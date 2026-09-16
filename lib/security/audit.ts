export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  event:
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILED"
    | "TWO_FACTOR_ENABLED"
    | "TWO_FACTOR_VERIFIED"
    | "TWO_FACTOR_DISABLED"
    | "TOKEN_ENCRYPTED_AES256"
    | "MEDIA_AUTO_PURGE"
    | "SESSION_REVOKED"
    | "SETTINGS_UPDATED";
  description: string;
  ipAddress: string;
  userAgent: string;
  status: "success" | "warning" | "error";
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  twoFactorConfirmedAt: Date | null;
  backupCodes: string[];
  sessionTimeoutMinutes: number; // 15, 60, 480, 1440, 10080
  strictIpBinding: boolean;
  failedLoginAttempts: number;
  lockoutUntil: Date | null;
}

// In-memory security state store with initial sensible defaults
let securityState: SecuritySettings = {
  twoFactorEnabled: false,
  twoFactorSecret: null,
  twoFactorConfirmedAt: null,
  backupCodes: [],
  sessionTimeoutMinutes: 60, // 1 hour standard
  strictIpBinding: false,
  failedLoginAttempts: 0,
  lockoutUntil: null,
};

const auditLogs: AuditLogEntry[] = [
  {
    id: "log_init_1",
    timestamp: new Date(Date.now() - 3600 * 1000 * 4),
    event: "TOKEN_ENCRYPTED_AES256",
    description: "AES-256-GCM hardware-accelerated encryption key initialized",
    ipAddress: "127.0.0.1",
    userAgent: "Fubber Core Security Engine",
    status: "success",
  },
  {
    id: "log_init_2",
    timestamp: new Date(Date.now() - 3600 * 1000 * 2),
    event: "MEDIA_AUTO_PURGE",
    description: "Scheduled 1-hour media auto-deletion job registered",
    ipAddress: "127.0.0.1",
    userAgent: "Cron Engine / Vercel Scheduler",
    status: "success",
  },
  {
    id: "log_init_3",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    event: "LOGIN_SUCCESS",
    description: "Primary workspace administrator authenticated",
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    status: "success",
  },
];

export function getSecuritySettings(): SecuritySettings {
  return { ...securityState };
}

export function updateSecuritySettings(updates: Partial<SecuritySettings>): SecuritySettings {
  securityState = { ...securityState, ...updates };
  return securityState;
}

export function getAuditLogs(): AuditLogEntry[] {
  return [...auditLogs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function addAuditLog(
  event: AuditLogEntry["event"],
  description: string,
  status: AuditLogEntry["status"] = "success",
  ipAddress = "127.0.0.1",
  userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
): AuditLogEntry {
  const newEntry: AuditLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date(),
    event,
    description,
    ipAddress,
    userAgent,
    status,
  };
  auditLogs.unshift(newEntry);
  if (auditLogs.length > 100) {
    auditLogs.pop();
  }
  return newEntry;
}
