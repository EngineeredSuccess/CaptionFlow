# 🔗 LinkedIn OAuth 2.0 Setup Guide

Follow these steps to connect CaptionFlow to the LinkedIn Developer Portal and enable automated posting.

## 1. Create a LinkedIn App
1. Go to the **[LinkedIn Developer Portal](https://www.linkedin.com/developers/)**.
2. Click **Create app**.
3. Fill in the app details:
   - **App Name**: CaptionFlow
   - **LinkedIn Page**: Link your official company page (required by LinkedIn).
   - **App Logo**: Upload the `logo_2.png` file.
4. Verify your app by clicking the verification link sent to your LinkedIn Page's administrator.

## 2. Enable Products
In the **Products** tab of your app, you MUST add these two products:

1.  **Sign In with LinkedIn using OpenID Connect**:
    - Essential for logging in and fetching your profile name/ID.
2.  **Share on LinkedIn**:
    - Essential for the app to post captions directly to your profile.

> [!IMPORTANT]
> The "Share on LinkedIn" product might require a short review or a checkbox confirmation. Ensure its status is **"Added"** before testing.

## 3. Configure Authentication
Go to the **Auth** tab:

### 🔑 Credentials
- Copy the **Client ID**.
- Copy the **Client Secret**.

### 🌐 Authorized Redirect URLs
Click the edit icon in the **OAuth 2.0 settings** section and add this exact URL:
`https://captionflow.xyz/api/auth/social/linkedin/callback`

> [!TIP]
> If you are testing locally, also add:
> `http://localhost:3000/api/auth/social/linkedin/callback`

## 4. Update Environment Variables
Add the credentials to your Vercel Environment Variables (or `.env.local`):

| Variable Name | Value |
| :--- | :--- |
| `LINKEDIN_CLIENT_ID` | *Your Client ID* |
| `LINKEDIN_CLIENT_SECRET` | *Your Client Secret* |

---

## 📝 Verification Checklist
- [ ] App is verified via LinkedIn Page.
- [ ] Both "Sign In" and "Share" products are in **"Added"** status.
- [ ] Redirect URL in LinkedIn matches the one in `.env.local`.
- [ ] You have redeployed on Vercel after adding environment variables.
