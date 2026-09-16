# Fubber API Setup & Live Data Guide

This guide walks you through configuring real production credentials for your database, cloud storage, and all 6 social media networks.

---

## 1. Database Setup (Neon PostgreSQL)

Fubber uses **Neon Serverless PostgreSQL** with Drizzle ORM.

1. Sign up at [neon.tech](https://neon.tech) (free tier available).
2. Click **Create Project** (choose your preferred region, e.g., `US East (Ohio)` or `EU Central`).
3. In the project dashboard, locate the **Connection Details** box.
4. Copy the connection string format:
   ```env
   DATABASE_URL="postgres://[username]:[password]@[ep-hostname].pooler.neon.tech/[database]?sslmode=require"
   ```
5. In your local project directory, create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```
6. Paste your `DATABASE_URL` into `.env.local`.
7. Push the database schema directly to your Neon database:
   ```bash
   npm run db:push
   ```
   Drizzle ORM will automatically create all 10 tables (`users`, `social_accounts`, `social_pages`, `posts`, `post_variants`, `media_assets`, `publish_attempts`, `analytics_snapshots`, `oauth_states`, `audit_logs`).

---

## 2. Token Encryption Key

Generate a random 32-byte key for AES-256-GCM encryption so all stored OAuth tokens are encrypted at rest:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Copy the output and set it in `.env.local`:
```env
AUTH_SECRET="your_generated_32_byte_key"
```

---

## 3. Media Storage (Vercel Blob)

1. When deploying to Vercel, go to the **Storage** tab in your Vercel project dashboard.
2. Click **Create Database** -> **Blob**.
3. Name your store (e.g. `socialhub-media`) and click **Create**.
4. In the settings, copy the `BLOB_READ_WRITE_TOKEN`.
5. Set it in `.env.local`:
   ```env
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
   ```
*(Note: When developing locally without a token, SocialHub automatically uses local data storage so you can upload images immediately).*

---

## 4. Social Media Developer Credentials

### Meta (Facebook Pages & Instagram)

Both Facebook Page posting and Instagram Content Publishing use the Meta Graph API.

1. Go to [developers.facebook.com](https://developers.facebook.com) and log in.
2. Click **My Apps** -> **Create App**.
3. Select **Other** -> **Business** as the app type.
4. Name your app (e.g. `SocialHub Publisher`).
5. Under **Add Products to App**, add:
   - **Facebook Login for Business**
   - **Instagram Graph API**
6. In **App settings** -> **Basic**:
   - Copy **App ID** -> set as `META_APP_ID`.
   - Copy **App Secret** -> set as `META_APP_SECRET`.
7. Under **Facebook Login for Business** -> **Settings**:
   - Add Valid OAuth Redirect URIs:
     - `http://localhost:3000/api/auth/facebook/callback`
     - `https://your-production-domain.vercel.app/api/auth/facebook/callback`
8. In **App Review** -> **Permissions and Features**, request:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `instagram_basic`
   - `instagram_content_publish`

---

### Meta Threads

1. In the same Meta developer account (or a new app), navigate to **Threads API**.
2. Click **Set Up** on Threads.
3. Configure the OAuth Redirect URI:
   - `http://localhost:3000/api/auth/threads/callback`
   - `https://your-production-domain.vercel.app/api/auth/threads/callback`
4. Copy the Client ID and Secret:
   ```env
   THREADS_CLIENT_ID="your_threads_id"
   THREADS_CLIENT_SECRET="your_threads_secret"
   ```

---

### X (Twitter API v2)

1. Go to [developer.x.com](https://developer.x.com) and sign in.
2. Create a **Project** and an **App** (Free or Basic tier).
3. Under **User authentication settings**, click **Set up**:
   - **App permissions**: Read and Write
   - **Type of App**: Web App
   - **Callback URI / Redirect URL**:
     - `http://localhost:3000/api/auth/x/callback`
     - `https://your-production-domain.vercel.app/api/auth/x/callback`
   - **Website URL**: `https://your-production-domain.vercel.app` (or `http://localhost:3000`)
4. Save and copy:
   - **OAuth 2.0 Client ID** -> `X_CLIENT_ID`
   - **OAuth 2.0 Client Secret** -> `X_CLIENT_SECRET`

---

### Pinterest (API v5)

1. Go to [developers.pinterest.com](https://developers.pinterest.com).
2. Click **Create App**.
3. In **App Details**, locate your App ID and App Secret.
4. In **Redirect URIs**, add:
   - `http://localhost:3000/api/auth/pinterest/callback`
   - `https://your-production-domain.vercel.app/api/auth/pinterest/callback`
5. Configure in `.env.local`:
   ```env
   PINTEREST_APP_ID="your_pinterest_app_id"
   PINTEREST_APP_SECRET="your_pinterest_app_secret"
   ```

---

### Google / YouTube

1. Go to [console.cloud.google.com](https://console.cloud.google.com).
2. Create a project named `SocialHub`.
3. Go to **APIs & Services** -> **Library** -> search for **YouTube Data API v3** -> click **Enable**.
4. Go to **APIs & Services** -> **OAuth consent screen**:
   - User Type: External
   - Fill in app name and developer email
5. Go to **Credentials** -> **Create Credentials** -> **OAuth client ID**:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/youtube/callback`
     - `https://your-production-domain.vercel.app/api/auth/youtube/callback`
6. Copy Client ID and Client Secret:
   ```env
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   ```
*(Note: As indicated across SocialHub, Google YouTube Data API v3 does not support third-party creation of Community tab posts. The connection authenticates your channel identity).*

---

## 5. Summary of `.env.local`

```env
DATABASE_URL="postgres://user:password@ep-sample.us-east-2.aws.neon.tech/socialhub?sslmode=require"
AUTH_SECRET="your_32_byte_secret_key"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

META_APP_ID="your_meta_app_id"
META_APP_SECRET="your_meta_app_secret"

THREADS_CLIENT_ID="your_threads_client_id"
THREADS_CLIENT_SECRET="your_threads_client_secret"

X_CLIENT_ID="your_x_client_id"
X_CLIENT_SECRET="your_x_client_secret"

PINTEREST_APP_ID="your_pinterest_app_id"
PINTEREST_APP_SECRET="your_pinterest_app_secret"

GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

---

## 6. How to Run & Verify

1. Start your local dev server:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000).
3. Navigate to **Connected Accounts** and connect your social profiles.
4. Navigate to **Create Post** -> upload an image, write your caption, inspect the live preview, and click **Publish Now**.
