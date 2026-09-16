import { SocialPublisher, PostVariantPayload, PublishResult, ValidationResult } from "../types";

export class YouTubePublisher implements SocialPublisher {
  platform = "youtube" as const;
  displayName = "YouTube Community";
  maxCharacters = 5000;
  supportedAspectRatios = ["16:9", "1:1", "original"];
  isPublishingSupported = false;
  unsupportedReason =
    "Google has not released a public API endpoint in the official YouTube Data API v3 for third-party creation of YouTube Community posts. In compliance with developer policies, automated workarounds or unofficial endpoints are disabled.";

  validatePost(caption: string, mediaUrl?: string | null, account?: any): ValidationResult {
    return {
      isValid: false,
      issues: [
        {
          field: "account",
          severity: "error",
          message: this.unsupportedReason,
        },
      ],
      charCount: caption.length,
      maxChars: this.maxCharacters,
    };
  }

  async publishPost(payload: PostVariantPayload): Promise<PublishResult> {
    return {
      success: false,
      platform: "youtube",
      errorMessage: this.unsupportedReason,
      errorCode: "API_CAPABILITY_UNAVAILABLE",
    };
  }
}

export const youtubePublisher = new YouTubePublisher();
