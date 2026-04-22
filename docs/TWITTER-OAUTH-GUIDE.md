# 🐦 X (Twitter) OAuth 2.0 Setup Guide

Follow these steps to connect CaptionFlow to the X Developer Portal and enable automated posting (tweets).

## 1. Create a Project and App
1. Go to the **[X Developer Portal](https://developer.twitter.com/en/portal/dashboard)**.
2. If you don't have one, create a **Project** (e.g., "CaptionFlow Project").
3. Inside the Project, create a new **App** (e.g., "CaptionFlow").
4. Click on the **App Settings** (gear icon) for your new app.

## 2. Set Up User Authentication
This is the most important part. Scroll down to the **User authentication settings** section and click **Set up**.

### ⚙️ App Settings
- **App Type**: Select **Web App, Native App**.
- **App Permissions**: Select **Read and Write and Offline access**. 
  - *Offline access* is required to receive a refresh token so the user doesn't have to re-login every time.

### 🌐 OAuth 2.0 Settings
- **Callback URI / Redirect URL**: Use this exact URL:
  `https://captionflow.xyz/api/auth/social/twitter/callback`
- **Website URL**: `https://captionflow.xyz`
- **Terms of Service URL**: `https://captionflow.xyz/terms`
- **Privacy Policy URL**: `https://captionflow.xyz/privacy`

Click **Save**.

## 3. Get Your Credentials
Go to the **Keys and tokens** tab:

### 🔑 OAuth 2.0 Client ID and Client Secret
Scroll down to the **OAuth 2.0 Client ID and Client Secret** section.
- Copy the **Client ID**.
- Copy the **Client Secret**.

> [!IMPORTANT]
> Do NOT use the "API Key" or "API Secret" from the top of the page. You specifically need the **OAuth 2.0** credentials.

## 4. Update Environment Variables
Add the credentials to your Vercel Environment Variables (or `.env.local`):

| Variable Name | Value |
| :--- | :--- |
| `TWITTER_CLIENT_ID` | *Your Client ID* |
| `TWITTER_CLIENT_SECRET` | *Your Client Secret* |

---

## 📝 Verification Checklist
- [ ] Authentication Settings are set to **Read and Write and Offline access**.
- [ ] Redirect URL matches exactly.
- [ ] You are using the **OAuth 2.0** Client ID/Secret (not the legacy API keys).
- [ ] You have redeployed on Vercel after adding environment variables.

## ⚠️ Free Tier Note
If you are on the **Free** tier of the X API, you are limited to **50 tweets per month** per app. For higher limits, you would need the **Basic** tier ($100/mo).
