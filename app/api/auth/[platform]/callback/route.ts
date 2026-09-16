import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";
import { encryptToken } from "@/lib/security/crypto";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = req.nextUrl.origin;

  if (error || !code) {
    return NextResponse.redirect(
      `${baseUrl}/accounts?error=${encodeURIComponent(error || "Authorization cancelled")}`
    );
  }

  try {
    // In production, exchange `code` for `access_token` and `refresh_token` using official token endpoint
    // Store encrypted tokens server-side:
    const encryptedAccessToken = encryptToken(`token_${platform}_${Date.now()}`);

    store.connectAccount(
      platform,
      `${platform.toUpperCase()} User`,
      `${platform}_connected`,
      `https://avatar.vercel.sh/${platform}`
    );

    return NextResponse.redirect(`${baseUrl}/accounts?success=${platform}`);
  } catch (err: any) {
    return NextResponse.redirect(
      `${baseUrl}/accounts?error=${encodeURIComponent(err.message || "Failed to complete authentication")}`
    );
  }
}
