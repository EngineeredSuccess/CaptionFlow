'use client';

import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'] });

export default function TermsPage() {
    return (
        <div className={`min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8 ${outfit.className}`}>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Last updated: April 20, 2026
                    </p>
                </div>

                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-foreground/80">
                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using CaptionFlow (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">2. Description of Service</h2>
                        <p>
                            CaptionFlow (&quot;the Service&quot;) is an AI-powered social media assistant that generates captions and hashtags based on user input. We provide tools for brand voice analysis and social media scheduling.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">3. User Accounts</h2>
                        <p>
                            To use certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">4. Subscriptions and Payments</h2>
                        <p>
                            Certain features require a paid subscription. All payments are processed securely via Stripe. Subscriptions automatically renew unless canceled at least 24 hours before the end of the current billing period.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">5. Content Ownership</h2>
                        <p>
                            You retain ownership of the content you input into the Service. We grant you a license to use the AI-generated captions for your own social media purposes. However, you are responsible for ensuring that the content adheres to the terms of the social media platforms (TikTok, Instagram, etc.) where it is published.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">6. Prohibited Conduct</h2>
                        <p>
                            You agree not to use the Service for any unlawful purpose or to generate content that is harmful, offensive, or violates the intellectual property rights of others.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">7. Termination</h2>
                        <p>
                            We reserve the right to suspend or terminate your account if you violate these Terms or for any other reason at our sole discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">8. Limitation of Liability</h2>
                        <p>
                            CaptionFlow is provided &quot;as is&quot; without warranties of any kind. We are not liable for any direct, indirect, or incidental damages arising from your use of the Service or any AI-generated content.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">9. Changes to Terms</h2>
                        <p>
                            We may update these Terms from time to time. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
