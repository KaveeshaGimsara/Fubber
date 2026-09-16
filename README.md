<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/share-2.svg" alt="Fubber Logo" width="80" height="80">

  # Fubber
  
  **The Ultimate Free & Open-Source Social Media Publishing Dashboard**

  <p align="center">
    <a href="https://vercel.com/new/clone?repository-url=https://github.com/KaveeshaGimsara/fubber"><img src="https://vercel.com/button" alt="Deploy with Vercel"/></a>
  </p>

  <p align="center">
    <a href="https://github.com/sponsors/KaveeshaGimsara"><img src="https://img.shields.io/badge/Sponsor-GitHub-%23EA4AAA?style=for-the-badge&logo=github&logoColor=white" alt="Sponsor on GitHub"></a>
    <a href="https://ko-fi.com/vgmoo_creators"><img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me a Coffee"></a>
  </p>
</div>

---

**Fubber** is a beautiful, personal alternative to expensive tools like Buffer and Hootsuite. It allows you to schedule, edit, and publish posts with images across 6 major social networks simultaneously—all from one clean dashboard.

1. **Facebook Page**
2. **Instagram** 
3. **Threads** 
4. **X (Twitter)** 
5. **Pinterest** 
6. **YouTube Community Posts**

![Fubber Dashboard Preview](https://res.cloudinary.com/tbpn17by/image/upload/f_auto,q_auto/ScreenShot_Tool_-20260916215637)

---

## 🌟 Why Fubber?

- **Completely Free**: Host it yourself on Vercel's free tier. No monthly subscriptions.
- **Write Once, Customize Everywhere**: Upload one image and write one master caption. You can then individually tweak the caption, crop, and aspect ratio for each specific platform before posting.
- **Automatic Scheduling**: Pick a future date, time, and timezone. Fubber will automatically publish it for you while you sleep.
- **Visual Previews**: See exactly what your post will look like on Instagram, X, or Facebook before you hit publish.
- **Advanced Analytics**: Track your engagement, reach, and follower growth with beautiful charts.

---

## 🚀 How to Install (For Beginners)

You **do not** need to know how to code to use Fubber! You can get this running entirely through your web browser for free. Follow these steps carefully:

### Step 1: Get a Database (Neon)
Fubber needs a place to save your scheduled posts and settings.
1. Go to [Neon.tech](https://neon.tech/) and create a free account.
2. Click **Create Project** and name it "Fubber".
3. Once created, look for your **Connection String** (it starts with `postgres://...`). Copy this and save it somewhere safe. You will need it soon!

### Step 2: Get Your App Ready (GitHub)
1. Create a free account on [GitHub.com](https://github.com).
2. Go to the Fubber code page (where you are reading this).
3. Click the **Fork** button in the top right corner. This creates a personal copy of Fubber in your own account.

### Step 3: Publish to the Web (Vercel)
Vercel is a free service that will host your Fubber dashboard so you can access it from anywhere.
1. Create a free account on [Vercel.com](https://vercel.com).
2. Click **Add New Project**.
3. Import the "Fubber" repository you just forked in Step 2.
4. Before you click Deploy, open the **Environment Variables** section. You need to add a few secret keys:
   - **Name**: `DATABASE_URL` | **Value**: Paste the Neon link you got in Step 1.
   - **Name**: `AUTH_SECRET` | **Value**: Make up a random, long password (e.g., `MySuperSecretPassword123!`).
   - **Name**: `CRON_SECRET` | **Value**: Make up another random password. (This protects your scheduler).
   - **Name**: `NEXT_PUBLIC_APP_URL` | **Value**: Your Vercel website URL (you can add this later once Vercel gives you your `.vercel.app` link).
5. Click **Deploy**. Wait a couple of minutes for it to finish!

### Step 4: Setup Image Storage (Vercel Blob)
Your app is live, but it needs a place to store the photos you upload.
1. In your Vercel Dashboard, go to your new Fubber project.
2. Click on the **Storage** tab at the top.
3. Click **Create Database** -> **Blob** -> Name it "fubber-media" and click **Create**.
4. Once created, scroll down to find the `BLOB_READ_WRITE_TOKEN`.
5. Go back to your project **Settings** -> **Environment Variables**, and add:
   - **Name**: `BLOB_READ_WRITE_TOKEN` | **Value**: Paste the token here.
6. Go to the **Deployments** tab and click **Redeploy** to apply the new image storage.

🎉 **You're done!** You can now visit your Vercel link and start using Fubber.

---

## 🔑 Connecting Your Social Accounts (API Keys)

To allow Fubber to post on your behalf, you need to connect your social media accounts by getting "API Keys" from Facebook, X (Twitter), etc. 

👉 **[Read the Full API Setup Guide Here](./API_SETUP_GUIDE.md)**

*(This guide walks you step-by-step through how to get the free developer keys for Meta, Google, X, and Pinterest).*

---

## 💻 For Developers (Local Setup)

If you are a developer and want to run Fubber locally on your computer:

```bash
# 1. Clone the repository
git clone https://github.com/KaveeshaGimsara/fubber.git
cd fubber

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# (Fill in your .env.local with your database and API credentials)

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📸 Screenshots

### Post Creation & Image Editor
![Create Post](https://res.cloudinary.com/tbpn17by/image/upload/f_auto,q_auto/ScreenShot_Tool_-20260916215351)

### Advanced Analytics
![Analytics Dashboard](https://res.cloudinary.com/tbpn17by/image/upload/v1789576388/ScreenShot_Tool_-20260916215626.png)

### Platforms Working
![Platforms Working](https://res.cloudinary.com/tbpn17by/image/upload/v1789576400/ScreenShot_Tool_-20260916215648.png)

---

## ❤️ Support & Sponsor

Fubber is an open-source project created to help creators manage their platforms without hefty monthly fees. If you find it useful, please consider supporting the project!

- [Sponsor on GitHub](https://github.com/sponsors/KaveeshaGimsara)
- [Buy me a Coffee](https://ko-fi.com/vgmoo_creators)
- ⭐ Don't forget to **Star** this repository!

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
