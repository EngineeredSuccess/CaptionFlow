# CaptionFlow Security Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remediate all CRITICAL and HIGH security issues identified in `docs/SECURITY.md`, then address MEDIUM issues in order.

**Architecture:** Fixes are isolated per file — no new abstractions introduced. Each task is self-contained and independently testable. No database migrations required except the final index task.

**Tech Stack:** Next.js 15 App Router, Supabase (anon + service-role clients), Upstash Redis (rate limiting), Node.js `crypto` module, Zod v4.

---

## Task 1: C2 — Remove Service Role Key from Public Waitlist Endpoint

**Files:**
- Modify: `app/api/waitlist/route.ts`

**Context:** The waitlist endpoint is public (no auth). It currently uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS. The fix is to switch to the anon Supabase client and enable an RLS policy for anonymous inserts on the `waitlist` table.

**RLS SQL to run first in Supabase SQL Editor:**
```sql
-- Allow anyone to insert into waitlist (no auth required)
CREATE POLICY "allow_public_waitlist_insert"
ON waitlist FOR INSERT
TO anon
WITH CHECK (true);
```

- [ ] **Step 1: Apply the RLS policy**
Run the SQL above in Supabase Dashboard → SQL Editor. Verify it appears in Authentication → Policies → waitlist table.

- [ ] **Step 2: Replace the service role client with the public anon client**

Replace the entire file `app/api/waitlist/route.ts` with:

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const waitlistSchema = z.object({
    email: z.string().email(),
    handle: z.string().min(1),
    platform: z.string().min(1),
});

// Public anon client — RLS policy handles insert permission
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = waitlistSchema.parse(body);

        const { error } = await supabase
            .from('waitlist')
            .insert([{
                email: validatedData.email,
                handle: validatedData.handle,
                platform: validatedData.platform,
            }]);

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'This email is already on the waitlist.' },
                    { status: 409 }
                );
            }
            throw error;
        }

        return NextResponse.json(
            { message: 'Successfully joined the waitlist!' },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid input data.', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Waitlist submission error:', error);
        return NextResponse.json(
            { error: 'Failed to join waitlist. Please try again later.' },
            { status: 500 }
        );
    }
}
```

- [ ] **Step 3: Verify locally**
```bash
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","handle":"@test","platform":"instagram"}'
# Expected: {"message":"Successfully joined the waitlist!"}
```

- [ ] **Step 4: Update SECURITY.md**
Change `C2` status from `[ ] Open` to `[x] Fixed`.

---

## Task 2: H1 — Add Rate Limiting to All AI Endpoints

**Files:**
- Modify: `app/api/generate-caption/route.ts`
- Modify: `app/api/boost-caption/route.ts`
- Modify: `app/api/analyze-caption/route.ts`
- Modify: `app/api/generate-caption-vision/route.ts`
- Modify: `app/api/generate-hooks/route.ts`

**Context:** `shared/lib/rate-limiter.ts` already exports `checkRateLimit(identifier, limiter)`. None of the AI endpoints call it. Add it immediately after auth verification, before any AI call.

- [ ] **Step 1: Add rate limiting to `generate-caption/route.ts`**

After the `if (!user)` block (around line 33), insert:

```typescript
import { checkRateLimit } from '@/shared/lib/rate-limiter';

// Inside POST handler, after user auth check:
const rateLimit = await checkRateLimit(user.id, 'captionGeneration');
if (!rateLimit.success) {
  return NextResponse.json(
    { error: 'Too many requests. Please wait before generating more captions.' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rateLimit.reset - Date.now()) / 1000)) },
    }
  );
}
```

- [ ] **Step 2: Add rate limiting to `boost-caption/route.ts`**

Same pattern — add after `if (!user)` block:

```typescript
import { checkRateLimit } from '@/shared/lib/rate-limiter';

const rateLimit = await checkRateLimit(user.id, 'api');
if (!rateLimit.success) {
  return NextResponse.json(
    { error: 'Too many requests. Please wait a moment.' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rateLimit.reset - Date.now()) / 1000)) },
    }
  );
}
```

- [ ] **Step 3: Add rate limiting to `analyze-caption/route.ts`**

Same pattern after `if (!user)` block:

```typescript
import { checkRateLimit } from '@/shared/lib/rate-limiter';

