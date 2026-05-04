# CaptionFlow — Security Audit Report

> Generated: 2026-04-27 | Status: Remediation In Progress

## Summary

| Severity | Count | Fixed |
|----------|-------|-------|
| CRITICAL | 2 | 1 (C1 requires manual secret rotation) |
| HIGH | 4 | 4 |
| MEDIUM | 7 | 7 |
| LOW | 2 | 2 |



---

## CRITICAL

### C1 — Hardcoded Secrets in `.env.local`
**File:** `.env.local`
**Issue:** All production secrets are in a file that may be committed — Supabase service role key, OpenAI key, Stripe secret, Resend, Redis, Google OAuth credentials.
**Impact:** Full database access bypassing RLS, unlimited API cost, payment manipulation, email spoofing.
**Fix:** Rotate every secret immediately. Verify `.env.local` is in `.gitignore`. Set all vars in Vercel Dashboard only.
**Status:** [ ] Open — requires manual action (rotate secrets in Stripe/OpenAI/Supabase/Resend dashboards)

---

### C2 — Service Role Key Used in Public Unauthenticated Endpoint
**File:** `app/api/waitlist/route.ts:13`
**Issue:** A public POST endpoint (no auth required) constructs a Supabase client using `SUPABASE_SERVICE_ROLE_KEY`, bypassing all RLS.
**Impact:** Any compromise of this endpoint grants full database write access.
**Fix:** Enable RLS policy for anonymous inserts on `waitlist` table. Remove service role client from this file entirely. Use the public anon client.
**Status:** [x] Fixed — code uses anon client; apply RLS policy in Supabase SQL Editor: `CREATE POLICY "allow_public_waitlist_insert" ON waitlist FOR INSERT TO anon WITH CHECK (true);`

---

## HIGH

### H1 — Rate Limiting Defined But Never Enforced
**Files:** `app/api/generate-caption/route.ts`, `app/api/boost-caption/route.ts`, `app/api/analyze-caption/route.ts`, `app/api/generate-caption-vision/route.ts`, `app/api/generate-hooks/route.ts`
**Issue:** `shared/lib/rate-limiter.ts` exports `checkRateLimit()` with Upstash Redis limiters, but no AI endpoint actually calls it. Users can make unlimited requests per minute.
**Impact:** OpenAI budget drain, DDoS surface, free-tier bypass (daily count alone is insufficient).
**Fix:** Add `checkRateLimit(user.id, 'captionGeneration')` at the top of every AI endpoint POST handler before any AI call. Return 429 with `Retry-After` header on limit exceeded.
**Status:** [x] Fixed — applied to generate-caption, boost-caption, analyze-caption, generate-caption-vision, generate-hooks

---

### H2 — Broken PKCE in Twitter OAuth
**File:** `app/api/auth/social/[platform]/route.ts:99`
**Issue:** Twitter OAuth uses a hardcoded, static PKCE code challenge:
```typescript
authParams.set('code_challenge', 'challenge'); // static string
authParams.set('code_challenge_method', 'plain');
```
Every user shares the same verifier, defeating PKCE entirely.
**Impact:** Authorization code interception attacks possible; PKCE provides no protection.
**Fix:** Generate `crypto.randomBytes(32)` per request as the verifier. Hash it with SHA-256 for the challenge (S256 method). Store verifier in a short-lived cookie for callback retrieval.
**Status:** [x] Fixed — S256 PKCE with per-request verifier stored in HttpOnly cookie

---

### H3 — `/api/beta` GET Endpoint Missing Admin Check
**File:** `app/api/beta/route.ts:59`
**Issue:** The GET handler has a comment "Admin: Get all beta signups" but only checks `if (!user)` — any authenticated user can enumerate all beta signups including emails.
**Impact:** Full PII exposure of waitlist (names, emails, timestamps) to any registered user.
**Fix:** After `getUser()`, query `users` table for `is_admin` flag and return 403 if false.
**Status:** [x] Fixed — also requires `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;` in Supabase

---

### H4 — OpenAI Call Fires Synchronously During Every OAuth Callback
**File:** `app/api/auth/social/[platform]/callback/route.ts:289`
**Issue:** Profile DNA extraction calls `openai.chat.completions.create()` inline during the OAuth redirect. This adds 1–3s latency and costs ~$0.05 per connection.
**Impact:** Poor UX, unnecessary cost per connection, failure risk blocks OAuth completion.
**Fix:** Skip AI DNA extraction during OAuth. Store raw `recentCaptions` only. Trigger DNA analysis via a separate user-initiated "Sync DNA" button.
**Status:** [x] Fixed — OpenAI call removed; raw captions stored with `analyzed: false` flag

---

## MEDIUM

### M1 — OAuth State Parameter Not Server-Validated (Replay Risk)
**File:** `app/api/auth/social/[platform]/callback/route.ts:194`
**Issue:** State is a base64-encoded JSON blob without server-side storage. No CSRF binding to the initiating session. 10-minute window allows replay.
**Fix:** On OAuth init, store state in a short-lived cookie (HttpOnly, SameSite=Lax, 10-min expiry). On callback, validate cookie matches state param, then clear it.
**Status:** [x] Fixed — implemented in /api/auth/social/[platform] routes


