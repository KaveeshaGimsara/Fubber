import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pageId } = body;

    if (!pageId) {
      return NextResponse.json(
        { success: false, error: "pageId is required" },
        { status: 400 }
      );
    }

    const selected = store.selectPage(pageId);
    if (!selected) {
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, page: selected });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
