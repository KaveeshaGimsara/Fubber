import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";
import { PostWithVariants } from "@/lib/db/types";
import { runMediaCleanup } from "@/lib/media/cleanup";

export async function GET(req: NextRequest) {
  try {
    // Proactive lazy check: purge any media that expired > 1 hour ago
    store.purgeExpiredMedia();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q")?.toLowerCase();

    let posts = store.getPosts();

    if (status && status !== "all") {
      posts = posts.filter((p) => p.status === status);
    }

    if (q) {
      posts = posts.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.mainCaption.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = store.getUser();

    const postId = body.id || `post_${Date.now()}`;
    const newPost: PostWithVariants = {
      id: postId,
      userId: user.id,
      title: body.title || null,
      mainCaption: body.mainCaption || "",
      mainMediaUrl: body.mainMediaUrl || null,
      mainMediaAssetId: body.mainMediaAssetId || null,
      status: body.status || "draft",
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
      timezone: body.timezone || "UTC",
      scheduleStatus: body.status === "scheduled" ? "queued" : "idle",
      processingStartedAt: null,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      cancelledAt: null,
      retryCount: 0,
      lastError: null,
      idempotencyKey: body.idempotencyKey || null,
      mediaExpiresAt: body.mediaExpiresAt ? new Date(body.mediaExpiresAt) : null,
      mediaAutoDeleted: body.mediaAutoDeleted || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      variants: (body.variants || []).map((v: any) => ({
        id: v.id || `var_${postId}_${v.platform}`,
        postId,
        platform: v.platform,
        caption: v.caption || body.mainCaption || "",
        mediaUrl: v.mediaUrl || body.mainMediaUrl || null,
        mediaAssetId: v.mediaAssetId || body.mainMediaAssetId || null,
        cropSettings: v.cropSettings || {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          zoom: 1,
          rotation: 0,
          aspect: v.aspectRatio || "original",
        },
        aspectRatio: v.aspectRatio || "original",
        isEnabled: v.isEnabled !== undefined ? v.isEnabled : true,
        publishStatus: v.publishStatus || "idle",
        publishedAt: v.publishedAt ? new Date(v.publishedAt) : null,
        externalPostId: v.externalPostId || null,
        externalPostUrl: v.externalPostUrl || null,
        errorMessage: v.errorMessage || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    };

    store.createPost(newPost);

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
