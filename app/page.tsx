import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Zap,
  Target,
  Clock,
  CheckCircle2,
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
      <section className="relative overflow-hidden bg-white dark:bg-zinc-950 pt-16 pb-32 lg:pt-32 lg:pb-48">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-primary mb-2">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>The All-in-One Social AI</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] text-zinc-900 dark:text-zinc-50">
                Captions That Sound Like{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                  You
                </span>,
                <br />
                Across Every Platform
              </h1>

              <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Stop struggling with writer&apos;s block. Let AI handle the captions while you focus on creating great content.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-2xl bg-primary shadow-xl shadow-primary/25 hover:scale-[1.02] transition-transform">
                    Start Creating Free
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-2xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                    View Pricing
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 justify-center lg:justify-start text-sm font-medium text-zinc-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>10 free captions/day</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <Badge variant="outline" className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                    Live Generation
                  </Badge>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Input Prompt</p>
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300">
                      Exploring a hidden coffee shop in Kyoto ☕✨
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">CaptionFlow AI</p>
                    <div className="bg-primary/5 dark:bg-primary/10 p-5 rounded-xl border border-primary/10 dark:border-primary/20">
                      <p className="text-zinc-900 dark:text-zinc-100 font-medium mb-3">
                        Tucked away in the quiet streets of Kyoto... Found this little slice of caffeine heaven. 🇯🇵☕ Sometimes the best journey is the one you didn&apos;t plan.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-primary text-sm font-semibold">#kyoto</span>
                        <span className="text-primary text-sm font-semibold">#coffeewanderer</span>
                        <span className="text-primary text-sm font-semibold">#hiddengems</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 border-4 border-white dark:border-zinc-900 shadow-sm"
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-zinc-500">
                    Join <span className="text-zinc-900 dark:text-zinc-100 font-bold">2,400+</span> creators
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] mb-10">Optimized For Every Platform</p>
          <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-24 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <div className="flex items-center gap-2">
              <Instagram className="w-8 h-8" />
              <span className="hidden sm:inline font-bold">Instagram</span>
            </div>
            <div className="flex items-center gap-2">
              <Twitter className="w-8 h-8" />
              <span className="hidden sm:inline font-bold">Twitter / X</span>
            </div>
            <div className="flex items-center gap-2">
              <Linkedin className="w-8 h-8" />
              <span className="hidden sm:inline font-bold">LinkedIn</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-8 h-8" />
              <span className="hidden sm:inline font-bold">TikTok</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-50">
              Create Engaging Content in Record Time
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Focus on your craft, let us handle the writing. Optimized for engagement, conversion, and brand consistency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sparkles className="w-8 h-8 text-primary" />}
              title="AI-Powered Context"
              description="Our AI considers your image description, target platform, and specific goals to generate high-performing captions."
            />

            <FeatureCard
              icon={<Target className="w-8 h-8 text-purple-500" />}
              title="Brand Voice DNA"
              description="More than just tones—upload your past winning captions and the AI learns your unique vocabulary and rhythm."
            />

            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-emerald-500" />}
              title="Hashtag Intelligence"
              description="Get a perfect mix of trending and niche hashtags to maximize reach without looking like spam."
            />

            <FeatureCard
              icon={<Zap className="w-8 h-8 text-amber-500" />}
              title="Cross-Platform Adaptability"
              description="One idea, four platforms. Instantly adapt your caption for the specific etiquette of IG, TikTok, LinkedIn, or X."
            />

            <FeatureCard
              icon={<Clock className="w-8 h-8 text-rose-500" />}
              title="Rapid Batching"
              description="Create a week's worth of viral captions in under five minutes. Perfect for creators and agencies alike."
            />

            <FeatureCard
              icon={<Shield className="w-8 h-8 text-indigo-500" />}
              title="Authentic & Safe"
              description="Engineered to bypass generic AI filters and provide natural-sounding results that build real connection."
            />
          </div>
        </div>
      </section>

      {/* Value Proposition Section (Formerly Comparison) */}
      <section className="py-24 lg:py-32 bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              Why Creators Choose CaptionFlow
            </h2>
            <p className="text-lg text-zinc-500">The first AI tool built for actual content strategy, not just text generation.</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="grid md:grid-cols-3 gap-0">
              <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50 border-b md:border-b-0 md:border-r font-bold text-zinc-500 uppercase tracking-widest text-xs">
                Performance Metric
              </div>
              <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50 border-b md:border-b-0 md:border-r text-center font-bold text-zinc-400 capitalize">
                Generic AI Tools
              </div>
              <div className="p-8 bg-primary/5 dark:bg-primary/10 text-center">
                <span className="font-bold text-primary capitalize">CaptionFlow</span>
              </div>

              {[
                ['Brand Consistency', 'Needs endless prompts', 'Built-in Voice Training'],
                ['Social IQ', 'One-size-fits-all', 'Platform-specific native context'],
                ['Hashtag Quality', 'Static lists', 'AI-Optimized for discovery'],
                ['Workflow', 'Copy-paste routine', 'Seamless cross-posting flow'],
                ['Total Platforms', 'Usually limited to 1 or 2', 'Support for All major socials'],
                ['Value / Cost', 'Pay for credits', 'Fair, transparent flat-rate'],
              ].map(([feature, easygen, captionflow], idx) => (
                <div key={`row-${idx}`} className="contents group">
                  <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 md:border-r font-semibold text-zinc-900 dark:text-zinc-100">
                    {feature}
                  </div>
                  <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 md:border-r text-center text-zinc-400 italic">
                    {easygen}
                  </div>
                  <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 text-center text-primary font-bold bg-primary/5 dark:bg-primary/10">
                    {captionflow}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 lg:py-32 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              From Idea to Published Post
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              A workflow designed for creators, by creators.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16 relative">
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-zinc-100 dark:bg-zinc-800 hidden md:block" />
            <StepCard
              number="1"
              title="Prompt Your Intent"
              description="Tell us what you're posting. From a casual vlog to a high-ticket product launch, our AI gets the context."
            />
            <StepCard
              number="2"
              title="Select Your Channels"
              description="Pick the platforms you need. Our AI automatically reformats the length, tone, and hashtags for each one."
            />
            <StepCard
              number="3"
              title="Post with Confidence"
              description="Review your generated options, copy them with a single click, and watch your engagement grow."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-32 bg-zinc-900 dark:bg-black text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full scale-150 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">Trusted by Performance Creators</h2>
            <p className="text-zinc-400 text-lg">Join the thousands of influencers and managers scaling their content.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="CaptionFlow saved me 5+ hours per week. The brand voice training is game-changing—my captions actually sound like me now!"
              author="Sarah M."
              role="Instagram Creator @sarahcreates"
            />
            <TestimonialCard
              quote="I was tired of generic AI tools that just didn't get my style. CaptionFlow is different—it adapts to the specific platform perfectly."
              author="James K."
              role="Productivity Lead, 120K followers"
            />
            <TestimonialCard
              quote="The hashtag optimization alone is worth the sub. My organic reach has genuinely increased since I started tools that actually know my niche."
              author="Emily R."
              role="Lifestyle & Tech Blogger"
            />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 lg:py-32 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.1)_100%)]" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-10 text-white">
          <h2 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Ready to Speak Your <br />
            <span className="text-zinc-900">Brand DNA?</span>
          </h2>
          <p className="text-2xl text-white/90 max-w-2xl mx-auto font-medium">
            Start free with 10 captions today. No complexity, just conversion.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
            <Link href="/register">
              <Button size="lg" className="h-16 px-12 text-xl font-bold rounded-2xl bg-white text-primary hover:bg-zinc-50 shadow-2xl transition-all hover:scale-105">
                Join Now For Free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="h-16 px-12 text-xl font-bold rounded-2xl border-white/40 text-white bg-transparent hover:bg-white/10 backdrop-blur-sm transition-all shadow-lg">
                See Unlimited Plans
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-10 text-sm font-bold opacity-80 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Full Pro Access Trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Cancel Instantly</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>No Card Needed</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 lg:py-32 bg-white dark:bg-zinc-950">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              Common Questions
            </h2>
            <p className="text-zinc-500">Everything you need to know about CaptionFlow.</p>
          </div>

          <div className="space-y-6">
            <FAQItem
              question="How is CaptionFlow different from ChatGPT?"
              answer="Broad AI knows everything, but it's not a social media expert. CaptionFlow uses specialized prompts engineered for conversion, automatically handles platform-specific formatting, and learns your specific Brand Voice through analysis of your own content."
            />
            <FAQItem
              question="How does the voice training work?"
              answer="You upload 3-5 of your best past captions. Our AI decomposes your sentence structure, vocabulary preferences, and emotional tone. It then applies this 'DNA' to every new caption it generates for you."
            />
            <FAQItem
              question="Can I really use it for LinkedIn and X too?"
              answer="Yes! We support the four pillars: Instagram, TikTok, LinkedIn, and X (Twitter). The AI adapts the style for each—professional and insight-driven for LinkedIn, punchy and thread-ready for X."
            />
            <FAQItem
              question="What happens when I hit my daily free limit?"
              answer="Free users get 10 high-quality generations every 24 hours. If you're a heavy creator, our Pro plan offers unlimited generations and advanced voice training tools."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-500 py-20 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="text-white text-2xl font-bold tracking-tight">CaptionFlow</span>
              </div>
              <p className="text-lg max-w-sm leading-relaxed">
                Empowering creators with AI that speaks their language. Authentic content, amplified.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Product</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link href="/caption-generator" className="hover:text-primary transition-colors">Generator</Link></li>
                <li><Link href="/brand-voice" className="hover:text-primary transition-colors">Brand DNA</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Legal</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} CaptionFlow. Built for creators.</p>
            <div className="flex gap-8">
              <span className="text-zinc-700">Twitter</span>
              <span className="text-zinc-700">LinkedIn</span>
              <span className="text-zinc-700">Instagram</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="h-full group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
      <CardContent className="p-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h3>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center space-y-6 relative group">
      <div className="w-16 h-16 bg-white dark:bg-zinc-900 border-2 border-primary text-primary rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-300">
        {number}
      </div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h3>
      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm rounded-3xl">
      <CardContent className="p-8 space-y-6">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <Sparkles key={i} className="w-4 h-4 text-primary fill-primary" />
          ))}
        </div>
        <p className="text-zinc-200 text-lg leading-relaxed italic">{quote}</p>
        <div className="pt-4 border-t border-white/10">
          <p className="text-white font-bold">{author}</p>
          <p className="text-zinc-500 text-sm font-medium">{role}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-primary/30 transition-colors">
      <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 mb-3">{question}</h3>
      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{answer}</p>
    </div>
  );
}
