"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MousePointer,
  TrendingUp,
  RefreshCw,
  Filter,
  Calendar,
  ExternalLink,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/ui/dialog";
import {
  FacebookIcon,
  InstagramIcon,
  ThreadsIcon,
  XIcon,
  PinterestIcon,
  YouTubeIcon,
  LinkedInIcon,
} from "@/components/icons/social-icons";
import { PostWithVariants, SocialAccount } from "@/lib/db/types";

const PLATFORMS = [
  { id: "all", name: "All Networks" },
  { id: "facebook", name: "Facebook", Icon: FacebookIcon },
  { id: "instagram", name: "Instagram", Icon: InstagramIcon },
  { id: "threads", name: "Threads", Icon: ThreadsIcon },
  { id: "x", name: "X", Icon: XIcon },
  { id: "linkedin", name: "LinkedIn", Icon: LinkedInIcon },
  { id: "pinterest", name: "Pinterest", Icon: PinterestIcon },
  { id: "youtube", name: "YouTube", Icon: YouTubeIcon },
];

export default function AnalyticsCommandCenter() {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [posts, setPosts] = useState<PostWithVariants[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");
  const [inspectPost, setInspectPost] = useState<PostWithVariants | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "impressions" | "likes" | "clicks">("date");
  const [activeSection, setActiveSection] = useState<
    "overview" | "platforms" | "content"
  >("overview");
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);

  const loadData = async () => {
    try {
      const [postsRes, accountsRes, analyticsRes] = await Promise.all([
        fetch("/api/posts"),
        fetch("/api/accounts"),
        fetch(`/api/analytics?timeframe=${timeframe}`),
      ]);
      const postsData = await postsRes.json();
      const accountsData = await accountsRes.json();
      const analyticsData = await analyticsRes.json();

      if (postsData.success) setPosts(postsData.posts || []);
      if (accountsData.success) setAccounts(accountsData.accounts || []);
      if (analyticsData.success) setAnalyticsSummary(analyticsData.analytics || null);
    } catch (err) {
      console.error("Failed to load analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeframe]);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setLastSyncTime("Just now");
      await loadData();
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter published posts
  const publishedPosts = useMemo(() => {
    return posts.filter((p) => p.status === "published" || p.status === "partially_published");
  }, [posts]);

  // Aggregate Metrics strictly from verified published posts and real snapshots
  const metrics = useMemo(() => {
    const reach = analyticsSummary?.totalReach || 0;
    const impressions = analyticsSummary?.totalImpressions || 0;
    const likes = analyticsSummary?.totalLikes || 0;
    const comments = analyticsSummary?.totalComments || 0;
    const shares = analyticsSummary?.totalShares || 0;
    const saves = analyticsSummary?.totalSaves || 0;
    const clicks = analyticsSummary?.totalClicks || 0;

    const engagement = likes + comments + shares + saves + clicks;
    const engagementRate =
      impressions > 0 ? ((engagement / impressions) * 100).toFixed(1) : "0.0";

    return {
      totalPosts: publishedPosts.length,
      reach,
      impressions,
      engagement,
      engagementRate: `${engagementRate}%`,
      likes,
      comments,
      shares,
      saves,
      clicks,
    };
  }, [publishedPosts, analyticsSummary]);

  // Objective Platform Comparison Matrix (Zero fabricated metrics)
  const platformComparison = useMemo(() => {
    return [
      { id: "facebook", name: "Facebook", Icon: FacebookIcon, posts: 0, reach: 0, impressions: 0, engagement: 0, clicks: 0 },
      { id: "instagram", name: "Instagram", Icon: InstagramIcon, posts: 0, reach: 0, impressions: 0, engagement: 0, clicks: 0 },
      { id: "threads", name: "Threads", Icon: ThreadsIcon, posts: 0, reach: 0, impressions: 0, engagement: 0, clicks: 0 },
      { id: "x", name: "X (Twitter)", Icon: XIcon, posts: 0, reach: 0, impressions: 0, engagement: 0, clicks: 0 },
      { id: "pinterest", name: "Pinterest", Icon: PinterestIcon, posts: 0, reach: 0, impressions: 0, engagement: 0, clicks: 0 },
      { id: "youtube", name: "YouTube", Icon: YouTubeIcon, posts: 0, reach: 0, impressions: 0, engagement: 0, clicks: 0 },
    ].map((item) => {
      let count = 0;
      publishedPosts.forEach((p) => {
        const v = p.variants.find((v) => v.platform === item.id && v.publishStatus === "published");
        if (v) count++;
      });

      const serverItem = analyticsSummary?.platformComparison?.find(
        (p: any) => p.platform.toLowerCase() === item.id.toLowerCase()
      );

      return {
        ...item,
        posts: count,
        reach: 0,
        impressions: 0,
        engagement: serverItem ? serverItem.likes + serverItem.comments + serverItem.shares : 0,
        clicks: serverItem ? serverItem.clicks : 0,
      };
    });
  }, [publishedPosts, analyticsSummary]);

  // Chart data calculation from genuine records
  const chartDays = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
  const timeSeriesData = useMemo(() => {
    const list = [];
    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const count = publishedPosts.filter(
        (p) =>
          p.publishedAt &&
          new Date(p.publishedAt) >= dayStart &&
          new Date(p.publishedAt) <= dayEnd
      ).length;

      const timelineItem = analyticsSummary?.timelineData?.find(
        (t: any) => t.date === dayStr
      );

      list.push({
        date: dayStr,
        posts: count,
        reach: 0,
        impressions: 0,
        engagement: timelineItem ? timelineItem.likes + timelineItem.comments + timelineItem.shares : 0,
      });
    }
    return list;
  }, [publishedPosts, chartDays, analyticsSummary]);

  // Sorted Top Content
  const sortedContent = useMemo(() => {
    return [...publishedPosts].sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  }, [publishedPosts, sortBy]);

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto">
      {/* 1. Header & Sync Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Analytics Command Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Real-time cross-platform metrics, audience engagement, and objective platform comparison.
          </p>
        </div>

        {/* Sync button and Status */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 font-medium">
            Last synchronized: {lastSyncTime}
          </span>
          <Button
            size="sm"
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="h-8 rounded-xl text-xs gap-1.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>Sync Now</span>
          </Button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800">
        {/* Section Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSection("overview")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeSection === "overview"
                ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSection("platforms")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeSection === "platforms"
                ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Platform Comparison
          </button>
          <button
            onClick={() => setActiveSection("content")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeSection === "content"
                ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Content Performance
          </button>
        </div>

        {/* Platform and Timeframe Selectors */}
        <div className="flex items-center gap-2">
          {/* Platform filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="h-8 px-2.5 rounded-xl text-xs border border-slate-200 dark:border-zinc-800 bg-background text-slate-700 dark:text-zinc-300 focus:outline-none"
          >
            {PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Timeframe pill */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
            {(["7d", "30d", "90d"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  timeframe === t
                    ? "bg-white dark:bg-zinc-800 text-sky-600 dark:text-sky-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t === "7d" ? "7D" : t === "30d" ? "30D" : "90D"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Section Content */}
      {publishedPosts.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No analytics data yet.
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto">
            Publish content and connect supported analytics providers to see performance data.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/create">
              <Button className="h-9 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold">
                Create Post
              </Button>
            </Link>
            <Link href="/channels">
              <Button variant="outline" className="h-9 px-4 rounded-xl text-xs font-semibold">
                Connect Channels
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {activeSection === "overview" && (
            <div className="space-y-6">
          {/* KPI Matrix Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Reach
              </p>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {metrics.reach}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Unique viewers</span>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Impressions
              </p>
              <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
                {metrics.impressions}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Feed views</span>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Engagement
              </p>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {metrics.engagement}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Total interactions</span>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Engagement Rate
              </p>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {metrics.engagementRate}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Avg per post</span>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Likes & Reactions
              </p>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {metrics.likes}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Cross-network</span>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Clicks & Visits
              </p>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {metrics.clicks}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Outbound links</span>
            </Card>
          </div>

          {/* Impressions & Reach Over Time Chart */}
          <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Impressions & Reach Over Time
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Official delivery volume across selected social platforms.
              </p>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="skyImpressions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="emeraldReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  <Area
                    type="monotone"
                    dataKey="impressions"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#skyImpressions)"
                    name="Impressions"
                  />
                  <Area
                    type="monotone"
                    dataKey="reach"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#emeraldReach)"
                    name="Unique Reach"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* 4. Platform Comparison Section */}
      {activeSection === "platforms" && (
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Objective Platform Comparison
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Objective performance comparison across all 6 supported networks.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400">
                    <th className="py-2.5 font-semibold">Network</th>
                    <th className="py-2.5 font-semibold text-right">Published Posts</th>
                    <th className="py-2.5 font-semibold text-right">Reach</th>
                    <th className="py-2.5 font-semibold text-right">Impressions</th>
                    <th className="py-2.5 font-semibold text-right">Engagement</th>
                    <th className="py-2.5 font-semibold text-right">Link Clicks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {platformComparison.map((row) => {
                    const Icon = row.Icon;
                    return (
                      <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5 font-semibold text-slate-800 dark:text-zinc-200">
                            <Icon className="w-4 h-4" />
                            <span>{row.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-right font-medium text-slate-700 dark:text-zinc-300">
                          {row.posts}
                        </td>
                        <td className="py-3 text-right font-medium text-slate-700 dark:text-zinc-300">
                          {row.reach}
                        </td>
                        <td className="py-3 text-right font-medium text-slate-700 dark:text-zinc-300">
                          {row.impressions}
                        </td>
                        <td className="py-3 text-right font-medium text-emerald-600 font-bold">
                          {row.engagement}
                        </td>
                        <td className="py-3 text-right font-medium text-sky-600">
                          {row.clicks}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* 5. Content Performance (Top Content) Section */}
      {activeSection === "content" && (
        <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Content Performance
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Inspect metrics per published post. Click any post to inspect full analytics.
              </p>
            </div>
          </div>

          {sortedContent.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No published posts available for analysis yet. Create and publish a post to populate metrics.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400">
                    <th className="py-2.5 font-semibold">Post Content</th>
                    <th className="py-2.5 font-semibold">Platforms</th>
                    <th className="py-2.5 font-semibold">Published</th>
                    <th className="py-2.5 font-semibold text-right">Reach</th>
                    <th className="py-2.5 font-semibold text-right">Impressions</th>
                    <th className="py-2.5 font-semibold text-right">Engagement</th>
                    <th className="py-2.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {sortedContent.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                      <td className="py-3">
                        <div className="flex items-center gap-3 min-w-0 max-w-xs">
                          <div className="w-9 h-9 rounded-lg bg-zinc-900 shrink-0 overflow-hidden border border-slate-200 dark:border-zinc-700 flex items-center justify-center">
                            {post.mainMediaUrl && !post.mainMediaUrl.startsWith("[Purged") ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={post.mainMediaUrl}
                                alt="Thumbnail"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Clock className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate">
                              {post.title || post.mainCaption.slice(0, 30)}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {post.mainCaption}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          {post.variants
                            .filter((v) => v.publishStatus === "published")
                            .map((v) => {
                              const Icon = PLATFORMS.find((p) => p.id === v.platform)?.Icon || Share2;
                              return <Icon key={v.id} className="w-3.5 h-3.5 text-slate-600" />;
                            })}
                        </div>
                      </td>
                      <td className="py-3 text-slate-500 font-mono text-[11px]">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-3 text-right font-medium text-slate-700">0</td>
                      <td className="py-3 text-right font-medium text-sky-600">0</td>
                      <td className="py-3 text-right font-medium text-emerald-600 font-bold">0</td>
                      <td className="py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setInspectPost(post)}
                          className="h-7 text-[11px] rounded-lg"
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </>
  )}

      {/* 6. Detailed Content Analytics Modal */}
      {inspectPost && (
        <Dialog open={Boolean(inspectPost)} onOpenChange={() => setInspectPost(null)}>
          <DialogContent className="max-w-xl rounded-2xl p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">
                Detailed Post Analytics
              </DialogTitle>
              <DialogDescription className="text-xs">
                Performance breakdown and engagement delivery per connected network.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  {inspectPost.title || "Social Post"}
                </p>
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {inspectPost.mainCaption}
                </p>
              </div>

              {/* Published Variants Matrix */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Network Deliveries
                </p>
                <div className="space-y-1.5">
                  {inspectPost.variants
                    .filter((v) => v.publishStatus === "published")
                    .map((v) => (
                      <div
                        key={v.id}
                        className="p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize text-[10px]">
                            {v.platform}
                          </Badge>
                          <span className="text-slate-500 font-mono text-[11px]">
                            {v.publishedAt ? new Date(v.publishedAt).toLocaleDateString() : ""}
                          </span>
                        </div>

                        {v.externalPostUrl && (
                          <a
                            href={v.externalPostUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 hover:text-sky-700 flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <span>View Live Post</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
