import React from "react";
import { Globe, ThumbsUp, MessageCircle, Share2, MoreHorizontal, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";

import { FubberLogo, FUBBER_AVATAR_DATA_URI } from "@/components/icons/fubber-logo";

interface FacebookPreviewProps {
  pageName?: string;
  avatarUrl?: string;
  caption: string;
  imageUrl?: string | null;
  aspectRatio?: string;
}

export function FacebookPreview({
  pageName = "Fubber",
  avatarUrl = FUBBER_AVATAR_DATA_URI,
  caption,
  imageUrl,
}: FacebookPreviewProps) {
  const displayAvatar = avatarUrl || FUBBER_AVATAR_DATA_URI;

  return (
    <div className="w-full max-w-[500px] mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden font-sans text-sm">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-1 ring-zinc-200 dark:ring-zinc-700">
            <AvatarImage src={displayAvatar} alt={pageName} />
            <AvatarFallback className="bg-sky-500 text-white">
              <FubberLogo className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight flex items-center gap-1.5">
              {pageName}
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 bg-blue-600 rounded-full text-white">
                <Check className="h-2 w-2 stroke-[3]" />
              </span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
              <span>Just now</span>
              <span>•</span>
              <Globe className="h-3 w-3" />
            </div>
          </div>
        </div>
        <button className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Caption */}
      <div className="px-4 pb-3 text-zinc-900 dark:text-zinc-100 whitespace-pre-line leading-relaxed">
        {caption || <span className="text-zinc-400 italic">No caption written yet...</span>}
      </div>

      {/* Image */}
      {imageUrl ? (
        <div className="relative w-full bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center overflow-hidden border-y border-zinc-100 dark:border-zinc-800/80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Facebook preview"
            className="w-full h-auto max-h-[480px] object-cover"
          />
        </div>
      ) : (
        <div className="h-56 bg-zinc-100 dark:bg-zinc-800/50 flex flex-col items-center justify-center text-zinc-400 text-xs border-y border-zinc-100 dark:border-zinc-800">
          Upload an image to preview
        </div>
      )}

      {/* Reaction stats */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
            <ThumbsUp className="h-2.5 w-2.5" />
          </div>
          <span className="ml-1">0</span>
        </div>
        <div className="flex items-center gap-3">
          <span>0 comments</span>
          <span>0 shares</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-2 py-1 flex items-center justify-around text-zinc-600 dark:text-zinc-300 font-medium text-xs">
        <button className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <ThumbsUp className="h-4 w-4" />
          <span>Like</span>
        </button>
        <button className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <MessageCircle className="h-4 w-4" />
          <span>Comment</span>
        </button>
        <button className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
