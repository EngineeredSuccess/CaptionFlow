# CaptionFlow Deployment Guide

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/EngineeredSuccess/CaptionFlow)

## 📋 Prerequisites

1. **Vercel Account**: [Sign up here](https://vercel.com/signup)
2. **GitHub Account**: Repository already created at `https://github.com/EngineeredSuccess/CaptionFlow`
3. **Stripe Account**: For payments
4. **Supabase Project**: Already configured
5. **Resend Account**: For emails

## ⚙️ Environment Variables

Add these environment variables in Vercel Dashboard:

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_KEY` - Your Supabase public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### OpenAI
- `OPENAI_API_KEY` - Your OpenAI API key

### Stripe
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
- `WEBHOOK_END_URL` - https://cf.pawelrzepecki.com/api/stripe-webhook

### Stripe Products
- `STRIPE_PRO_PRICE_ID` - Pro plan price ID
- `STRIPE_TEAM_PRICE_ID` - Team plan price ID
- `STRIPE_FREE_PRICE_ID` - Free plan price ID

### Resend Email
- `RESEND_API_KEY` - Your Resend API key

### Upstash Redis (Optional)
- `UPSTASH_REDIS_REST_URL` - Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` - Redis REST token

### App Config
- `NEXT_PUBLIC_APP_URL` - https://cf.pawelrzepecki.com
- `FREE_DAILY_LIMIT` - 10
- `BETA_ENABLED` - true
- `MAX_BETA_USERS` - 100

## 🔧 Stripe Webhook Configuration

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. **Endpoint URL**: `https://cf.pawelrzepecki.com/api/stripe-webhook`
4. **Events to listen for**:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret and add to environment variables

## 🌐 Domain Configuration

Since your main site is on Squarespace (pawelrzepecki.com), deploy CaptionFlow to a subdomain:

### Subdomain Setup
Deploy CaptionFlow to `cf.pawelrzepecki.com`:

1. In Vercel Dashboard → Project Settings → Domains
2. Add `cf.pawelrzepecki.com`
3. In Squarespace DNS settings, add CNAME record:
   - Type: CNAME
   - Host: cf
   - Points to: cname.vercel-dns.com

## 📊 Database Setup

Run these SQL files in Supabase SQL Editor:

1. **Main Schema**: `docs/database-schema.sql`
2. **Analytics Schema**: `docs/analytics-schema.sql`

## 🚀 Deploy Steps

### Method 1: Vercel Dashboard (Easiest)
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import Git Repository: `EngineeredSuccess/CaptionFlow`
3. Configure Environment Variables
4. Deploy!

### Method 2: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

## 📝 Post-Deployment Checklist

- [ ] Site loads at https://cf.pawelrzepecki.com
- [ ] Sign up works
- [ ] Caption generation works
- [ ] Stripe checkout works
- [ ] Webhooks receiving events
- [ ] Emails sending (welcome, etc.)
- [ ] Database tables created

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Stripe Docs**: https://stripe.com/docs

---

**Repository**: https://github.com/EngineeredSuccess/CaptionFlow
