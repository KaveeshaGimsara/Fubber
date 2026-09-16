"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { Input } from "@/ui/input";
import { Badge } from "@/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { PostWithVariants, PostVariant, PlatformType } from "@/lib/db/types";
import { getPublisher } from "@/lib/social/registry";
import { formatDate } from "@/lib/utils";

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "partially_published", label: "Partial" },
  { id: "failed", label: "Failed" },
  { id: "draft", label: "Drafts" },
];

export default function PublishedHistoryPage() {
  const [posts, setPosts] = useState<PostWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedPostDetails, setSelectedPostDetails] = useState<PostWithVariants | null>(null);
  const [retryingVariantId, setRetryingVariantId] = useState<string | null>(null);

  const loadPosts = async () => {
    try {
      const res = await fetch(`/api/posts?status=${selectedStatus}&q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [selectedStatus, search]);

  const handleRetryVariant = async (postId: string, variant: PostVariant) => {
    setRetryingVariantId(variant.id);
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          variantIds: [variant.id],
        }),
      });
      const data = await res.json();
      if (data.success) {
        loadPosts();
        if (selectedPostDetails && selectedPostDetails.id === postId) {
          setSelectedPostDetails(data.post);
        }
      }
    } catch (e) {
      console.error("Retry failed:", e);
    } finally {
      setRetryingVariantId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Publishing History
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Delivery logs, external post links, and retry actions for all connected platforms.
          </p>
        </div>

        <Link href="/create">
          <Button size="sm" className="h-8 rounded-lg text-xs font-medium shadow-none">
            New Post
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedStatus(f.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors shrink-0 ${
                selectedStatus === f.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground hover:text-foreground border-border"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-60">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search caption..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs rounded-lg"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground">
          Loading history...
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl space-y-2">
          <p className="text-xs text-muted-foreground">
            No published posts match your filter.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => {
            const enabledVariants = post.variants.filter((v) => v.isEnabled);

            return (
              <Card
                key={post.id}
                className="rounded-xl border-border p-3.5 shadow-none hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors cursor-pointer"
                onClick={() => setSelectedPostDetails(post)}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-zinc-950 shrink-0 overflow-hidden border border-border flex items-center justify-center">
                      {post.mainMediaUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.mainMediaUrl}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-zinc-500">None</span>
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-medium text-foreground">
                          {post.title || post.mainCaption.slice(0, 40) || "Post"}
                        </h4>
                        <Badge
                          variant={
                            post.status === "published"
                              ? "success"
                              : post.status === "partially_published"
                              ? "warning"
                              : post.status === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[10px] capitalize"
                        >
                          {post.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground truncate max-w-md">
                        {post.mainCaption}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                        <span>{formatDate(post.createdAt)}</span>
                        <span>•</span>
                        <span>{enabledVariants.length} platforms</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto shrink-0">
                    {enabledVariants.map((v) => (
                      <div
                        key={v.id}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1 ${
                          v.publishStatus === "published"
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                            : v.publishStatus === "failed"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        <span className="capitalize">{v.platform}</span>
                        {v.publishStatus === "published" ? (
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        ) : v.publishStatus === "failed" ? (
                          <AlertCircle className="h-2.5 w-2.5" />
                        ) : (
                          <Clock className="h-2.5 w-2.5" />
                        )}
                      </div>
                    ))}

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs rounded-md ml-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPostDetails(post);
                      }}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Post Details & Variant Retry Modal */}
      <Dialog
        open={Boolean(selectedPostDetails)}
        onOpenChange={(open) => !open && setSelectedPostDetails(null)}
      >
        <DialogContent className="max-w-xl">
          {selectedPostDetails && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-sm font-semibold">
                    {selectedPostDetails.title || "Post Details"}
                  </DialogTitle>
                  <Badge
                    variant={
                      selectedPostDetails.status === "published"
                        ? "success"
                        : selectedPostDetails.status === "partially_published"
                        ? "warning"
                        : "destructive"
                    }
                    className="capitalize text-[10px]"
                  >
                    {selectedPostDetails.status.replace("_", " ")}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="p-3 rounded-lg bg-muted/30 border border-border text-xs space-y-1">
                <span className="font-medium text-foreground block">Master Caption</span>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {selectedPostDetails.mainCaption}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-medium text-foreground block">
                  Delivery Status per Platform
                </span>

                <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                  {selectedPostDetails.variants.map((v) => {
                    const pub = getPublisher(v.platform as PlatformType);
                    const isRetrying = retryingVariantId === v.id;

                    return (
                      <div
                        key={v.id}
                        className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {pub.displayName}
                            </span>
                            <Badge
                              variant={
                                v.publishStatus === "published"
                                  ? "success"
                                  : v.publishStatus === "failed"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="text-[9px] capitalize"
                            >
                              {v.publishStatus}
                            </Badge>
                          </div>

                          {v.externalPostId && (
                            <p className="text-[10px] text-muted-foreground font-mono">
                              ID: {v.externalPostId}
                            </p>
                          )}

                          {v.errorMessage && (
                            <p className="text-[10px] text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 shrink-0" />
                              <span>{v.errorMessage}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {v.externalPostUrl && (
                            <a
                              href={v.externalPostUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}

                          {v.publishStatus === "failed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[11px] gap-1 px-2"
                              disabled={isRetrying}
                              onClick={() =>
                                handleRetryVariant(selectedPostDetails.id, v)
                              }
                            >
                              <RefreshCw
                                className={`h-2.5 w-2.5 ${isRetrying ? "animate-spin" : ""}`}
                              />
                              <span>Retry</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
