import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";
import { getPublisher } from "@/lib/social/registry";
import { PlatformType, PostStatus } from "@/lib/db/types";
import { PublishResult } from "@/lib/social/types";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized cron execution" },
        { status: 401 }
      );
    }

    const duePosts = store.claimDueScheduledPosts();
    const pages = store.getPages();
    const selectedFbPage = pages.find((p) => p.isSelected) || pages[0];

    const executionSummary = [];

    for (const post of duePosts) {
      const enabledVariants = post.variants.filter((v) => v.isEnabled);
      const results: PublishResult[] = [];

      for (const variant of enabledVariants) {
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

          variant.publishStatus = result.success ? "published" : "failed";
          variant.publishedAt = result.success ? new Date() : null;
          variant.externalPostId = result.externalPostId || null;
          variant.externalPostUrl = result.externalPostUrl || null;
          variant.errorMessage = result.errorMessage || null;
          variant.updatedAt = new Date();
        } catch (err: any) {
          variant.publishStatus = "failed";
          variant.errorMessage = err.message || `Failed publishing scheduled variant to ${platform}`;
          variant.updatedAt = new Date();
          results.push({
            success: false,
            platform,
            errorMessage: err.message,
            errorCode: "CRON_DISPATCH_FAIL",
          });
        }
      }

      const publishedCount = enabledVariants.filter((v) => v.publishStatus === "published").length;
      const failedCount = enabledVariants.filter((v) => v.publishStatus === "failed").length;

      let overallStatus: PostStatus = "published";
      if (publishedCount === 0 && failedCount > 0) {
        overallStatus = "failed";
      } else if (publishedCount > 0 && failedCount > 0) {
        overallStatus = "partially_published";
      }

      const now = new Date();
      post.status = overallStatus;
      post.scheduleStatus = overallStatus;
      post.retryCount = (post.retryCount || 0) + 1;
      post.lastError = failedCount > 0 ? results.find((r) => !r.success)?.errorMessage || null : null;
      if (overallStatus !== "failed") {
        post.publishedAt = now;
        post.mediaExpiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour auto-purge
        post.mediaAutoDeleted = false;
      }
      post.updatedAt = now;

      store.updatePost(post.id, post);

      executionSummary.push({
        postId: post.id,
        title: post.title || post.mainCaption.slice(0, 30),
        status: overallStatus,
        scheduleStatus: post.scheduleStatus,
        publishedVariants: publishedCount,
        failedVariants: failedCount,
      });
    }

    return NextResponse.json({
      success: true,
      processedCount: duePosts.length,
      dispatched: executionSummary,
      checkedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
