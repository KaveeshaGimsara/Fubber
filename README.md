# SocialHub — Production-Ready Social Media Publishing Dashboard

**SocialHub** is a lightweight, personal alternative to Buffer and Metricool built for cross-network **IMAGE + CAPTION** publishing across 6 social networks:
1. **Facebook Page** (Meta Graph API / Page selector)
2. **Instagram** (Meta Instagram Graph API / Container publishing)
3. **Threads** (Official Threads API)
4. **X (Twitter)** (Official X API v2)
5. **Pinterest** (Official Pinterest API v5)
6. **YouTube Community Posts** (Official YouTube Data API v3 with transparent API limitation status)

---

## Features

- **Master Content & Independent Variants**: Upload one high-res image and write a Master Caption. Each platform variant inherits this content and allows completely isolated captions, aspect ratios, and crops.
- **Precision Image Cropping**: Powered by `react-easy-crop` with presets (`Original`, `1:1`, `4:5`, `16:9`, `1.91:1`, `2:3`, `1:2`), zoom, pan, and rotation. Editing one platform never affects another.
- **Realistic Platform Previews**: Visual preview cards simulating authentic Facebook, Instagram, Threads, X, Pinterest, and YouTube post layouts.
- **Independent Multi-Network Publishing**: Before publishing, a "Review & Publish" checklist shows all active platforms. When you click **PUBLISH NOW**, each network executes independently. If one network fails, the others still succeed, and you can retry only the failed networks.
- **Official API Compliance**: No scraping, no unofficial endpoints, and no automated browser bypasses. For YouTube, the app transparently indicates Google's official limitation regarding third-party Community Post creation.
- **Drafts & Auto-Save**: Debounced background auto-saving and full draft management (edit, duplicate, delete).
- **Publishing History**: Track all publications, inspect external post IDs and live URLs, and retry failed posts.
- **Normalized Analytics**: Cross-platform analytics dashboard using Recharts for engagement over time, platform comparison, and distribution.
- **Media Library**: Upload, search, sort, inspect dimensions/file sizes, and track post usage across campaigns.
- **Connected Accounts**: Connect profiles, reconnect expired tokens, and switch target Facebook Pages seamlessly.
- **Sleek SaaS UI**: Built with Tailwind CSS, Lucide icons, and `next-themes` (Default: Light theme, plus Dark and System options).

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Neon Serverless PostgreSQL with Drizzle ORM
- **Security**: AES-256-GCM encrypted token storage & server-side secrets
- **Analytics**: Recharts & Normalized Provider Architecture
- **Cropping**: `react-easy-crop` & HTML5 Canvas
- **Deployment**: Vercel & Vercel Blob

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and set your credentials:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## Deploy to Vercel

1. Push your repository to GitHub.
2. Import the repository into **Vercel**.
3. In the Vercel project settings, add the environment variables from `.env.example`:
   - `DATABASE_URL` (from Neon Console)
   - `AUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `BLOB_READ_WRITE_TOKEN` (from Vercel Storage tab)
   - Platform client IDs and secrets
4. Deploy!
