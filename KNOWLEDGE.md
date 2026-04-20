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
│   ├── generate-caption/  # Core AI generation
│   └── ...
├── pricing/         # Pricing page (public)
└── page.tsx         # Landing page

features/           # Domain-specific logic
├── captions/       # Caption generator components
├── brand-voice/    # Brand voice training
├── auth/           # Auth components
├── payments/       # Payment components & hooks
└── scheduling/     # Post scheduling

shared/             # Cross-cutting utilities
├── lib/            # Supabase clients, email service, rate limiter
├── types/          # Global TypeScript types
├── config/         # App configuration
└── components/     # Shared UI components
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
