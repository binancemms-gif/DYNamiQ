export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'author';
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  featured_image: string;
  author_name: string;
  author_avatar?: string;
  category_slug: string;
  read_time_minutes: number;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  is_lead_story: number;
  is_featured: number;
  source_urls?: string;
  seo_title?: string;
  seo_description?: string;
  social_image?: string;
  published_at: string;
  updated_at: string;
  tags?: string;
}

export interface Founder {
  id: string;
  slug: string;
  name: string;
  company: string;
  role_title: string;
  bio: string;
  portrait_url: string;
  website_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  key_takeaway?: string;
  fundraising_stage?: string;
  interview_notes?: string;
  is_featured: number;
  created_at: string;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo_url: string;
  description: string;
  industry: string;
  founder_name?: string;
  website_url: string;
  is_featured: number;
  is_sponsored: number;
  sponsored_disclosure?: string;
  coverage_summary?: string;
  created_at: string;
}

export interface Podcast {
  id: string;
  slug: string;
  title: string;
  episode_number: number;
  guest_name: string;
  guest_role: string;
  host_name: string;
  description: string;
  thumbnail_url: string;
  embed_url?: string;
  audio_url?: string;
  source_url?: string;
  duration: string;
  transcript?: string;
  status: string;
  published_at: string;
}

export interface CultureMeme {
  id: string;
  title: string;
  image_url: string;
  caption: string;
  attribution?: string;
  source_url?: string;
  likes_count: number;
  created_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  source: string;
  status: string;
  consent: number;
  created_at: string;
}

export interface Inquiry {
  id: string;
  company: string;
  contact_name: string;
  email: string;
  campaign_type: string;
  budget_range: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
}

export interface HomepageConfig {
  id: string;
  hero_headline: string;
  hero_subcopy: string;
  hero_cta_primary_text: string;
  hero_cta_primary_link: string;
  hero_cta_secondary_text: string;
  hero_cta_secondary_link: string;
  lead_story_id?: string;
  section_order: string[];
  visible_sections: Record<string, boolean>;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  alt_text?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  details?: string;
  timestamp: string;
}

export interface BootstrapData {
  categories: Category[];
  homepage_config: HomepageConfig | null;
  lead_story: Article | null;
  featured_stories: Article[];
  latest_articles: Article[];
  founders: Founder[];
  brands: Brand[];
  podcasts: Podcast[];
  culture_memes: CultureMeme[];
  settings: Record<string, string>;
}
