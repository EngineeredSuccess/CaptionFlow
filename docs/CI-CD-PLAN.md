# CaptionFlow - CI/CD Strategy & Plan

## Executive Summary

**Recommended Approach**: Multi-stage GitHub Actions pipeline with automated testing, staging environment, and zero-downtime production deployment to `cf.pawelrzepecki.com`.

**Why This Approach**: Professional-grade reliability, cost-effective for MVP stage, scales to enterprise needs.

---

## Current Setup Analysis

**Deployment Target**: `cf.pawelrzepecki.com` (subdomain on Squarespace-hosted main domain)
**Platform**: Vercel + Supabase + Stripe
**Repository**: GitHub (EngineeredSuccess/CaptionFlow)

---

## Recommended CI/CD Architecture

### Stage 1: Development Workflow
**Branch**: `feature/*` or `fix/*`

**Triggers**: Push to any branch except main

**Actions**:
```yaml
1. Install dependencies
2. Run TypeScript type checking
3. Run ESLint
4. Run unit tests
5. Build application
6. Deploy to Preview URL
```

**Outcome**: Every PR gets a unique preview URL (e.g., `captionflow-git-feature-xyz.vercel.app`)

---

### Stage 2: Staging Environment Options

You have **two free options** for staging - choose based on your needs:

#### Option A: Vercel Preview Deployments (Recommended for MVP)
**Best for**: Early stage, solo development, quick testing

**How it works**:
- Every Pull Request gets a unique preview URL automatically
- URLs look like: `captionflow-git-feature-xyz.vercel.app`
- No additional domains or DNS setup needed
- Vercel handles everything

**Pros**:
- ✅ Completely free
- ✅ Zero setup required
- ✅ Automatic for every PR
- ✅ Isolated environments per branch

**Cons**:
- Random URLs (not branded)
- URLs change with each deployment
- Harder to share with clients

**Setup**: None! Just use Vercel's built-in feature.

---

#### Option B: Subdomain Under Your Domain (For Scale)
**Best for**: Team development, client demos, professional presentation

**How it works**:
- Create free subdomains under your existing `pawelrzepecki.com`
- Examples: `staging.cf.pawelrzepecki.com` or `dev.cf.pawelrzepecki.com`
- Since you own the domain, subdomains are free!

**Setup**:
1. **In Squarespace DNS** (where you manage pawelrzepecki.com):
   ```
   Type: CNAME
   Host: staging.cf
   Points to: cname.vercel-dns.com
   TTL: 3600
   ```

2. **In Vercel Dashboard**:
   - Project Settings → Domains
   - Add: `staging.cf.pawelrzepecki.com`

3. **Create Staging Supabase Project** (separate database):
   - New project in Supabase
   - Run same schema migrations
   - Use test Stripe keys

**Pros**:
- ✅ Professional branded URL
- ✅ Persistent URL for sharing
- ✅ Separate database for safety
- ✅ Perfect for client demos

**Cons**:
- Requires DNS configuration
- More complex setup
- Overkill for solo MVP

---

### Recommended: Start with Option A (Preview Deployments)

For your current MVP stage, use **Vercel Preview Deployments** (Option A):

**Actions for Stage 2**:
```yaml
1. Run full test suite
2. Build with production optimizations
3. Run integration tests
4. Deploy to Vercel Preview URL (auto-generated)
5. Run smoke tests on preview URL
6. Send Slack/Discord notification with preview link
```

**When to upgrade to Option B**:
- When you have 3+ team members
- When doing client demos regularly
- When you need persistent test data
- When ready to invest 1-2 hours in setup

---

### Stage 3: Production Deployment
**Trigger**: Manual approval or tagged release

**Actions**:
```yaml
1. Verify preview deployment health (or staging if using Option B)
2. Create database backup (Supabase)
3. Deploy to cf.pawelrzepecki.com
4. Run health checks
5. Verify critical paths (login, caption generation)
6. Monitor error rates (5 minutes)
7. If errors > threshold → automatic rollback
8. Send deployment success notification
```

**Rollback Strategy**:
- Vercel provides instant rollback to previous deployment
- Database: Point-in-time recovery (Supabase)
- Stripe: Webhooks handle subscription state

---

### Stage 3: Production Deployment
**Trigger**: Manual approval or tagged release

