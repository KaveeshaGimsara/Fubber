import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";
import { getPublisher } from "@/lib/social/registry";
import { PlatformType, PostStatus } from "@/lib/db/types";
import { PublishResult } from "@/lib/social/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, variantIds, retryOnlyFailed } = body;

    const post = store.getPost(postId);
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    const pages = store.getPages();
    const selectedFbPage = pages.find((p) => p.isSelected) || pages[0];

    // Filter which variants to publish
    let targetVariants = post.variants.filter((v) => v.isEnabled);

    if (variantIds && Array.isArray(variantIds) && variantIds.length > 0) {
      targetVariants = targetVariants.filter((v) => variantIds.includes(v.id));
    } else if (retryOnlyFailed) {
      targetVariants = targetVariants.filter((v) => v.publishStatus === "failed");
    }

    if (targetVariants.length === 0) {
      return NextResponse.json(
        { success: false, error: "No enabled variants selected for publishing" },
        { status: 400 }
      );
    }

    const results: PublishResult[] = [];

    // Execute publishing independently for each platform variant
    // One failure does NOT halt or cancel others!
    await Promise.all(
      targetVariants.map(async (variant) => {
        const platform = variant.platform as PlatformType;
        const account = store.getAccountByPlatform(platform);

        try {
          const publisher = getPublisher(platform);

          const result = await publisher.publishPost({
            variant,
            account,
            selectedPage: platform === "facebook" ? selectedFbPage : undefined,
          });

          results.push(result);

          // Update variant in post
          variant.publishStatus = result.success ? "published" : "failed";
          variant.publishedAt = result.success ? new Date() : null;
          variant.externalPostId = result.externalPostId || null;
          variant.externalPostUrl = result.externalPostUrl || null;
          variant.errorMessage = result.errorMessage || null;
          variant.updatedAt = new Date();
        } catch (err: any) {
          const failureResult: PublishResult = {
            success: false,
            platform,
            errorMessage: err.message || `Unexpected error publishing to ${platform}`,
            errorCode: "EXECUTION_EXCEPTION",
          };
          results.push(failureResult);

          variant.publishStatus = "failed";
          variant.errorMessage = failureResult.errorMessage || null;
          variant.updatedAt = new Date();
        }
      })
    );

    // Compute overall post status
    const enabledVariants = post.variants.filter((v) => v.isEnabled);
    const publishedCount = enabledVariants.filter(
      (v) => v.publishStatus === "published"
    ).length;
    const failedCount = enabledVariants.filter(
      (v) => v.publishStatus === "failed"
    ).length;

    let overallStatus: PostStatus = "published";
    if (publishedCount === 0 && failedCount > 0) {
      overallStatus = "failed";
    } else if (publishedCount > 0 && failedCount > 0) {
      overallStatus = "partially_published";
    }

    post.status = overallStatus;
    post.updatedAt = new Date();

    if (overallStatus === "published" || overallStatus === "partially_published") {
      const now = new Date();
      post.publishedAt = now;
      // Auto-expire media 1 hour after successful publication to prevent storage quota exhaustion
      post.mediaExpiresAt = new Date(now.getTime() + 60 * 60 * 1000);
      post.mediaAutoDeleted = false;

      // Update media asset expiration if asset exists
      if (post.mainMediaAssetId) {
        const media = store.getMediaById(post.mainMediaAssetId);
        if (media) {
          media.expiresAt = post.mediaExpiresAt;
        }
      }
    }

    store.updatePost(post.id, post);

    return NextResponse.json({
      success: true,
      post,
      results,
      summary: {
        total: targetVariants.length,
        published: publishedCount,
        failed: failedCount,
        overallStatus,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
