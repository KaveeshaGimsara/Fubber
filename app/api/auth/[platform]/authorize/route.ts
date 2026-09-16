import { NextRequest, NextResponse } from "next/server";
import { generateOAuthState, generateCodeVerifier, generateCodeChallenge } from "@/lib/security/oauth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const state = generateOAuthState();
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);

  const baseUrl = req.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/auth/${platform}/callback`;

  let authUrl = "";

  switch (platform) {
    case "facebook":
    case "instagram": {
      const appId = process.env.META_APP_ID || "mock_meta_app_id";
      const scopes = encodeURIComponent("pages_show_list,pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish");
      authUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scopes}`;
      break;
    }
    case "threads": {
      const clientId = process.env.THREADS_CLIENT_ID || "mock_threads_id";
      const scopes = encodeURIComponent("threads_basic,threads_content_publish");
      authUrl = `https://threads.net/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code&state=${state}`;
      break;
    }
    case "x": {
      const clientId = process.env.X_CLIENT_ID || "mock_x_id";
      const scopes = encodeURIComponent("tweet.read tweet.write users.read offline.access");
      authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${state}&code_challenge=${challenge}&code_challenge_method=S256`;
      break;
    }
    case "pinterest": {
      const appId = process.env.PINTEREST_APP_ID || "mock_pin_id";
      const scopes = encodeURIComponent("boards:read,pins:read,pins:write");
      authUrl = `https://www.pinterest.com/oauth/?consumer_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&state=${state}`;
      break;
    }
    case "youtube": {
      const clientId = process.env.GOOGLE_CLIENT_ID || "mock_google_id";
      const scopes = encodeURIComponent("https://www.googleapis.com/auth/youtube.readonly");
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&access_type=offline&state=${state}&prompt=consent`;
      break;
    }
    case "linkedin": {
      const clientId = process.env.LINKEDIN_CLIENT_ID || "mock_linkedin_id";
      const scopes = encodeURIComponent("openid profile email w_member_social");
      authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${state}`;
      break;
    }
    default:
      return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
  }

  return NextResponse.redirect(authUrl);
}
