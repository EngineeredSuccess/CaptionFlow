'use client';

import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'] });

export default function PrivacyPage() {
    return (
        <div className={`min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8 ${outfit.className}`}>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Last updated: April 20, 2026
                    </p>
                </div>

                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-foreground/80">
                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
                        <p>
                            CaptionFlow (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) collects information to provide better services to our users. The types of information we collect include:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li><strong>Account Information:</strong> Name, email address, and profile picture when you sign up via Google or Email.</li>
                            <li><strong>Content Data:</strong> The descriptions and images you provide to generate captions.</li>
                            <li><strong>Social Media Data:</strong> When you connect social accounts (Instagram, TikTok, LinkedIn, Twitter), we store OAuth tokens and basic profile information (handles, profile pictures) as permitted by the respective platforms.</li>
                            <li><strong>AI Analysis Data:</strong> We may analyze your public social media posts to create a &quot;Profile DNA&quot; that helps our AI generate content in your specific voice.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Information</h2>
                        <p>We use the collected information for the following purposes:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>To provide, maintain, and improve our caption generation services.</li>
                            <li>To personalize your experience by learning your brand voice.</li>
                            <li>To process payments and manage your subscription via Stripe.</li>
                            <li>To communicate with you about service updates and promotional offers.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">3. Data Sharing and Disclosure</h2>
                        <p>
                            We do not sell your personal data. We share information only with service providers that help us run the application, including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li><strong>OpenAI:</strong> To process your descriptions and generate AI content.</li>
                            <li><strong>Supabase:</strong> For database storage and authentication.</li>
                            <li><strong>Stripe:</strong> For secure payment processing.</li>
                            <li><strong>Resend:</strong> For sending transactional emails.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">4. Your Data Rights</h2>
                        <p>
                            You have the right to access, update, or delete your personal information at any time. You can disconnect your social media accounts through the Settings dashboard, which will revoke our access tokens immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">5. Security</h2>
                        <p>
                            We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet or electronic storage is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">6. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at support@captionflow.xyz.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
