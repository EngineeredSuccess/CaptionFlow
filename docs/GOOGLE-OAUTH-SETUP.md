# Google OAuth Setup Guide

## Overview
CaptionFlow supports Sign in with Google. This guide walks you through setting up Google OAuth in your Supabase project.

## Steps to Configure

### 1. Go to Supabase Dashboard
- Navigate to: https://supabase.com/dashboard/project/qkgcdcxnmwdvaeibxrbu
- Sign in to your account

### 2. Enable Google Provider
1. Go to **Authentication** → **Providers**
2. Find **Google** in the list
3. Toggle to **Enabled**
4. Set the following:
   - **Client ID**: (from Google Cloud Console)
   - **Secret**: (from Google Cloud Console)
   - **Redirect URL**: https://qkgcdcxnmwdvaeibxrbu.supabase.co/auth/v1/callback

### 3. Get Google OAuth Credentials

#### Create Google Cloud Project
1. Go to: https://console.cloud.google.com/
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**

#### Create OAuth 2.0 Credentials
1. Click **Create Credentials** → **OAuth client ID**
2. Select **Web application**
3. Configure:
   - **Name**: CaptionFlow
   - **Authorized JavaScript origins**:
     - http://localhost:3000 (for development)
     - https://captionflow.xyz (for production)
   - **Authorized redirect URIs**:
     - https://qkgcdcxnmwdvaeibxrbu.supabase.co/auth/v1/callback

4. Click **Create**
5. Copy the **Client ID** and **Client Secret**

### 4. Configure in Supabase
1. Paste the Client ID and Client Secret in Supabase Google Provider settings
2. Click **Save**

### 5. Test Locally
1. Run the app: `npm run dev`
2. Go to http://localhost:3000/login
3. Click "Continue with Google"
4. Should redirect to Google sign-in, then back to the app

### 6. Deploy
1. Deploy to Vercel
2. Update Google Cloud Console with production URLs:
   - Add: https://captionflow.xyz to Authorized JavaScript origins
   - The redirect URI stays the same (Supabase handles it)

## How It Works

1. User clicks "Continue with Google" on login/register page
2. Supabase redirects to Google's OAuth consent screen
3. User authenticates with Google
4. Google redirects back to Supabase callback URL
5. Supabase creates/updates user session
6. Our `/api/auth/callback` route receives the session
7. If new user: Creates record in `users` table
8. Redirects to `/caption-generator`

## Troubleshooting

### "Invalid client"
- Check Client ID is correct in Supabase
- Verify Authorized JavaScript origins include your domain

### "Redirect URI mismatch"
- Ensure the Supabase callback URL is in Google's Authorized redirect URIs
- Format: https://[project-ref].supabase.co/auth/v1/callback

### "User not found" error when creating captions
- This happens if the user record wasn't created in the database
- The `/api/auth/callback` route should automatically create the user
- Check browser console and Vercel logs for errors
- Make sure the `users` table exists in Supabase

### CORS errors
- Make sure your domain is in Google's Authorized JavaScript origins
- Both http://localhost:3000 and your production domain

## Security Notes

- Never commit Google Client Secret to git
- Use environment variables for any sensitive data
- The Google Client ID can be public (used in frontend)
- Always use HTTPS in production
- Review Google's OAuth security best practices: https://developers.google.com/identity/protocols/oauth2

## Additional Resources

- [Supabase Google Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Setting up OAuth 2.0](https://support.google.com/cloud/answer/6158849)
