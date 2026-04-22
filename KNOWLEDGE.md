# CaptionFlow — Developer Knowledge Base

> Quick reference for common developer tasks.

## 🚀 Getting Started
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run lint (errors only)
npm run lint -- --quiet

# Type check
npm run type-check

# Format code
npm run format
```

## 🔧 Local Stripe Webhook Testing
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
# Login
stripe login

# Forward events to your local webhook endpoint
stripe listen --forward-to localhost:3000/api/stripe-webhook

# The CLI will output a webhook secret (whsec_...) — use it as STRIPE_WEBHOOK_SECRET in .env.local

# Trigger a test event
stripe trigger checkout.session.completed
```

## 📦 Creating a New Stripe Product
1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Create a product (e.g., "CaptionFlow Pro")
3. Add a recurring price (monthly)
4. Copy the **Price ID** (starts with `price_`, NOT `prod_`)
5. Set it in `.env.local` as `STRIPE_PRO_PRICE_ID` or `STRIPE_TEAM_PRICE_ID`

> ⚠️ **Common mistake**: Using the Product ID (`prod_...`) instead of the Price ID (`price_...`).
> The checkout session `line_items` requires a Price ID.

## 🗄️ Database Migrations
SQL migration files live in `supabase/migrations/`. To apply a new migration:
1. Create a file: `supabase/migrations/YYYYMMDD_description.sql`
2. Run the SQL in Supabase Dashboard → SQL Editor
3. Commit the migration file

### Key RPC functions (defined in `20260420_add_caption_rpc.sql`):
- `reset_daily_caption_count()` — resets all overdue daily counters
- `increment_caption_count(user_uuid UUID)` — atomically increments counter

## 🏗️ Project Architecture
```
app/
├── (auth)/          # Login, register pages
├── (dashboard)/     # Protected pages (generator, brand voice, settings, etc.)
├── (landing)/       # Public pages (waitlist)
├── api/             # Backend API routes
│   ├── stripe-webhook/    # Stripe event handler
│   ├── generate-caption/  # Multi-platform AI generation (JSON)
│   └── schedule-post/     # Scheduling engine handler
├── pricing/         # Pricing page (public)
└── page.tsx         # Landing page

features/           # Domain-specific logic
├── captions/       # Caption generator & Result Cards
├── brand-voice/    # Brand voice training
├── auth/           # Auth components
├── payments/       # Payment components & hooks
├── scheduling/     # Post scheduling calendar logic
├── social/         # Social Media OAuth Handlers

shared/             # Cross-cutting utilities
├── lib/            # Supabase clients, email service, rate limiter
├── types/          # Global TypeScript types
├── config/         # App configuration
├── components/     # Shared UI components
```

## 🔒 Authentication Flow
1. User signs up via Supabase Auth (email/password or Google OAuth)
2. On signup, a row is created in `public.users` with `subscription_tier: 'free'`
3. Supabase RLS policies restrict data access to authenticated users' own rows
4. API routes verify auth via `supabase.auth.getUser()`

## 💳 Payment Flow
1. User clicks "Upgrade" → `POST /api/create-checkout-session`
2. Server creates Stripe customer (if new) and checkout session with `userId` + `tier` in metadata
3. User completes payment on Stripe-hosted page
4. Stripe sends `checkout.session.completed` webhook → `/api/stripe-webhook`
5. Webhook updates `users.subscription_tier` and sends upgrade confirmation email

## 📧 Email Templates
All templates are in `shared/lib/email.ts`:
- `sendWelcomeEmail(email, name)` — On signup
- `sendBetaInvite(email, inviteCode)` — Beta access
- `sendUpgradeConfirmation(email, tier)` — After subscription upgrade
- `sendPasswordReset(email, resetUrl)` — Password reset

---

## Social Media Integration (TikTok V2 / Instagram)

### TikTok Login Kit (V2)
The integration uses the TikTok V2 API, which has several strict requirements:
1. **Parameter Names**: Use `client_key` instead of `client_id` in the authorization URL.
2. **Scope Formatting**: Scopes MUST be comma-separated (e.g., `user.info.basic,video.publish`), not space-separated.
3. **Redirect URI**: Must match the Developer Portal exactly, INCLUDING a trailing slash (e.g., `.../callback/`).
4. **Sandbox Errors**: 
   - `non_sandbox_target`: Means the user is not an approved Sandbox User for the app.
   - `param_error`: Often means `client_key` or `redirect_uri` mismatch.
5. **Caching**: Next.js redirects and browser cache can interfere with OAuth updates. Use `Cache-Control: no-store` on OAuth routes.

### Instagram Graph API
1. **Business Account Required**: The user MUST have an Instagram Professional/Business account linked to a Facebook Page.
2. **Diagnostics**: The callback route passes a `msg` parameter to `/settings` if Supabase fails (e.g., RLS, constraints), which is then displayed in the UI.
3. **Database**: Managed in the `social_connections` table with RLS enabled for user security.

### LinkedIn OAuth 2.0 (OpenID Connect)
1. **Scopes**: Use `openid`, `profile`, and `w_member_social` for sign-in and personal feed posting.
2. **Products**: MUST add "Sign In with LinkedIn using OpenID Connect" and "Share on LinkedIn" in the Developer Portal.
3. **Redirect URI**: Exact path match required (e.g., `https://captionflow.xyz/api/auth/social/linkedin/callback`).

### X (Twitter) OAuth 2.0 (PKCE)
1. **Flow**: Requires PKCE (`code_challenge` and `code_verifier`). Current implementation uses `plain` method for compatibility.
2. **Permissions**: App MUST be set to **"Read and Write and Offline access"** in User Authentication settings.
3. **App Type**: Choose **"Web App, Native App"**.
4. **Free Tier**: Limited to 50 tweets/month. Basic tier is needed for professional production.

---

## 🤖 Multi-Platform Generation Engine

### AI Processing
- **Model**: Primary core uses **GPT-4o** (upgraded from gpt-4o-mini for viral score accuracy).
- **Output Format**: Uses OpenAI's `json_object` response format.
- **Logic**: One prompt generates multiple optimized captions simultaneously for all selected platforms.
- **Mapping**: The backend parses the JSON and saves EACH platform output as a unique row in the `captions` table.
- **Pricing Metering**: A multi-platform generation action (e.g., 3 platforms at once) increments `daily_caption_count` by only **1 point** per generating click.

### UI Architecture
- Component: `CaptionResultCard.tsx`
- Each generated platform receives its own independent card.
- Viral Scores, Hook Refinements, and Scheduling events are isolated per card.

---

## 📅 Scheduling Engine

### Schema
Required columns in `captions` table (applied via `20260212_scheduling_engine.sql`):
- `scheduled_at`: TIMESTAMP (UTC)
- `scheduled_status`: enum (NULL, 'pending', 'published', 'failed')
- `publish_platforms`: text[] (array of platforms for cross-posting)

### API Route: `/api/schedule-post`
- Updates `scheduled_at` and sets `scheduled_status = 'pending'`.
- Returns verbose DB error messages if migration is missing or RLS violation occurs.

### Multi-Platform Cross-posting
While results are generated independently per platform card, the scheduling engine supports `publish_platforms` as an array. Current UX focuses on 1-to-1 scheduling (one card -> one scheduled post), but the DB is ready for cross-platform expansion.
