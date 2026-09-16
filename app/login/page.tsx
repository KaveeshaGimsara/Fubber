"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { FubberLogo } from "@/components/icons/fubber-logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@fubber.io");
  const [password, setPassword] = useState("FubberAdmin2026!");
  const [totpCode, setTotpCode] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          totpCode: requires2FA ? totpCode : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Authentication failed");
        setIsLoading(false);
        return;
      }

      if (data.requires2FA) {
        setRequires2FA(true);
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Authentication successful! Redirecting to workspace...");
      setTimeout(() => {
        router.push("/");
      }, 900);
    } catch (err: any) {
      setErrorMessage(err.message || "Network error during authentication");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col justify-center items-center p-4">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <FubberLogo className="h-9 w-9 text-sky-500" />
            <span className="font-bold text-2xl tracking-tight text-foreground">
              Fubber
            </span>
          </Link>
          <p className="text-xs text-muted-foreground max-w-xs">
            Social Media Publishing & Analytics Workspace
          </p>
        </div>

        <Card className="border border-border/80 shadow-lg shadow-sky-950/5 dark:shadow-black/40 bg-card/90 backdrop-blur-md">
          <CardHeader className="space-y-1.5 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-foreground">
                {requires2FA ? "Two-Factor Verification" : "Sign in to Fubber"}
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20">
                <ShieldCheck className="h-3 w-3" />
                AES-256 GCM
              </Badge>
            </div>
            <CardDescription className="text-xs">
              {requires2FA
                ? "Enter the 6-digit code from your Authenticator app (Google Authenticator, Authy, etc.)"
                : "Enter your workspace administrator credentials to access your channels"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!requires2FA ? (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Work Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="owner@fubber.io"
                        className="pl-9 h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">Password</Label>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail("owner@fubber.io");
                          setPassword("FubberAdmin2026!");
                        }}
                        className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        Use Default
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="pl-9 h-9 text-xs font-mono"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div className="text-xs">
                      <p className="font-medium text-foreground">Authenticator App Active</p>
                      <p className="text-muted-foreground text-[11px]">
                        Open Google Authenticator or Authy to retrieve your one-time password
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">
                        {useBackupCode ? "Emergency Backup Code" : "6-Digit Security Code"}
                      </Label>
                      <button
                        type="button"
                        onClick={() => {
                          setUseBackupCode(!useBackupCode);
                          setTotpCode("");
                        }}
                        className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        {useBackupCode ? "Use Authenticator App" : "Use Backup Code"}
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        required
                        autoFocus
                        maxLength={useBackupCode ? 10 : 6}
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value)}
                        placeholder={useBackupCode ? "A7B2-9F1C" : "123456"}
                        className="pl-9 h-10 text-sm font-mono tracking-widest text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-9 text-xs font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm"
              >
                {isLoading ? (
                  "Verifying credentials..."
                ) : requires2FA ? (
                  "Verify & Access Dashboard"
                ) : (
                  <span className="flex items-center gap-1.5">
                    Continue to Fubber
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Fingerprint className="h-3.5 w-3.5 text-sky-500" />
                Session auto-timeout
              </span>
              <Link href="/settings" className="hover:text-foreground">
                Security Settings
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-muted-foreground">
          Protected with hardware-accelerated AES-256 encryption. All credentials stored server-side.
        </p>
      </div>
    </div>
  );
}
