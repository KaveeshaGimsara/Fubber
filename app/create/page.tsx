"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Send,
  Save,
  Check,
  Clock,
  Sparkles,
  ArrowRight,
  Trash2,
  Calendar,
} from "lucide-react";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { FubberLogo } from "@/components/icons/fubber-logo";
import { MasterContentStep } from "@/components/create-post/master-content-step";
import { PlatformCustomizationTabs } from "@/components/create-post/platform-customization-tabs";
import { ReviewPublishModal } from "@/components/create-post/review-publish-modal";
import { ScheduleModal } from "@/components/create-post/schedule-modal";
import { PostVariant, PlatformType, PostWithVariants, SocialAccount } from "@/lib/db/types";

const INITIAL_PLATFORMS: PlatformType[] = [
  "facebook",
  "instagram",
  "threads",
  "x",
  "linkedin",
  "pinterest",
  "youtube",
];

function CreatePostContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("edit");

  const [postId, setPostId] = useState<string>(`post_${Date.now()}`);
  const [masterCaption, setMasterCaption] = useState<string>("");
  const [masterImageUrl, setMasterImageUrl] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [imageMetadata, setImageMetadata] = useState<{
    filename?: string;
    width?: number;
    height?: number;
    fileSize?: number;
    format?: string;
  } | null>(null);

  const [variants, setVariants] = useState<PostVariant[]>(() =>
    INITIAL_PLATFORMS.map((platform) => ({
      id: `var_${Date.now()}_${platform}`,
      postId: "",
      platform,
      caption: "",
      mediaUrl: null,
      mediaAssetId: null,
      cropSettings: null,
      aspectRatio: platform === "instagram" ? "4:5" : platform === "pinterest" ? "2:3" : "16:9",
      isEnabled: platform !== "youtube", // YouTube starts off due to official API notice
      publishStatus: "idle",
      publishedAt: null,
      externalPostId: null,
      externalPostUrl: null,
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  // Load existing post if in edit/draft mode
  useEffect(() => {
    if (!editId) return;

    async function loadPost() {
      try {
        const res = await fetch(`/api/posts/${editId}`);
        const data = await res.json();
        if (data.success && data.post) {
          const p: PostWithVariants = data.post;
          setPostId(p.id);
          setMasterCaption(p.mainCaption || "");
          setMasterImageUrl(p.mainMediaUrl || null);
          if (p.variants && p.variants.length > 0) {
            setVariants(p.variants);
          }
        }
      } catch (err) {
        console.error("Failed to load post for editing:", err);
      }
    }
    loadPost();
  }, [editId]);

  // Load connected accounts so platform previews display real brand/avatar data
  useEffect(() => {
    async function loadAccounts() {
      try {
        const res = await fetch("/api/accounts");
        const data = await res.json();
        if (data.success && data.accounts) {
          setAccounts(data.accounts);
        }
      } catch (err) {
        console.error("Failed to load accounts for create page:", err);
      }
    }
    loadAccounts();
  }, []);

  // Master caption update automatically initializes variants that haven't been customized
  const handleMasterCaptionChange = (newCaption: string) => {
    setMasterCaption(newCaption);
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        // Only update if variant caption matches previous master or is blank
        caption: !v.caption || v.caption === masterCaption ? newCaption : v.caption,
      }))
    );
  };

  // Master image update
  const handleImageSelected = (
    file: File,
    dataUrl: string,
    metadata: {
      filename: string;
      width: number;
      height: number;
      fileSize: number;
      format: string;
    }
  ) => {
    setMasterImageUrl(dataUrl);
    setImageMetadata(metadata);

    // Synchronize to platform variants
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        mediaUrl: dataUrl,
      }))
    );
  };

  const handleRemoveImage = () => {
    setMasterImageUrl(null);
    setImageMetadata(null);
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        mediaUrl: null,
        cropSettings: null,
      }))
    );
  };

  // Independent variant modification
  const handleUpdateVariant = (
    platform: PlatformType,
    updates: Partial<PostVariant>
  ) => {
    setVariants((prev) =>
      prev.map((v) => (v.platform === platform ? { ...v, ...updates } : v))
    );
  };

  // Debounced auto-save mechanism
  const saveDraft = useCallback(
    async (isManual = false) => {
      if (!masterCaption.trim() && !masterImageUrl) return;

      if (isManual) setIsSavingDraft(true);

      try {
        const payload = {
          id: postId,
          title: masterCaption.slice(0, 40) || "Draft Post",
          mainCaption: masterCaption,
          mainMediaUrl: masterImageUrl,
          status: "draft",
          variants,
        };

        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.success) {
          setLastSavedTime(
            new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          );
        }
      } catch (err) {
        console.error("Auto-save failed:", err);
      } finally {
        if (isManual) setIsSavingDraft(false);
      }
    },
    [postId, masterCaption, masterImageUrl, variants]
  );

  // Debounce auto-save every 4 seconds after content changes
  useEffect(() => {
    if (!masterCaption && !masterImageUrl) return;
    const timer = setTimeout(() => {
      saveDraft(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [masterCaption, masterImageUrl, variants, saveDraft]);

  const handleConfirmSchedule = async (scheduledDate: Date, timezone: string = "UTC") => {
    setIsScheduling(true);
    try {
      const payload = {
        id: postId,
        title: masterCaption.slice(0, 50) || "Scheduled Post",
        mainCaption: masterCaption,
        mainMediaUrl: masterImageUrl,
        status: "scheduled",
        scheduledFor: scheduledDate.toISOString(),
        timezone,
        scheduleStatus: "queued",
        idempotencyKey: `sched_${postId}_${Date.now()}`,
        variants: variants.map((v) => ({
          ...v,
          caption: v.caption || masterCaption,
          mediaUrl: v.mediaUrl || masterImageUrl,
        })),
      };

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsScheduleModalOpen(false);
        router.push("/scheduled");
      }
    } catch (err) {
      console.error("Scheduling failed:", err);
    } finally {
      setIsScheduling(false);
    }
  };

  const enabledCount = variants.filter((v) => v.isEnabled).length;

  return (
    <div className="space-y-10 pb-24">
      {/* Top Action Header Bar */}
      <div className="p-3.5 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md bg-card/95 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 p-[1.5px] shadow-sm shrink-0">
            <div className="w-full h-full rounded-[10px] bg-sky-500 flex items-center justify-center">
              <FubberLogo className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground tracking-tight">Post Editor</h2>
              <Badge variant="outline" className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/20 py-0 h-4">
                Fubber
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
              <span>{enabledCount} of {variants.length} platforms active</span>
              {lastSavedTime && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <Check className="h-3 w-3 stroke-[2.5]" />
                    Saved at {lastSavedTime}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end flex-wrap pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveDraft(true)}
            disabled={isSavingDraft}
            className="h-8 text-xs rounded-lg gap-1.5 flex-1 sm:flex-initial"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSavingDraft ? "Saving..." : "Save Draft"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={(!masterCaption.trim() && !masterImageUrl) || enabledCount === 0}
            onClick={() => setIsScheduleModalOpen(true)}
            className="h-8 text-xs rounded-lg gap-1.5 border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex-1 sm:flex-initial"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Schedule</span>
          </Button>

          <Button
            size="sm"
            disabled={(!masterCaption.trim() && !masterImageUrl) || enabledCount === 0}
            onClick={() => setIsPublishModalOpen(true)}
            className="h-8 text-xs font-semibold px-4 rounded-lg gap-1.5 shadow-sm bg-sky-500 hover:bg-sky-600 text-white w-full sm:w-auto"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Publish Now ({enabledCount})</span>
          </Button>
        </div>
      </div>

      {/* STEP 1 — Main Content */}
      <MasterContentStep
        mainCaption={masterCaption}
        onCaptionChange={handleMasterCaptionChange}
        mainImageUrl={masterImageUrl}
        imageMetadata={imageMetadata}
        onImageSelected={handleImageSelected}
        onRemoveImage={handleRemoveImage}
      />

      {/* STEP 2 — Platform Customization & Realistic Previews */}
      <PlatformCustomizationTabs
        variants={variants}
        masterCaption={masterCaption}
        masterImageUrl={masterImageUrl}
        accounts={accounts}
        onUpdateVariant={handleUpdateVariant}
      />

      {/* Review & Publish Modal */}
      <ReviewPublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        postId={postId}
        variants={variants}
        onPublishComplete={(updated) => setVariants(updated)}
      />

      {/* Schedule Picker Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onConfirmSchedule={handleConfirmSchedule}
        isSubmitting={isScheduling}
      />
    </div>
  );
}

export default function CreatePostPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-16 text-center text-xs text-muted-foreground">
          Loading post editor...
        </div>
      }
    >
      <CreatePostContent />
    </React.Suspense>
  );
}
