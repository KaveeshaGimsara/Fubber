"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  Activity,
  Zap,
} from "lucide-react";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Badge } from "@/ui/badge";
import {
  FacebookIcon,
  InstagramIcon,
  ThreadsIcon,
  XIcon,
  PinterestIcon,
  YouTubeIcon,
  LinkedInIcon,
} from "@/components/icons/social-icons";
import { SocialAccount, SocialPage, ChannelApiHealth } from "@/lib/db/types";

interface ChannelConfig {
  id: string;
  name: string;
  provider: string;
  apiVersion: string;
  Icon: React.ComponentType<{ className?: string }>;
  description: string;
  hasRateLimitHeaders: boolean;
  scopesGranted: string[];
  capabilities: {
    publishing: boolean;
    analytics: boolean;
    mediaCropping: boolean;
    notice?: string;
  };
}

const CHANNELS_CONFIG: ChannelConfig[] = [
  {
    id: "facebook",
    name: "Facebook Page",
    provider: "Meta Graph API",
    apiVersion: "v20.0",
    Icon: FacebookIcon,
    description: "Official feed photo and caption publishing for managed Facebook Pages.",
    hasRateLimitHeaders: true,
    scopesGranted: ["pages_show_list", "pages_read_engagement", "pages_manage_posts"],
    capabilities: {
      publishing: true,
      analytics: true,
      mediaCropping: true,
    },
  },
  {
    id: "instagram",
    name: "Instagram",
    provider: "Meta Graph API (Instagram Content Publishing)",
    apiVersion: "v20.0",
    Icon: InstagramIcon,
    description: "Official container-based image post publishing for professional and business accounts.",
    hasRateLimitHeaders: true,
    scopesGranted: ["instagram_basic", "instagram_content_publish"],
    capabilities: {
      publishing: true,
      analytics: true,
      mediaCropping: true,
    },
  },
  {
    id: "threads",
    name: "Threads",
    provider: "Meta Threads API",
    apiVersion: "v1.0",
    Icon: ThreadsIcon,
    description: "Direct single image and caption posting to Meta's Threads network.",
    hasRateLimitHeaders: true,
    scopesGranted: ["threads_basic", "threads_content_publish"],
    capabilities: {
      publishing: true,
      analytics: true,
      mediaCropping: true,
    },
  },
  {
    id: "x",
    name: "X (Twitter)",
    provider: "Twitter API v2",
    apiVersion: "v2.88",
    Icon: XIcon,
    description: "Official OAuth 2.0 PKCE tweet creation with media attachment.",
    hasRateLimitHeaders: true,
    scopesGranted: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    capabilities: {
      publishing: true,
      analytics: true,
      mediaCropping: true,
    },
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    provider: "LinkedIn REST API",
    apiVersion: "v202401",
    Icon: LinkedInIcon,
    description: "Official member posts and organization company page publishing with media attachments.",
    hasRateLimitHeaders: true,
    scopesGranted: ["w_member_social", "r_basicprofile", "w_organization_social"],
    capabilities: {
      publishing: true,
      analytics: true,
      mediaCropping: true,
    },
  },
  {
    id: "pinterest",
    name: "Pinterest",
    provider: "Pinterest API v5",
    apiVersion: "v5.12",
    Icon: PinterestIcon,
    description: "Create standard Pins to user boards with links and titles.",
    hasRateLimitHeaders: false, // Pinterest v5 uses aggregate daily buckets not surfaced in request headers
    scopesGranted: ["boards:read", "pins:read", "pins:write"],
    capabilities: {
      publishing: true,
      analytics: true,
      mediaCropping: true,
    },
  },
  {
    id: "youtube",
    name: "YouTube",
    provider: "Google YouTube Data API v3",
    apiVersion: "v3",
    Icon: YouTubeIcon,
    description: "Channel authentication via Google Cloud OAuth (Community tab restricted by Google).",
    hasRateLimitHeaders: false, // Quota units are accounted via Google Cloud Console
    scopesGranted: ["https://www.googleapis.com/auth/youtube.readonly"],
    capabilities: {
      publishing: false,
      analytics: true,
      mediaCropping: false,
      notice: "Google does not expose third-party Community Tab creation via public REST API.",
    },
  },
];