const rateLimit = await checkRateLimit(user.id, 'api');
if (!rateLimit.success) {
  return NextResponse.json(
    { error: 'Too many requests. Please wait a moment.' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rateLimit.reset - Date.now()) / 1000)) },
    }
  );
}
```

- [ ] **Step 4: Add rate limiting to `generate-caption-vision/route.ts`**

Same pattern after `if (!user)` block:

```typescript
import { checkRateLimit } from '@/shared/lib/rate-limiter';

const rateLimit = await checkRateLimit(user.id, 'captionGeneration');
if (!rateLimit.success) {
  return NextResponse.json(
    { error: 'Too many requests. Please wait before generating more captions.' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rateLimit.reset - Date.now()) / 1000)) },
    }
  );
}
```

- [ ] **Step 5: Add rate limiting to `generate-hooks/route.ts`**

Same pattern after `if (!user)` block:

```typescript
import { checkRateLimit } from '@/shared/lib/rate-limiter';

const rateLimit = await checkRateLimit(user.id, 'api');
if (!rateLimit.success) {
  return NextResponse.json(
    { error: 'Too many requests. Please wait a moment.' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rateLimit.reset - Date.now()) / 1000)) },
    }
  );
}
```

- [ ] **Step 6: Verify build passes**
```bash
npm run type-check
```
Expected: no errors

- [ ] **Step 7: Update SECURITY.md**
Change `H1` status to `[x] Fixed`.

---

## Task 3: H3 — Add Admin Check to `/api/beta` GET

**Files:**
- Modify: `app/api/beta/route.ts`

**Context:** The GET handler only checks `if (!user)`. Any authenticated user can read all beta signup emails. Need to query the `users` table for an `is_admin` flag.

**Prerequisite SQL (run in Supabase if column doesn't exist):**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;
-- Set yourself as admin:
UPDATE users SET is_admin = true WHERE email = 'your@email.com';
```

- [ ] **Step 1: Replace the GET handler in `app/api/beta/route.ts`**

Replace the existing `GET` function with:

