"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Send,
  Trash2,
  Edit2,
  Copy,
  Ban,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Globe,
  ChevronLeft,
  ChevronRight,
  List as ListIcon,
  CalendarDays,
  Columns,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/ui/dialog";
import { PostWithVariants, PlatformType } from "@/lib/db/types";
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

export default function ScheduledPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "published" | "failed" | "cancelled">("upcoming");
  const [viewMode, setViewMode] = useState<"list" | "month" | "week">("list");
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [selectedPostDetails, setSelectedPostDetails] = useState<PostWithVariants | null>(null);

  const loadPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Filter posts by active tab
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (activeTab === "upcoming") {
        return p.status === "scheduled";
      }
      if (activeTab === "published") {
        return p.status === "published" || p.status === "partially_published";
      }
      if (activeTab === "failed") {
        return p.status === "failed";
      }
      if (activeTab === "cancelled") {
        return p.status === "cancelled";
      }
      return false;
    });
  }, [posts, activeTab]);

  // Actions
  const handlePublishNow = async (postId: string) => {
    setActionInProgress(postId);
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (data.success) {
        await loadPosts();
        if (selectedPostDetails?.id === postId) setSelectedPostDetails(null);
      }
    } catch (err) {
      console.error("Publish now failed:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDuplicate = async (postId: string) => {
    setActionInProgress(postId);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate" }),
      });
      const data = await res.json();
      if (data.success) {
        await loadPosts();
        if (data.post?.id) {
          router.push(`/create?edit=${data.post.id}`);
        }
      }
    } catch (err) {
      console.error("Duplicate failed:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCancel = async (postId: string) => {
    setActionInProgress(postId);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await res.json();
      if (data.success) {
        await loadPosts();
        if (selectedPostDetails?.id === postId) setSelectedPostDetails(null);
      }
    } catch (err) {
      console.error("Cancel failed:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to permanently delete this scheduled post?")) return;
    setActionInProgress(postId);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        if (selectedPostDetails?.id === postId) setSelectedPostDetails(null);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Calendar Helpers (Month View)
  const monthStart = new Date(
    currentCalendarDate.getFullYear(),
    currentCalendarDate.getMonth(),
    1
  );
  const monthEnd = new Date(
    currentCalendarDate.getFullYear(),
    currentCalendarDate.getMonth() + 1,
    0
  );
  const startDayOfWeek = monthStart.getDay(); // 0 = Sunday
  const daysInMonth = monthEnd.getDate();

  // Calendar Helpers (Week View)
  const weekStart = new Date(currentCalendarDate);
  weekStart.setDate(currentCalendarDate.getDate() - currentCalendarDate.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const scheduledCounts = {
    upcoming: posts.filter((p) => p.status === "scheduled").length,
    published: posts.filter((p) => p.status === "published" || p.status === "partially_published").length,
    failed: posts.filter((p) => p.status === "failed").length,
    cancelled: posts.filter((p) => p.status === "cancelled").length,
  };

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Scheduled Posts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated serverless post execution, calendar views, and cross-platform publishing status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-white dark:bg-zinc-800 text-sky-600 dark:text-sky-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === "week"
                  ? "bg-white dark:bg-zinc-800 text-sky-600 dark:text-sky-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Week</span>
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === "month"
                  ? "bg-white dark:bg-zinc-800 text-sky-600 dark:text-sky-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Month</span>
            </button>
          </div>

          <Link href="/create">
            <Button className="h-9 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-none">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Post</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        {(["upcoming", "published", "failed", "cancelled"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize flex items-center gap-1.5 transition-colors ${
              activeTab === tab
                ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>{tab}</span>
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
            >
              {scheduledCounts[tab]}
            </Badge>
          </button>
        ))}
      </div>

      {/* Calendar Navigation when in Month or Week View */}
      {viewMode !== "list" && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const next = new Date(currentCalendarDate);
                if (viewMode === "month") next.setMonth(next.getMonth() - 1);
                else next.setDate(next.getDate() - 7);
                setCurrentCalendarDate(next);
              }}
              className="h-8 w-8 p-0 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const next = new Date(currentCalendarDate);
                if (viewMode === "month") next.setMonth(next.getMonth() + 1);
                else next.setDate(next.getDate() + 7);
                setCurrentCalendarDate(next);
              }}
              className="h-8 w-8 p-0 rounded-xl"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <span className="text-xs font-bold text-slate-900 dark:text-white ml-2">
              {currentCalendarDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentCalendarDate(new Date())}
            className="h-8 text-xs text-sky-600 hover:text-sky-700 font-semibold"
          >
            Today
          </Button>
        </div>
      )}

      {/* View 1: LIST VIEW */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {filteredPosts.length === 0 ? (
            <Card className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {activeTab === "upcoming"
                  ? "No scheduled posts yet."
                  : `No ${activeTab} posts recorded.`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {activeTab === "upcoming"
                  ? "Create and schedule posts to publish automatically at your chosen time."
                  : "Posts in this status will appear here automatically."}
              </p>
              {activeTab === "upcoming" && (
                <div className="mt-6">
                  <Link href="/create">
                    <Button className="h-9 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold">
                      Schedule a Post
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          ) : (
            filteredPosts.map((post) => {
              const enabledVariants = post.variants.filter((v) => v.isEnabled);
              const isProcessing = actionInProgress === post.id;
              const scheduledDate = post.scheduledFor ? new Date(post.scheduledFor) : null;

              return (
                <Card
                  key={post.id}
                  className="rounded-2xl border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-none hover:border-slate-300 dark:hover:border-zinc-700 transition-all"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Thumbnail + Details */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                        {post.mainMediaUrl && !post.mainMediaUrl.startsWith("[Purged") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.mainMediaUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Clock className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {post.title || post.mainCaption.slice(0, 45) || "Scheduled Post"}
                          </h4>
                          <Badge
                            variant={
                              post.status === "published"
                                ? "success"
                                : post.status === "failed"
                                ? "destructive"
                                : post.status === "cancelled"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-[10px] px-2 py-0 capitalize"
                          >
                            {post.scheduleStatus || post.status}
                          </Badge>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {post.mainCaption}
                        </p>

                        {/* Scheduling Time & Timezone Metadata */}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                          {scheduledDate && (
                            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-zinc-300">
                              <CalendarIcon className="w-3.5 h-3.5 text-sky-500" />
                              <span>
                                {scheduledDate.toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              <span>·</span>
                              <span>
                                {scheduledDate.toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </span>
                          )}

                          <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md">
                            <Globe className="w-3 h-3" />
                            <span>{post.timezone || "UTC"}</span>
                          </span>

                          {/* Platforms */}
                          <div className="flex items-center gap-1">
                            {enabledVariants.map((v) => {
                              const Icon = PLATFORM_ICONS[v.platform];
                              return Icon ? (
                                <div
                                  key={v.id}
                                  title={`${v.platform}: ${v.publishStatus}`}
                                  className="w-5 h-5 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center"
                                >
                                  <Icon className="w-3 h-3" />
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>

                        {post.lastError && (
                          <p className="text-[11px] text-rose-600 font-medium pt-1">
                            Error: {post.lastError}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPostDetails(post)}
                        className="h-8 text-[11px] rounded-xl px-2.5"
                      >
                        Details
                      </Button>

                      {post.status === "scheduled" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => handlePublishNow(post.id)}
                          className="h-8 text-[11px] rounded-xl px-2.5 text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/30"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          <span>Publish Now</span>
                        </Button>
                      )}

                      <Link href={`/create?edit=${post.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isProcessing}
                          className="h-8 text-[11px] rounded-xl px-2.5"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          <span>Edit</span>
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleDuplicate(post.id)}
                        className="h-8 text-[11px] rounded-xl px-2.5"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        <span>Duplicate</span>
                      </Button>

                      {post.status === "scheduled" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => handleCancel(post.id)}
                          className="h-8 text-[11px] rounded-xl px-2.5 text-amber-600 hover:text-amber-700"
                        >
                          <Ban className="w-3 h-3 mr-1" />
                          <span>Cancel</span>
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleDelete(post.id)}
                        className="h-8 text-[11px] rounded-xl px-2.5 text-rose-600 hover:text-rose-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* View 2: MONTH CALENDAR VIEW */}
      {viewMode === "month" && (
        <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-none">
          <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-zinc-800 rounded-xl overflow-hidden text-center text-xs">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2.5 bg-slate-50 dark:bg-zinc-900 font-semibold text-slate-600 dark:text-zinc-400">
                {day}
              </div>
            ))}

            {/* Empty offset padding */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`offset_${i}`} className="min-h-[100px] bg-white dark:bg-zinc-950 p-1 opacity-30" />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const cellDate = new Date(
                currentCalendarDate.getFullYear(),
                currentCalendarDate.getMonth(),
                dayNum
              );
              const isToday =
                new Date().toDateString() === cellDate.toDateString();

              // Posts scheduled on this day
              const dayPosts = posts.filter((p) => {
                if (!p.scheduledFor) return false;
                const d = new Date(p.scheduledFor);
                return (
                  d.getFullYear() === cellDate.getFullYear() &&
                  d.getMonth() === cellDate.getMonth() &&
                  d.getDate() === dayNum
                );
              });

              return (
                <div
                  key={`day_${dayNum}`}
                  className={`min-h-[110px] bg-white dark:bg-zinc-950 p-1.5 text-left border-t border-slate-100 dark:border-zinc-900 ${
                    isToday ? "ring-1 ring-inset ring-sky-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                        isToday
                          ? "bg-sky-500 text-white font-bold"
                          : "text-slate-700 dark:text-zinc-300"
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayPosts.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {dayPosts.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 max-h-[85px] overflow-y-auto pr-0.5">
                    {dayPosts.map((post) => (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => setSelectedPostDetails(post)}
                        className="w-full text-left p-1 rounded-md bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-100 dark:border-sky-900/40 text-[11px] truncate block transition-colors"
                      >
                        <span className="font-semibold text-sky-900 dark:text-sky-200">
                          {post.scheduledFor
                            ? new Date(post.scheduledFor).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                        <span className="text-slate-600 dark:text-zinc-300 ml-1 truncate">
                          {post.title || post.mainCaption.slice(0, 18)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* View 3: WEEK VIEW */}
      {viewMode === "week" && (
        <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-none">
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((date) => {
              const isToday =
                new Date().toDateString() === date.toDateString();

              const dayPosts = posts.filter((p) => {
                if (!p.scheduledFor) return false;
                const d = new Date(p.scheduledFor);
                return d.toDateString() === date.toDateString();
              });

              return (
                <div
                  key={date.toISOString()}
                  className={`p-3 rounded-xl border ${
                    isToday
                      ? "border-sky-400 dark:border-sky-800 bg-sky-50/20 dark:bg-sky-950/20"
                      : "border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30"
                  } min-h-[300px] flex flex-col`}
                >
                  <div className="pb-2 border-b border-slate-200 dark:border-zinc-800 mb-2">
                    <span className="text-[11px] font-medium text-slate-500 block uppercase tracking-wider">
                      {date.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        isToday ? "text-sky-600 dark:text-sky-400" : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {dayPosts.length === 0 ? (
                      <span className="text-[11px] text-slate-400 block text-center pt-8">
                        No posts
                      </span>
                    ) : (
                      dayPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => setSelectedPostDetails(post)}
                          className="p-2 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs hover:border-sky-300 dark:hover:border-sky-800 cursor-pointer space-y-1 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sky-600 dark:text-sky-400 text-[10px]">
                              {post.scheduledFor
                                ? new Date(post.scheduledFor).toLocaleTimeString([], {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                            <Badge variant="secondary" className="text-[9px] px-1 py-0">
                              {post.status}
                            </Badge>
                          </div>
                          <p className="text-[11px] font-medium text-slate-800 dark:text-zinc-200 truncate">
                            {post.title || post.mainCaption}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Post Details & Inspect Modal */}
      {selectedPostDetails && (
        <Dialog open={Boolean(selectedPostDetails)} onOpenChange={() => setSelectedPostDetails(null)}>
          <DialogContent className="max-w-lg rounded-2xl p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">
                Scheduled Post Details
              </DialogTitle>
              <DialogDescription className="text-xs">
                Inspect scheduled timing, target channels, captions, and independent publishing status.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {/* Media Preview + Caption */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex gap-3">
                {selectedPostDetails.mainMediaUrl && !selectedPostDetails.mainMediaUrl.startsWith("[Purged") && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-zinc-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedPostDetails.mainMediaUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {selectedPostDetails.title || "Post"}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-3">
                    {selectedPostDetails.mainCaption}
                  </p>
                </div>
              </div>

              {/* Timing & Timezone */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                    Scheduled For
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {selectedPostDetails.scheduledFor
                      ? new Date(selectedPostDetails.scheduledFor).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                    Configured Timezone
                  </span>
                  <span className="font-mono text-slate-600 dark:text-zinc-300">
                    {selectedPostDetails.timezone || "UTC"}
                  </span>
                </div>
              </div>

              {/* Platform Variant Breakdown */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block">
                  Configured Platforms ({selectedPostDetails.variants.filter((v) => v.isEnabled).length})
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedPostDetails.variants
                    .filter((v) => v.isEnabled)
                    .map((v) => {
                      const Icon = PLATFORM_ICONS[v.platform];
                      return (
                        <div
                          key={v.id}
                          className="p-2 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            {Icon && <Icon className="w-4 h-4" />}
                            <span className="font-semibold capitalize text-slate-800 dark:text-zinc-200">
                              {v.platform}
                            </span>
                          </div>

                          <Badge
                            variant={
                              v.publishStatus === "published"
                                ? "success"
                                : v.publishStatus === "failed"
                                ? "destructive"
                                : "outline"
                            }
                            className="text-[10px] px-1.5 py-0 capitalize"
                          >
                            {v.publishStatus}
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPostDetails(null)}
                className="text-xs h-8 rounded-xl"
              >
                Close
              </Button>

              {selectedPostDetails.status === "scheduled" && (
                <Button
                  size="sm"
                  onClick={() => handlePublishNow(selectedPostDetails.id)}
                  className="text-xs h-8 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Publish Now
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
