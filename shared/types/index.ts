// Caption types
export interface Caption {
  id: string;
  user_id: string;
  content: string;
  hashtags: string[];
  platform: string[];
  tone: string;
  brand_voice_id: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  is_public: boolean;
}

// Brand Voice types
export interface BrandVoice {
  id: string;
  user_id: string;
  example_1: string | null;
  example_2: string | null;
  example_3: string | null;
  example_4: string | null;
  example_5: string | null;
  selected_tone: string;
  updated_at: string;
}

// User types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  stripe_customer_id: string | null;
  subscription_tier: 'free' | 'pro' | 'team';
  subscription_status: string;
  subscription_id: string | null;
  current_period_end: string | null;
  daily_caption_count: number;
  last_reset_date: string | null;
  preferences: Record<string, unknown>;
}

// API Request types
export interface GenerateCaptionRequest {
  description: string;
  tone: 'casual' | 'professional' | 'funny' | 'edgy' | 'witty';
  platform: ('instagram' | 'tiktok' | 'linkedin' | 'twitter')[];
  brandVoiceId?: string;
  numHashtags?: number;
}

export interface SaveBrandVoiceRequest {
  examples: string[];
  selectedTone: 'casual' | 'professional' | 'funny' | 'edgy' | 'witty';
}