```typescript
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!userData?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: signups, error } = await supabase
      .from('beta_signups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, signups: signups || [] });
  } catch (error) {
    console.error('Get beta signups error:', error);
    return NextResponse.json({ error: 'Failed to fetch beta signups' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify build**
```bash
npm run type-check
```
Expected: no errors

- [ ] **Step 3: Update SECURITY.md**
Change `H3` status to `[x] Fixed`.

---

## Task 4: M4 — Stop Leaking DB Error Details to Client

**Files:**
- Modify: `app/api/schedule-post/route.ts`

**Context:** Line 80 returns `${updateError.message || updateError.details || 'Unknown DB error'}` directly to the client. This can expose table names, column names, and constraint details.

- [ ] **Step 1: Find the leaking error line**

In `app/api/schedule-post/route.ts`, find:
```typescript
{ error: `Failed to schedule: ${updateError.message || updateError.details || 'Unknown DB error'}` },
```

- [ ] **Step 2: Replace with generic message**

Change to:
```typescript
console.error('Schedule post DB error:', updateError);
// return generic message:
{ error: 'Failed to schedule post. Please try again.' },
```

Full replacement:
```typescript
if (updateError) {
    console.error('Schedule post DB error:', updateError);
    return NextResponse.json(
        { error: 'Failed to schedule post. Please try again.' },
        { status: 500 }
    );
}
```

- [ ] **Step 3: Update SECURITY.md**
Change `M4` status to `[x] Fixed`.

---

## Task 5: M5 — Add Input Max-Length to AI Prompt Inputs

**Files:**
- Modify: `app/api/analyze-caption/route.ts`
- Modify: `app/api/boost-caption/route.ts`
- Modify: `app/api/generate-hooks/route.ts`

**Context:** Zod schemas only validate `min(5)` on caption strings. No upper bound means users can send 100KB strings into OpenAI prompts.

- [ ] **Step 1: Update `analyze-caption/route.ts` schema**

Find:
```typescript
const requestSchema = z.object({
    caption: z.string().min(5),
```
Replace with:
```typescript
const requestSchema = z.object({
    caption: z.string().min(5).max(5000),
```

- [ ] **Step 2: Update `boost-caption/route.ts` schema**

Find:
```typescript
const requestSchema = z.object({
    caption: z.string().min(5),
```
Replace with:
```typescript
const requestSchema = z.object({
    caption: z.string().min(5).max(5000),
```

- [ ] **Step 3: Update `generate-hooks/route.ts` schema**

Find the caption/content field in the schema and add `.max(5000)`.

- [ ] **Step 4: Update SECURITY.md**
Change `M5` status to `[x] Fixed`.

---

## Task 6: H2 — Fix PKCE for Twitter OAuth

**Files:**
- Modify: `app/api/auth/social/[platform]/route.ts`
- Modify: `app/api/auth/social/[platform]/callback/route.ts`

**Context:** Twitter OAuth currently uses `code_challenge: 'challenge'` (hardcoded). Fix: generate a random verifier per request, store it in a short-lived cookie, use SHA-256 challenge method.

- [ ] **Step 1: Update the OAuth init route to generate PKCE**

In `app/api/auth/social/[platform]/route.ts`, find:
```typescript
if (platform === 'twitter') {
    authParams.set('code_challenge', 'challenge');
    authParams.set('code_challenge_method', 'plain');
}
```

Replace with:
```typescript
let twitterCodeVerifier: string | undefined;
if (platform === 'twitter') {
    twitterCodeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
        .createHash('sha256')
        .update(twitterCodeVerifier)
        .digest('base64url');
    authParams.set('code_challenge', codeChallenge);
    authParams.set('code_challenge_method', 'S256');
}
```

Then, before returning the redirect response, set the verifier in a cookie:
```typescript
if (twitterCodeVerifier) {
    redirectResponse.cookies.set('twitter_pkce_verifier', twitterCodeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600, // 10 minutes
        path: '/api/auth/social/twitter/callback',
    });
}
```

- [ ] **Step 2: Update the callback to read the verifier from cookie**

In `app/api/auth/social/[platform]/callback/route.ts`, find where Twitter token exchange happens. Add cookie import at top:
```typescript
import { cookies } from 'next/headers';
```

In the token exchange section for Twitter, read and pass the verifier:
```typescript
if (platform === 'twitter') {
    const cookieStore = await cookies();
    const verifier = cookieStore.get('twitter_pkce_verifier')?.value;
    if (!verifier) {
        return NextResponse.redirect(new URL('/settings?social_error=pkce_missing', request.url));
    }
    tokenBody.set('code_verifier', verifier);
    // Clear the cookie after use
    // (handled by setting maxAge=0 on the response cookie)
}
```

After successful token exchange, clear the PKCE cookie on the response:
```typescript
const finalResponse = NextResponse.redirect(successUrl);
if (platform === 'twitter') {
    finalResponse.cookies.set('twitter_pkce_verifier', '', { maxAge: 0, path: '/api/auth/social/twitter/callback' });
}
return finalResponse;
```

- [ ] **Step 3: Verify build**
```bash
npm run type-check
```
Expected: no errors

- [ ] **Step 4: Update SECURITY.md**
Change `H2` status to `[x] Fixed`.

---

## Task 7: H4 — Remove Synchronous DNA Extraction from OAuth Callback

**Files:**
- Modify: `app/api/auth/social/[platform]/callback/route.ts`

**Context:** After fetching the platform profile (which already includes `recentCaptions`), an OpenAI call fires inline to analyze the captions into structured DNA. This adds cost and latency to a user-facing redirect. Fix: store raw captions only; remove the OpenAI call from this path.

- [ ] **Step 1: Find the OpenAI DNA extraction block**

Search for the `openai.chat.completions.create` call inside the callback route. It will be in a block that looks like:
```typescript
if (recentCaptions.length > 0) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const aiResponse = await openai.chat.completions.create({ ... });
    // ... parses response into profile_dna
}
```

- [ ] **Step 2: Remove the OpenAI call, store raw captions only**

Replace the entire `if (recentCaptions.length > 0) { const openai = ...}` block with:
```typescript
// Raw captions stored for user-initiated DNA sync (see /api/social-connections/analyze)
const profile_dna = recentCaptions.length > 0
    ? { source_captions: recentCaptions, analyzed: false }
    : null;
```

- [ ] **Step 3: Remove the OpenAI import if it's now unused in this file**

Check if `import OpenAI from 'openai'` is still used elsewhere in the callback file. If not, remove it.

- [ ] **Step 4: Verify build**
```bash
npm run type-check
```
Expected: no errors

- [ ] **Step 5: Update SECURITY.md**
Change `H4` status to `[x] Fixed`.

---

## Task 8: M3 — Fix Cron Secret Comparison

**Files:**
- Modify: `app/api/cron/publish/route.ts`

**Context:** `authHeader !== \`Bearer ${process.env.CRON_SECRET}\`` leaks timing info and silently passes when `CRON_SECRET` is undefined (making `Bearer undefined` a valid token).

- [ ] **Step 1: Replace the auth check**

Find:
```typescript
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
}
```

Replace with:
```typescript
import { timingSafeEqual } from 'crypto';

const cronSecret = process.env.CRON_SECRET;
if (!cronSecret) {
    console.error('CRON_SECRET is not set');
    return new NextResponse('Unauthorized', { status: 401 });
}

const authHeader = request.headers.get('authorization') ?? '';
const expected = `Bearer ${cronSecret}`;

let authorized = false;
try {
    authorized = timingSafeEqual(
        Buffer.from(authHeader),
        Buffer.from(expected)
    );
} catch {
    authorized = false;
}

if (!authorized) {
    return new NextResponse('Unauthorized', { status: 401 });
}
```

Note: `timingSafeEqual` throws if buffers are different lengths, so wrap in try/catch (not authorized if they differ in length).

- [ ] **Step 2: Verify build**
```bash
npm run type-check
```
Expected: no errors

- [ ] **Step 3: Update SECURITY.md**
Change `M3` status to `[x] Fixed`.

---

## Task 9: M6 — Parallelize LinkedIn Org Fetch

**Files:**
- Modify: `app/api/auth/social/[platform]/callback/route.ts`

**Context:** The LinkedIn section loops `for (const urn of orgUrns)` with sequential `await fetch()`. Replace with `Promise.all`.

- [ ] **Step 1: Find the sequential loop**

In the `fetchPlatformProfile` function, find:
```typescript
const orgsList = [];
for (const urn of orgUrns) {
    const id = urn.split(':').pop();
    const detailsRes = await fetch(`https://api.linkedin.com/v2/organizations/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const detailsData = await detailsRes.json();
    if (detailsData.localizedName || detailsData.vanityName) {
        orgsList.push({
            id: urn,
            name: detailsData.localizedName || detailsData.vanityName || 'LinkedIn Page'
        });
    }
}
organizations = orgsList;
```

- [ ] **Step 2: Replace with parallel fetch**

```typescript
const orgDetails = await Promise.all(
    orgUrns.map(async (urn: string) => {
        const id = urn.split(':').pop();
        try {
            const detailsRes = await fetch(`https://api.linkedin.com/v2/organizations/${id}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const detailsData = await detailsRes.json();
            if (detailsData.localizedName || detailsData.vanityName) {
                return {
                    id: urn,
                    name: detailsData.localizedName || detailsData.vanityName || 'LinkedIn Page',
                };
            }
        } catch {
            // silently skip failed org fetches
        }
        return null;
    })
);
organizations = orgDetails.filter((o): o is { id: string; name: string } => o !== null);
```

- [ ] **Step 3: Update SECURITY.md**
Change `M6` status to `[x] Fixed`.

---

## Task 10: DB Indexes Migration

**Files:**
- Create: `supabase/migrations/20260427_add_performance_indexes.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- Performance indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_captions_user_id
    ON captions(user_id);

CREATE INDEX IF NOT EXISTS idx_captions_scheduled
    ON captions(scheduled_status, scheduled_at)
    WHERE scheduled_status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_social_connections_user_id
    ON social_connections(user_id);

CREATE INDEX IF NOT EXISTS idx_brand_voices_user_id
    ON brand_voices(user_id);
```

- [ ] **Step 2: Run in Supabase SQL Editor**

Copy the SQL and run it in Supabase Dashboard → SQL Editor. Verify each index appears in Table Editor → captions → Indexes.

- [ ] **Step 3: Update SECURITY.md**
Mark the DB Indexes section as `[x] Applied`.

---

## Self-Review Checklist

- [x] C1 (hardcoded secrets) — manual task, documented in SECURITY.md, not codeable here
- [x] C2 covered in Task 1
- [x] H1 covered in Task 2
- [x] H2 covered in Task 6
- [x] H3 covered in Task 3
- [x] H4 covered in Task 7
- [x] M3 covered in Task 8
- [x] M4 covered in Task 4
- [x] M5 covered in Task 5
- [x] M6 covered in Task 9
- [x] DB indexes covered in Task 10
- [ ] M1 (server-side state), M2 (encrypted tokens), M7 (idempotent cron), L1, L2 — deferred to next sprint (higher complexity, lower immediate risk)
