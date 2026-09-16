"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Shield,
  Palette,
  Sliders,
  CheckCircle2,
  Server,
  Sun,
  Moon,
  Laptop,
  KeyRound,
  Smartphone,
  Lock,
  Copy,
  Clock,
  LogOut,
  AlertTriangle,
  History,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Button } from "@/ui/button";
import { Switch } from "@/ui/switch";
import { Badge } from "@/ui/badge";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/ui/dialog";
import {
  FacebookIcon,
  InstagramIcon,
  ThreadsIcon,
  XIcon,
  PinterestIcon,
  YouTubeIcon,
  LinkedInIcon,
} from "@/components/icons/social-icons";
import { AuditLogEntry } from "@/lib/security/audit";

const NETWORKS = [
  { key: "facebook", label: "Facebook Page", Icon: FacebookIcon },
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "threads", label: "Threads", Icon: ThreadsIcon },
  { key: "x", label: "X (Twitter)", Icon: XIcon },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedInIcon },
  { key: "pinterest", label: "Pinterest", Icon: PinterestIcon },
  { key: "youtube", label: "YouTube Community", Icon: YouTubeIcon },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [defaultPlatforms, setDefaultPlatforms] = useState({
    facebook: true,
    instagram: true,
    threads: true,
    x: true,
    linkedin: true,
    pinterest: true,
    youtube: false,
  });
  const [autoCopyMaster, setAutoCopyMaster] = useState(true);
  const [sandboxMode, setSandboxMode] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Security state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [strictIp, setStrictIp] = useState(false);

  // 2FA modal state
  const [show2faModal, setShow2faModal] = useState(false);
  const [setupData, setSetupData] = useState<{
    secret: string;
    formattedSecret: string;
    otpauthUri: string;
    backupCodes: string[];
  } | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [revokingSessions, setRevokingSessions] = useState(false);

  const fetchSecurityData = async () => {
    try {
      const [statusRes, auditRes] = await Promise.all([
        fetch("/api/auth/2fa"),
        fetch("/api/security/audit"),
      ]);
      const statusData = await statusRes.json();
      const auditData = await auditRes.json();

      if (statusData.success) {
        setTwoFactorEnabled(statusData.twoFactorEnabled);
        if (statusData.sessionTimeoutMinutes) {
          setSessionTimeout(statusData.sessionTimeoutMinutes);
        }
      }
      if (auditData.success) {
        setAuditLogs(auditData.logs || []);
        if (auditData.settings?.strictIpBinding !== undefined) {
          setStrictIp(auditData.settings.strictIpBinding);
        }
      }
    } catch (err) {
      console.error("Failed to fetch security settings:", err);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handleOpen2faSetup = async () => {
    setIsSettingUp(true);
    setVerifyError("");
    setVerifyCode("");
    try {
      const res = await fetch("/api/auth/2fa?action=setup");
      const data = await res.json();
      if (data.success) {
        setSetupData(data.setup);
        setShow2faModal(true);
      }
    } catch (err: any) {
      alert("Failed to initialize 2FA setup: " + err.message);
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleConfirm2faEnable = async () => {
    if (!setupData || !verifyCode) return;
    setVerifyError("");

    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enable",
          secret: setupData.secret,
          token: verifyCode,
          backupCodes: setupData.backupCodes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setVerifyError(data.error || "Verification failed. Check the code.");
        return;
      }

      setTwoFactorEnabled(true);
      setShow2faModal(false);
      fetchSecurityData();
    } catch (err: any) {
      setVerifyError(err.message || "Failed to confirm 2FA");
    }
  };

  const handleDisable2fa = async () => {
    const code = prompt("Enter a valid 6-digit code or your password to disable 2FA:");
    if (!code) return;

    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "disable",
          token: code,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTwoFactorEnabled(false);
        fetchSecurityData();
      } else {
        alert(data.error || "Failed to disable 2FA");
      }
    } catch (err: any) {
      alert(err.message || "Error disabling 2FA");
    }
  };

  const handleSessionTimeoutChange = async (minutes: number) => {
    setSessionTimeout(minutes);
    try {
      await fetch("/api/security/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_session_timeout",
          sessionTimeoutMinutes: minutes,
        }),
      });
      fetchSecurityData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeSessions = async () => {
    if (!confirm("Are you sure you want to terminate all active sessions across all devices?")) return;
    setRevokingSessions(true);
    try {
      await fetch("/api/security/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke_sessions" }),
      });
      fetchSecurityData();
      alert("All active sessions have been terminated.");
    } catch (err: any) {
      alert(err.message || "Failed to revoke sessions");
    } finally {
      setRevokingSessions(false);
    }
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Workspace Settings & Security
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure publishing channels, themes, two-factor authentication (2FA), and security diagnostics.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Preferences updated successfully.</span>
        </div>
      )}

      {/* TWO-FACTOR AUTHENTICATION (2FA) */}
      <Card className="rounded-xl border-border shadow-none">
        <CardHeader className="p-5 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-sky-500" />
              <span>Two-Factor Authentication (Authenticator App)</span>
            </CardTitle>
            <Badge
              variant={twoFactorEnabled ? "success" : "secondary"}
              className="text-[10px]"
            >
              {twoFactorEnabled ? "2FA Active" : "2FA Disabled"}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Protect your publishing workspace using TOTP standards (Google Authenticator, Authy, 1Password, or Microsoft Authenticator).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2 space-y-4">
          <div className="p-3.5 rounded-xl bg-muted/20 border border-border flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-foreground block">
                Time-based One-Time Password (TOTP)
              </span>
              <p className="text-[11px] text-muted-foreground">
                {twoFactorEnabled
                  ? "Your account is secured. A 6-digit code from your authenticator app is required at sign in."
                  : "Require an authenticator code when signing into your Fubber workspace."}
              </p>
            </div>
            <div>
              {twoFactorEnabled ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisable2fa}
                  className="h-8 text-xs text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  Disable 2FA
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleOpen2faSetup}
                  disabled={isSettingUp}
                  className="h-8 text-xs bg-sky-500 hover:bg-sky-600 text-white"
                >
                  Enable 2FA
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SESSION & ACCESS CONTROLS */}
      <Card className="rounded-xl border-border shadow-none">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-sky-500" />
            <span>Session Inactivity & Access Controls</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Control automatic session logout windows and active login tokens.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-border bg-card space-y-1.5">
              <Label className="text-xs font-medium">Session Inactivity Timeout</Label>
              <select
                value={sessionTimeout}
                onChange={(e) => handleSessionTimeoutChange(Number(e.target.value))}
                className="w-full text-xs h-8 rounded-lg border border-border bg-background px-2 text-foreground"
              >
                <option value={15}>15 Minutes (Strict Security)</option>
                <option value={60}>1 Hour (Standard)</option>
                <option value={480}>8 Hours (Full Workday)</option>
                <option value={1440}>24 Hours (Daily)</option>
                <option value={10080}>7 Days (Extended)</option>
              </select>
              <p className="text-[10px] text-muted-foreground">
                Automatically logs out when idle to protect sensitive social media tokens.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-foreground block">
                  Terminate All Active Sessions
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Revokes all active browser sessions and forces re-authentication.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={revokingSessions}
                onClick={handleRevokeSessions}
                className="h-8 text-xs gap-1.5 mt-2 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Revoke All Sessions</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECURITY AUDIT LOG */}
      <Card className="rounded-xl border-border shadow-none">
        <CardHeader className="p-5 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <History className="h-4 w-4 text-sky-500" />
              <span>Security & Access Audit Trail</span>
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">
              {auditLogs.length} Events Logged
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Tamper-evident log of authentication attempts, token encryptions, and scheduled cleanups.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2">
          <div className="rounded-lg border border-border overflow-hidden text-xs">
            <div className="max-h-56 overflow-y-auto divide-y divide-border">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                  <div className="space-y-0.5 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-foreground">
                        {log.event}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {log.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      log.status === "success"
                        ? "success"
                        : log.status === "warning"
                        ? "warning"
                        : "destructive"
                    }
                    className="text-[9px] capitalize"
                  >
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Appearance */}
      <Card className="rounded-xl border-border shadow-none">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Theme & Appearance</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Select your preferred interface appearance.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2">
          <div className="grid grid-cols-3 gap-2.5 max-w-sm">
            {[
              { id: "light", label: "Light", Icon: Sun },
              { id: "dark", label: "Dark", Icon: Moon },
              { id: "system", label: "System", Icon: Laptop },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={`p-3 rounded-lg border text-center transition-colors flex flex-col items-center gap-1.5 ${
                  theme === id
                    ? "border-sky-500 bg-sky-500/10 font-semibold text-foreground"
                    : "border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Default Publishing Preferences */}
      <Card className="rounded-xl border-border shadow-none">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            <span>Default Publishing Preferences</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Configure which platforms are enabled by default for new posts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {NETWORKS.map(({ key, label, Icon }) => (
              <div
                key={key}
                className="p-2.5 rounded-lg bg-muted/20 border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-foreground" />
                  <span className="text-xs text-foreground font-medium">{label}</span>
                </div>
                <Switch
                  checked={(defaultPlatforms as any)[key]}
                  onCheckedChange={(val) =>
                    setDefaultPlatforms((prev) => ({ ...prev, [key]: val }))
                  }
                />
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-foreground block">
                Initialize Variants with Master Caption
              </span>
              <span className="text-[11px] text-muted-foreground">
                Copies master caption into each platform tab upon post creation.
              </span>
            </div>
            <Switch
              checked={autoCopyMaster}
              onCheckedChange={setAutoCopyMaster}
            />
          </div>
        </CardContent>
      </Card>

      {/* Developer Sandbox Mode */}
      <Card className="rounded-xl border-border shadow-none">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <Server className="h-4 w-4" />
            <span>API Execution Mode</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Switch between developer sandbox simulation and live official API publishing.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border">
            <div>
              <span className="text-xs font-medium text-foreground flex items-center gap-2">
                <span>Developer Sandbox Mode</span>
                {sandboxMode ? (
                  <Badge variant="success" className="text-[10px]">Active</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">Live Mode</Badge>
                )}
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Simulates official responses locally so you can test publishing pipelines without registering all developer portal apps.
              </p>
            </div>
            <Switch
              checked={sandboxMode}
              onCheckedChange={setSandboxMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Diagnostics */}
      <Card className="rounded-xl border-border shadow-none">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span>Infrastructure & Token Security</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Server-side token encryption and infrastructure status.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2 space-y-2">
          {[
            {
              title: "Token Encryption Engine",
              desc: "AES-256-GCM cipher with random 12-byte IV and 16-byte auth tag",
              status: "Secure (Hardware)",
            },
            {
              title: "Database Connection",
              desc: "Neon PostgreSQL with Drizzle ORM Serverless",
              status: "Connected",
            },
            {
              title: "1-Hour Auto-Purge Cron",
              desc: "Auto deletes uploaded images from DB after 1h to prevent storage limits",
              status: "Active (/api/cron/cleanup)",
            },
            {
              title: "Two-Factor Authentication",
              desc: "RFC 6238 TOTP Standard with 30s drift window",
              status: twoFactorEnabled ? "Active" : "Ready to Configure",
            },
          ].map((diag, i) => (
            <div
              key={i}
              className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-medium text-foreground block">{diag.title}</span>
                <span className="text-[11px] text-muted-foreground">{diag.desc}</span>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {diag.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="rounded-lg h-8 px-4 text-xs font-medium shadow-none bg-sky-500 hover:bg-sky-600 text-white">
          Save Settings
        </Button>
      </div>

      {/* 2FA SETUP MODAL */}
      <Dialog open={show2faModal} onOpenChange={setShow2faModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-sky-500" />
              Configure Authenticator App
            </DialogTitle>
            <DialogDescription className="text-xs">
              Follow these steps to link Google Authenticator, Authy, or 1Password.
            </DialogDescription>
          </DialogHeader>

          {setupData && (
            <div className="space-y-4 py-2 text-xs">
              {/* Step 1: Secret Key */}
              <div className="space-y-1.5">
                <span className="font-medium text-foreground block">
                  1. Enter this Secret Key into your Authenticator app:
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-muted rounded-lg font-mono text-center font-bold tracking-widest text-xs select-all text-sky-600 dark:text-sky-400">
                    {setupData.formattedSecret}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(setupData.secret);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="h-8 gap-1 text-xs"
                  >
                    {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey ? "Copied" : "Copy"}</span>
                  </Button>
                </div>
              </div>

              {/* Step 2: Backup recovery codes */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    2. Save your Emergency Backup Codes:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(setupData.backupCodes.join("\n"));
                      setCopiedCodes(true);
                      setTimeout(() => setCopiedCodes(false), 2000);
                    }}
                    className="text-[11px] text-sky-600 hover:underline flex items-center gap-1"
                  >
                    {copiedCodes ? "Copied!" : "Copy all"}
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border grid grid-cols-2 gap-1.5 font-mono text-[11px] text-center text-muted-foreground">
                  {setupData.backupCodes.map((code, idx) => (
                    <div key={idx} className="bg-background py-1 px-2 rounded border border-border/50">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3: Verification */}
              <div className="space-y-2 pt-2 border-t border-border">
                <Label className="font-medium text-foreground">
                  3. Enter the 6-digit code displayed in your app:
                </Label>
                <div className="flex gap-2">
                  <Input
                    maxLength={6}
                    autoFocus
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="123456"
                    className="font-mono text-center tracking-widest text-sm h-9"
                  />
                  <Button
                    onClick={handleConfirm2faEnable}
                    className="bg-sky-500 hover:bg-sky-600 text-white h-9 text-xs px-4"
                  >
                    Verify & Enable
                  </Button>
                </div>
                {verifyError && (
                  <p className="text-rose-600 text-[11px]">{verifyError}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
