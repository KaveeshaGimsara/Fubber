import React from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";

import { FubberLogo, FUBBER_AVATAR_DATA_URI } from "@/components/icons/fubber-logo";

interface YouTubePreviewProps {
  channelName?: string;
  avatarUrl?: string;
  caption: string;
  imageUrl?: string | null;
}

export function YouTubeCommunityPreview({
  channelName = "Fubber",
  avatarUrl = FUBBER_AVATAR_DATA_URI,
  caption,
  imageUrl,
}: YouTubePreviewProps) {
  const displayAvatar = avatarUrl || FUBBER_AVATAR_DATA_URI;

  return (
    <div className="w-full max-w-[520px] mx-auto space-y-3 font-sans text-sm">
      {/* Official API Capability Notice Badge */}
      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div>
          <span className="font-semibold block">API Capability Unavailable (Official Restriction)</span>
          Google YouTube Data API v3 does not expose a public endpoint for third-party creation of Community tab posts. Preview shown for reference.
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
        {/* Channel Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={displayAvatar} alt={channelName} />
              <AvatarFallback className="bg-sky-500 text-white">
                <FubberLogo className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                {channelName}
              </div>
              <div className="text-[11px] text-zinc-500">Community</div>
            </div>
          </div>
          <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        {/* Post Text */}
        <div className="mt-3 text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed whitespace-pre-line">
          {caption || <span className="text-zinc-400 italic">No community text written yet...</span>}
        </div>

        {/* Media Container */}
        {imageUrl ? (
          <div className="mt-3 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="YouTube community preview"
              className="w-full max-h-[420px] object-cover"
            />
          </div>
        ) : (
          <div className="mt-3 aspect-[16/9] rounded-xl bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-400 text-xs border border-zinc-200 dark:border-zinc-800">
            Upload an image to preview
          </div>
        )}

        {/* Actions bar */}
        <div className="mt-4 flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-xs pt-1">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <ThumbsUp className="h-4 w-4" />
              <span>0</span>
            </button>
            <button className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <MessageSquare className="h-4 w-4" />
              <span>0</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
