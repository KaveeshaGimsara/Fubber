import React from "react";
import { Globe, ThumbsUp, MessageSquare, Repeat2, Send, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";

import { FubberLogo, FUBBER_AVATAR_DATA_URI } from "@/components/icons/fubber-logo";

interface LinkedInPreviewProps {
  authorName?: string;
  avatarUrl?: string;
  headline?: string;
  caption: string;
  imageUrl?: string | null;
  aspectRatio?: string;
}

export function LinkedInPreview({
  authorName = "Fubber",
  avatarUrl = FUBBER_AVATAR_DATA_URI,
  headline = "Next-Gen Social Media Publishing & Analytics",
  caption,
  imageUrl,
}: LinkedInPreviewProps) {
  const displayAvatar = avatarUrl || FUBBER_AVATAR_DATA_URI;

  return (
    <div className="w-full max-w-[500px] mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden font-sans text-sm">
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 ring-1 ring-zinc-200 dark:ring-zinc-700">
            <AvatarImage src={displayAvatar} alt={authorName} />
            <AvatarFallback className="bg-sky-500 text-white">
              <FubberLogo className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight flex items-center gap-1.5">
              <span>{authorName}</span>
              <span className="text-xs text-zinc-400 font-normal">• 1st</span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
              {headline}
            </div>
            <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
              <span>Now</span>
              <span>•</span>
              <Globe className="h-3 w-3" />
            </div>
          </div>
        </div>
        <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Caption */}
      <div className="px-4 pb-3 text-zinc-900 dark:text-zinc-100 whitespace-pre-line leading-relaxed text-[13.5px]">
        {caption || <span className="text-zinc-400 italic">No post copy added yet...</span>}
      </div>

      {/* Image */}
      {imageUrl ? (
        <div className="relative w-full bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center overflow-hidden border-y border-zinc-100 dark:border-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="LinkedIn Post Preview"
            className="w-full h-auto max-h-[460px] object-cover"
          />
        </div>
      ) : (
        <div className="h-52 bg-zinc-100 dark:bg-zinc-800/50 flex flex-col items-center justify-center text-zinc-400 text-xs border-y border-zinc-100 dark:border-zinc-800">
          Upload an image to preview post
        </div>
      )}

      {/* Reaction Counts */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center">
            <ThumbsUp className="h-2.5 w-2.5" />
          </div>
          <span className="text-[11px] text-zinc-500">0 reactions</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span>0 comments</span>
          <span>•</span>
          <span>0 reposts</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-2 py-1.5 flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300">
        <button className="flex-1 py-2 flex items-center justify-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
          <ThumbsUp className="h-4 w-4 text-zinc-500" />
          <span>Like</span>
        </button>
        <button className="flex-1 py-2 flex items-center justify-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
          <MessageSquare className="h-4 w-4 text-zinc-500" />
          <span>Comment</span>
        </button>
        <button className="flex-1 py-2 flex items-center justify-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
          <Repeat2 className="h-4 w-4 text-zinc-500" />
          <span>Repost</span>
        </button>
        <button className="flex-1 py-2 flex items-center justify-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
          <Send className="h-4 w-4 text-zinc-500" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
