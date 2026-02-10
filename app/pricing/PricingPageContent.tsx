'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Users, Loader2, X } from 'lucide-react';
import { createClient } from '@/shared/lib/supabase/client';
import { User } from '@supabase/supabase-js';

const PRICING_TIERS = [
  {
    name: 'Free',
    price: 0,
    priceId: null,
    description: 'Perfect for trying out CaptionFlow',
    features: [
      '10 captions per day',
      'Basic hashtag optimization (5 tags)',
      'Instagram & TikTok support',
      'Save up to 50 captions',
      'Email support',
    ],
    notIncluded: [
      'Brand voice training',
      'All platforms',
      'Priority speed',
      'Team collaboration',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: 15,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    description: 'Best for individual creators',
    features: [
      'Unlimited captions',
      'AI-optimized hashtags (10-15 tags)',
      'All platforms: IG, TikTok, LinkedIn, Twitter',
      'Brand voice training (5 examples)',
      'Unlimited saved captions',
      'Priority generation speed',
      'Email support',
    ],
    notIncluded: ['Team collaboration'],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Team',
    price: 39,
    priceId: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID,
    description: 'For teams and agencies',
    features: [
      'Everything in Pro',
      '5 team members',
      'Shared caption library',
      'Team analytics dashboard',
      'Priority support',
      'Admin controls',
    ],
    notIncluded: [],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function PricingPageContent() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // Check for success/canceled params
    if (searchParams.get('success')) {
      setShowSuccess(true);
    }
    if (searchParams.get('canceled')) {
      setShowCanceled(true);
    }

    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('users')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setCurrentTier(data.subscription_tier);
        }
      }
    };

    getUser();
  }, [searchParams, supabase]);

  const handleCheckout = async (tier: typeof PRICING_TIERS[0]) => {
    if (!user) {
      window.location.href = '/register?redirect=/pricing';
      return;
    }

    if (!tier.priceId) {
      // Free tier - already on it
      return;
    }

    setIsLoading(tier.name);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: tier.priceId,
          tier: tier.name.toLowerCase(),
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Choose the plan that works for you. All plans include a 14-day free trial.
          </p>
          
          {/* Comparison Badge */}
          <div className="mt-8 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
            <span className="text-sm font-medium">
              💰 75% cheaper than EasyGen
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {showSuccess && (
        <div className="max-w-6xl mx-auto px-4 mt-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">Welcome to Pro!</p>
                <p className="text-sm text-green-700">Your subscription is now active.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSuccess(false)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {showCanceled && (
        <div className="max-w-6xl mx-auto px-4 mt-8">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-full">
                <X className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-amber-900">Checkout Canceled</p>
                <p className="text-sm text-amber-700">No worries! You can upgrade anytime.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowCanceled(false)}
              className="text-amber-600 hover:text-amber-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {PRICING_TIERS.map((tier) => (
            <Card 
              key={tier.name}
              className={`relative ${tier.popular ? 'border-blue-500 border-2 shadow-xl scale-105' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {tier.name === 'Free' && <Sparkles className="w-5 h-5 text-gray-400" />}
                  {tier.name === 'Pro' && <Zap className="w-5 h-5 text-blue-500" />}
                  {tier.name === 'Team' && <Users className="w-5 h-5 text-purple-500" />}
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                </div>
                
                <div className="mb-2">
                  <span className="text-5xl font-bold">${tier.price}</span>
                  {tier.price > 0 && <span className="text-gray-500">/month</span>}
                </div>
                
                <p className="text-sm text-gray-600">{tier.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <ul className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {tier.notIncluded.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => handleCheckout(tier)}
                  disabled={isLoading === tier.name || currentTier === tier.name.toLowerCase()}
                  className={`w-full ${
                    tier.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : tier.name === 'Free' 
                        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' 
                        : ''
                  }`}
                  size="lg"
                >
                  {isLoading === tier.name ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : currentTier === tier.name.toLowerCase() ? (
                    'Current Plan'
                  ) : tier.name === 'Team' ? (
                    tier.cta
                  ) : (
                    tier.cta
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can cancel your subscription at any time. You&apos;ll continue to have access 
                  until the end of your billing period.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens when I hit the free limit?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Free users get 10 captions per day. Once you reach that limit, you&apos;ll need to 
                  wait until the next day or upgrade to Pro for unlimited captions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does brand voice training work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Pro users can upload 3-5 example captions that showcase their writing style. 
                  The AI analyzes these examples and generates new captions that match your 
                  unique voice, tone, and vocabulary.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a lifetime deal?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! For a limited time, we&apos;re offering a lifetime Pro plan for $79 (one-time payment). 
                  This is only available to the first 100 customers. Contact us for details.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 mb-4">Trusted by content creators worldwide</p>
          <div className="flex items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="text-sm">Secure SSL</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="text-sm">PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="text-sm">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
