"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Radio,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Calendar,
  Send,
  RefreshCw,
  ExternalLink,
  Activity,
  Zap,
  Shield,
  FileText,
  Image as ImageIcon,
  ArrowRight,
  TrendingUp,
  MousePointer,
  Share2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { PostWithVariants, SocialAccount } from "@/lib/db/types";
import {
  FacebookIcon,
  InstagramIcon,
  ThreadsIcon,
  XIcon,
  PinterestIcon,
  YouTubeIcon,
  LinkedInIcon,
} from "@/components/icons/social-icons";

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  threads: ThreadsIcon,
  x: XIcon,
  linkedin: LinkedInIcon,
  pinterest: PinterestIcon,
  youtube: YouTubeIcon,
};

const ALL_PLATFORMS = [
  { id: "facebook", name: "Facebook", Icon: FacebookIcon },
  { id: "instagram", name: "Instagram", Icon: InstagramIcon },
  { id: "threads", name: "Threads", Icon: ThreadsIcon },
  { id: "x", name: "X", Icon: XIcon },
  { id: "linkedin", name: "LinkedIn", Icon: LinkedInIcon },
  { id: "pinterest", name: "Pinterest", Icon: PinterestIcon },
  { id: "youtube", name: "YouTube", Icon: YouTubeIcon },
];

