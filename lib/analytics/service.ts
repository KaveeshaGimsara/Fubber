import { store } from "../db";
import { PlatformType } from "../db/types";

export interface AnalyticsSummary {
  totalPosts: number;
  publishedPosts: number;
  partiallyPublishedPosts: number;
  failedPosts: number;
  draftPosts: number;
  totalImpressions: number;
  totalReach: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
  totalClicks: number;
  avgEngagementRate: number;
  platformBreakdown: { platform: PlatformType; count: number; name: string; color: string }[];
  timelineData: { date: string; posts: number; likes: number; comments: number; shares: number }[];
  platformComparison: { platform: string; likes: number; comments: number; shares: number; clicks: number }[];
  topPosts: Array<{
    id: string;
    title: string;
    caption: string;
    mediaUrl?: string | null;
    publishedAt: string;
    impressions: number;
    engagement: number;
    platforms: PlatformType[];
  }>;
}

export function getAnalyticsSummary(timeframe: "7d" | "30d" | "90d" | "all" = "30d"): AnalyticsSummary {
  const posts = store.getPosts();
  const snapshots = store.getAnalytics();

  let published = 0;
  let partial = 0;
  let failed = 0;
  let drafts = 0;

  const platformCounts: Record<PlatformType, number> = {
    facebook: 0,
    instagram: 0,
    threads: 0,
    x: 0,
    linkedin: 0,
    pinterest: 0,
    youtube: 0,
  };

  posts.forEach((p) => {
    if (p.status === "published") published++;
    else if (p.status === "partially_published") partial++;
    else if (p.status === "failed") failed++;
    else if (p.status === "draft") drafts++;

    p.variants.forEach((v) => {
      if (v.isEnabled && platformCounts[v.platform as PlatformType] !== undefined) {
        platformCounts[v.platform as PlatformType]++;
      }
    });
  });

  let totalImpressions = 0;
  let totalReach = 0;
  let totalLikes = 0;
  let totalComments = 0;
  let totalShares = 0;
  let totalSaves = 0;
  let totalClicks = 0;

  snapshots.forEach((s) => {
    totalImpressions += s.impressions || 0;
    totalReach += s.reach || 0;
    totalLikes += s.likes || 0;
    totalComments += s.comments || 0;
    totalShares += s.shares || 0;
    totalSaves += s.saves || 0;
    totalClicks += s.clicks || 0;
  });

  const platformMeta: Record<PlatformType, { name: string; color: string }> = {
    facebook: { name: "Facebook", color: "#1877F2" },
    instagram: { name: "Instagram", color: "#E4405F" },
    threads: { name: "Threads", color: "#4B5563" },
    x: { name: "X", color: "#111827" },
    linkedin: { name: "LinkedIn", color: "#0A66C2" },
    pinterest: { name: "Pinterest", color: "#BD081C" },
    youtube: { name: "YouTube", color: "#FF0000" },
  };

  const platformBreakdown = (Object.keys(platformCounts) as PlatformType[]).map((platform) => ({
    platform,
    name: platformMeta[platform].name,
    color: platformMeta[platform].color,
    count: platformCounts[platform],
  }));

  // Build timeline data from actual posts and snapshots
  const timelineMap: Record<string, { date: string; posts: number; likes: number; comments: number; shares: number }> = {};

  // Initialize past 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    timelineMap[key] = { date: key, posts: 0, likes: 0, comments: 0, shares: 0 };
  }

  posts.forEach((p) => {
    const key = new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (timelineMap[key]) {
      timelineMap[key].posts += 1;
    }
  });

  snapshots.forEach((s) => {
    const key = new Date(s.snapshotDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (timelineMap[key]) {
      timelineMap[key].likes += s.likes || 0;
      timelineMap[key].comments += s.comments || 0;
      timelineMap[key].shares += s.shares || 0;
    }
  });

  const timelineData = Object.values(timelineMap);

  const platformMetrics: Record<string, { likes: number; comments: number; shares: number; clicks: number }> = {
    Facebook: { likes: 0, comments: 0, shares: 0, clicks: 0 },
    Instagram: { likes: 0, comments: 0, shares: 0, clicks: 0 },
    Threads: { likes: 0, comments: 0, shares: 0, clicks: 0 },
    X: { likes: 0, comments: 0, shares: 0, clicks: 0 },
    LinkedIn: { likes: 0, comments: 0, shares: 0, clicks: 0 },
    Pinterest: { likes: 0, comments: 0, shares: 0, clicks: 0 },
  };

  snapshots.forEach((s) => {
    const name = platformMeta[s.platform as PlatformType]?.name;
    if (name && platformMetrics[name]) {
      platformMetrics[name].likes += s.likes || 0;
      platformMetrics[name].comments += s.comments || 0;
      platformMetrics[name].shares += s.shares || 0;
      platformMetrics[name].clicks += s.clicks || 0;
    }
  });

  const platformComparison = Object.entries(platformMetrics).map(([platform, metrics]) => ({
    platform,
    ...metrics,
  }));

  const topPosts = posts
    .filter((p) => p.status === "published" || p.status === "partially_published")
    .map((p) => {
      const postSnapshots = snapshots.filter((s) => s.postId === p.id);
      const imp = postSnapshots.reduce((sum, s) => sum + (s.impressions || 0), 0);
      const eng = postSnapshots.reduce((sum, s) => sum + (s.likes || 0) + (s.comments || 0) + (s.shares || 0), 0);

      return {
        id: p.id,
        title: p.title || p.mainCaption.slice(0, 40) + "...",
        caption: p.mainCaption,
        mediaUrl: p.mainMediaUrl,
        publishedAt: new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        impressions: imp,
        engagement: eng,
        platforms: p.variants.filter((v) => v.isEnabled).map((v) => v.platform as PlatformType),
      };
    });

  const totalInteractions = totalLikes + totalComments + totalShares + totalSaves + totalClicks;
  const avgEngagementRate = totalImpressions > 0 ? Number(((totalInteractions / totalImpressions) * 100).toFixed(1)) : 0;

  return {
    totalPosts: posts.length,
    publishedPosts: published,
    partiallyPublishedPosts: partial,
    failedPosts: failed,
    draftPosts: drafts,
    totalImpressions,
    totalReach,
    totalLikes,
    totalComments,
    totalShares,
    totalSaves,
    totalClicks,
    avgEngagementRate,
    platformBreakdown,
    timelineData,
    platformComparison,
    topPosts,
  };
}
