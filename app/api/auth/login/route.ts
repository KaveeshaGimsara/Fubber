import { NextRequest, NextResponse } from "next/server";
import {
  getSecuritySettings,
  updateSecuritySettings,
  addAuditLog,
} from "@/lib/security/audit";
import { verifyTotp } from "@/lib/security/totp";

export async function POST(req: NextRequest) {
  try {
    const { email, password, totpCode } = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Browser";
    const settings = getSecuritySettings();

    // Check Lockout
    if (settings.lockoutUntil && new Date() < new Date(settings.lockoutUntil)) {
      const remainingMs = new Date(settings.lockoutUntil).getTime() - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      return NextResponse.json(
        {
          success: false,
          error: `Account temporarily locked due to excessive failed attempts. Try again in ${remainingMinutes} minutes.`,
        },
        { status: 429 }
      );
    }

    // Default primary credentials (or custom user email)
    const validEmail = "owner@fubber.io";
    const validPassword = process.env.ADMIN_PASSWORD || "FubberAdmin2026!";

    // Simple validation (in production, bcrypt hash comparison)
    const isCredentialsValid =
      (email?.toLowerCase() === validEmail || email?.toLowerCase() === "admin@fubber.io") &&
      password === validPassword;

    if (!isCredentialsValid) {
      const newAttempts = settings.failedLoginAttempts + 1;
      let lockoutUntil: Date | null = null;
      if (newAttempts >= 5) {
        lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lockout
      }

      updateSecuritySettings({
        failedLoginAttempts: newAttempts,
        lockoutUntil,
      });

      addAuditLog(
        "LOGIN_FAILED",
        `Failed authentication attempt for ${email || "unknown"} (Attempt ${newAttempts}/5)`,
        "warning",
        ip,
        userAgent
      );

      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
          attemptsRemaining: Math.max(0, 5 - newAttempts),
        },
        { status: 401 }
      );
    }

    // Credentials are valid; Check if 2FA is required
    if (settings.twoFactorEnabled) {
      if (!totpCode) {
        return NextResponse.json({
          success: true,
          requires2FA: true,
          message: "Please enter the 6-digit code from your Authenticator App",
        });
      }

      // Verify 2FA code or backup code
      const cleanCode = totpCode.trim().toUpperCase();
      let is2faValid = false;

      if (settings.twoFactorSecret && verifyTotp(settings.twoFactorSecret, cleanCode)) {
        is2faValid = true;
      } else if (settings.backupCodes.includes(cleanCode)) {
        is2faValid = true;
        // Consume backup code
        updateSecuritySettings({
          backupCodes: settings.backupCodes.filter((c) => c !== cleanCode),
        });
      }

      if (!is2faValid) {
        addAuditLog(
          "LOGIN_FAILED",
          `Invalid 2FA code provided during sign-in for ${email}`,
          "warning",
          ip,
          userAgent
        );
        return NextResponse.json(
          { success: false, error: "Invalid authenticator or backup code" },
          { status: 401 }
        );
      }
    }

    // Reset failed attempts upon successful login
    updateSecuritySettings({
      failedLoginAttempts: 0,
      lockoutUntil: null,
    });

    addAuditLog(
      "LOGIN_SUCCESS",
      `Administrator signed in successfully (${settings.twoFactorEnabled ? "Password + 2FA" : "Password only"})`,
      "success",
      ip,
      userAgent
    );

    const response = NextResponse.json({
      success: true,
      requires2FA: false,
      user: {
        email: validEmail,
        name: "Fubber Admin",
        role: "owner",
      },
      message: "Signed in successfully",
    });

    // Set Session Cookie
    const maxAgeSeconds = settings.sessionTimeoutMinutes * 60;
    response.cookies.set("fubber_session", `sess_${Date.now()}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAgeSeconds,
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
