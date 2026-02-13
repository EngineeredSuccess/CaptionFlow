# CaptionFlow

AI Social Media Caption Generator - An affordable alternative to EasyGen

## Quick Start

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your API keys
3. Run `npm install`
4. Run `npm run dev`

## Environment Variables

| Key | Description | Required |
|-----|-------------|----------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | Yes |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anonymous key | Yes |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key | Yes |
| OPENAI_API_KEY | OpenAI API key | Yes |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Stripe publishable key | Yes |
| STRIPE_SECRET_KEY | Stripe secret key | Yes |
| STRIPE_WEBHOOK_SECRET | Stripe webhook secret | Yes |
| STRIPE_PRO_PRICE_ID | Stripe Pro tier price ID | Yes |
| STRIPE_TEAM_PRICE_ID | Stripe Team tier price ID | Yes |
| NEXT_PUBLIC_APP_URL | Application URL | Yes |
| FREE_DAILY_LIMIT | Daily caption limit for free tier | Yes |

## Architecture

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI GPT-4o-mini
- **Payments:** Stripe
- **State Management:** Zustand
- **Validation:** Zod

## Project Structure

```
captionflow/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth group routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   └── pricing/           # Pricing page
├── features/              # Domain features
│   ├── captions/          # Caption generation feature
│   ├── brand-voice/       # Brand voice feature
│   ├── auth/              # Authentication feature
│   └── payments/          # Payments feature
├── shared/                # Cross-cutting concerns
│   ├── components/        # Shared UI components
│   ├── lib/               # Utility functions
│   ├── types/             # Global types
│   └── config/            # Configuration
├── components/ui/         # shadcn/ui components
└── docs/                  # Documentation
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🚀 Deployment

### Deploy to Vercel (Recommended)

**GitHub Repository**: https://github.com/EngineeredSuccess/CaptionFlow

**One-Click Deploy**:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/EngineeredSuccess/CaptionFlow)

**Manual Deployment**:
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

### Domain Configuration

Your site is configured for: **https://captionflow.xyz**

1. Deploy to Vercel
2. Add custom domain in Vercel Dashboard: `captionflow.xyz`
3. In Squarespace DNS, add CNAME:
   - Host: `cf`
   - Points to: `cname.vercel-dns.com`

### Stripe Webhook Setup

**Webhook URL**: `https://captionflow.xyz/api/stripe-webhook`

Events to listen for:
- `checkout.session.completed`
- `customer.subscription.deleted`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup instructions.

## License

MIT
