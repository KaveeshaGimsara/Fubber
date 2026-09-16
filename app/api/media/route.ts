import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";
import { uploadMedia } from "@/lib/media/storage";
import { MediaAsset } from "@/lib/db/types";

export async function GET() {
  try {
    const media = store.getMedia();
    const posts = store.getPosts();

    // Calculate usage count for each media asset
    const mediaWithUsage = media.map((item) => {
      const usedInPosts = posts.filter(
        (p) =>
          p.mainMediaAssetId === item.id ||
          p.mainMediaUrl === item.url ||
          p.variants.some((v) => v.mediaAssetId === item.id || v.mediaUrl === item.url)
      );

      return {
        ...item,
        usageCount: usedInPosts.length,
        usedInPostTitles: usedInPosts.map((p) => p.title || p.mainCaption.slice(0, 30)),
      };
    });

    const stats = store.getStorageStats();

    return NextResponse.json({
      success: true,
      media: mediaWithUsage,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const widthStr = formData.get("width") as string | null;
    const heightStr = formData.get("height") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate mime type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Only image files (JPEG, PNG, WebP) are supported." },
        { status: 400 }
      );
    }

    // Validate size (e.g. 15MB)
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File exceeds maximum upload size of 15MB." },
        { status: 400 }
      );
    }

    const uploaded = await uploadMedia(file, file.name);
    const user = store.getUser();

    const newAsset: MediaAsset = {
      id: `media_${Date.now()}`,
      userId: user.id,
      filename: file.name,
      url: uploaded.url,
      storageKey: uploaded.storageKey,
      fileSize: file.size,
      mimeType: file.type,
      width: widthStr ? parseInt(widthStr, 10) : 1920,
      height: heightStr ? parseInt(heightStr, 10) : 1080,
      format: file.type.split("/")[1] || "jpeg",
      expiresAt: null,
      isPurged: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.addMedia(newAsset);

    return NextResponse.json(
      { success: true, asset: newAsset },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Media ID required" },
        { status: 400 }
      );
    }

    store.deleteMedia(id);
    return NextResponse.json({ success: true, message: "Media deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
