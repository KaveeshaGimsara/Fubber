# 🚀 Fubber (ෆබර්) - 2026 සම්පූර්ණ Setup මගපෙන්වීම (100% Free Tier)

මෙම ලියවිල්ල Fubber සමාජ මාධ්‍ය කළමනාකරණ මෘදුකාංගය (Social Media Publishing & Analytics Workspace) **කිසිදු මුදලක් නොගෙවා (100% Free Plans පමණක් භාවිත කරමින්)** 2026 නවතම වෙබ් අඩවි සහ Developer Portals සමඟ නිවැරදිව පියවරෙන් පියවර සකසා ගන්නා ආකාරය පැහැදිලි කරයි.

---

## 📑 පටුන (Table of Contents)
1. [100% නොමිලේ ක්‍රියාත්මක වන ආකාරය (Free Plan Architecture)](#1-100-නොමිලේ-ක්‍රියාත්මක-වන-ආකාරය)
2. [Database Storage නොපිරී තබා ගන්නා 1-Hour Auto-Delete ක්‍රමවේදය](#2-1-hour-auto-delete-ක්‍රමවේදය)
3. [පියවර 1: Neon Serverless Database එක නොමිලේ සාදා ගැනීම](#පියවර-1-neon-postgresql-නොමිලේ-සාදා-ගැනීම)
4. [පියවර 2: Vercel මත නොමිලේ Deploy කර Cron Job සක්‍රිය කිරීම](#පියවර-2-vercel-මත-නොමිලේ-deploy-කිරීම)
5. [පියවර 3: 2026 Social Media Developer APIs නොමිලේ ලබා ගැනීම](#පියවර-3-2026-social-media-apis-ලබා-ගැනීම)
   - 📘 Facebook Pages & Instagram (Meta Graph API)
   - 🧵 Threads API
   - 💼 LinkedIn Developer Portal (Profile & Company Page)
   - 𝕏 X (Twitter) API v2 Free Tier
   - 📌 Pinterest API v5
   - 🎥 YouTube Data API v3
6. [පියවර 4: Authenticator App (2FA) සහ Login ආරක්‍ෂාව සක්‍රිය කිරීම](#පියවර-4-authenticator-app-2fa-සහ-login-ආරක්‍ෂාව)
7. [පියවර 5: Local පරිගණකයේ Run කර පරික්ෂා කිරීම](#පියවර-5-local-පරිගණකයේ-run-කිරීම)

---

## 1. 100% නොමිලේ ක්‍රියාත්මක වන ආකාරය

Fubber නිර්මාණය කර ඇත්තේ ශුන්‍ය වියදමකින් (Zero Cost) පවත්වාගෙන යා හැකි වන පරිදිය:

| සේවාව (Service) | Plan එක | පිරිවැය (Cost) | ලබා දෙන සීමාවන් (Limits) |
| :--- | :--- | :--- | :--- |
| **Vercel** | Hobby Tier | **$0 / Free** | Unlimited deployments, 100GB Bandwidth, Edge Functions |
| **Neon Database** | Free Tier | **$0 / Free** | 0.5 GiB (512 MB) Storage, Serverless Postgres |
| **Meta Graph API** | Developer Free | **$0 / Free** | 200 calls/hour per user (Facebook, Instagram, Threads) |
| **LinkedIn REST API** | Developer Free | **$0 / Free** | Community Management & Share API (100 calls/hr) |
| **X (Twitter) API** | v2 Free Tier | **$0 / Free** | 500 Posts/month write access via OAuth 2.0 PKCE |
| **Pinterest API** | Developer Free | **$0 / Free** | Unlimited standard organic Pins |
| **Google Cloud** | Free Tier | **$0 / Free** | 10,000 units/day YouTube Data API v3 |

---

## 2. 1-Hour Auto-Delete ක්‍රමවේදය (Storage Protection)

Neon PostgreSQL නොමිලේ ලබා දෙන්නේ **512 MB** Storage පමණි. ඔබ විශාල ප්‍රමාණයේ පින්තූර Database එකේ දිගටම තබා ගතහොත් දින කිහිපයකින් මෙම 512 MB සීමාව ඉක්මවා යනු ඇත.

### Fubber මෙය විසඳන්නේ කෙසේද?
Fubber තුළ **ස්වයංක්‍රීය 1-Hour Purge System** එකක් සකස් කර ඇත:
1. ඔබ Image එකක් Upload කර Post එක සමාජ ජාල වෙත publish කළ පසු හෝ schedule කළ පසු, එම පින්තූරය තාවකාලිකව Database එකේ තැන්පත් වේ.
2. පැය 1ක් (60 Minutes) ගත වූ පසු Fubber හි `/api/cron/cleanup` සේවාව ස්වයංක්‍රීයව ක්‍රියාත්මක වී Database එකෙන් එම Image data සහ temporary cache එක මකා දමයි (**Hard Delete**).
3. **ප්‍රතිඵලය:** ඔබේ Database Storage එක කිසිදා **10MB - 15MB** ඉක්මවා යන්නේ නැත! එම නිසා Neon Free Tier එක ජීවිත කාලයටම නොමිලේ භාවිතා කළ හැක.

---

## පියවර 1: Neon PostgreSQL නොමිලේ සාදා ගැනීම

1. [https://neon.tech](https://neon.tech) වෙබ් අඩවියට පිවිස **Sign Up** වන්න (GitHub හෝ Google හරහා නොමිලේ සම්බන්ධ විය හැක).
2. **Create Project** ක්ලික් කර:
   - Project Name: `fubber-db` ලෙස ලබා දෙන්න.
   - Region: ඔබට ළඟම කලාපය (උදා: `ap-southeast-1 Singapore` හෝ `eu-central-1`) තෝරන්න.
3. Dashboard එකේ දිස්වන **Connection String** එක පිටපත් කරගන්න (Copy Connection String):
   ```env
   DATABASE_URL="postgresql://neondb_owner:xxxxxxxx@ep-cool-fog-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   ```
4. ඔබේ Fubber Folder එක තුළ ඇති `.env.local` ගොනුව විවෘත කර එම connection string එක paste කරන්න.
5. Command Prompt / PowerShell එකේ පහත විධානය ක්‍රියාත්මක කර Database Tables සාදන්න:
   ```bash
   npm run db:push
   ```

---

## පියවර 2: Vercel මත නොමිලේ Deploy කිරීම

1. ඔබේ code එක [GitHub](https://github.com) එකට Push කරන්න.
2. [https://vercel.com](https://vercel.com) වෙත ගොස් ඔබේ GitHub ගිණුමෙන් Login වන්න.
3. **Add New... -> Project** ක්ලික් කර ඔබගේ Fubber Repository එක Import කරන්න.
4. **Environment Variables** කොටසේ පහත අගයන් ඇතුළත් කරන්න:
   - `DATABASE_URL`: ඔබේ Neon connection string එක
   - `SESSION_SECRET`: ඕනෑම අකුරු සහ ඉලක්කම් 32ක රහස්‍ය කේතයක් (උදා: `fubber_aes256_secret_key_32_chars!`)
   - `CRON_SECRET`: Vercel Cron ආරක්ෂා කිරීමට රහස්‍ය කේතයක් (උදා: `fubber_secure_cron_token_2026`)
5. **Deploy** ක්ලික් කරන්න. විනාඩි 2ක් ඇතුළත ඔබේ Fubber වෙබ් අඩවිය සජීවීව ක්‍රියාත්මක වේ.

### Vercel Cron Job ස්වයංක්‍රීයව සක්‍රිය වීම
Fubber project එක තුළ දැනටමත් `vercel.json` ගොනුව අන්තර්ගත කර ඇත:
```json
{
  "crons": [
    {
      "path": "/api/cron/publish-scheduled",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 * * * *"
    }
  ]
}
```
- සෑම විනාඩි 5කට වරක් Schedule කළ Posts සමාජ ජාල වෙත යවනු ලැබේ.
- සෑම පැයකට වරක් පැරණි Images ස්වයංක්‍රීයව Database එකෙන් මකා දමනු ලැබේ.

---

## පියවර 3: 2026 Social Media APIs ලබා ගැනීම

### 📘 1. Facebook Pages & Instagram (Meta Graph API 2026)
1. [developers.facebook.com](https://developers.facebook.com) වෙත ගොස් **My Apps -> Create App** ක්ලික් කරන්න.
2. Use case එක සඳහා **Other** තෝරා **Business** type එක තෝරන්න.
3. App Name එකට `Fubber Workspace` ලබා දෙන්න.
4. Dashboard එකෙන් **Instagram Graph API** සහ **Facebook Login for Business** එක් කරන්න.
5. **App Settings -> Basic** වෙත ගොස්:
   - `App ID` සහ `App Secret` පිටපත් කරගන්න.
   - `.env.local` හි `META_APP_ID` සහ `META_APP_SECRET` වලට ලබා දෙන්න.
6. Valid OAuth Redirect URI එකට:
   - `https://your-fubber.vercel.app/api/auth/facebook/callback`
   - Local පරික්ෂාව සඳහා: `http://localhost:3000/api/auth/facebook/callback`

---

### 🧵 2. Threads API (2026 Official Meta API)
1. එම Meta Developer App එක තුළම **Add Product** ක්ලික් කර **Threads** තෝරන්න.
2. **Threads -> Quickstart** හෝ **Use cases** වෙත යන්න.
3. Permissions සඳහා `threads_basic` සහ `threads_content_publish` ලබා ගන්න.
4. `.env.local` හි `THREADS_CLIENT_ID` සහ `THREADS_CLIENT_SECRET` සකසන්න.

---

### 💼 3. LinkedIn Developer Portal (2026)
1. [https://www.linkedin.com/developers](https://www.linkedin.com/developers) වෙත ගොස් **Create App** ක්ලික් කරන්න.
2. ඔබේ LinkedIn Company Page එකක් හෝ Personal Page එකක් App එක සමඟ Link කරන්න.
3. **Products** tab එකට ගොස්:
   - **Share on LinkedIn**
   - **Sign In with LinkedIn using OpenID Connect**
   - **Community Management API** (Company Page සඳහා) සක්‍රිය කරන්න.
4. **Auth** tab එකට ගොස් **Authorized Redirect URLs for your app** වෙත:
   - `https://your-fubber.vercel.app/api/auth/linkedin/callback`
   - `http://localhost:3000/api/auth/linkedin/callback`
5. Client ID සහ Client Secret පිටපත් කර `.env.local` හි `LINKEDIN_CLIENT_ID` සහ `LINKEDIN_CLIENT_SECRET` වලට ලබා දෙන්න.

---

### 𝕏 4. X (Twitter) API v2 Free Tier (2026)
1. [developer.x.com](https://developer.x.com) වෙත ගොස් **Sign up for Free Account** තෝරන්න.
2. **Projects & Apps** යටතේ App එකක් සාදන්න.
3. **User Authentication Settings** -> **Set up** ක්ලික් කරන්න:
   - App permissions: **Read and write**
   - Type of App: **Web App, Automated App or Bot**
   - Callback URL: `https://your-fubber.vercel.app/api/auth/x/callback`
   - Website URL: ඔබේ Vercel domain එක
4. ලැබෙන **OAuth 2.0 Client ID** සහ **Client Secret** පිටපත් කර `.env.local` හි `X_CLIENT_ID` සහ `X_CLIENT_SECRET` වලට ලබා දෙන්න.

---

### 📌 5. Pinterest API v5 (2026)
1. [developers.pinterest.com](https://developers.pinterest.com) වෙත පිවිසෙන්න.
2. **My Apps** -> **Create App** තෝරන්න.
3. Redirect URI: `https://your-fubber.vercel.app/api/auth/pinterest/callback`
4. Scopes: `boards:read,pins:read,pins:write`.
5. App ID සහ Secret එක `.env.local` හි `PINTEREST_APP_ID` සහ `PINTEREST_APP_SECRET` ලෙස සටහන් කරන්න.

---

### 🎥 6. YouTube Data API v3 (Google Cloud)
1. [console.cloud.google.com](https://console.cloud.google.com) වෙත ගොස් නව Project එකක් සාදන්න (`Fubber App`).
2. **APIs & Services -> Library** වෙත ගොස් **YouTube Data API v3** Enable කරන්න.
3. **Credentials -> Create Credentials -> OAuth Client ID** තෝරන්න (Web Application).
4. Authorized redirect URI: `https://your-fubber.vercel.app/api/auth/youtube/callback`.
5. Client ID සහ Secret එක `.env.local` හි `GOOGLE_CLIENT_ID` සහ `GOOGLE_CLIENT_SECRET` වලට එක් කරන්න.
   *(සැලකිය යුතුයි: Google විසින් තෙවන පාර්ශවීය මෘදුකාංග සඳහා Community Post නිර්මාණය කිරීම API හරහා සීමා කර ඇත, නමුත් Channel Analytics සහ Metrics බැලීම 100% නොමිලේ කළ හැක).*

---

## පියවර 4: Authenticator App (2FA) සහ Login ආරක්‍ෂාව

Fubber හි ඔබගේ සියලු Social Media Tokens ඉතා ආරක්‍ෂිතව තබා ගැනීම සඳහා Two-Factor Authentication (TOTP) ඇතුළත් කර ඇත.

### 2FA සකසා ගන්නා ආකාරය:
1. ඔබගේ ස්මාර්ට් ජංගම දුරකථනයට **Google Authenticator** හෝ **Authy** (නොමිලේ ලබාගත හැකි App) Install කරගන්න.
2. Fubber හි **Settings** පිටුවට ගොස් **Two-Factor Authentication** කොටසේ ඇති **Enable 2FA** බොත්තම ක්ලික් කරන්න.
3. තිරයේ දිස්වන **Secret Key** එක Authenticator App එකට ඇතුළත් කරන්න (හෝ Setup code එක copy කරන්න).
4. ලබා දෙන **Emergency Backup Codes** පිටපත් කර ආරක්‍ෂිත ස්ථානයක තබා ගන්න.
5. Authenticator App එකෙන් ලැබෙන ඉලක්කම් 6 කේතය ඇතුළත් කර **Verify & Enable** ක්ලික් කරන්න.
6. මින්පසු ඔබ Login වන සෑම අවස්ථාවකම මෙම 6-digit කේතය අවශ්‍ය වන බැවින් ඔබගේ ගිණුම 100% ආරක්‍ෂිත වේ.

### Login විස්තර:
- **Login URL:** `/login`
- **Default Admin Email:** `owner@fubber.io`
- **Default Password:** `FubberAdmin2026!` (ඔබට Settings හරහා මෙය වෙනස් කළ හැක)

---

## පියවර 5: Local පරිගණකයේ Run කිරීම

ඔබට මෙය ඔබේ පරිගණකයේ දමා පරික්ෂා කිරීමට අවශ්‍ය නම්:

```bash
# 1. Packages install කිරීම
npm install

# 2. Development server එක ආරම්භ කිරීම
npm run dev
```

ඉන්පසු බ්‍රවුසරයෙන් [http://localhost:3000](http://localhost:3000) වෙත පිවිසෙන්න.

---

## 💡 සාර්ථකව පවත්වාගෙන යාම සඳහා උපදෙස් (Pro Tips)
- **Sandbox Mode:** ඔබට තවමත් සියලු Social Media Developer Accounts නොමැති නම්, Fubber හි **Settings -> Developer Sandbox Mode** සක්‍රිය කර තබන්න. එවිට සියලුම Preview, Post Creator, Cropping, Analytics සැබෑ API ප්‍රතිචාර ආකාරයෙන්ම කිසිදු දෝෂයකින් තොරව පරීක්ෂා කළ හැක.
- **Storage Reminder:** පින්තූර Database එකේ වැඩිවේ යැයි බිය විය යුතු නැත. Fubber හි ඇති 1-Hour Purge System මඟින් පැරණි Image files ස්වයංක්‍රීයව අතුගා දමයි!

---
© 2026 **Fubber** - Minimalist & Secure Social Media Command Center.
