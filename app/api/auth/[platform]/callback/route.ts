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
    const redirectUri = `${baseUrl}/api/auth/${platform}/callback`;

    let accountName = `${platform.toUpperCase()} User`;
    let username = `${platform}_connected`;
    let avatarUrl = `https://avatar.vercel.sh/${platform}`;
    let rawAccessToken = `token_${platform}_${Date.now()}`;

    // Live Meta Graph API token exchange if live credentials are configured
    if (
      (platform === "facebook" || platform === "instagram" || platform === "threads") &&
      process.env.META_APP_ID &&
      process.env.META_APP_SECRET
    ) {
      try {
        const tokenUrl =
          platform === "threads"
            ? `https://graph.threads.net/oauth/access_token`
            : `https://graph.facebook.com/v20.0/oauth/access_token`;

        if (platform === "threads") {
          const formBody = new URLSearchParams({
            client_id: process.env.THREADS_CLIENT_ID || process.env.META_APP_ID,
            client_secret: process.env.THREADS_CLIENT_SECRET || process.env.META_APP_SECRET,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
            code,
          });

          const threadsTokenRes = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formBody.toString(),
          });
          const threadsTokenData = await threadsTokenRes.json();
          if (threadsTokenData.access_token) {
            rawAccessToken = threadsTokenData.access_token;
            accountName = `Threads User ${threadsTokenData.user_id || ""}`.trim();
            username = `threads_${threadsTokenData.user_id || "user"}`;
          }
        } else {
          const fbTokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${encodeURIComponent(code)}`;
          const fbTokenRes = await fetch(fbTokenUrl);
          const fbTokenData = await fbTokenRes.json();

          if (fbTokenData.access_token) {
            rawAccessToken = fbTokenData.access_token;

            // Fetch User Profile
            const profileRes = await fetch(
              `https://graph.facebook.com/v20.0/me?fields=id,name,picture.type(large)&access_token=${rawAccessToken}`
            );
            const profileData = await profileRes.json();
            if (profileData.name) {
              accountName = profileData.name;
              username = profileData.id ? `fb_${profileData.id}` : username;
              if (profileData.picture?.data?.url) {
                avatarUrl = profileData.picture.data.url;
              }
            }

            // Fetch Facebook Pages if Facebook
            if (platform === "facebook") {
              const pagesRes = await fetch(
                `https://graph.facebook.com/v20.0/me/accounts?fields=id,name,access_token,category&access_token=${rawAccessToken}`
              );
              const pagesData = await pagesRes.json();
              if (Array.isArray(pagesData.data)) {
                pagesData.data.forEach((p: any, idx: number) => {
                  store.addPage({
                    id: `page_${p.id}`,
                    platform: "facebook",
                    accountId: `acc_facebook`,
                    pageId: p.id,
                    pageName: p.name,
                    category: p.category || "General",
                    pageAccessToken: encryptToken(p.access_token),
                    isSelected: idx === 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  });
                });
              }
            }
          }
        }
      } catch (metaErr) {
        console.error("Meta live token exchange error:", metaErr);
      }
    }

    const encryptedAccessToken = encryptToken(rawAccessToken);

    const account = store.connectAccount(
      platform,
      accountName,
      username,
      avatarUrl
    );

    if (account) {
      account.accessToken = encryptedAccessToken;
    }

    return NextResponse.redirect(`${baseUrl}/accounts?success=${platform}`);
  } catch (err: any) {
    return NextResponse.redirect(
      `${baseUrl}/accounts?error=${encodeURIComponent(err.message || "Failed to complete authentication")}`
    );
  }
}
