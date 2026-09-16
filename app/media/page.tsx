"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Search,
  SlidersHorizontal,
  Send,
  Database,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { Input } from "@/ui/input";
import { Badge } from "@/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog";
import { formatBytes } from "@/lib/utils";

interface MediaWithUsage {
  id: string;
  filename: string;
  url: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  format?: string;
  createdAt: string;
  usageCount: number;
  usedInPostTitles: string[];
}

export default function MediaLibraryPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mediaList, setMediaList] = useState<MediaWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "size">("newest");
  const [selectedAsset, setSelectedAsset] = useState<MediaWithUsage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [storageStats, setStorageStats] = useState<{
    activeAssetsCount: number;
    currentBytes: number;
    totalReclaimedBytes: number;
    purgedPostsCount: number;
  } | null>(null);
  const [isPurging, setIsPurging] = useState(false);

  const loadMedia = async () => {
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (data.success) {
        setMediaList(data.media);
        if (data.stats) setStorageStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePurgeExpired = async () => {
    setIsPurging(true);
    try {
      const res = await fetch("/api/cron/cleanup", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await loadMedia();
      }
    } catch (err) {
      console.error("Manual purge error:", err);
    } finally {
      setIsPurging(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        loadMedia();
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this media asset?")) return;
    try {
      await fetch(`/api/media?id=${id}`, { method: "DELETE" });
      setMediaList((prev) => prev.filter((m) => m.id !== id));
      if (selectedAsset?.id === id) setSelectedAsset(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMedia = mediaList
    .filter((m) => m.filename.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return b.fileSize - a.fileSize;
      }
    });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Media Library
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Store, inspect, and reuse assets across your campaigns.
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-8 gap-1.5 rounded-lg text-xs font-medium shadow-none"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>{isUploading ? "Uploading..." : "Upload Image"}</span>
          </Button>
        </div>
      </div>

      {/* Storage Quota & 1-Hour Auto-Purge Manager */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                  Storage Optimizer (1-Hour Auto-Purge)
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-normal">
                Post images auto-purge 1 hour after successful publication to prevent database & blob quota spikes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="text-left md:text-right">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Active Footprint</p>
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                {formatBytes(storageStats?.currentBytes || 0)} ({storageStats?.activeAssetsCount || 0} files)
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Storage Saved</p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {formatBytes(storageStats?.totalReclaimedBytes || 0)} ({storageStats?.purgedPostsCount || 0} posts)
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handlePurgeExpired}
              disabled={isPurging}
              className="h-8 rounded-xl text-xs gap-1.5 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPurging ? "animate-spin" : ""}`} />
              <span>Purge Expired</span>
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-64">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs rounded-lg"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Sort:</span>
          <div className="flex items-center gap-1 p-0.5 bg-card border border-border rounded-lg">
            {(["newest", "oldest", "size"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                  sortBy === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground">
          Loading media...
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            No media uploaded.
          </p>
          <p className="text-[11px] text-slate-400">
            Upload an image to begin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredMedia.map((asset) => (
            <Card
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className="group rounded-xl border-border overflow-hidden shadow-none hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-square w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.url}
                  alt={asset.filename}
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-medium bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded">
                    {asset.usageCount} post{asset.usageCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-card space-y-0.5">
                <p className="text-xs font-medium text-foreground truncate" title={asset.filename}>
                  {asset.filename}
                </p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span>{asset.width}×{asset.height}</span>
                  <span>{formatBytes(asset.fileSize)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Asset Inspection Dialog */}
      <Dialog
        open={Boolean(selectedAsset)}
        onOpenChange={(open) => !open && setSelectedAsset(null)}
      >
        <DialogContent className="max-w-lg">
          {selectedAsset && (
            <div className="space-y-3">
              <DialogHeader>
                <DialogTitle className="text-sm font-semibold truncate">
                  {selectedAsset.filename}
                </DialogTitle>
              </DialogHeader>

              <div className="rounded-xl overflow-hidden bg-black max-h-[300px] flex items-center justify-center border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.filename}
                  className="max-h-[300px] w-full object-contain"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px] font-sans">Dimensions</span>
                  <span className="text-foreground">{selectedAsset.width} × {selectedAsset.height}</span>
                </div>
                <div className="p-2 rounded-lg bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px] font-sans">Size</span>
                  <span className="text-foreground">{formatBytes(selectedAsset.fileSize)}</span>
                </div>
                <div className="p-2 rounded-lg bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px] font-sans">Usage</span>
                  <span className="text-foreground">{selectedAsset.usageCount} posts</span>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 mt-3 flex items-center justify-between w-full">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(selectedAsset.id)}
                  className="text-destructive hover:bg-destructive/10 text-xs h-7 gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete</span>
                </Button>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAsset(null)}
                    className="text-xs h-7"
                  >
                    Close
                  </Button>
                  <Link href="/create">
                    <Button size="sm" className="text-xs h-7 gap-1 shadow-none">
                      <Send className="h-3 w-3" />
                      <span>Use in Post</span>
                    </Button>
                  </Link>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