export default function ChannelsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [pages, setPages] = useState<SocialPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [selectedHealthModal, setSelectedHealthModal] = useState<{
    channel: string;
    health: ChannelApiHealth;
    account?: SocialAccount;
  } | null>(null);
  const [updatingPage, setUpdatingPage] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      if (data.success) {
        setAccounts(data.accounts || []);
        setPages(data.pages || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleExpand = (channelId: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [channelId]: !prev[channelId],
    }));
  };

  const handleDisconnect = async (platform: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platform}? Stored tokens will be revoked.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/accounts?platform=${platform}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAccounts((prev) => prev.filter((a) => a.platform !== platform));
      }
    } catch (err) {
      console.error("Disconnect failed:", err);
    }
  };

  const handleSelectPage = async (pageId: string) => {
    setUpdatingPage(true);
    try {
      const res = await fetch("/api/accounts/select-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      const data = await res.json();
      if (data.success) {
        setPages(data.pages);
      }
    } catch (err) {
      console.error("Failed to select page:", err);
    } finally {
      setUpdatingPage(false);
    }
  };

  const getHealthBadge = (health: ChannelApiHealth, isConnected: boolean) => {
    if (!isConnected) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Disconnected
        </span>
      );
    }

    switch (health) {
      case "healthy":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Healthy
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Warning
          </span>
        );
      case "auth_required":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Auth Required
          </span>
        );
      case "rate_limited":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Rate Limited
          </span>
        );
      case "api_error":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            API Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-24 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Channels & API Monitor
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Manage authenticated social media accounts, monitor official API rate limits, and inspect endpoint health.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
          className="h-8 rounded-xl text-xs gap-1.5 border-slate-200 dark:border-zinc-800"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh APIs</span>
        </Button>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CHANNELS_CONFIG.map((config) => {
          const acc = accounts.find((a) => a.platform === config.id && a.isConnected);
          const isConnected = Boolean(acc);
          const health: ChannelApiHealth = isConnected ? (acc?.apiStatus as ChannelApiHealth) || "healthy" : "disconnected";
          const isExpanded = expandedDetails[config.id];
          const Icon = config.Icon;

          return (
            <Card
              key={config.id}
              className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 overflow-hidden transition-all"
            >
              <CardContent className="p-5 space-y-4">
                {/* Channel Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                          {config.name}
                        </h2>
                        {getHealthBadge(health, isConnected)}
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                        {config.provider}
                      </p>
                    </div>
                  </div>

                  {/* Top action */}
                  {isConnected ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDisconnect(config.id)}
                      className="h-7 text-[11px] rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/50"
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <a href={`/api/auth/${config.id}/authorize`}>
                      <Button
                        size="sm"
                        className="h-7 px-3 text-[11px] rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-sm"
                      >
                        Connect
                      </Button>
                    </a>
                  )}
                </div>

                {/* Account Details if connected */}
                {isConnected && acc ? (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={acc.profileImageUrl || "https://avatar.vercel.sh/user"}
                          alt={acc.accountName}
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">
                          {acc.accountName}
                        </span>
                        {acc.accountUsername && (
                          <span className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">
                            @{acc.accountUsername}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ID: {acc.platformAccountId?.slice(0, 10) || "Unknown"}
                      </span>
                    </div>

                    {/* Facebook Page Switcher */}
                    {config.id === "facebook" && pages.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800 space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Active Target Page:
                        </label>
                        <div className="space-y-1">
                          {pages.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => handleSelectPage(p.pageId)}
                              disabled={updatingPage}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                p.isSelected
                                  ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold border border-sky-200 dark:border-sky-800"
                                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                              }`}
                            >
                              <span>{p.pageName}</span>
                              {p.isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {config.description}
                  </p>
                )}

                {/* API Capability Badge */}
                {config.capabilities.notice && (
                  <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{config.capabilities.notice}</span>
                  </div>
                )}

                {/* Expandable API Details Accordion */}
                <div className="pt-1 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    onClick={() => toggleExpand(config.id)}
                    className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 py-1"
                  >
                    <span>API Details & Health</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 text-[11px] space-y-2 font-mono">
                      <div className="flex justify-between py-0.5 border-b border-slate-200/40 dark:border-zinc-800">
                        <span className="text-slate-400">API Provider</span>
                        <span className="text-slate-800 dark:text-zinc-200 font-sans font-medium">
                          {config.provider}
                        </span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-slate-200/40 dark:border-zinc-800">
                        <span className="text-slate-400">API Version</span>
                        <span className="text-slate-800 dark:text-zinc-200 font-sans font-medium">
                          {config.apiVersion}
                        </span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-slate-200/40 dark:border-zinc-800">
                        <span className="text-slate-400">Token Status</span>
                        <span className="text-slate-800 dark:text-zinc-200 font-sans font-medium">
                          {isConnected ? "Active (AES-256-GCM Encrypted)" : "Not connected"}
                        </span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-slate-200/40 dark:border-zinc-800">
                        <span className="text-slate-400">Token Expiry</span>
                        <span className="text-slate-800 dark:text-zinc-200 font-sans font-medium">
                          {isConnected && acc?.tokenExpiresAt
                            ? new Date(acc.tokenExpiresAt).toLocaleDateString()
                            : isConnected
                            ? "Never (Long-Lived Page Token)"
                            : "Not provided"}
                        </span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-slate-200/40 dark:border-zinc-800">
                        <span className="text-slate-400">Publishing Capability</span>
                        <span className="text-slate-800 dark:text-zinc-200 font-sans font-medium">
                          {config.capabilities.publishing ? "Supported (Image + Caption)" : "Restricted by Provider"}
                        </span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-slate-200/40 dark:border-zinc-800">
                        <span className="text-slate-400">Analytics Capability</span>
                        <span className="text-slate-800 dark:text-zinc-200 font-sans font-medium">
                          {config.capabilities.analytics ? "Supported (Official Metrics)" : "Unavailable"}
                        </span>
                      </div>
                      <div className="py-0.5">
                        <span className="text-slate-400 block mb-1">Permissions / Scopes:</span>
                        <div className="flex flex-wrap gap-1">
                          {config.scopesGranted.map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[10px] text-slate-700 dark:text-zinc-300"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dedicated Section: Official API Limit Monitor */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Official API Limit Monitor
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Real-time rate-limit monitoring per platform. Platforms that do not expose rate limit headers display honest neutral states (no fabricated limits).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {CHANNELS_CONFIG.map((config) => {
            const acc = accounts.find((a) => a.platform === config.id && a.isConnected);
            const hasRealRateLimit =
              acc &&
              acc.rateLimitLimit !== null &&
              acc.rateLimitLimit !== undefined &&
              acc.rateLimitRemaining !== null &&
              acc.rateLimitRemaining !== undefined;

            return (
              <div
                key={config.id}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    {config.name}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">
                    {config.apiVersion}
                  </span>
                </div>

                {hasRealRateLimit ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">
                        {acc.rateLimitRemaining} / {acc.rateLimitLimit} calls remaining
                      </span>
                      {acc.rateLimitResetAt && (
                        <span className="text-slate-400 font-mono text-[10px]">
                          Resets: {new Date(acc.rateLimitResetAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, ((acc.rateLimitRemaining! / acc.rateLimitLimit!) * 100))}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold block">
                      Live official API quota
                    </span>
                  </div>
                ) : (
                  <div className="py-2.5 text-center text-[11px] text-slate-400 bg-white dark:bg-zinc-900 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800">
                    {!acc
                      ? "Channel not connected"
                      : config.hasRateLimitHeaders
                      ? "Rate limit quota monitored on next API call"
                      : "Official API uses cloud console quota"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
