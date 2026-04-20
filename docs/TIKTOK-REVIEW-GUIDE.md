# TikTok App Review Preparation Guide

This guide contains all the information and assets you need to submit **CaptionFlow** for review on the TikTok Developer Portal.

## 1. App Basic Information
- **App Name**: CaptionFlow
- **App Description**: CaptionFlow is an AI-powered social media assistant that helps creators generate engaging captions, hashtags, and hooks. It analyzes the user's previous content style ("Profile DNA Sync") to ensure the AI-generated content sounds authentic and matches their brand voice.
- **Logo**: Use the `public/favicon.ico` or a high-res version of the Sparkles logo (512x512 PNG required).

## 2. Essential URLs
- **Privacy Policy URL**: `https://captionflow.xyz/privacy`
- **Terms of Service URL**: `https://captionflow.xyz/terms`
- **Redirect URI**: `https://captionflow.xyz/api/auth/social/tiktok/callback`

## 3. Scopes & Usage Descriptions
When TikTok asks why you need specific scopes, use these descriptions:

| Scope | Usage Description for Reviewer |
|-------|-------------------------------|
| `user.info.basic` | Used to identify the creator and display their profile handle/avatar within the CaptionFlow dashboard for account management. |
| `video.list` | Used to fetch the descriptions of the creator's 5 most recent videos. This data is processed by our AI to learn the user's unique writing style (Tone, Hook Style) for more authentic caption generation. |
| `video.publish` | Allows users to directly publish or schedule their generated AI captions alongside their videos to TikTok directly from our platform. |

## 4. Demo Video Requirements
TikTok **requires** a demo video. Your video should show:
1. The user clicking "Connect TikTok" on the CaptionFlow Settings page.
2. The TikTok OAuth consent screen showing the requested scopes.
3. The user successfully being redirected back to CaptionFlow.
4. (Optional) A caption being generated using the "Brand Voice" learned from TikTok.

## 5. Site Verification
We have already implemented the site verification file at:
`https://captionflow.xyz/tiktok-developers-site-verification.txt`

If TikTok asks you to update the code, you can find the file here:
`app/tiktok-developers-site-verification.txt/route.ts`

---

## Technical Checklist
- [x] Redirect URIs configured in TikTok Console.
- [x] Scopes `user.info.basic`, `video.publish`, `video.list` requested in console.
- [x] Webhook endpoint (optional) not required for initial review.
