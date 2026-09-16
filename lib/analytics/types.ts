import { PlatformType } from "../db/types";

export interface NormalizedMetrics {
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  engagementRate: number;
  unavailableMetrics: Array<"impressions" | "reach" | "likes" | "comments" | "shares" | "saves" | "clicks">;
  platformSpecific?: Record<string, any>;
}

export interface SocialAnalyticsProvider {
  platform: PlatformType;
  fetchMetrics(externalPostId: string): Promise<NormalizedMetrics>;
}
