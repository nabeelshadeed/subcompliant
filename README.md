# SubCompliant — Backend Application

Full-stack Next.js 14 SaaS for subcontractor compliance management.

## Stack

| Layer | Service |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL via Supabase |
| ORM | Drizzle ORM |
| Auth | Clerk |
| Storage | Cloudflare R2 |
| Queue | Upstash Redis |
| Email | Resend |
| OCR | AWS Textract |
| Payments | Stripe |
| Deployment | Vercel |

---

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill environment variables
cp ../subcompliant-final/.env.example .env.local
# Edit .env.local with your service credentials

# 3. Push database schema to Supabase
npm run db:push

# 4. Start dev server
npm run dev

# 5. (Optional) Start background worker in a second terminal
npm run worker:dev
```

App runs at `http://localhost:3000`.

---

## Environment Variables

Copy `.env.example` and populate each value. Required services:

### Supabase (Database)
1. Create project at supabase.com
2. Go to Settings → Database → Connection string (Transaction mode for pooled)
3. Copy `DATABASE_URL` and `DATABASE_URL_POOLED`
4. Copy `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` from API settings

### Clerk (Auth)
1. Create app at clerk.com
2. Enable Organizations in Clerk dashboard
3. Copy `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
4. Create a webhook endpoint pointing to `https://your-domain.com/api/webhooks/clerk`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`, `organization.created`, `organizationMembership.created`
5. Copy webhook secret to `CLERK_WEBHOOK_SECRET`

### Cloudflare R2 (Storage)
1. Create R2 bucket named `subcompliant-docs` in Cloudflare dashboard
2. Create API token with Object Read & Write permissions
3. Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`

### Upstash Redis (Queue)
1. Create database at upstash.com
2. Copy REST URL and token to `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`

### Resend (Email)
1. Create account at resend.com
2. Verify your sending domain
3. Copy API key to `RESEND_API_KEY`

### Stripe (Payments)
1. Create account at stripe.com
2. Create 6 price objects (Starter/Pro/Business × monthly/annual)
3. Copy publishable and secret keys
4. Create webhook endpoint for `https://your-domain.com/api/webhooks/stripe`
   - Subscribe to: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### AWS Textract (OCR)
1. Create IAM user with `AmazonTextractFullAccess` and `AmazonS3ReadOnlyAccess`
2. Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_TEXTRACT_REGION=eu-west-2`
3. **Note:** Textract reads documents directly from R2. Because R2 is S3-compatible but uses a custom endpoint, you may need to stage files in a real S3 bucket before calling Textract. Set `TEXTRACT_USE_STAGING_S3=true` and provide `TEXTRACT_STAGING_BUCKET` for this pattern.

---

## Database Setup

```bash
# Generate migration files from schema
npm run db:generate

# Apply to Supabase
npm run db:migrate

# Or push schema directly (dev)
npm run db:push

# Browse data
npm run db:studio
```

The schema already includes seed data for document types and trades — no manual seeding needed.

### Row-Level Security

RLS is enabled on all tables. The API sets `app.contractor_id` via `setTenantContext()` to enforce tenant isolation at the database level. This is called automatically in the auth helper.

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy --prod

# Set environment variables (or paste in Vercel dashboard)
vercel env add DATABASE_URL production
# ... repeat for all env vars
```

The `vercel.json` configures:
- **Daily cron** at 08:00 UTC → `/api/cron/expiry-reminders`
- **Security headers** on all `/api/*` routes

Set `CRON_SECRET` in Vercel env vars and use it to authenticate cron calls.

---

## Background Worker

The document processor polls Upstash Redis for jobs:

```bash
npm run worker:dev
```

In production, deploy this as a separate **Railway** or **Render** worker service pointing at the same codebase with `npm run worker:dev` as the start command.

Job types handled:
- `process_document` — Textract OCR, metadata extraction, risk recalculation
- `calculate_risk_score` — weighted scoring across insurance/CSCS/trade certs/RAMS/admin

---

## Architecture

```
src/
├── app/
│   ├── (app)/              # Authenticated app pages (sidebar layout)
│   │   ├── dashboard/
│   │   ├── subcontractors/ # List + [id] profile with doc review
│   │   ├── compliance/     # Portfolio-wide compliance table
│   │   ├── documents/      # Full document library with filters
│   │   ├── notifications/
│   │   └── settings/       # Org settings + billing
│   ├── (public)/
│   │   └── upload/         # Magic-link subcontractor upload flow
│   ├── auth/               # Clerk sign-in / sign-up pages
│   └── api/
│       ├── auth/           # Magic-link generation + token resolution
│       ├── documents/      # Upload + review (approve/reject)
│       ├── subcontractors/ # CRUD + compliance + risk-score
│       ├── billing/        # Stripe checkout + portal
│       ├── webhooks/       # Clerk sync + Stripe billing events
│       └── cron/           # Daily expiry reminders
├── components/
│   ├── layout/             # Sidebar, TopBar
│   ├── documents/          # FileDropzone, DocumentReviewPanel, DocumentFilters
│   ├── subcontractors/     # InviteModal
│   └── ui/                 # StatCard, Badges, EmptyState
├── lib/
│   ├── db/                 # Drizzle schema + relations + connection
│   ├── auth/               # getAuthContext, requireAdmin, logAudit
│   ├── compliance-engine.ts# Compliant / partial / non-compliant logic
│   ├── risk-engine.ts      # Weighted risk score calculation
│   ├── r2.ts               # Cloudflare R2 upload/download
│   ├── redis.ts            # Upstash job queue
│   ├── resend.ts           # Email templates
│   ├── stripe.ts           # Billing integration
│   └── textract.ts         # OCR extraction
└── workers/
    └── document-processor.ts
```

---

## Roles & Permissions

| Role | Can invite subs | Can review docs | Can manage billing |
|---|---|---|---|
| `owner` | ✓ | ✓ | ✓ |
| `admin` | ✓ | ✓ | ✗ |
| `viewer` | ✗ | ✗ | ✗ |

Roles are set via Clerk org membership (`org:admin` → `admin`, otherwise `viewer`). The owner role is assigned to the Clerk org creator via the webhook handler.

---

## Key Flows

### Subcontractor Onboarding (Magic Link)
1. Contractor clicks **Invite** → fills email + selects required docs
2. `POST /api/auth/magic-link` creates upload session token, sends Resend email
3. Sub receives email, clicks link → `/upload?t=TOKEN`
4. Sub fills in name/email, uploads each document via `POST /api/documents/upload?t=TOKEN`
5. Each upload: stored in R2, DB record created, processing job queued
6. Worker runs OCR, extracts expiry/policy data, triggers risk recalculation
7. Contractor sees new sub + documents in dashboard

### Document Review
1. Contractor opens subcontractor profile → sees pending documents
2. Clicks **Approve** or **Reject** on any document
3. `POST /api/documents/[id]/review` updates status, sends Resend email to sub
4. Risk score recalculated automatically

### Billing
1. Contractor visits `/settings/billing` → selects plan
2. `POST /api/billing/checkout` creates Stripe Checkout Session → redirect
3. On success: Stripe webhook updates contractor plan + sub limit in DB
4. Contractor visits portal via `POST /api/billing/portal` for invoice management