export default function FubberDashboardPage() {
  const [posts, setPosts] = useState<PostWithVariants[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    async function loadData() {
      try {
        const [postsRes, accountsRes] = await Promise.all([
          fetch("/api/posts"),
          fetch("/api/accounts"),
        ]);
        const postsData = await postsRes.json();
        const accountsData = await accountsRes.json();

        if (postsData.success) setPosts(postsData.posts || []);
        if (accountsData.success) setAccounts(accountsData.accounts || []);
      } catch (err) {
        console.error("Dashboard data load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Computed Metrics (strictly real data)
  const totalPosts = posts.length;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const publishedToday = posts.filter(
    (p) =>
      (p.status === "published" || p.status === "partially_published") &&
      p.publishedAt &&
      new Date(p.publishedAt) >= startOfToday
  ).length;

  const publishedThisMonth = posts.filter(
    (p) =>
      (p.status === "published" || p.status === "partially_published") &&
      p.publishedAt &&
      new Date(p.publishedAt) >= startOfMonth
  ).length;

  const successfulPublications = posts.filter((p) => p.status === "published").length;
  const failedPublications = posts.filter((p) => p.status === "failed").length;
  const partialPublications = posts.filter((p) => p.status === "partially_published").length;
  const draftsCount = posts.filter((p) => p.status === "draft").length;
  const scheduledPosts = posts.filter((p) => p.status === "scheduled");

  const connectedChannels = accounts.filter((a) => a.isConnected);
  const apiWarnings = connectedChannels.filter((a) => a.apiStatus === "warning").length;

  // Chart data calculation
  const chartDays = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
  const activityChartData = useMemo(() => {
    const daysArray = [];
    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const publishedOnDay = posts.filter(
        (p) =>
          p.publishedAt &&
          new Date(p.publishedAt) >= dayStart &&
          new Date(p.publishedAt) <= dayEnd
      ).length;

      const failedOnDay = posts.filter(
        (p) =>
          p.status === "failed" &&
          new Date(p.createdAt) >= dayStart &&
          new Date(p.createdAt) <= dayEnd
      ).length;

      daysArray.push({
        date: dayStr,
        published: publishedOnDay,
        failed: failedOnDay,
      });
    }
    return daysArray;
  }, [posts, chartDays]);

  // Recent Activity Feed
  const recentActivities = useMemo(() => {
    const activities: Array<{
      id: string;
      platform: string;
      action: string;
      status: "success" | "failed" | "partial" | "scheduled";
      time: string;
      postTitle: string;
      error?: string | null;
    }> = [];

    posts.forEach((post) => {
      post.variants.forEach((v) => {
        if (v.publishStatus === "published") {
          activities.push({
            id: `act_${v.id}_pub`,
            platform: v.platform,
            action: "Post published",
            status: "success",
            time: v.publishedAt
              ? new Date(v.publishedAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Recently",
            postTitle: post.title || post.mainCaption.slice(0, 35) || "Social Post",
          });
        } else if (v.publishStatus === "failed") {
          activities.push({
            id: `act_${v.id}_fail`,
            platform: v.platform,
            action: "Publishing failed",
            status: "failed",
            time: new Date(v.updatedAt).toLocaleDateString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            postTitle: post.title || post.mainCaption.slice(0, 35) || "Social Post",
            error: v.errorMessage || "OAuth token error or media rejected by network",
          });
        }
      });
    });

    return activities.slice(0, 8);
  }, [posts]);

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto">
      {/* 1. Header & Quick Actions Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Fubber social media command center. Monitor real-time publications, channel health, and delivery metrics.
          </p>
        </div>

        {/* Quick Actions Row */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/create">
            <Button
              size="sm"
              className="rounded-xl h-9 px-3.5 text-xs font-semibold gap-1.5 bg-sky-500 hover:bg-sky-600 text-white shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Post</span>
            </Button>
          </Link>
          <Link href="/channels">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-9 px-3 text-xs font-semibold gap-1.5 border-slate-200 dark:border-zinc-800"
            >
              <Radio className="w-3.5 h-3.5 text-sky-500" />
              <span>Connect Channel</span>
            </Button>
          </Link>
          <Link href="/analytics">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-9 px-3 text-xs font-semibold gap-1.5 border-slate-200 dark:border-zinc-800"
            >
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Analytics</span>
            </Button>
          </Link>
          <Link href="/published">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-9 px-3 text-xs font-semibold gap-1.5 border-slate-200 dark:border-zinc-800"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Published</span>
            </Button>
          </Link>
          <Link href="/media">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-9 px-3 text-xs font-semibold gap-1.5 border-slate-200 dark:border-zinc-800"
            >
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Media</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Overview KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-4">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Total Posts
          </p>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalPosts}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">All time</span>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-4">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Published Today
          </p>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
            {publishedToday}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            {publishedThisMonth} this month
          </span>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-4">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Successful
          </p>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {successfulPublications}
          </div>
          <span className="text-[10px] text-emerald-600 block mt-1">Delivered</span>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-4">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Failed / Partial
          </p>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {failedPublications + partialPublications}
          </div>
          <span className="text-[10px] text-rose-500 block mt-1">Requires review</span>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-4">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Drafts
          </p>
          <div className="text-2xl font-black text-slate-800 dark:text-zinc-200 mt-1">
            {draftsCount}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Unfinished drafts</span>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-4">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Connected Channels
          </p>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {connectedChannels.length} / 6
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Active networks</span>
        </Card>
      </div>

      {/* 3. Publishing Activity Chart Section */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Publishing Activity
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Posts published and delivery successes over time.
            </p>
          </div>

          {/* Timeframe Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
            {(["7d", "30d", "90d"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  timeframe === t
                    ? "bg-white dark:bg-zinc-800 text-sky-600 dark:text-sky-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t === "7d" ? "7 Days" : t === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityChartData}>
              <defs>
                <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e2e8f0",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                }}
              />
              <Area
                type="monotone"
                dataKey="published"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#skyGradient)"
                name="Published"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 4. API Health Dashboard Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Channel API Health
            </h2>
          </div>
          <Link
            href="/channels"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
          >
            <span>Manage All Channels</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ALL_PLATFORMS.map((platform) => {
            const acc = accounts.find((a) => a.platform === platform.id && a.isConnected);
            const isConnected = Boolean(acc);
            const status = acc?.apiStatus || (isConnected ? "healthy" : "disconnected");
            const Icon = platform.Icon;

            return (
              <Link key={platform.id} href="/channels">
                <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-3.5 hover:border-sky-300 dark:hover:border-sky-800 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-4 h-4" />
                    <span
                      className={`w-2 h-2 rounded-full ${
                        status === "healthy"
                          ? "bg-emerald-500 animate-pulse"
                          : status === "warning"
                          ? "bg-amber-500"
                          : status === "rate_limited"
                          ? "bg-purple-500"
                          : status === "auth_required"
                          ? "bg-rose-500"
                          : "bg-slate-300 dark:bg-zinc-700"
                      }`}
                    />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                    {platform.name}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                    {status.replace("_", " ")}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 5. Split Section: Recent Activity & Up Next Scheduled */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity Feed */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Activity Feed
            </h2>
            <Link
              href="/published"
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
            >
              View History
            </Link>
          </div>

          {recentActivities.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No recent publishing activity recorded yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {recentActivities.map((act) => {
                const Icon = PLATFORM_ICONS[act.platform] || Share2;

                return (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">
                            {act.action}
                          </span>
                          <Badge
                            variant={act.status === "success" ? "success" : "destructive"}
                            className="text-[9px] px-1.5 py-0"
                          >
                            {act.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                          {act.postTitle}
                        </p>
                        {act.error && (
                          <p className="text-[10px] text-rose-600 mt-0.5 truncate">
                            {act.error}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {act.time}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Up Next Scheduled Posts */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Up Next · Scheduled ({scheduledPosts.length})
            </h2>
            <Link
              href="/scheduled"
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
            >
              All Scheduled
            </Link>
          </div>

          {scheduledPosts.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Calendar className="w-8 h-8 text-slate-300 dark:text-zinc-700 mx-auto" />
              <p className="text-xs text-slate-500">No upcoming posts scheduled.</p>
              <Link href="/create">
                <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg mt-1">
                  <Plus className="w-3 h-3 mr-1" />
                  Schedule Post
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {scheduledPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 shrink-0 overflow-hidden border border-slate-200 dark:border-zinc-700 flex items-center justify-center">
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
                        {post.title || post.mainCaption.slice(0, 35) || "Scheduled Post"}
                      </p>
                      <p className="text-[10px] text-sky-600 dark:text-sky-400 font-medium mt-0.5">
                        {post.scheduledFor
                          ? new Date(post.scheduledFor).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Queued"}
                      </p>
                    </div>
                  </div>

                  <Link href={`/create?edit=${post.id}`}>
                    <Button size="sm" variant="outline" className="h-7 text-[11px] rounded-lg">
                      Edit
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
