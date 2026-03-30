# Shoo-Auth Platform Documentation

> **Research & Architecture Guide** | Generated March 2026  
> **Purpose**: Comprehensive documentation for building a complete, production-ready authentication platform

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture](#current-architecture)
3. [Research: Auth Best Practices](#research-auth-best-practices)
4. [Security Analysis](#security-analysis)
5. [Gap Analysis](#gap-analysis)
6. [Feature Roadmap](#feature-roadmap)
7. [Implementation Recommendations](#implementation-recommendations)
8. [API Reference](#api-reference)

---

## Executive Summary

**Shoo-Auth** is a modern authentication platform combining:
- **Shoo** (`@shoojs/react`) - OAuth/OpenID Connect provider at `shoo.dev`
- **Convex** - Backend database and serverless functions
- **Next.js 16** - Frontend framework with App Router
- **Jose** - JWT verification library

### Current State

| Component | Status | Notes |
|-----------|--------|-------|
| OAuth Sign-in | ✅ Working | Via Shoo provider |
| Session Management | ✅ Working | Convex-backed with 30-day expiry |
| Token Verification | ✅ Working | JWKS-based verification |
| User Dashboard | ✅ Working | Profile + session display |
| Admin Dashboard | ✅ Working | User/session management |
| Multi-device Sessions | ✅ Working | Per-device session tracking |
| Session Revocation | ✅ Working | Per-session + bulk revoke |

### Architecture Philosophy

Shoo-Auth follows a **"separation of concerns"** pattern:
1. **Shoo** handles OAuth flows, identity tokens, and pairwise user IDs
2. **Convex** stores application data, sessions, and user metadata
3. **Next.js** handles UI, SSR-safe auth wrappers, and API routes

---

## Current Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js Frontend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │  Hero/Page   │  │   Dashboard  │  │      Admin Dashboard     │ │
│  │  (Marketing) │  │   (User)     │  │     (Admin Features)     │ │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘ │
│         │                 │                       │               │
│  ┌──────▼─────────────────▼───────────────────────▼─────────────┐ │
│  │              lib/shoo-convex.ts                               │ │
│  │  - useShooAuth() hook                                         │ │
│  │  - SSR-safe auth wrappers                                     │ │
│  │  - Centralized auth config                                    │ │
│  └──────┬──────────────────────────────────────────┬──────────┘ │
│         │                                            │            │
│  ┌──────▼──────────────┐                  ┌──────────▼────────┐  │
│  │  @shoojs/react      │                  │  convex/react     │  │
│  │  - createShooAuth() │                  │  - useQuery()     │  │
│  │  - signIn()         │                  │  - useMutation()  │  │
│  └──────┬──────────────┘                  └──────────┬────────┘  │
└─────────┼─────────────────────────────────────────────┼──────────┘
          │                                             │
          │ OAuth Flow                                  │ Data Sync
          ▼                                             ▼
┌──────────────────┐                        ┌─────────────────────┐
│   shoo.dev       │                        │      Convex         │
│  OAuth Provider  │                        │   Backend           │
│                  │                        │                     │
│  - Authorization │                        │  ┌───────────────┐  │
│  - Token Issuance  │                        │  │  users.ts     │  │
│  - JWKS Endpoint   │                        │  │  - getCurrent │  │
│                  │                        │  │  - getOrCreate│  │
└────────┬─────────┘                        │  │  - listUsers  │  │
         │                                  │  └───────────────┘  │
         │ Callback                         │                     │
         │                                  │  ┌───────────────┐  │
         ▼                                  │  │  sessions.ts  │  │
┌──────────────────┐                       │  │  - create     │  │
│  /auth/callback  │                       │  │  - revoke     │  │
│                  │                       │  │  - cleanup    │  │
│  1. Exchange code│                       │  └───────────────┘  │
│  2. Verify JWT   │                       │                     │
│  3. Sync to DB   │                       │  ┌───────────────┐  │
│  4. Create sess  │                       │  │  schema.ts    │  │
└────────┬─────────┘                       │  │  - users      │  │
         │                                  │  │  - userSess   │  │
         │ Token                            └─────────────────────┘
         │
         ▼
┌──────────────────┐
│  /api/verify     │
│                  │
│  JWKS Validation │
│  - Signature     │
│  - Issuer        │
│  - Audience      │
└──────────────────┘
```

### Key Files Reference

| File | Purpose | Lines |
|------|---------|-------|
| `lib/shoo-convex.ts` | Auth configuration & hooks | 53 |
| `convex/schema.ts` | Database schema | 26 |
| `convex/users.ts` | User CRUD operations | 89 |
| `convex/sessions.ts` | Session management | 145 |
| `app/auth/callback/page.tsx` | OAuth callback handler | 210 |
| `app/api/verify/route.ts` | Token verification API | 49 |
| `app/dashboard/page.tsx` | User dashboard | 213 |
| `app/admin/page.tsx` | Admin panel | 408 |
| `components/profile.tsx` | Auth UI component | 51 |

---

## Research: Auth Best Practices

### 1. Session Management Patterns

Based on Clerk's documentation and industry standards:

#### Token Storage
| Approach | Pros | Cons | Used by Shoo |
|----------|------|------|--------------|
| localStorage | Simple, persists across tabs | XSS vulnerable | ✅ Yes |
| httpOnly cookies | XSS-safe, automatic transmission | CSRF risk, complex | ❌ No |
| Memory only | Most secure | Lost on refresh | ❌ No |

**Shoo's Approach**: localStorage with automatic refresh polling (every 60s). This is a pragmatic choice for a modern SPA but requires XSS protection.

#### Session Lifecycle
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Sign In   │────▶│   Active    │────▶│   Expired   │────▶│  Cleaned Up │
│             │     │  (30 days)  │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Revoked   │
                    │  (manual)   │
                    └─────────────┘
```

### 2. JWT Best Practices

From Clerk documentation analysis:

**Required Claims Verification**:
- ✅ `iss` (Issuer) - Validates token source
- ✅ `aud` (Audience) - Validates intended recipient (origin-based)
- ✅ `pairwise_sub` - Shoo's unique user identifier
- ✅ `exp` (Expiration) - Checked via JWKS

**JWKS Key Rotation**:
- Remote JWKS endpoint: `/.well-known/jwks.json`
- Automatic key caching with TTL
- Graceful rotation handling

### 3. Multi-Device Session Patterns

Shoo-Auth implements **per-device session tracking**:

| Feature | Implementation |
|---------|----------------|
| Device isolation | Each sign-in creates unique session record |
| Token hashing | SHA-256 hash stored (not raw token) |
| Concurrent limit | No hard limit (soft: admin-enforced) |
| Cross-device revoke | `revokeAllUserSessions` mutation |

**Best Practice Comparison**:
- **Clerk**: Server-side session list with device fingerprinting
- **Auth0**: Session store with `sid` claim tracking
- **Shoo**: Application-layer session management via Convex

### 4. Security Patterns from Research

| Pattern | Status | Notes |
|---------|--------|-------|
| Token expiration | ✅ | 30 days, configurable |
| Secure token hashing | ✅ | SHA-256 in browser (Web Crypto) |
| CSRF protection | ⚠️ | Not explicitly implemented (stateless API) |
| Rate limiting | ❌ | Not implemented |
| IP binding | ❌ | Not implemented |
| Device fingerprinting | ❌ | Not implemented |

---

## Security Analysis

### Strengths

1. **Pairwise User IDs**: Shoo provides privacy-preserving user identifiers (different per OAuth client)
2. **JWKS Verification**: Proper asymmetric signature verification
3. **Audience Validation**: Tokens bound to origin prevent cross-site replay
4. **Session Transparency**: Users can see active sessions and revoke them
5. **Admin Controls**: Bulk session cleanup, user management

### Weaknesses & Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| localStorage XSS | Medium | CSP headers, input sanitization |
| No rate limiting | High | Implement middleware limits |
| Token hash only | Low | Consider storing metadata hash only |
| No device fingerprinting | Low | Add for security-sensitive apps |

### OWASP Auth Checklist

| Control | Status | Notes |
|---------|--------|-------|
| Password policy | N/A | OAuth-only (Shoo handles) |
| MFA/2FA | N/A | Via Shoo provider |
| Session timeout | ✅ | 30 days |
| Concurrent session limit | ⚠️ | No automatic limit |
| Secure session ID | ✅ | Token hash stored |
| Session invalidation | ✅ | Full revocation support |
| CSRF protection | ⚠️ | Not explicitly implemented |
| Clickjacking protection | ⚠️ | No X-Frame-Options set |

---

## Gap Analysis

### Missing for "Complete" Auth Platform

#### Core Features (P0)
| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Rate limiting | High | Low | API route protection |
| Audit logging | High | Medium | Track auth events |
| Webhook support | High | Medium | External system sync |
| Session metadata | Medium | Low | Device, IP, location |

#### Enterprise Features (P1)
| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Organization/Teams | Medium | High | Multi-tenant support |
| RBAC | Medium | Medium | Role-based access |
| SSO/SAML | Low | High | Enterprise connector |
| SCIM provisioning | Low | High | Directory sync |

#### Security Enhancements (P1)
| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Suspicious activity detection | Medium | Medium | Unusual patterns |
| IP allowlisting | Low | Low | Geographic restrictions |
| Session anomaly alerts | Low | Medium | Email notifications |
| Forced password reset | N/A | N/A | Handled by Shoo |

---

## Feature Roadmap

### Phase 1: Foundation (Current)
✅ OAuth sign-in with Shoo
✅ Session management
✅ Basic admin dashboard
✅ User profiles

### Phase 2: Security & Reliability (Next)
- [ ] Rate limiting middleware
- [ ] Comprehensive audit logging
- [ ] Webhook system for auth events
- [ ] Suspicious activity detection
- [ ] Session metadata (device, IP)

### Phase 3: Enterprise (Future)
- [ ] Organization/team support
- [ ] Role-based access control (RBAC)
- [ ] Invitation system
- [ ] Domain-based auto-provisioning
- [ ] Admin API

### Phase 4: Platform (Vision)
- [ ] Multi-provider support (beyond Shoo)
- [ ] Custom OAuth provider integration
- [ ] Enterprise SSO (SAML, OIDC)
- [ ] Directory sync (SCIM)
- [ ] Analytics dashboard

---

## Implementation Recommendations

### Immediate Improvements

#### 1. Rate Limiting
```typescript
// convex/rateLimit.ts
export const checkRateLimit = mutation({
  args: { 
    key: v.string(), // IP or userId
    windowMs: v.number(),
    maxRequests: v.number()
  },
  handler: async (ctx, { key, windowMs, maxRequests }) => {
    // Implementation using Convex TTL
  }
});
```

#### 2. Audit Logging
```typescript
// convex/audit.ts
export const logAuthEvent = mutation({
  args: {
    userId: v.string(),
    event: v.string(), // 'sign_in', 'sign_out', 'session_revoked'
    metadata: v.optional(v.object({
      ip: v.optional(v.string()),
      userAgent: v.optional(v.string()),
    }))
  },
  // Create audit trail table
});
```

#### 3. Session Metadata Enhancement
```typescript
// Add to schema.ts
userSessions: defineTable({
  userId: v.string(),
  tokenHash: v.string(),
  createdAt: v.number(),
  expiresAt: v.number(),
  // New fields:
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  deviceFingerprint: v.optional(v.string()),
  lastActiveAt: v.number(),
})
```

### Architecture Patterns to Adopt

#### 1. Middleware Pattern for Protected Routes
```typescript
// middleware.ts (Next.js)
export async function middleware(request: NextRequest) {
  // Check auth before serving protected routes
  // Centralize redirect logic
}
```

#### 2. Hook Pattern for Auth State
```typescript
// hooks/useRequireAuth.ts
export function useRequireAuth() {
  const { identity, loading } = useShooAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !identity.userId) {
      router.push('/auth/signin');
    }
  }, [identity, loading, router]);
  
  return { identity, loading };
}
```

#### 3. Service Pattern for API Clients
```typescript
// lib/api-client.ts
class AuthenticatedApiClient {
  async fetch(endpoint: string, options?: RequestInit) {
    const token = await getAuthToken();
    return fetch(endpoint, {
      ...options,
      headers: {
        ...options?.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}
```

---

## API Reference

### Shoo-Auth React Hook

```typescript
function useShooAuth(): {
  identity: {
    userId: string | null;
    token: string | null;
    // ...
  };
  claims: {
    name?: string;
    email?: string;
    // JWT claims
  } | null;
  loading: boolean;
  sessionState: 'authenticated' | 'login_required' | 'loading';
  signIn: (options?: { requestPii?: boolean }) => Promise<void>;
  signOut: () => void;
  clearIdentity: () => void;
}
```

### Convex Mutations

```typescript
// User Management
api.users.getCurrentUser({ userId: string })
api.users.getOrCreateUser({ userId, email?, name? })
api.users.updateProfile({ userId, email?, name? })
api.users.listUsers()

// Session Management
api.sessions.createSession({ userId, tokenHash, expiresAt })
api.sessions.getUserSessions({ userId })
api.sessions.revokeSession({ sessionId })
api.sessions.revokeAllUserSessions({ userId })
api.sessions.getAllActiveSessions()
api.sessions.cleanupExpiredSessions()
```

### Environment Configuration

```bash
# Required
NEXT_PUBLIC_CONVEX_URL=https://your-convex-url
SHOO_BASE_URL=https://shoo.dev

# Optional overrides
SHOO_ISSUER=https://shoo.dev
APP_ORIGIN=http://localhost:3000
```

---

## Conclusion

Shoo-Auth represents a **solid foundation** for a modern authentication platform. The architecture correctly separates concerns between the OAuth provider (Shoo), the application backend (Convex), and the frontend (Next.js).

### Key Achievements

1. **Functional OAuth flow** with proper token verification
2. **Session management** with multi-device support
3. **Admin tooling** for user and session management
4. **Clean architecture** with proper separation of concerns

### Path to Production

To reach "complete authentication platform" status:

1. **Security hardening**: Rate limiting, audit logging, anomaly detection
2. **Enterprise features**: Organizations, RBAC, invitations
3. **Platform expansion**: Multi-provider support, custom OAuth
4. **Operational tooling**: Webhooks, analytics, admin API

The current implementation provides approximately **60%** of a full-featured auth platform, with the remaining 40% being enterprise/security features that can be incrementally added.

---

*Documentation generated for shoo-auth research initiative.  
Last updated: March 2026*
