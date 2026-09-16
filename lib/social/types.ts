import { PlatformType, PostVariant, SocialAccount, SocialPage } from "../db/types";

export interface PublishResult {
  success: boolean;
  platform: PlatformType;
  externalPostId?: string;
  externalPostUrl?: string;
  errorMessage?: string;
  errorCode?: string;
  rateLimitReset?: Date;
  rawResponse?: any;
}

export interface ValidationIssue {
  field: "caption" | "media" | "account";
  severity: "error" | "warning";
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  charCount: number;
  maxChars: number;
}

export interface PostVariantPayload {
  variant: PostVariant;
  account?: SocialAccount | null;
  selectedPage?: SocialPage | null;
}

export interface SocialPublisher {
  platform: PlatformType;
  displayName: string;
  maxCharacters: number;
  supportedAspectRatios: string[];
  isPublishingSupported: boolean;
  unsupportedReason?: string;

  validatePost(caption: string, mediaUrl?: string | null, account?: SocialAccount | null): ValidationResult;
  publishPost(payload: PostVariantPayload): Promise<PublishResult>;
}
