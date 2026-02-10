import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  Zap, 
  Target, 
  Clock, 
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  Shield,
  Instagram,
  Twitter,
  Linkedin
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Now 75% Cheaper Than EasyGen</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                AI Captions That Sound Like{' '}
                <span className="text-yellow-300">You</span>,
                <br />
                Not a Robot
              </h1>
              
              <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-xl">
                Generate engaging social media captions in seconds. Train the AI on your brand voice for authentic, conversion-focused content.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-bold">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                    View Pricing
                  </Button>
                </Link>
              </div>
              
              <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>10 free captions/day</span>
                </div>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-2">Describe your post...</p>
                      <p className="text-gray-800">A sunset photo of coffee ☕</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-sm text-gray-600 mb-1">Generated Caption:</p>
                      <p className="text-gray-800">
                        Nothing beats a good cup of coffee to start your day ☕✨
                      </p>
                      <p className="text-blue-600 text-sm mt-2">
                        #coffee #morning #coffeelover #goodvibes #sunrise
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-gray-900">2,000+</span> creators trust CaptionFlow
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-500 text-sm mb-6">TRUSTED BY CREATORS ON</p>
          <div className="flex items-center justify-center gap-8 opacity-50">
            <Instagram className="w-8 h-8" />
            <Twitter className="w-8 h-8" />
            <Linkedin className="w-8 h-8" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need to Create Engaging Content
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stop struggling with writer&apos;s block. Let AI handle the captions while you focus on creating great content.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sparkles className="w-8 h-8 text-blue-500" />}
              title="AI-Powered Generation"
              description="Generate captions in seconds with GPT-4o-mini. Just describe your content and get multiple options instantly."
            />
            
            <FeatureCard
              icon={<Target className="w-8 h-8 text-purple-500" />}
              title="Brand Voice Training"
              description="Upload 3-5 example captions and the AI learns your unique style, tone, and vocabulary."
            />
            
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-green-500" />}
              title="Optimized Hashtags"
              description="Get 10-15 relevant hashtags per caption. Mix of popular and niche tags for maximum reach."
            />
            
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-yellow-500" />}
              title="Multi-Platform Support"
              description="One tool for Instagram, TikTok, LinkedIn, and Twitter. Platform-specific formatting included."
            />
            
            <FeatureCard
              icon={<Clock className="w-8 h-8 text-red-500" />}
              title="Save Hours Weekly"
              description="What used to take 30 minutes now takes 30 seconds. Batch create captions for the week ahead."
            />
            
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-indigo-500" />}
              title="Authentic Results"
              description="No generic AI-sounding captions. Our prompts are engineered for natural, engaging content."
            />
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Creators Choose CaptionFlow Over EasyGen
            </h2>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-3 gap-0">
              <div className="p-6 bg-gray-50 border-b md:border-b-0 md:border-r font-semibold text-gray-700">
                Feature
              </div>
              <div className="p-6 bg-gray-50 border-b md:border-b-0 md:border-r text-center">
                <span className="font-bold text-red-500">EasyGen</span>
              </div>
              <div className="p-6 bg-blue-50 text-center">
                <span className="font-bold text-blue-600">CaptionFlow</span>
              </div>
              
              {[
                ['Pricing', '$59.99 for add-ons', '$15/month unlimited'],
                ['Brand Voice', 'Weak/none', '5 examples training'],
                ['Hashtags', 'Random/generic', 'AI-optimized (10-15)'],
                ['Platforms', 'IG & TikTok only', 'IG, TikTok, LinkedIn, Twitter'],
                ['Scheduling', 'Not available', 'Basic scheduling'],
                ['UI Speed', 'Clunky, multi-step', 'Single-page, fast'],
              ].map(([feature, easygen, captionflow], idx) => (
                <>
                  <div key={`f-${idx}`} className="p-6 border-t md:border-r font-medium">
                    {feature}
                  </div>
                  <div key={`e-${idx}`} className="p-6 border-t md:border-r text-center text-gray-600">
                    {easygen}
                  </div>
                  <div key={`c-${idx}`} className="p-6 border-t text-center text-green-600 font-semibold">
                    {captionflow}
                  </div>
                </>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              From idea to published post in 3 simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Describe Your Content"
              description="Tell us what your photo or video is about. A sunset, your morning coffee, a product showcase - anything!"
            />
            <StepCard
              number="2"
              title="AI Generates Options"
              description="Our AI creates engaging captions with optimized hashtags. Choose your favorite or regenerate for more options."
            />
            <StepCard
              number="3"
              title="Copy & Post"
              description="Copy your caption with one click and paste it directly into Instagram, TikTok, LinkedIn, or Twitter."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Loved by Content Creators
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="CaptionFlow saved me 5+ hours per week. The brand voice training is game-changing - my captions actually sound like me now!"
              author="Sarah M."
              role="Instagram Creator, 50K followers"
            />
            <TestimonialCard
              quote="I was paying $60/month for EasyGen's add-ons. CaptionFlow gives me more features for $15. Absolute no-brainer."
              author="James K."
              role="TikTok Creator, 120K followers"
            />
            <TestimonialCard
              quote="The hashtag optimization alone is worth it. My engagement increased 40% since switching to CaptionFlow."
              author="Emily R."
              role="Lifestyle Blogger"
            />
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Transform Your Social Media Game?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Start free with 10 captions per day. Upgrade to Pro for unlimited captions and brand voice training.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-bold">
                Get Started Free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                See All Plans
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Free 14-day Pro trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <FAQItem
              question="Is it really 75% cheaper than EasyGen?"
              answer="Yes! EasyGen charges $59.99 for additional post packages on top of their base price. CaptionFlow Pro is just $15/month for unlimited everything - no hidden fees or add-ons."
            />
            <FAQItem
              question="How does the brand voice training work?"
              answer="Upload 3-5 captions that represent your writing style. Our AI analyzes your vocabulary, sentence structure, tone, and patterns. When generating new captions, it matches your unique voice so content sounds authentically like you."
            />
            <FAQItem
              question="Can I use it for multiple platforms?"
              answer="Absolutely! CaptionFlow supports Instagram, TikTok, LinkedIn, and Twitter. The AI adapts captions for each platform's best practices - shorter for TikTok, professional for LinkedIn, etc."
            />
            <FAQItem
              question="What happens when I hit the free limit?"
              answer="Free users get 10 captions per day. Once you reach that limit, you'll need to wait until the next day (resets at midnight UTC) or upgrade to Pro for unlimited generation."
            />
            <FAQItem
              question="Is there a lifetime deal available?"
              answer="Yes! We're offering a limited-time lifetime Pro plan for $79 (one-time payment). This is only available to the first 100 customers. Check our pricing page for availability."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-blue-500" />
                <span className="text-white text-xl font-bold">CaptionFlow</span>
              </div>
              <p className="text-sm">
                AI-powered social media captions that sound like you, not a robot.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/caption-generator" className="hover:text-white">Caption Generator</Link></li>
                <li><Link href="/brand-voice" className="hover:text-white">Brand Voice</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} CaptionFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <Card className="bg-white/10 border-white/20">
      <CardContent className="p-6">
        <MessageSquare className="w-8 h-8 text-blue-400 mb-4" />
        <p className="text-white/90 mb-4 italic">&ldquo;{quote}&rdquo;</p>
        <div>
          <p className="text-white font-semibold">{author}</p>
          <p className="text-white/60 text-sm">{role}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-gray-200 pb-4">
      <h3 className="font-semibold text-lg mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}
