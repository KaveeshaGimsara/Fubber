import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = store.getPost(id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = store.getPost(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    if (body.action === "cancel") {
      const cancelled = store.cancelScheduledPost(id);
      return NextResponse.json({ success: true, post: cancelled });
    }

    if (body.action === "duplicate") {
      const duplicated = store.duplicatePost(id);
      return NextResponse.json({ success: true, post: duplicated });
    }

    const updated = store.updatePost(id, {
      ...body,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : existing.scheduledFor,
      timezone: body.timezone || existing.timezone || "UTC",
      scheduleStatus: body.scheduleStatus || existing.scheduleStatus || "idle",
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = store.deletePost(id);

    return NextResponse.json({
      success,
      message: success ? "Post deleted" : "Post not found",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
