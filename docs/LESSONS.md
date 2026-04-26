# CaptionFlow - Development Lessons Learned

## Table of Contents
1. [Authentication & OAuth Issues](#authentication--oauth-issues)
2. [Deployment & Environment Issues](#deployment--environment-issues)
3. [Database Issues](#database-issues)
4. [Build & TypeScript Issues](#build--typescript-issues)
5. [Stripe Integration Issues](#stripe-integration-issues)
6. [Best Practices Established](#best-practices-established)

---

## Authentication & OAuth Issues

### Issue 1: Google OAuth - "User Not Found" Error
**Problem**: Users signing up with Google couldn't create captions because their user record wasn't being created in the database.

**Root Cause**: The OAuth callback handler was trying to insert user data using the anon key (browser client), which was blocked by Row Level Security (RLS) policies.

**Error Message**: 
```
User not found
```

**Solution**: 
1. Created a separate service role client for database operations
2. Server-side callback handler uses service role client to bypass RLS
3. File: `shared/lib/supabase/service-role.ts`

```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
```

**Key Learning**: Always use service role key for server-side database operations that need to bypass RLS.

---

### Issue 2: OAuth Code Exchange Not Setting Session Cookies
**Problem**: After Google OAuth, users were redirected back to login page instead of being authenticated.

**Root Cause**: Using service role client to exchange OAuth code doesn't set session cookies in the browser.

**Solution**: 
1. Use regular server client (`createServerClient`) to exchange code - sets cookies
2. Use service role client only for database operations

**Before (Broken)**:
```typescript
const supabase = createServiceRoleClient(); // ❌ No cookie support
const { data: { user } } = await supabase.auth.exchangeCodeForSession(code);
```

**After (Fixed)**:
```typescript
const supabase = await createClient(); // ✅ Sets cookies
const { data: { user } } = await supabase.auth.exchangeCodeForSession(code);

// Use service role only for DB
const serviceRoleClient = createServiceRoleClient();
await serviceRoleClient.from('users').insert({...})
```

**Key Learning**: OAuth code exchange must use the cookie-aware server client, not service role.

---

### Issue 3: OAuth Callback Redirect Loop
**Problem**: Google OAuth would redirect to login page repeatedly instead of completing authentication.

**Root Cause**: 
- Callback URL mismatch between Supabase and Google Cloud Console
- Missing `/api/auth/callback` route handling

**Solution**:
1. Ensure Google Cloud Console redirect URI matches Supabase exactly:
   - `https://[project-ref].supabase.co/auth/v1/callback`
2. Create proper callback route that handles both auth and user creation

**File**: `app/api/auth/callback/route.ts`

**Key Learning**: OAuth redirect URIs must match exactly - including protocol and trailing slashes.

---

## Deployment & Environment Issues

### Issue 4: Vercel Environment Variable Errors
**Problem**: Deployment failed with error:
```
Environment Variable "NEXT_PUBLIC_SUPABASE_URL" references Secret "next_public_supabase_url", which does not exist.
```

**Root Cause**: `vercel.json` was trying to reference Vercel Secrets that didn't exist using the `@` syntax.

**Before (Broken)**:
```json
{
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@next_public_supabase_url"
  }
}
```

**After (Fixed)**:
```json
{
  "version": 2,
  "name": "captionflow"
  // No env section - add via Dashboard instead
}
```

**Solution**: 
1. Remove environment variables from `vercel.json`
2. Add them manually in Vercel Dashboard:
   - Project Settings → Environment Variables
   - Add each variable with name and value
   - Select all environments (Production, Preview, Development)

**Key Learning**: Vercel environment variables should be configured in Dashboard, not vercel.json for better security.

---

### Issue 5: GitHub Secret Scanning Blocking Pushes
**Problem**: GitHub rejected pushes with error:
```
GH013: Repository rule violations found - Push cannot contain secrets
```

**Root Cause**: Commits contained API keys in documentation files (DEPLOYMENT.md).

**Solution**:
1. Remove secrets from all documentation
2. Use placeholders instead:
   ```
   # Bad
   OPENAI_API_KEY=sk-abc123...
   
   # Good
   OPENAI_API_KEY=your_openai_key_here
   ```

3. Use `git commit --amend` to fix commits before pushing

**Key Learning**: Never commit real API keys, even in documentation. Use placeholders.

---

### Issue 6: Domain Configuration Confusion
**Problem**: Unclear how to deploy to subdomain while main site is on Squarespace.

**Setup**:
- Main site: pawelrzepecki.com (Squarespace)
- App: captionflow.xyz (Vercel)

**Solution**:
1. Deploy to Vercel
2. In Vercel Dashboard: Settings → Domains → Add `captionflow.xyz`
3. In Squarespace DNS: Add CNAME record
   - Host: `cf`
   - Points to: `cname.vercel-dns.com`

**Key Learning**: Subdomain deployment requires DNS configuration at the main domain provider.

---

## Database Issues

### Issue 7: Tables Not Created Before Testing
**Problem**: App deployed but users couldn't create captions because database tables didn't exist.

**Error**: 
```
relation "users" does not exist
```

**Root Cause**: SQL schema files existed but weren't executed in Supabase.

**Solution**:
1. Run SQL schema in Supabase SQL Editor:
   - Navigate to: SQL Editor → New Query
   - Copy contents of `docs/database-schema.sql`
   - Execute

2. Required tables:
   - `users` - User data and subscriptions
   - `brand_voices` - Brand voice training examples
   - `captions` - Generated captions
   - `analytics_events` - Usage tracking

**Key Learning**: Database schema must be manually executed in Supabase before app deployment.

---

### Issue 8: RLS Policies Blocking Legitimate Operations
**Problem**: Server-side operations failing due to RLS policies.

**Error**:
```
new row violates row-level security policy for table "users"
```

**Root Cause**: RLS policies were enabled but the server was using anon key instead of service role.

**Solution**: 
1. Use service role client for server-side database operations
2. Keep RLS enabled for security
3. Policies remain in place but service role bypasses them

**Key Learning**: RLS is good for security but service role key is needed for server operations.

---

## Build & TypeScript Issues

### Issue 9: Zod Error Type Changes
**Problem**: Build failed with TypeScript error:
```
Property 'errors' does not exist on type 'ZodError'
```

**Root Cause**: Zod v3.22+ changed `error.errors` to `error.issues`.

**Before (Broken)**:
```typescript
if (error instanceof z.ZodError) {
  return { error: 'Invalid data', details: error.errors }
}
```

**After (Fixed)**:
```typescript
if (error instanceof z.ZodError) {
  return { error: 'Invalid data', details: error.issues }
}
```

**Key Learning**: Always check library changelog for breaking changes in type definitions.

---

### Issue 10: Supabase Cookies Async/Await
**Problem**: TypeScript error:
```
Property 'getAll' does not exist on type 'Promise<ReadonlyRequestCookies>'
```

**Root Cause**: Next.js 15+ requires awaiting the cookies() function.

**Before (Broken)**:
```typescript
const cookieStore = cookies() // ❌ Not awaited
return cookieStore.getAll()
```

**After (Fixed)**:
```typescript
const cookieStore = await cookies() // ✅ Awaited
return cookieStore.getAll()
```

**Key Learning**: Next.js 15 made cookies() async - always await it.

---

### Issue 11: Missing Suspense Boundary for useSearchParams
**Problem**: Build error:
```
useSearchParams() should be wrapped in a suspense boundary
```

**Solution**: Wrap component using `useSearchParams` in Suspense:

```typescript
import { Suspense } from 'react'

export default function PricingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PricingContent />
    </Suspense>
  )
}
```

**Key Learning**: Client-side hooks that read URL parameters need Suspense boundaries in Next.js 14+.

---

## Stripe Integration Issues

### Issue 12: Stripe Invoice Type Changes
**Problem**: Build error with Stripe types:
```
Property 'subscription' does not exist on type 'Invoice'
```

**Root Cause**: Stripe SDK v16+ changed invoice property names.

**Solution**: Updated webhook handler to use new property structure.

**Key Learning**: Stripe SDK updates frequently - check their migration guides.

---

### Issue 13: Webhook Secret Configuration
**Problem**: Webhook endpoints returning 400 errors.

**Root Cause**: `STRIPE_WEBHOOK_SECRET` environment variable not set correctly.

**Solution**:
1. Get webhook secret from Stripe Dashboard:
   - Developers → Webhooks → [Your endpoint] → Signing secret
2. Add to Vercel environment variables
3. Format: `whsec_...`

**Key Learning**: Each webhook endpoint has its own unique signing secret.

---

## Best Practices Established

### 1. Environment Variable Management
- Keep `.env.local` for development
- Never commit real secrets to git
- Use Vercel Dashboard for production env vars
- Document all required variables in `.env.example`

### 2. Authentication Flow
- Use server client for auth operations (cookies)
- Use service role client for database operations (RLS bypass)
- Always verify user exists in DB before protected operations
- Log auth events for debugging

### 3. Database Operations
- Enable RLS on all tables
- Create policies for user data isolation
- Use service role for server-side inserts
- Test schema before deployment

### 4. Error Handling
- Always catch and log errors
- Return user-friendly error messages
- Use TypeScript for type safety
- Validate inputs with Zod

### 5. Deployment Checklist
- [ ] Database schema deployed
- [ ] Environment variables configured
- [ ] Webhook endpoints configured (Stripe)
- [ ] OAuth redirect URIs set (Google)
- [ ] Domain DNS records added
- [ ] Build passes locally
- [ ] Git commit clean (no secrets)

---

## Quick Reference: Common Fixes

### Fix RLS Blocking
```typescript
// Use service role client
import { createServiceRoleClient } from '@/shared/lib/supabase/service-role'
const supabase = createServiceRoleClient()
```

### Fix OAuth Redirect
```typescript
// Use correct callback URL
redirectTo: `${window.location.origin}/api/auth/callback`
```

### Fix Environment Variables
1. Remove from vercel.json
2. Add via Vercel Dashboard
3. Redeploy

### Fix Database Not Found
1. Go to Supabase SQL Editor
2. Run schema files
3. Verify tables exist

---

## UI/UX Refinement & Brand Positioning
- [UI/UX Refinement & Brand Positioning](#uiux-refinement--brand-positioning)
- [Advanced CI/CD & Staging Infrastructure](#advanced-cicd--staging-infrastructure)

---

## UI/UX Refinement & Brand Positioning

### Issue 14: Premium Aesthetic with Tailwind 4
**Insight**: Leveraging OKLCH colors and glassmorphism (backdrop-blur) elevates a boilerplate UI to a premium SaaS aesthetic.
**Best Practice**: Use `backdrop-blur-sm` with semi-transparent white borders (`border-white/20`) for a polished Apple-like feel.

### Issue 15: Brand Pivot Strategy
**Lesson**: Competing on price (e.g., "75% cheaper") is a race to the bottom. Competing on value/authenticity (e.g., "Captions that sound like you") builds a stronger brand identity.
**Implementation**: Shift headers from price-focused to outcome-focused.

---

## Advanced CI/CD & Staging Infrastructure

### Issue 16: Database Isolation
**Problem**: Testing new migrations or deleting test data on a production database is risky.
**Solution**: Use a separate Supabase project for Staging.
**Key Learning**: For new Supabase projects, use the **Transaction Pooler** (IPv4) connection string instead of the direct one (IPv6) to avoid connection timeouts in many CI environments.

### Issue 17: Supabase API Key Evolution
**Change**: Supabase has transitioned from "anon/service_role" terminology to "Publishable/Secret".
**Alignment**: Standardize your environment variables to match:
  - `NEXT_PUBLIC_SUPABASE_KEY` (Publishable)
  - `SUPABASE_SERVICE_ROLE_KEY` (Secret)

### Issue 18: Manual Approval Gates
**Security**: Add a `Required Reviewer` to the production environment in GitHub Actions.
**Benefit**: Prevents accidental deployments to `main` from going live before a final check on the staging preview.

### Issue 19: Vercel Hobby Cron Limitations
**Problem**: Deployment fails with "Hobby accounts are limited to daily cron jobs" when using a 5-minute schedule in `vercel.json`.
**Solution**: Remove the `crons` section from `vercel.json` and use an external provider (like Cron-job.org) to ping the `/api/cron/publish` endpoint.
**Key Learning**: Vercel Hobby is highly restrictive for scheduled tasks; external triggers are the best free workaround.

### Issue 20: Missing SELECT Fields vs TypeScript
**Problem**: Build error: "Property 'id' does not exist on type...".
**Root Cause**: Adding a new field to a Supabase `.select()` often leads to accidentally deleting essential fields like `id`.
**Solution**: Always double-check that all fields used in the function logic (especially IDs used for updates) are included in the string-literal select.
**Key Learning**: Run `npx tsc --noEmit` locally before every push to catch these "silent" logic regressions.

### Issue 21: JSX Structural Errors (Unterminated regexp)
**Problem**: Turbopack build failure: "Unterminated regexp literal".
**Root Cause**: Unbalanced `<div>` tags or missing colons in ternary operators `() ? () : ()` cause the parser to lose track of the JSX context.
**Solution**: Use an IDE with auto-formatting or carefully verify indentation when adding complex nested logic (like the Media URL input).

### Issue 22: Time Granularity & Browser Inconsistency
**Problem**: Native `<input type="time" step="300" />` doesn't strictly prevent users from typing "13:12" in some browsers.
**Solution**: Implement a "Snapping" logic in `onChange` and `onSubmit` that rounds minutes to the nearest 5-minute interval (0, 5, 10, etc.).
**Benefit**: Guarantees alignment with a 5-minute Cron Job execution window.

### Issue 23: Master vs Main Syncing
**Problem**: Pushes to `main` weren't triggering Vercel deployments.
**Root Cause**: Vercel was configured to track the `master` branch (legacy default), while the agent was pushing to `main`.
**Solution**: Synchronize branches using `git merge main` into `master` and push to both to ensure consistency.

---

## AI Pipeline & Feature Scoping

### Issue 24: Model Routing (GPT-4o vs Claude)
**Problem**: Generating human-like captions consistently is difficult; GPT-4 often sounds repetitive and uses AI filler phrases.
**Solution**: Implemented a dual-model architecture.
1. **GPT-4o**: Handles fast, structured generation (JSON) and serves free tier users.
2. **Claude 3.5 Sonnet**: Excels at human-like writing. Exposed as "Human Mode" strictly for Pro users.
**Key Learning**: Mixing models based on their strengths (GPT for structure/analysis, Claude for voice) provides the best user experience while managing API costs effectively.

### Issue 25: Scraping Limits vs User Experience (One-Click Remix)
**Problem**: Trying to scrape Instagram/TikTok URLs to "Remix" content leads to constant API blocks and IP bans from Meta/ByteDance.
**Solution**: Pivoted the feature to a manual copy-paste "Source Content" area.
**Key Learning**: Sometimes a slightly more manual UX (copy-paste) is better than a fragile automation (scraping) that breaks 50% of the time.

### Issue 26: Shadowban Prevention (Banned Word Shield)
**Problem**: Users need protection against engagement bait words that trigger algorithm suppression, but checking in real-time during AI generation is complex.
**Solution**: Implemented a fast post-generation check. If the generated text contains high-risk words (e.g., "link in bio"), a prominent alert is displayed above the result.
**Key Learning**: "Account Insurance" can be framed as a value-add feature. Post-generation validation is much easier to implement and maintain than pre-generation constraints.

### Issue 27: Managing Platform API Constraints (Twitter & TikTok)
**Problem**: Twitter's free API limits posting to 0, and TikTok's API requires a lengthy App Review process. Users clicking "Connect" would hit 403 errors.
**Solution**: Built an elegant "Coming Soon" visual state in the SocialConnections component, replacing the Connect button with a dashed border and an explanation badge.
**Key Learning**: Always manage user expectations visually. An honest "Requires paid API access. Coming soon." builds more trust than a broken button.

---

## Conclusion
The main challenges were:
1. **Understanding Supabase auth vs database clients** - Critical distinction
2. **OAuth flow cookie handling** - Easy to miss
3. **Drafting a scalable CI/CD strategy** - Moving from "push to deploy" to "verify then deploy".
4. **Designing for 'premium'** - Small details like fonts (Outfit) and shadows make a huge difference.
5. **Hobby Tier Resourcefulness** - Using external crons and branch syncing to bypass hosting platform limitations.
6. **AI Architecture** - Hybrid model approaches (GPT + Claude) and smart fallbacks.

Always test on staging before hitting production!
