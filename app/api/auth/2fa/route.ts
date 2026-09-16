import { NextRequest, NextResponse } from "next/server";
import {
  generateTotpSetup,
  verifyTotp,
} from "@/lib/security/totp";
import {
  getSecuritySettings,
  updateSecuritySettings,
  addAuditLog,
} from "@/lib/security/audit";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const settings = getSecuritySettings();

  if (action === "setup") {
    // Generate new secret for QR code scanning
    const setup = generateTotpSetup("owner@fubber.io", "Fubber");
    return NextResponse.json({
      success: true,
      setup,
    });
  }

  return NextResponse.json({
    success: true,
    twoFactorEnabled: settings.twoFactorEnabled,
    twoFactorConfirmedAt: settings.twoFactorConfirmedAt,
    backupCodesCount: settings.backupCodes.length,
    sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, secret, token, backupCodes } = body;
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Browser";

    if (action === "enable") {
      if (!secret || !token) {
        return NextResponse.json(
          { success: false, error: "Secret key and 6-digit verification code are required" },
          { status: 400 }
        );
      }

      const isValid = verifyTotp(secret, token);
      if (!isValid) {
        addAuditLog("LOGIN_FAILED", "Failed 2FA code verification during activation attempt", "warning", ip, userAgent);
        return NextResponse.json(
          { success: false, error: "Invalid 6-digit code. Please ensure your authenticator app time is synchronized." },
          { status: 400 }
        );
      }

      updateSecuritySettings({
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorConfirmedAt: new Date(),
        backupCodes: backupCodes || [],
      });

      addAuditLog("TWO_FACTOR_ENABLED", "Two-Factor Authentication (TOTP) activated successfully", "success", ip, userAgent);

      return NextResponse.json({
        success: true,
        message: "Two-Factor Authentication enabled successfully",
      });
    }

    if (action === "disable") {
      const settings = getSecuritySettings();
      if (!settings.twoFactorEnabled) {
        return NextResponse.json({ success: true, message: "2FA is already disabled" });
      }

      if (!token) {
        return NextResponse.json(
          { success: false, error: "6-digit confirmation code required to disable 2FA" },
          { status: 400 }
        );
      }

      const isValid = settings.twoFactorSecret ? verifyTotp(settings.twoFactorSecret, token) : true;
      if (!isValid) {
        addAuditLog("LOGIN_FAILED", "Failed code attempt while trying to disable 2FA", "warning", ip, userAgent);
        return NextResponse.json(
          { success: false, error: "Incorrect verification code" },
          { status: 400 }
        );
      }

      updateSecuritySettings({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorConfirmedAt: null,
        backupCodes: [],
      });

      addAuditLog("TWO_FACTOR_DISABLED", "Two-Factor Authentication turned off", "warning", ip, userAgent);

      return NextResponse.json({
        success: true,
        message: "Two-Factor Authentication has been disabled",
      });
    }

    if (action === "verify") {
      const settings = getSecuritySettings();
      if (!settings.twoFactorEnabled) {
        return NextResponse.json({ success: true, verified: true });
      }

      // Check if code matches TOTP or backup code
      const cleanToken = (token || "").trim().toUpperCase();
      let matched = false;

      if (settings.twoFactorSecret && verifyTotp(settings.twoFactorSecret, cleanToken)) {
        matched = true;
      } else if (settings.backupCodes.includes(cleanToken)) {
        matched = true;
        // Consume backup code
        updateSecuritySettings({
          backupCodes: settings.backupCodes.filter((c) => c !== cleanToken),
        });
      }

      if (!matched) {
        addAuditLog("LOGIN_FAILED", "Invalid 2FA token submitted", "warning", ip, userAgent);
        return NextResponse.json(
          { success: false, error: "Invalid authenticator code or backup recovery code" },
          { status: 401 }
        );
      }

      addAuditLog("TWO_FACTOR_VERIFIED", "Two-factor authentication code verified successfully", "success", ip, userAgent);
      return NextResponse.json({ success: true, verified: true });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
