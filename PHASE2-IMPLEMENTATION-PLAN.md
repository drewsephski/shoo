# Phase 2 Implementation Plan — Security Hardening

> **Status**: Architecture Locked  
> **Scope**: Rate limiting, audit logging, device fingerprinting  
> **Target**: Production-ready Shoo auth template

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Authentication Flow                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User Sign-In                                                    │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │ Rate Limit  │────▶│   Shoo      │────▶│   Token     │       │
│  │   Check     │     │   OAuth     │     │ Verification│       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
│       │                                       │                 │
│       │ (if allowed)                          │                 │
│       ▼                                       ▼                 │
│  ┌─────────────┐                       ┌─────────────┐           │
│  │  Log Audit  │                       │  Create     │           │
│  │  Event      │                       │  Session    │           │
│  │  (attempt)  │                       │  + Device   │           │
│  └─────────────┘                       │  Metadata   │           │
│       │                                └─────────────┘           │
│       │                                       │                 │
│       ▼                                       ▼                 │
│  ┌─────────────┐                       ┌─────────────┐           │
│  │  Log Audit  │                       │  Log Audit  │           │
│  │  (success/ │                       │  (success)  │           │
│  │   failure)  │                       └─────────────┘           │
│  └─────────────┘                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Schema Changes

### 1. Rate Limits Table

```typescript
// convex/schema.ts additions
rateLimits: defineTable({
  key: v.string(),           // "ip:${ip}:signin" or "user:${userId}:signin"
  count: v.number(),         // attempts in current window
  windowStart: v.number(),    // timestamp (ms)
  expiresAt: v.number(),      // TTL cleanup
})
  .index("by_key", ["key"])
  .index("by_expiresAt", ["expiresAt"])
```

### 2. Audit Events Table

```typescript
auditEvents: defineTable({
  userId: v.optional(v.string()),
  event: v.union(
    v.literal("sign_in_success"),
    v.literal("sign_in_failure"),
    v.literal("session_created"),
    v.literal("session_revoked"),
    v.literal("all_sessions_revoked"),
    v.literal("rate_limit_exceeded"),
    v.literal("token_verification_failed")
  ),
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  metadata: v.optional(v.object({
    sessionId: v.optional(v.string()),
    reason: v.optional(v.string()),
    attemptsInWindow: v.optional(v.number()),
  })),
  timestamp: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_timestamp", ["timestamp"])
  .index("by_event", ["event"])
```

### 3. Extended User Sessions

```typescript
userSessions: defineTable({
  userId: v.string(),
  tokenHash: v.string(),
  createdAt: v.number(),
  expiresAt: v.number(),
  // NEW FIELDS:
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  deviceFingerprint: v.optional(v.string()), // hash of UA + IP
  lastActiveAt: v.number(), // track session usage
})
  .index("by_userId", ["userId"])
  .index("by_tokenHash", ["tokenHash"])
  .index("by_deviceFingerprint", ["deviceFingerprint"]) // for detecting new devices
```

---

## Implementation Steps

### Step 1: Rate Limiting (`convex/rateLimit.ts`)

**Purpose**: Prevent brute force attacks on sign-in endpoint

**Logic**:
- Key: `ip:${request.ip}:signin`
- Window: 5 minutes (300,000 ms)
- Max attempts: 5 per window
- Cleanup: TTL on expiresAt

**API**:
```typescript
checkRateLimit(ctx, key: string, windowMs: number, maxRequests: number): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
}>

incrementRateLimit(ctx, key: string, windowMs: number): Promise<void>

cleanupExpiredRateLimits(ctx): Promise<{ deletedCount: number }>
```

**Integration Points**:
- `app/auth/callback/page.tsx` — before calling `createSession`
- `app/api/verify/route.ts` — before token verification

---

### Step 2: Audit Logging (`convex/audit.ts`)

**Purpose**: Security trail of all auth events

**API**:
```typescript
logAuthEvent(ctx, {
  userId?: string,
  event: AuthEventType,
  ipAddress?: string,
  userAgent?: string,
  metadata?: object
}): Promise<void>

getUserAuditLog(ctx, userId: string, limit?: number): Promise<AuditEvent[]>

getRecentAuditEvents(ctx, limit?: number): Promise<AuditEvent[]>

cleanupOldAuditEvents(ctx, olderThanMs: number): Promise<{ deletedCount: number }>
```

