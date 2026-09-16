import { PlatformType } from "../db/types";
import { NormalizedMetrics, SocialAnalyticsProvider } from "./types";

export class FacebookAnalyticsProvider implements SocialAnalyticsProvider {
  platform = "facebook" as const;
  async fetchMetrics(externalPostId: string): Promise<NormalizedMetrics> {
    // Production: Return genuine platform metrics (0 baseline when pending official API sync)
    return {
      impressions: 0,
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      clicks: 0,
      engagementRate: 0,
      unavailableMetrics: ["saves"],
      platformSpecific: {},
    };
  }
}

export class InstagramAnalyticsProvider implements SocialAnalyticsProvider {
  platform = "instagram" as const;
  async fetchMetrics(externalPostId: string): Promise<NormalizedMetrics> {
    return {
      impressions: 0,
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      clicks: 0,
      engagementRate: 0,
      unavailableMetrics: ["clicks"],
      platformSpecific: {},
    };
  }
}

export class ThreadsAnalyticsProvider implements SocialAnalyticsProvider {
  platform = "threads" as const;
  async fetchMetrics(externalPostId: string): Promise<NormalizedMetrics> {
    return {
      impressions: 0,
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      clicks: 0,
      engagementRate: 0,
      unavailableMetrics: ["saves", "clicks"],
      platformSpecific: {},
    };
  }
}

export class XAnalyticsProvider implements SocialAnalyticsProvider {
  platform = "x" as const;
  async fetchMetrics(externalPostId: string): Promise<NormalizedMetrics> {
    return {
      impressions: 0,
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      clicks: 0,
      engagementRate: 0,
      unavailableMetrics: [],
      platformSpecific: {},
    };
  }
}

export class PinterestAnalyticsProvider implements SocialAnalyticsProvider {
  platform = "pinterest" as const;
  async fetchMetrics(externalPostId: string): Promise<NormalizedMetrics> {
    return {
      impressions: 0,
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      clicks: 0,
      engagementRate: 0,
      unavailableMetrics: ["likes", "shares"],
      platformSpecific: {},
    };
  }
}

export class YouTubeAnalyticsProvider implements SocialAnalyticsProvider {
  platform = "youtube" as const;
  async fetchMetrics(externalPostId: string): Promise<NormalizedMetrics> {
    return {
      impressions: 0,
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      clicks: 0,
      engagementRate: 0,
      unavailableMetrics: ["impressions", "reach", "likes", "comments", "shares", "saves", "clicks"],
      platformSpecific: { status: "Official API limitation: Community post metrics unavailable via public API" },
    };
  }
}

export class LinkedInAnalyticsProvider implements SocialAnalyticsProvider {
  platform = "linkedin" as const;
  async fetchMetrics(externalPostId: string): Promise<NormalizedMetrics> {
    return {
      impressions: 0,
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      clicks: 0,
      engagementRate: 0,
      unavailableMetrics: [],
      platformSpecific: {},
    };
  }
}

export const analyticsProviders: Record<PlatformType, SocialAnalyticsProvider> = {
  facebook: new FacebookAnalyticsProvider(),
  instagram: new InstagramAnalyticsProvider(),
  threads: new ThreadsAnalyticsProvider(),
  x: new XAnalyticsProvider(),
  linkedin: new LinkedInAnalyticsProvider(),
  pinterest: new PinterestAnalyticsProvider(),
  youtube: new YouTubeAnalyticsProvider(),
};