---

### M2 — OAuth Access Tokens Stored in Plaintext
**File:** `app/api/auth/social/[platform]/callback/route.ts:336`
**Issue:** `access_token` and `refresh_token` are stored unencrypted in `social_connections` table.
**Impact:** Database breach exposes live social media tokens for all connected accounts.
**Fix:** Encrypt tokens with AES-256-GCM before storage using a `TOKEN_ENCRYPTION_KEY` env var. Decrypt on read.
**Status:** [x] Fixed — AES-256-GCM encryption added to OAuth callback and cron publish routes


---

### M3 — Cron Secret Comparison Not Timing-Safe
**File:** `app/api/cron/publish/route.ts:10`
**Issue:** `authHeader !== \`Bearer ${process.env.CRON_SECRET}\`` is a string comparison vulnerable to timing attacks. Also `CRON_SECRET` may be undefined, making every request with `Bearer undefined` authorized.
**Fix:** Use `crypto.timingSafeEqual()`. Guard against undefined secret at startup.
**Status:** [x] Fixed

---

### M4 — Internal DB Error Messages Leaked to Client
**File:** `app/api/schedule-post/route.ts:80`
**Issue:** `${updateError.message || updateError.details || 'Unknown DB error'}` is returned directly in the response body — exposes table structure, column names, constraint names.
**Fix:** Log the full error server-side; return generic `'Failed to schedule post'` to client.
**Status:** [x] Fixed

---

### M5 — Missing Input Length/Sanitization on AI Prompt Inputs
**Files:** `app/api/analyze-caption/route.ts`, `app/api/boost-caption/route.ts`, `app/api/generate-hooks/route.ts`
**Issue:** `caption` strings are interpolated directly into OpenAI prompts with no max-length cap beyond Zod's `min(5)`. Enables token abuse and prompt injection attempts.
**Fix:** Add `.max(5000)` to Zod schemas. Strip control characters before injection into prompts.
**Status:** [x] Fixed — .max(5000) added to analyze-caption, boost-caption, generate-hooks

---

### M6 — N+1 LinkedIn Organization Fetch
**File:** `app/api/auth/social/[platform]/callback/route.ts:77`
**Issue:** Sequential `await fetch()` inside a `for` loop fetches each LinkedIn org one-by-one.
**Fix:** Use `Promise.all()` to fetch all org details in parallel.
**Status:** [x] Fixed

---

### M7 — Non-Idempotent Cron (Posts Can Get Stuck in `pending`)
**File:** `app/api/cron/publish/route.ts`
**Issue:** If the cron worker crashes or times out mid-loop, some posts remain in `scheduled` status and are retried on the next cron tick, potentially double-publishing.
**Fix:** Use a `processing` intermediate status. Set `scheduled_status = 'processing'` before attempting publish; roll back to `scheduled` on timeout, advance to `published`/`failed` on completion.
**Status:** [x] Fixed — 'processing' status implemented in cron publish route


---

## LOW

### L1 — Image Size Validated After Full Body Parse
**File:** `app/api/generate-caption-vision/route.ts:35`
**Issue:** Base64 image size check happens after the entire request body is parsed and held in memory.
**Fix:** Check `Content-Length` header before parsing body and reject early if over limit.
**Status:** [x] Fixed — Content-Length check added to /api/generate-caption-vision


---

### L2 — Over-fetching Columns with `select('*')`
**Files:** `app/api/captions/route.ts`, several others
**Issue:** `select('*')` returns all columns including potentially large fields not needed by the client.
**Fix:** Replace with explicit column lists matching what each endpoint actually uses.
**Status:** [x] Fixed — explicit columns added to captions API and dashboard page


---

## Missing Database Indexes (Performance)

Run these migrations in Supabase SQL Editor:

```sql
CREATE INDEX IF NOT EXISTS idx_captions_user_id ON captions(user_id);
CREATE INDEX IF NOT EXISTS idx_captions_scheduled ON captions(scheduled_status, scheduled_at) WHERE scheduled_status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_social_connections_user_id ON social_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_voices_user_id ON brand_voices(user_id);
```

**Status:** [ ] Open — Use consolidated script: `supabase/migrations/20260427_security_consolidated.sql`

---

## Fix Order

1. **C2** — Remove service role from waitlist endpoint (5 min)
2. **H1** — Add rate limiting to all AI endpoints (30 min)
3. **H3** — Add admin check to `/api/beta` GET (5 min)
4. **H2** — Fix PKCE for Twitter OAuth (20 min)
5. **M4** — Stop leaking DB errors to client (10 min)
6. **M5** — Add input max-length to AI endpoints (15 min)
7. **H4** — Remove synchronous DNA extraction from OAuth (20 min)
8. **M3** — Fix cron secret comparison (10 min)
9. **M6** — Parallelize LinkedIn org fetch (10 min)
10. **M1** — Server-side OAuth state storage (30 min)
11. **M2** — Encrypt OAuth tokens at rest (45 min)
12. **M7** — Idempotent cron with processing status (30 min)
13. **L1** — Early Content-Length check on vision endpoint (5 min)
14. **L2** — Replace select('*') with explicit columns (15 min)
15. DB indexes migration (5 min)
