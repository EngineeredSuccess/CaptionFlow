# Instagram OAuth Setup Guide

To enable Instagram publishing and "Profile DNA Sync", you need to create an app in the Meta Developer Portal and configure your environment variables.

## 1. Create a Meta Developer App
1. Go to the [Meta Developer Portal](https://developers.facebook.com/).
2. Click **My Apps** -> **Create App**.
3. Select **Other** -> **App Type: Business** or **Consumer** (typically Business for publishing).
4. Give it a name: `CaptionFlow`.

## 2. Add Products to your App
1. In the App Dashboard, find **Instagram Graph API** and click **Set Up**.
2. Also find **Facebook Login for Business** and click **Set Up**.
   - **Note**: For professional publishing, Instagram auth actually goes through the Facebook Login flow.

## 3. Configure Redirect URIs
In the **Facebook Login for Business** -> **Settings**, add the following Valid OAuth Redirect URIs:

- **Local Development**: `http://localhost:3000/api/auth/social/instagram/callback`
- **Staging**: `https://cf.pawelrzepecki.com/api/auth/social/instagram/callback`
- **Production**: `https://captionflow.xyz/api/auth/social/instagram/callback`

## 4. Get App Credentials
1. Go to **Settings** -> **Basic**.
2. Copy your **App ID** and **App Secret**.

## 5. Configure Environment Variables
Add these to your Vercel Dashboard (and `.env.local` for testing):

```env
INSTAGRAM_CLIENT_ID=your_app_id
INSTAGRAM_CLIENT_SECRET=your_app_secret
```

---

## Permission Notes
To publish on behalf of users, your app will eventually need:
- `instagram_basic`
- `instagram_content_publish`
- `pages_show_list` (needed to find the Instagram account linked to a Facebook Page)

For testing (Development Mode), you can add your own account as a **Test User** in the Meta portal without needing a full App Review.
