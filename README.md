# StylinSoulMetalArt - Etsy Intelligence Platform

A production-ready Etsy seller intelligence, SEO optimization, keyword research, competitor research, niche finder, listing builder, and listing management application for the **StylinSoulMetalArt** shop.

## Features

- **Dashboard** — Shop overview with listing stats, revenue charts, and optimization alerts
- **My Listings** — Full listing table with filters, search, SEO scores, and performance tracking
- **Listing Analyzer** — Deep analysis with the "StylinSoul Optimization Score" (0-100)
- **Keyword Research** — Discover keywords from marketplace data, competitor analysis, and AI expansion
- **Niche Finder** — Discover profitable metal sign niches with opportunity scoring
- **Competitor Research** — Analyze competitor listings, find keyword gaps and pricing patterns
- **Listing Builder** — Generate optimized titles, tags, descriptions for metal sign listings
- **Bulk Optimizer** — Queue multiple listings for review with individual approval
- **Sales Intelligence** — Revenue, orders, and performance data from actual Etsy transactions
- **Saved Research** — Organize keywords, niches, and ideas in folders
- **Optimization History** — Track all changes with snapshot-based rollback capability
- **Setup Wizard** — Guided configuration for first-time setup

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts
- **Backend**: Next.js (App Router), Server Actions, API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Etsy OAuth 2.0 + PKCE
- **AI**: OpenAI-compatible API (Qwen, OpenAI, etc.)
- **Deployment**: Vercel-ready

## Requirements

- Node.js 18+
- PostgreSQL 14+
- Etsy Developer Account (https://www.etsy.com/developers)
- AI API key (OpenAI-compatible)

## Installation

### 1. Clone and Install

```bash
git clone <repository-url>
cd stylinsoul-etsy-intelligence
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb stylinsoul

# Run Prisma migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio
npx prisma studio
```

### 3. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Etsy API (get from https://www.etsy.com/developers/register)
ETSY_KEYSTRING=your_keystring_here
ETSY_SHARED_SECRET=your_shared_secret_here
ETSY_REDIRECT_URI=http://localhost:3000/api/auth/etsy/callback
ETSY_SHOP_NAME=StylinSoulMetalArt

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/stylinsoul

# Token Encryption (generate: openssl rand -hex 32)
TOKEN_ENCRYPTION_KEY=your_encryption_key_here

# AI Provider
AI_PROVIDER=qwen
AI_API_KEY=your_ai_api_key_here
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=qwen-plus

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Create Etsy Seller App

1. Go to https://www.etsy.com/developers/register
2. Create a new app
3. Set the **Redirect URI** to: `http://localhost:3000/api/auth/etsy/callback`
4. Required OAuth scopes:
   - `listings_r` — Read listings
   - `listings_w` — Write listings
   - `transactions_r` — Read transactions
   - `shops_r` — Read shop data
   - `shops_w` — Write shop data
5. Copy your **Keystring** and **Shared Secret** to `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## How OAuth Works

1. User clicks "Connect Etsy"
2. App generates PKCE code_verifier and SHA-256 code_challenge
3. User is redirected to Etsy authorization page
4. User grants permissions
5. Etsy redirects back with authorization code
6. App exchanges code for access_token + refresh_token (server-side)
7. Refresh token is encrypted and stored in database
8. Access token is used for all subsequent API calls
9. When access token expires, it's automatically refreshed

## How to Configure AI

The AI provider uses an OpenAI-compatible API format. Configure in `.env.local`:

- **Qwen**: Set `AI_BASE_URL` to your Qwen endpoint
- **OpenAI**: Set `AI_BASE_URL=https://api.openai.com/v1` and `AI_MODEL=gpt-4`
- **Custom**: Any OpenAI-compatible endpoint

The AI is used for:
- Keyword generation and clustering
- Listing title/tag/description generation
- Niche opportunity discovery
- Competitor analysis
- Listing optimization suggestions

## Production Deployment (Vercel)

### 1. Configure Environment Variables in Vercel

Add all variables from `.env.example` in Vercel's environment settings.

### 2. Update Redirect URI

Change `ETSY_REDIRECT_URI` to your production URL:
```
https://your-app.vercel.app/api/auth/etsy/callback
```

### 3. Update in Etsy Developer Portal

Add the production redirect URI to your Etsy app settings.

### 4. Deploy

```bash
vercel --prod
```

## Security

- **Never** expose `ETSY_SHARED_SECRET`, `TOKEN_ENCRYPTION_KEY`, or `AI_API_KEY` to the browser
- All Etsy API calls happen **server-side only**
- OAuth refresh tokens are **encrypted** with AES-256 before storage
- PKCE (Proof Key for Code Exchange) prevents authorization code interception
- CSRF protection via OAuth state parameter validation
- Rate limiting with exponential backoff on all API calls
- Input validation with Zod schemas
- SQL injection prevention via Prisma ORM

## Shop Rules (StylinSoulMetalArt)

This application is configured for a laser-cut metal sign shop:

- **No emojis** in Etsy titles
- **No "16 gauge"** in titles
- Tags must be **≤ 20 characters** each
- Generate exactly **13 tags** per listing
- Focus on **buyer intent** keywords
- Key dimensions: Product, Recipient, Occasion, Style, Personalization, Room/Location, Profession/Hobby, Relationship

### Available Colors
Black, Red, White, Silver, Copper, Blue, Gold, Green, Pink, Anthracite, Cream, Chrome, Yellow

### Available Sizes
8", 10", 12", 14", 15", 18", 24", 30", 36", 40", 44", 48", 55", 59"

## Important Notes

### What Etsy API Provides
- Listing data (title, description, tags, price, images, etc.)
- Order/transaction data
- Shop information
- Taxonomy and attributes
- Inventory and variations (up to 3)

### What Etsy API Does NOT Provide
- Listing views/visits
- Conversion rates
- Search volume
- Traffic data
- Etsy ranking data

When a metric is not available, the UI shows: *"Not available through Etsy Open API"*

### StylinSoul Optimization Score
This is an **internal heuristic** (0-100), NOT an official Etsy metric. It analyzes:
- Keyword targeting (25 pts)
- Tags (20 pts)
- Title structure (15 pts)
- Attributes (15 pts)
- Description (10 pts)
- Personalization (5 pts)
- Competitive positioning (10 pts)

## Troubleshooting

### OAuth Errors
- Verify redirect URI matches exactly in both `.env.local` and Etsy developer portal
- Ensure scopes are correctly configured
- Check that keystring and shared secret are correct

### Database Errors
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` format
- Run `npx prisma migrate dev` to create tables

### AI Errors
- Verify API key is valid
- Check base URL is correct for your provider
- Ensure model name matches your provider's available models

### Rate Limiting
- Etsy API has QPS (queries per second) and QPD (queries per day) limits
- The app automatically handles 429 responses with exponential backoff
- Reduce sync frequency if you hit daily limits

## Project Structure

```
/app              — Next.js App Router pages and API routes
/components       — React UI components
/lib/etsy         — Etsy API client and OAuth
/lib/seo          — SEO scoring engine
/lib/keywords     — Keyword research logic
/lib/niches       — Niche discovery engine
/lib/ai           — AI provider abstraction
/lib/security     — Encryption, PKCE, validation
/lib/database     — Prisma client and helpers
/types            — TypeScript type definitions
/prisma           — Database schema and migrations
```

## License

Private — For use with StylinSoulMetalArt Etsy shop only.