**Integration Points**:
- `convex/sessions.ts:createSession` — log session creation
- `convex/sessions.ts:revokeSession` — log revocation
- `app/auth/callback/page.tsx` — log sign-in attempts
- `app/api/verify/route.ts` — log verification failures

---

### Step 3: Device Fingerprinting

**Purpose**: Track device metadata for security awareness

**Implementation**:
1. Capture IP and User-Agent in `createSession`
2. Generate device fingerprint: `SHA256(IP + User-Agent + salt)`
3. Store in session record
4. Display in admin dashboard

**Helper Function**:
```typescript
// lib/device.ts
export function generateDeviceFingerprint(
  ipAddress: string,
  userAgent: string
): string {
  const data = `${ipAddress}:${userAgent}`;
  return crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
}
```

**Integration**:
- Modify `convex/sessions.ts:createSession` to accept and store device info
- Update `app/auth/callback/page.tsx` to pass device metadata
- Add device column to admin dashboard

---

### Step 4: Admin Dashboard Updates (`app/admin/page.tsx`)

**New Features**:
1. **Device column** in sessions list (show truncated fingerprint)
2. **Audit Log tab** — view recent auth events
3. **Rate Limit indicators** — show if user is currently rate-limited

**Data Fetching**:
```typescript
const auditEvents = useQuery(api.audit.getRecentAuditEvents, { limit: 50 });
const userSessions = useQuery(api.sessions.getUserSessionsWithDevice, { userId });
```

---

## File Changes Required

| File | Change Type | Description |
|------|-------------|-------------|
| `convex/schema.ts` | Modify | Add rateLimits, auditEvents tables; extend userSessions |
| `convex/rateLimit.ts` | Create | Rate limiting logic |
| `convex/audit.ts` | Create | Audit logging system |
| `convex/sessions.ts` | Modify | Add device metadata; integrate rate limiting |
| `app/auth/callback/page.tsx` | Modify | Pass device info; add rate limit check |
| `app/api/verify/route.ts` | Modify | Add audit logging on failures |
| `app/admin/page.tsx` | Modify | Add device column; audit log panel |
| `lib/device.ts` | Create | Device fingerprinting utilities |

---

## Testing Strategy

### Unit Tests (Convex)
- Rate limiting: test window boundaries, cleanup
- Audit logging: test all event types, metadata
- Device fingerprint: test consistency, uniqueness

### E2E Tests (Playwright)
- Rate limiting: simulate 6 rapid sign-ins, verify 6th blocked
- Audit trail: sign in, verify event logged
- Device detection: sign in from two browsers, verify different fingerprints

### Manual Testing
- Admin dashboard displays device info
- Rate limit error shown to user
- Audit log viewable in admin

---

## Security Considerations

### Rate Limiting
- IP-based (not user-based) to prevent account enumeration
- Soft limits — don't lock accounts permanently
- TTL cleanup prevents table bloat

### Audit Logging
- Log failures AND successes
- Include metadata for forensics
- Separate cleanup job (retention: 90 days)
- No sensitive data in logs (no tokens, no passwords)

### Device Fingerprinting
- Hash + truncate (privacy-preserving)
- Used for "new device" detection, not blocking
- IP may change (mobile networks) — don't over-rely

---

## Deployment Checklist

- [ ] Convex schema pushed (`npx convex dev`)
- [ ] Environment variables documented
- [ ] Admin dashboard tested
- [ ] Rate limiting verified (manual test)
- [ ] Audit events visible
- [ ] README updated with new features

---

## Success Criteria

1. **Rate limiting**: 5+ rapid sign-in attempts from same IP are blocked
2. **Audit logging**: Every auth event appears in admin within 1 second
3. **Device fingerprinting**: Admin shows different devices for same user
4. **No regressions**: Existing auth flow still works

---

## Time Estimate

| Step | Effort |
|------|--------|
| Schema changes | 15 min |
| Rate limiting | 30 min |
| Audit logging | 30 min |
| Device fingerprinting | 20 min |
| Admin updates | 30 min |
| Testing | 30 min |
| **Total** | **~3 hours** |

---

*Plan ready for implementation. Start with schema changes, then build features in order.*
