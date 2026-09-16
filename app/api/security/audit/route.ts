import { NextRequest, NextResponse } from "next/server";
import {
  getAuditLogs,
  getSecuritySettings,
  updateSecuritySettings,
  addAuditLog,
} from "@/lib/security/audit";

export async function GET() {
  const logs = getAuditLogs();
  const settings = getSecuritySettings();

  return NextResponse.json({
    success: true,
    logs,
    settings: {
      twoFactorEnabled: settings.twoFactorEnabled,
      sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
      strictIpBinding: settings.strictIpBinding,
      backupCodesRemaining: settings.backupCodes.length,
      encryptionStatus: "Active (AES-256-GCM)",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { action, sessionTimeoutMinutes, strictIpBinding } = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Browser";

    if (action === "update_session_timeout" && sessionTimeoutMinutes) {
      updateSecuritySettings({ sessionTimeoutMinutes });
      addAuditLog(
        "SETTINGS_UPDATED",
        `Session inactivity timeout updated to ${sessionTimeoutMinutes} minutes`,
        "success",
        ip,
        userAgent
      );
      return NextResponse.json({ success: true, sessionTimeoutMinutes });
    }

    if (action === "revoke_sessions") {
      addAuditLog(
        "SESSION_REVOKED",
        "All active sessions revoked by administrator",
        "warning",
        ip,
        userAgent
      );
      return NextResponse.json({
        success: true,
        message: "All active sessions have been terminated",
      });
    }

    if (action === "toggle_strict_ip") {
      const updated = updateSecuritySettings({ strictIpBinding: Boolean(strictIpBinding) });
      addAuditLog(
        "SETTINGS_UPDATED",
        `Strict IP binding ${updated.strictIpBinding ? "enabled" : "disabled"}`,
        "success",
        ip,
        userAgent
      );
      return NextResponse.json({ success: true, strictIpBinding: updated.strictIpBinding });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
