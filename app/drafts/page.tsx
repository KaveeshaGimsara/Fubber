"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  ArrowRight,
  Clock,
  Search,
} from "lucide-react";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { Input } from "@/ui/input";
import { Badge } from "@/ui/badge";
import { PostWithVariants } from "@/lib/db/types";

export default function DraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<PostWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadDrafts = async () => {
    try {
      const res = await fetch("/api/posts?status=draft");
      const data = await res.json();
      if (data.success) {
        setDrafts(data.posts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;
    try {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setDrafts((prev) => [data.post, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = drafts.filter(
    (d) =>
      d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.mainCaption.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Saved Drafts
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Continue editing drafts or create new variants.
          </p>
        </div>

        <Link href="/create">
          <Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-medium shadow-none">
            <Plus className="h-3.5 w-3.5" />
            <span>New Draft</span>
          </Button>
        </Link>
      </div>

      <div className="max-w-xs">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Filter drafts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs rounded-lg"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground">
          Loading drafts...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl space-y-2.5">
          <p className="text-xs text-muted-foreground">
            No saved drafts found.
          </p>
          <Link href="/create">
            <Button size="sm" variant="outline" className="h-7 text-xs rounded-md">
              Start a new post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((draft) => (
            <Card
              key={draft.id}
              className="rounded-xl border-border p-3.5 shadow-none hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                <div className="w-full h-36 rounded-lg overflow-hidden bg-zinc-950 border border-border flex items-center justify-center">
                  {draft.mainMediaUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={draft.mainMediaUrl}
                      alt="Draft media"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-zinc-500">No image</span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-medium text-foreground truncate">
                      {draft.title || draft.mainCaption.slice(0, 30) || "Untitled Draft"}
                    </h4>
                    <Badge variant="secondary" className="text-[10px]">
                      Draft
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {draft.mainCaption || "Empty caption"}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-border flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                  <Clock className="h-3 w-3" />
                  {new Date(draft.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => handleDuplicate(draft.id)}
                    title="Duplicate"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(draft.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Link href={`/create?edit=${draft.id}`}>
                    <Button size="sm" className="h-7 px-2.5 text-xs gap-1 rounded-md shadow-none">
                      <span>Edit</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
