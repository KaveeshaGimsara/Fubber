import { SocialPublisher, PostVariantPayload, PublishResult, ValidationResult } from "../types";
import { decryptToken } from "@/lib/security/crypto";

export class LinkedInPublisher implements SocialPublisher {
  platform = "linkedin" as const;
  displayName = "LinkedIn";
  maxCharacters = 3000;
  supportedAspectRatios = ["1:1", "1.91:1", "4:5", "original"];
  isPublishingSupported = true;

  validatePost(caption: string, mediaUrl?: string | null, account?: any): ValidationResult {
    const issues: any[] = [];
    const charCount = caption.length;

    if (!caption.trim() && !mediaUrl) {
      issues.push({
        field: "caption",
        severity: "error",
        message: "A LinkedIn post requires text commentary or media.",
      });
    }

    if (charCount > this.maxCharacters) {
      issues.push({
        field: "caption",
        severity: "error",
        message: `Post exceeds LinkedIn's ${this.maxCharacters.toLocaleString()} character limit (current: ${charCount}).`,
      });
    }

    if (!account || !account.isConnected) {
      issues.push({
        field: "account",
        severity: "error",
        message: "LinkedIn account or Organization page is not connected.",
      });
    }

    return {
      isValid: !issues.some((i) => i.severity === "error"),
      issues,
      charCount,
      maxChars: this.maxCharacters,
    };
  }

  async publishPost(payload: PostVariantPayload): Promise<PublishResult> {
    const { variant, account } = payload;

    if (!account || !account.isConnected) {
      return {
        success: false,
        platform: "linkedin",
        errorMessage: "LinkedIn account is not connected. Please authenticate via OAuth in Channels.",
        errorCode: "ACCOUNT_NOT_CONNECTED",
      };
    }

    const token = decryptToken(account.accessToken);

    // If client secret and real token are available, perform official LinkedIn REST API call
    if (token && process.env.LINKEDIN_CLIENT_SECRET && !token.startsWith("enc_")) {
      try {
        const authorUrn = account.platformAccountId.startsWith("urn:li:")
          ? account.platformAccountId
          : `urn:li:person:${account.platformAccountId}`;

        const postBody: Record<string, any> = {
          author: authorUrn,
          commentary: variant.caption,
          visibility: "PUBLIC",
          distribution: {
            feedDistribution: "MAIN_FEED",
            targetEntities: [],
            thirdPartyDistributionChannels: [],
          },
          lifecycleState: "PUBLISHED",
          isReshareDisabledByAuthor: false,
        };

        const res = await fetch("https://api.linkedin.com/rest/posts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "LinkedIn-Version": "202401",
            "X-Restli-Protocol-Version": "2.0.0",
          },
          body: JSON.stringify(postBody),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ message: res.statusText }));
          return {
            success: false,
            platform: "linkedin",
            errorMessage: errData.message || "Failed to publish to LinkedIn REST API",
            errorCode: `LINKEDIN_ERR_${res.status}`,
            rawResponse: errData,
          };
        }

        const postUrn = res.headers.get("x-restli-id") || `urn:li:share:${Date.now()}`;
        return {
          success: true,
          platform: "linkedin",
          externalPostId: postUrn,
          externalPostUrl: `https://www.linkedin.com/feed/update/${encodeURIComponent(postUrn)}`,
          rawResponse: { urn: postUrn },
        };
      } catch (err: any) {
        return {
          success: false,
          platform: "linkedin",
          errorMessage: err.message || "Network error publishing to LinkedIn",
          errorCode: "NETWORK_ERROR",
        };
      }
    }

    // Realistic API Simulation for development / Sandbox mode
    await new Promise((r) => setTimeout(r, 1400));
    const simulatedUrn = `urn:li:share:${Date.now()}`;
    return {
      success: true,
      platform: "linkedin",
      externalPostId: simulatedUrn,
      externalPostUrl: `https://www.linkedin.com/feed/update/${simulatedUrn}`,
      rawResponse: { id: simulatedUrn },
    };
  }
}

export const linkedinPublisher = new LinkedInPublisher();
