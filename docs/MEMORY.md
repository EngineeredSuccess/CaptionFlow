# CaptionFlow — Project Memory

> This file captures the key architectural decisions, integration details, and known issues 
> for the CaptionFlow project. Keep it updated as the project evolves.

## Tech Stack
| Layer         | Technology       | Notes |
|---------------|------------------|-------|
| Framework     | Next.js 16 (App Router) | Deployed on Vercel |
| Styling       | Tailwind CSS 4   | with shadcn/ui components |
| Database      | Supabase (PostgreSQL) | RLS enabled, service role for webhooks |
| AI            | OpenAI GPT-4o-mini | Text + Vision caption generation |
| Payments      | Stripe (v20)     | Subscriptions via Checkout Sessions |
| Email         | Resend           | Transactional emails (welcome, upgrade) |
| State         | Zustand          | Client-side state management |
| Validation    | Zod v4           | API request validation |
| Rate Limiting | Upstash Redis    | Optional, for API rate limiting |

## Domain & Deployment
- **Production**: `https://captionflow.xyz` (Vercel, branch: `main`)
- **Staging**: `https://cf.pawelrzepecki.com` (Vercel, branch: `develop`)
- **GitHub**: `https://github.com/EngineeredSuccess/CaptionFlow`

## Stripe Integration
### Products & Pricing
| Tier | Product ID | Price ID | Notes |
|------|-----------|----------|-------|
| Free | — | — | 10 captions/day, no payment required |
| Pro  | `prod_TxaRqBYAltgu9r` | **⚠️ NEEDS PRICE ID** | Unlimited captions, brand voice |
| Team | `prod_TxaSaeRUCDMhrR` | **⚠️ NEEDS PRICE ID** | Unlimited + team features |

### Webhook
- **Endpoint**: `/api/stripe-webhook` (POST)
- **Webhook URL**: `https://captionflow.xyz/api/stripe-webhook`
- **Events**: `checkout.session.completed`, `customer.subscription.deleted`
- **Flow**: Checkout passes `userId` and `tier` via `session.metadata` → webhook updates `users` table
- **Secret**: `STRIPE_WEBHOOK_SECRET` env var

### ⚠️ Known Issues (as of 2026-04-20)
1. **`STRIPE_PRO_PRICE_ID` / `STRIPE_TEAM_PRICE_ID`** in `.env.local` are set to **product IDs** (`prod_...`), not **price IDs** (`price_...`). The checkout session creation uses these as `price` in `line_items`, which requires a `price_xxx` ID. **This will cause Stripe checkout to fail.**
2. **`WEBHOOK_END_URL`** in `.env.local` is set to `https://cf.pawelrzepecki.com/stripe/checkout/webhook` which doesn't match the actual route at `/api/stripe-webhook`. This env var doesn't appear to be used in code but is misleading.

## Database Schema (key tables)
| Table | Purpose | RLS |
|-------|---------|-----|
| `users` | User profiles, subscription status, daily limits | ✅ |
| `brand_voices` | Brand voice examples (up to 5 per user) | ✅ |
| `captions` | Generated captions with hashtags, platform, tone | ✅ |
| `social_connections` | OAuth tokens for connected social platforms | ✅ |
| `waitlist` | Beta waitlist signups | ✅ |

### RPC Functions
| Function | Purpose |
|----------|---------|
| `reset_daily_caption_count()` | Resets all users' daily counts (called on date change) |
| `increment_caption_count(user_uuid)` | Atomically increments a user's daily count |
| `check_and_reset_daily_count()` | Trigger function on users table update |

## API Routes
| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/generate-caption` | POST | Text-based caption generation | ✅ |
| `/api/generate-caption-vision` | POST | Image-based caption generation | ✅ |
| `/api/analyze-caption` | POST | Caption quality scoring | ✅ |
| `/api/boost-caption` | POST | AI-powered caption improvement | ✅ |
| `/api/generate-hooks` | POST | Generate viral hook alternatives | ✅ |
| `/api/brand-voices` | GET/POST/PUT/DELETE | Brand voice CRUD | ✅ |
| `/api/captions` | GET | Fetch user's caption history | ✅ |
| `/api/schedule-post` | GET/POST | Schedule captions for publishing | ✅ |
| `/api/create-checkout-session` | POST | Stripe checkout session | ✅ |
| `/api/create-portal-session` | POST | Stripe billing portal | ✅ |
| `/api/stripe-webhook` | POST | Stripe webhook handler | Signature |
| `/api/waitlist` | POST | Waitlist signup | ❌ |
| `/api/analytics/*` | Various | Usage analytics | ✅ |
| `/api/social-connections` | Various | Social OAuth management | ✅ |

## Key Patterns
- **Authentication**: Supabase Auth via `createClient()` → `supabase.auth.getUser()`
- **Webhook Auth**: Stripe signature verification, service-role Supabase client
- **Daily Limits**: Free tier = 10/day, enforced via `daily_caption_count` + DB trigger
- **Brand Voice**: Users provide 5 example captions → injected into OpenAI system prompt
- **Email**: `emailService` singleton in `shared/lib/email.ts` using Resend