**Actions**:
```yaml
1. Verify staging deployment health
2. Create database backup (Supabase)
3. Deploy to cf.pawelrzepecki.com
4. Run health checks
5. Verify critical paths (login, caption generation)
6. Monitor error rates (5 minutes)
7. If errors > threshold → automatic rollback
8. Send deployment success notification
```

**Rollback Strategy**:
- Vercel provides instant rollback to previous deployment
- Database: Point-in-time recovery (Supabase)
- Stripe: Webhooks handle subscription state

---

## Implementation Plan

### Phase 1: Basic CI (Week 1)
**Goal**: Automated testing on every push

**Files to Create**:
```
.github/
  workflows/
    ci.yml              # Type checking, linting, building
    preview.yml         # Deploy previews for PRs
```

**GitHub Actions Workflow**:
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          # Add other build-time env vars
```

---

### Phase 2: Staging Environment (Week 2)
**Goal**: Full staging deployment pipeline

**Infrastructure Needed**:
1. **Supabase Staging Project**
   - Create new project in Supabase
   - Run schema migrations
   - Copy minimal seed data

2. **Vercel Staging Environment**
   - Add `staging.captionflow.com` domain
   - Configure staging environment variables
   - Set up preview deployments

3. **Environment Variables Strategy**:
```
Production (cf.pawelrzepecki.com):
  - Supabase: Production project
  - Stripe: Live keys
  - OpenAI: Production
  - Resend: Live

Staging (staging.captionflow.com):
  - Supabase: Staging project
  - Stripe: Test keys
  - OpenAI: Same (rate limited)
  - Resend: Test/Sandbox
```

---

### Phase 3: Production Pipeline (Week 3)
**Goal**: Safe production deployments with monitoring

**Vercel Configuration**:
```json
{
  "version": 2,
  "name": "captionflow",
  "github": {
    "enabled": false
  },
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ]
}
```

**GitHub Environments**:
```
GitHub Settings → Environments:
  
1. Staging
   - Protected: No
   - URL: https://staging.captionflow.com
   
2. Production
   - Protected: Yes
   - Required reviewers: 1 (you)
   - URL: https://cf.pawelrzepecki.com
```

---

## Environment Variables Strategy

### Development (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
# etc
```

### Staging (Vercel)
Configure in Vercel Dashboard:
- Target: Preview + Staging
- Same keys as dev but staging Supabase project

### Production (Vercel)
Configure in Vercel Dashboard:
- Target: Production only
- Production Supabase project
- Live Stripe keys

---

## Testing Strategy

### Unit Tests (Jest/Vitest)
**Files**: `**/*.test.ts`, `**/*.spec.ts`
**Run**: On every push
**Coverage Target**: 70%

```typescript
// Example: features/captions/lib/caption-utils.test.ts
import { generateHashtags } from './caption-utils'

describe('generateHashtags', () => {
  it('should return 10-15 hashtags', () => {
    const result = generateHashtags('coffee morning')
    expect(result.length).toBeGreaterThanOrEqual(10)
    expect(result.length).toBeLessThanOrEqual(15)
  })
})
```

### Integration Tests (Playwright)
**Files**: `e2e/**/*.spec.ts`
**Run**: Before staging deployment
**Scenarios**:
1. User registration flow
2. Google OAuth login
3. Caption generation
4. Stripe checkout
5. Brand voice setup

```typescript
// e2e/caption-generation.spec.ts
import { test, expect } from '@playwright/test'

test('user can generate a caption', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await page.goto('/caption-generator')
  await page.fill('textarea', 'A beautiful sunset')
  await page.click('button:has-text("Generate")')
  
  await expect(page.locator('.caption-result')).toBeVisible()
})
```

### Smoke Tests
**Run**: After every production deployment
**Duration**: 2 minutes
**Checks**:
- Homepage loads (200 status)
- Login page accessible
- API health check endpoint
- Database connection

---

## Monitoring & Alerting

### Error Tracking: Sentry
**Setup**:
```typescript
// app/layout.tsx or instrumentation.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV,
  tracesSampleRate: 1.0,
})
```

**Alerts**:
- Error rate > 1% → Slack notification
- New error type detected → Email alert
- API response time > 2s → Warning

