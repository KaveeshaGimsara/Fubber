"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  CheckCircle2,
  Filter,
  Send,
  CornerDownRight,
  Sparkles,
  Heart,
  Clock,
  Check,
} from "lucide-react";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import {
  InstagramIcon,
  YouTubeIcon,
  FacebookIcon,
  XIcon,
} from "@/components/icons/social-icons";

interface CommentItem {
  id: string;
  authorName: string;
  authorHandle: string;
  avatarUrl: string;
  platform: "instagram" | "youtube" | "facebook" | "x";
  text: string;
  postTitle: string;
  timeAgo: string;
  isAnswered: boolean;
  replies?: string[];
}

const INITIAL_COMMENTS: CommentItem[] = [];

export default function CommunityPage() {
  const [comments, setComments] = useState<CommentItem[]>(INITIAL_COMMENTS);
  const [filter, setFilter] = useState<"all" | "unanswered" | "answered">("unanswered");
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const filteredComments = comments.filter((c) => {
    if (filter === "unanswered") return !c.isAnswered;
    if (filter === "answered") return c.isAnswered;
    return true;
  });

  const handleSendReply = (id: string) => {
    const text = replyText[id]?.trim();
    if (!text) return;

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            isAnswered: true,
            replies: [...(c.replies || []), text],
          };
        }
        return c;
      })
    );

    setReplyText((prev) => ({ ...prev, [id]: "" }));
    setActiveReplyId(null);
  };

  const handleMarkResolved = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isAnswered: true } : c))
    );
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Community Engagement Inbox
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Respond to comments, answer queries, and manage follower conversations across all connected networks.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <button
            onClick={() => setFilter("unanswered")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === "unanswered"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Unanswered ({comments.filter((c) => !c.isAnswered).length})
          </button>
          <button
            onClick={() => setFilter("answered")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === "answered"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Answered ({comments.filter((c) => c.isAnswered).length})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === "all"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {filteredComments.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-slate-200 dark:border-zinc-800 p-12 text-center shadow-none">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
              Inbox Zero!
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
              All community comments across your social channels have been answered.
            </p>
          </Card>
        ) : (
          filteredComments.map((comment) => (
            <Card
              key={comment.id}
              className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-5 space-y-4"
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-zinc-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={comment.avatarUrl}
                      alt={comment.authorName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-sm">
                      {comment.platform === "instagram" && (
                        <InstagramIcon className="w-2.5 h-2.5 text-pink-600" />
                      )}
                      {comment.platform === "youtube" && (
                        <YouTubeIcon className="w-2.5 h-2.5 text-red-600" />
                      )}
                      {comment.platform === "facebook" && (
                        <FacebookIcon className="w-2.5 h-2.5 text-blue-600" />
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {comment.authorName}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-zinc-500 font-normal">
                        {comment.authorHandle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{comment.timeAgo}</span>
                      <span>•</span>
                      <span>on {comment.postTitle}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {!comment.isAnswered && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkResolved(comment.id)}
                      className="h-7 rounded-xl text-[11px] gap-1 text-slate-500 hover:text-emerald-600"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark Resolved</span>
                    </Button>
                  )}
                  <Badge
                    variant={comment.isAnswered ? "success" : "secondary"}
                    className="text-[10px]"
                  >
                    {comment.isAnswered ? "Answered" : "Unanswered"}
                  </Badge>
                </div>
              </div>

              {/* Comment Text */}
              <div className="pl-12">
                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
                  {comment.text}
                </p>

                {/* Existing replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-2.5 space-y-1.5 pl-3 border-l-2 border-emerald-500/50">
                    {comment.replies.map((reply, i) => (
                      <p
                        key={i}
                        className="text-xs text-emerald-900 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 p-2.5 rounded-lg"
                      >
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400 mr-1.5">
                          You replied:
                        </span>
                        {reply}
                      </p>
                    ))}
                  </div>
                )}

                {/* Reply Input Box */}
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Reply to ${comment.authorHandle}...`}
                    value={replyText[comment.id] || ""}
                    onChange={(e) =>
                      setReplyText((prev) => ({ ...prev, [comment.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendReply(comment.id);
                    }}
                    className="grow h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-background text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSendReply(comment.id)}
                    disabled={!replyText[comment.id]?.trim()}
                    className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
