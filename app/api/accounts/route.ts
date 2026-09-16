import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET() {
  try {
    const rawAccounts = store.getAccounts();
    const pages = store.getPages();

    // Sanitize: never expose encrypted tokens or secrets to client
    const accounts = rawAccounts.map((a) => ({
      id: a.id,
      platform: a.platform,
      accountName: a.accountName,
      accountUsername: a.accountUsername,
      profileImageUrl: a.profileImageUrl,
      isConnected: a.isConnected,
      connectedAt: a.connectedAt,
      scopes: a.scopes,
      pages: a.platform === "facebook" ? pages : [],
    }));

    return NextResponse.json({ success: true, accounts, pages });
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
    const { platform, accountName, username, avatarUrl } = body;

    if (!platform) {
      return NextResponse.json(
        { success: false, error: "Platform is required" },
        { status: 400 }
      );
    }

    const account = store.connectAccount(
      platform,
      accountName || `${platform.toUpperCase()} User`,
      username || `${platform}_user`,
      avatarUrl
    );

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        platform: account.platform,
        accountName: account.accountName,
        accountUsername: account.accountUsername,
        profileImageUrl: account.profileImageUrl,
        isConnected: account.isConnected,
        connectedAt: account.connectedAt,
      },
    });
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
    const platform = searchParams.get("platform");

    if (!platform) {
      return NextResponse.json(
        { success: false, error: "Platform required" },
        { status: 400 }
      );
    }

    store.disconnectAccount(platform);

    return NextResponse.json({
      success: true,
      message: `Disconnected ${platform} account`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