### Analytics: Vercel Analytics + Custom
**Built-in**: Vercel Web Analytics (free tier)
**Custom Events**:
```typescript
// Track key user actions
analytics.track('caption_generated', {
  platform: ['instagram'],
  tone: 'casual',
  userTier: 'free'
})
```

### Uptime Monitoring: UptimeRobot
**Setup**:
- Monitor: https://cf.pawelrzepecki.com
- Check interval: 5 minutes
- Alert via: Email, Slack

---

## Database Migration Strategy

### Schema Changes
**Tool**: Supabase CLI
**Process**:
```bash
# 1. Create migration
supabase migration new add_user_preferences

# 2. Edit migration file
# supabase/migrations/20240210_add_user_preferences.sql

# 3. Test locally
supabase db reset

# 4. Deploy to staging
supabase db push --linked

# 5. Deploy to production (after approval)
supabase db push --linked
```

### Backup Strategy
**Automatic**: Supabase daily backups (7-day retention)
**Manual**: Before major deployments
```bash
# Create backup point
supabase db dump --file backup-$(date +%Y%m%d).sql
```

---

## Deployment Checklist

### Pre-deployment (Staging)
- [ ] All tests passing
- [ ] Manual QA completed
- [ ] Database migrations tested
- [ ] Environment variables verified
- [ ] Stripe webhooks configured for staging

### Production Deployment
- [ ] Database backup created
- [ ] Maintenance mode (optional)
- [ ] Deploy to Vercel
- [ ] Smoke tests pass
- [ ] Monitor error rates (5 min)
- [ ] Notify team via Slack

### Post-deployment
- [ ] Check Vercel logs
- [ ] Verify Supabase connections
- [ ] Test critical user flows
- [ ] Monitor for 24 hours
- [ ] Update deployment log

---

## Rollback Procedures

### Vercel Rollback (Instant)
1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "Promote to Production"
4. Done (30 seconds)

### Database Rollback
1. Supabase Dashboard → Database → Backups
2. Select backup from before deployment
3. Restore (downtime: 2-5 minutes)

### Full Rollback
```bash
# 1. Rollback Vercel
vercel --prod # Deploy previous version

# 2. Rollback database
# Use Supabase UI or CLI

# 3. Verify
npm run test:smoke
```

---

## Cost Analysis

### GitHub Actions
**Free Tier**: 2,000 minutes/month
**Usage**: ~500 minutes/month (estimated)
**Cost**: $0 (within free tier)

### Vercel
**Hobby Plan**: Free
**Pro Plan**: $20/month (recommended for team)
**Features**:
- 1TB bandwidth
- 100GB-hours execution
- Analytics included

### Monitoring
**Sentry**: Free tier (5,000 errors/month)
**UptimeRobot**: Free tier (50 monitors)
**Total**: $0

**Total Monthly Cost**: $0-20

---

## Implementation Timeline

### Week 1: Basic CI
- [ ] Set up GitHub Actions workflow
- [ ] Add automated testing
- [ ] Configure branch protection
- [ ] Test with sample PR

### Week 2: Staging
- [ ] Create staging Supabase project
- [ ] Set up staging Vercel environment
- [ ] Configure staging subdomain
- [ ] Deploy staging pipeline

### Week 3: Production Pipeline
- [ ] Set up production environment protection
- [ ] Configure monitoring (Sentry)
- [ ] Add smoke tests
- [ ] Document rollback procedures

### Week 4: Polish
- [ ] Add Slack notifications
- [ ] Set up uptime monitoring
- [ ] Create runbooks
- [ ] Team training

---

## Recommended Next Steps

1. **Immediate** (Today):
   - Install GitHub Actions workflow for basic CI
   - Set up branch protection rules

2. **This Week**:
   - Create staging Supabase project
   - Set up staging.captionflow.com

3. **Next Week**:
   - Implement production deployment pipeline
   - Add monitoring and alerting

4. **Ongoing**:
   - Monitor metrics
   - Refine based on issues
   - Add more tests

---

## Conclusion

This CI/CD setup provides:
- **Safety**: Staging environment catches issues
- **Speed**: Automated deployments
- **Reliability**: Health checks and rollbacks
- **Visibility**: Monitoring and alerts
- **Affordability**: Free/low-cost tools

**Estimated Time to Full Setup**: 2-3 weeks
**Maintenance Overhead**: Minimal after setup

Ready to implement Phase 1?
