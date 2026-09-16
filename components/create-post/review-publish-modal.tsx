"use client";

import React, { useState } from "react";
import {
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { PostVariant, PlatformType } from "@/lib/db/types";
import { PublishResult } from "@/lib/social/types";
import { getPublisher } from "@/lib/social/registry";

interface ReviewPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  variants: PostVariant[];
  onPublishComplete?: (updatedVariants: PostVariant[]) => void;
}

export function ReviewPublishModal({
  isOpen,
  onClose,
  postId,
  variants,
  onPublishComplete,
}: ReviewPublishModalProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStates, setPublishStates] = useState<
    Record<string, { status: "idle" | "loading" | "success" | "error"; error?: string; url?: string }>
  >({});
  const [retryingPlatform, setRetryingPlatform] = useState<string | null>(null);

  const enabledVariants = variants.filter((v) => v.isEnabled);

  const executePublish = async (targetVariantIds?: string[]) => {
    setIsPublishing(true);

    const newStates = { ...publishStates };
    enabledVariants.forEach((v) => {
      if (!targetVariantIds || targetVariantIds.includes(v.id)) {
        newStates[v.platform] = { status: "loading" };
      }
    });
    setPublishStates(newStates);

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          variantIds: targetVariantIds,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Publishing failed");
      }

      const results: PublishResult[] = data.results || [];
      const updatedStates = { ...newStates };

      results.forEach((r) => {
        if (r.success) {
          updatedStates[r.platform] = {
            status: "success",
            url: r.externalPostUrl,
          };
        } else {
          updatedStates[r.platform] = {
            status: "error",
            error: r.errorMessage || "Publishing failed",
          };
        }
      });

      setPublishStates(updatedStates);

      if (onPublishComplete && data.post?.variants) {
        onPublishComplete(data.post.variants);
      }
    } catch (err: any) {
      console.error("Publish execution error:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRetrySingle = async (variant: PostVariant) => {
    setRetryingPlatform(variant.platform);
    setPublishStates((prev) => ({
      ...prev,
      [variant.platform]: { status: "loading" },
    }));

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
      const result: PublishResult = data.results?.[0];

      if (result && result.success) {
        setPublishStates((prev) => ({
          ...prev,
          [variant.platform]: { status: "success", url: result.externalPostUrl },
        }));
      } else {
        setPublishStates((prev) => ({
          ...prev,
          [variant.platform]: {
            status: "error",
            error: result?.errorMessage || "Retry failed",
          },
        }));
      }

      if (onPublishComplete && data.post?.variants) {
        onPublishComplete(data.post.variants);
      }
    } catch (err: any) {
      setPublishStates((prev) => ({
        ...prev,
        [variant.platform]: { status: "error", error: err.message },
      }));
    } finally {
      setRetryingPlatform(null);
    }
  };

  const failedVariants = enabledVariants.filter(
    (v) => publishStates[v.platform]?.status === "error"
  );
  const isComplete =
    Object.keys(publishStates).length > 0 &&
    !isPublishing &&
    !retryingPlatform;

  const allSucceeded =
    isComplete &&
    enabledVariants.length > 0 &&
    enabledVariants.every((v) => publishStates[v.platform]?.status === "success");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPublishing && onClose()}>
      <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            Review & Publish
          </DialogTitle>
          <DialogDescription className="text-xs">
            Review enabled platforms before publishing. Each platform delivers independently.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 my-2 max-h-[340px] overflow-y-auto pr-1">
          {enabledVariants.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground bg-muted/30 rounded-lg">
              No platform variants enabled.
            </div>
          ) : (
            enabledVariants.map((variant) => {
              const platform = variant.platform as PlatformType;
              const pub = getPublisher(platform);
              const state = publishStates[platform] || { status: "idle" };

              return (
                <div
                  key={variant.id}
                  className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-zinc-950 shrink-0 overflow-hidden border border-border flex items-center justify-center">
                      {variant.mediaUrl && !variant.mediaUrl.startsWith("[Purged") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={variant.mediaUrl}
                          alt={platform}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-zinc-500">None</span>
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {pub.displayName}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          {variant.aspectRatio || "1:1"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[130px] sm:max-w-[220px]">
                        {variant.caption || "No caption"}
                      </p>

                      {state.status === "error" && state.error && (
                        <p className="text-[10px] text-destructive flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span className="truncate">{state.error}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {state.status === "idle" && (
                      <Badge variant="secondary" className="text-[10px]">
                        Ready
                      </Badge>
                    )}

                    {state.status === "loading" && (
                      <Badge variant="secondary" className="text-[10px] flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Publishing
                      </Badge>
                    )}

                    {state.status === "success" && (
                      <div className="flex items-center gap-1.5">
                        <Badge variant="success" className="text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Published
                        </Badge>
                        {state.url && (
                          <a
                            href={state.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {state.status === "error" && (
                      <div className="flex items-center gap-1.5">
                        <Badge variant="destructive" className="text-[10px]">
                          Failed
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-[10px] gap-1"
                          disabled={retryingPlatform === platform}
                          onClick={() => handleRetrySingle(variant)}
                        >
                          <RefreshCw className={`h-2.5 w-2.5 ${retryingPlatform === platform ? "animate-spin" : ""}`} />
                          Retry
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {failedVariants.length > 0 && (
          <div className="p-2.5 rounded-lg bg-destructive/10 text-xs text-destructive flex items-center justify-between">
            <span>{failedVariants.length} platform(s) failed.</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executePublish(failedVariants.map((v) => v.id))}
              disabled={isPublishing}
              className="h-6 text-[10px] gap-1"
            >
              <RefreshCw className="h-2.5 w-2.5" />
              Retry Failed
            </Button>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPublishing}
            className="text-xs h-8"
          >
            {isComplete ? "Done" : "Cancel"}
          </Button>

          {!isComplete && (
            <Button
              size="sm"
              onClick={() => executePublish()}
              disabled={isPublishing || enabledVariants.length === 0}
              className="text-xs h-8 gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Publish Now ({enabledVariants.length})
                </>
              )}
            </Button>
          )}

          {allSucceeded && (
            <Button
              size="sm"
              onClick={onClose}
              className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
