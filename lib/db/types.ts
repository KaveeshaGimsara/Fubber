import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import * as schema from "./schema";

export type PlatformType =
  | "facebook"
  | "instagram"
  | "threads"
  | "x"
  | "pinterest"
  | "youtube"
  | "linkedin";

export type ChannelApiHealth =
  | "healthy"
  | "warning"
  | "auth_required"
  | "rate_limited"
  | "api_error"
  | "disconnected";

export type PostStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "partially_published"
  | "failed"
  | "cancelled";

export type ScheduleStatus =
  | "idle"
  | "queued"
  | "processing"
  | "published"
  | "partially_published"
  | "failed"
  | "cancelled";

export type VariantPublishStatus = "idle" | "publishing" | "published" | "failed";

export type AspectRatioType =
  | "original"
  | "1:1"
  | "4:5"
  | "16:9"
  | "1.91:1"
  | "2:3"
  | "1:2";

export interface CropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
  rotation: number;
  aspect: AspectRatioType;
}

export type User = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof schema.users>;

export type SocialAccount = InferSelectModel<typeof schema.socialAccounts>;
export type NewSocialAccount = InferInsertModel<typeof schema.socialAccounts>;

export type SocialPage = InferSelectModel<typeof schema.socialPages>;
export type NewSocialPage = InferInsertModel<typeof schema.socialPages>;

export type Post = InferSelectModel<typeof schema.posts>;
export type NewPost = InferInsertModel<typeof schema.posts>;

export type PostVariant = InferSelectModel<typeof schema.postVariants>;
export type NewPostVariant = InferInsertModel<typeof schema.postVariants>;

export type MediaAsset = InferSelectModel<typeof schema.mediaAssets>;
export type NewMediaAsset = InferInsertModel<typeof schema.mediaAssets>;

export type PublishAttempt = InferSelectModel<typeof schema.publishAttempts>;
export type NewPublishAttempt = InferInsertModel<typeof schema.publishAttempts>;

export type AnalyticsSnapshot = InferSelectModel<typeof schema.analyticsSnapshots>;
export type NewAnalyticsSnapshot = InferInsertModel<typeof schema.analyticsSnapshots>;

export type AuditLog = InferSelectModel<typeof schema.auditLogs>;
export type NewAuditLog = InferInsertModel<typeof schema.auditLogs>;

export interface PostWithVariants extends Post {
  variants: PostVariant[];
  mediaAsset?: MediaAsset | null;
}
