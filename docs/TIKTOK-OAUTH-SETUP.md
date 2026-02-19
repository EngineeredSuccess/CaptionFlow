# TikTok OAuth Setup Guide

To enable TikTok integration for CaptionFlow, you need to configure a TikTok Developer App and set the correct environment variables.

## 1. Create a TikTok Developer App

1.  Go to the [TikTok for Developers](https://developers.tiktok.com/) portal.
2.  Log in with your **TikTok account**.
3.  Click **"My Apps"** -> **"Connect a new app"**.
4.  Fill in the app details:
    *   **App Name**: CaptionFlow (or your app name)
    *   **Category**: Tools & Utilities (or similar)
    *   **Description**: A social media scheduling tool that allows users to post content.
5.  Click **"Create App"**.

## 2. Configure Products

TikTok apps require specific "Products" to be added and approved.

1.  In your app dashboard, look for **"Products"** on the left.
2.  Click **"Add Product"**.
3.  Add **"Login Kit"**:
    *   This is required for "Log in with TikTok".
    *   It gives access to `user.info.basic`.
4.  Add **"TikTok API"**:
    *   This is required for publishing videos.
    *   It gives access to `video.publish`.

## 3. Configuration

### Basic Display (Login Kit)
1.  Go to **"Login Kit"** in the sidebar.
2.  **Redirect URI**: Add the following URLs (make sure to click "Add"):
    *   **Production**: `https://captionflow.xyz/api/auth/social/tiktok/callback`
    *   **Staging**: `https://cf.pawelrzepecki.com/api/auth/social/tiktok/callback`
    *   **Local**: `http://localhost:3000/api/auth/social/tiktok/callback`
3.  **Scopes**: Ensure `user.info.basic` is selected.

### TikTok API (Publishing)
1.  Go to **"TikTok API"** in the sidebar.
2.  **Scopes**: Ensure `video.publish` is selected.
    *   *Note: Publishing permissions usually require a rigorous app review process by TikTok before they work for public users. For development, you might be able to use your own account if added as a tester.*

## 4. Get Credentials

1.  Go to **"App Settings"** -> **"Basic Information"**.
2.  Find your **Client Key** and **Client Secret**.

## 5. Add Environment Variables

Add these keys to your **Vercel Project Settings** (and local `.env.local` file):

| Variable | Value |
| :--- | :--- |
| `TIKTOK_CLIENT_ID` | (Your **Client Key**) |
| `TIKTOK_CLIENT_SECRET` | (Your **Client Secret**) |

> **Note**: TikTok uses the term "Client Key", but our code maps it to `TIKTOK_CLIENT_ID`.

## 6. Submit for Review (Later)
TikTok requires a review process before your app can be used by the public. You will likely need to provide a screencast of the integration working.
