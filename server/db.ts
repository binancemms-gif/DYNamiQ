import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'dynamiq.db');
export const db = new Database(DB_PATH);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, key] = stored.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

export function initDatabase() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'editor', 'author')),
      avatar_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      color TEXT
    );

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      featured_image TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_avatar TEXT,
      category_slug TEXT NOT NULL,
      read_time_minutes INTEGER NOT NULL DEFAULT 4,
      status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('draft', 'published', 'scheduled', 'archived')),
      is_lead_story INTEGER NOT NULL DEFAULT 0,
      is_featured INTEGER NOT NULL DEFAULT 0,
      source_urls TEXT,
      seo_title TEXT,
      seo_description TEXT,
      social_image TEXT,
      published_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      tags TEXT
    );

    CREATE TABLE IF NOT EXISTS founders (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      role_title TEXT NOT NULL,
      bio TEXT NOT NULL,
      portrait_url TEXT NOT NULL,
      website_url TEXT,
      twitter_url TEXT,
      linkedin_url TEXT,
      key_takeaway TEXT,
      fundraising_stage TEXT,
      interview_notes TEXT,
      is_featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      logo_url TEXT NOT NULL,
      description TEXT NOT NULL,
      industry TEXT NOT NULL,
      founder_name TEXT,
      website_url TEXT NOT NULL,
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_sponsored INTEGER NOT NULL DEFAULT 0,
      sponsored_disclosure TEXT,
      coverage_summary TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS podcasts (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      episode_number INTEGER NOT NULL,
      guest_name TEXT NOT NULL,
      guest_role TEXT NOT NULL,
      host_name TEXT NOT NULL DEFAULT 'DYNamiQ Media Desk',
      description TEXT NOT NULL,
      thumbnail_url TEXT NOT NULL,
      embed_url TEXT,
      audio_url TEXT,
      source_url TEXT,
      duration TEXT NOT NULL,
      transcript TEXT,
      status TEXT NOT NULL DEFAULT 'published',
      published_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS culture_memes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      image_url TEXT NOT NULL,
      caption TEXT NOT NULL,
      attribution TEXT,
      source_url TEXT,
      likes_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      source TEXT NOT NULL DEFAULT 'footer',
      status TEXT NOT NULL DEFAULT 'active',
      consent INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      email TEXT NOT NULL,
      campaign_type TEXT NOT NULL,
      budget_range TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'in_progress', 'resolved')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS homepage_config (
      id TEXT PRIMARY KEY,
      hero_headline TEXT NOT NULL,
      hero_subcopy TEXT NOT NULL,
      hero_cta_primary_text TEXT NOT NULL,
      hero_cta_primary_link TEXT NOT NULL,
      hero_cta_secondary_text TEXT NOT NULL,
      hero_cta_secondary_link TEXT NOT NULL,
      lead_story_id TEXT,
      section_order TEXT NOT NULL,
      visible_sections TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      alt_text TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_email TEXT,
      action TEXT NOT NULL,
      details TEXT,
      timestamp TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
    CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_slug);
    CREATE INDEX IF NOT EXISTS idx_founders_slug ON founders(slug);
    CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
    CREATE INDEX IF NOT EXISTS idx_podcasts_slug ON podcasts(slug);
  `);

  // Seed default admin if none exists
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin') as { count: number };
  if (adminCount.count === 0) {
    const adminId = 'usr_admin_default';
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO users (id, email, name, password_hash, role, avatar_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      adminId,
      'admin@dynamiq.media',
      'Editorial Director',
      hashPassword('admin2026!'),
      'admin',
      '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
      now,
      now
    );
  }

  // Seed Categories
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (categoryCount.count === 0) {
    const defaultCategories = [
      { id: 'cat_startups', name: 'Startups', slug: 'startups', description: 'Early-stage execution, deep tech, and venture scaling.', color: '#C6FF53' },
      { id: 'cat_founders', name: 'Founders', slug: 'founders', description: 'Firsthand founder journeys, candid retrospectives, and playbook insights.', color: '#FFFFFF' },
      { id: 'cat_podcasts', name: 'Podcasts', slug: 'podcasts', description: 'Studio interviews, video dispatches, and tape from the trenches.', color: '#A1A1AA' },
      { id: 'cat_brands', name: 'Brand Radar', slug: 'brands', description: 'Breakthrough enterprises, brand architecture, and hardware innovators.', color: '#C6FF53' },
      { id: 'cat_culture', name: 'Culture', slug: 'culture', description: 'Startup memes, internet commentary, and cultural shifts in technology.', color: '#E4E4E7' },
      { id: 'cat_solana', name: 'Solana', slug: 'solana', description: 'High-throughput builder stories, state compression, and decentralized media.', color: '#14F195' }
    ];

    const insertCat = db.prepare(`
      INSERT OR IGNORE INTO categories (id, name, slug, description, color)
      VALUES (@id, @name, @slug, @description, @color)
    `);
    for (const cat of defaultCategories) {
      insertCat.run(cat);
    }
  }

  // Seed Homepage Configuration
  const hpConfig = db.prepare('SELECT * FROM homepage_config WHERE id = ?').get('main');
  if (!hpConfig) {
    const defaultSections = JSON.stringify([
      'hero',
      'featured_grid',
      'founder_files',
      'startup_news',
      'podcast_desk',
      'brand_radar',
      'internet_culture',
      'solana_community',
      'newsletter'
    ]);
    const defaultVisibility = JSON.stringify({
      hero: true,
      featured_grid: true,
      founder_files: true,
      startup_news: true,
      podcast_desk: true,
      brand_radar: true,
      internet_culture: true,
      solana_community: true,
      newsletter: true
    });

    db.prepare(`
      INSERT INTO homepage_config (
        id, hero_headline, hero_subcopy, hero_cta_primary_text, hero_cta_primary_link,
        hero_cta_secondary_text, hero_cta_secondary_link, lead_story_id, section_order,
        visible_sections, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'main',
      'The startup world doesn’t need more noise. It needs better stories.',
      'The founders building through uncertainty. The businesses solving real problems. The conversations that change how we think.',
      'Explore the stories',
      '#featured-stories',
      'Meet the founders',
      '/founders',
      'art_physical_ai_frontier',
      defaultSections,
      defaultVisibility,
      new Date().toISOString()
    );
  }

  // Seed Site Settings
  const defaultSettings: Record<string, string> = {
    brand_name: 'DYNamiQ',
    tagline: 'Stories in Motion.',
    editorial_slogan: 'Built by founders. Watched by everyone.',
    primary_color: '#C6FF53',
    logo_url: '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
    favicon_url: '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
    seo_title: 'DYNamiQ — Stories in Motion',
    seo_description: 'Global startup media and business culture publication. Discover founder stories, deep tech breakthroughs, podcasts, startup memes, and Solana builder updates.',
    solana_token_name: 'DYNamiQ Community Token',
    solana_token_ticker: '$DYN',
    solana_network: 'Solana Mainnet',
    solana_mint_address: '',
    solana_explorer_url: '',
    solana_token_disclosures: 'Community experiment token. Holds zero equity, zero governance rights, and zero investment promise. Never allocate capital you cannot afford to lose.',
    social_twitter: 'https://x.com/dynamiqmedia',
    social_youtube: 'https://youtube.com/@dynamiqmedia',
    social_linkedin: 'https://linkedin.com/company/dynamiqmedia',
    social_telegram: 'https://t.me/dynamiqmedia',
    newsletter_provider: 'Native DB + Webhook Ready',
    analytics_status: 'Ready for Plausible / Google Analytics 4 snippet'
  };

  const getSetting = db.prepare('SELECT value FROM site_settings WHERE key = ?');
  const setSetting = db.prepare('INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)');
  for (const [key, value] of Object.entries(defaultSettings)) {
    if (!getSetting.get(key)) {
      setSetting.run(key, value, new Date().toISOString());
    }
  }

  // Seed Expanded Roster of Articles (with INSERT OR IGNORE so no duplicate error)
  const articles = [
    {
      id: 'art_physical_ai_frontier',
      slug: 'physical-ai-hardtech-founders-escaping-saas-trap',
      title: 'The Physical AI Frontier: How Hard-Tech Founders Are Escaping the SaaS Trap',
      subtitle: 'When digital margins compressed, ambitious builders turned toward factory hangars, titanium tolerances, and autonomous actuators.',
      excerpt: 'Software multiples compressed, cloud margins peaked, and the brightest founders turned toward heavy steel, micro-actuators, and clean-sheet robotics. Inside the industrial spaces building tomorrow.',
      content: `### The Pivot From Code to Mass\n\nFor a decade, the venture gospel was clear: zero marginal cost, high retention, and cloud architectures. But in 2026, the intellectual frontier shifted violently toward the physical universe.\n\n"Software alone has hit a wall of diminishing returns," explains Elena Rostova, lead partner at Apex Frontier Ventures. "The most urgent civilizational bottlenecks—power grids, sub-millimeter surgical robotics, autonomous freight, and solid-state materials—cannot be resolved in a Figma mockup."\n\nAcross former aerospace hangars in El Segundo and converted industrial warehouses in Munich, a new generation of technical founders is trading JavaScript frameworks for high-precision CNC mills and multi-axis dynamometers.\n\n### Capital Allocation in the Heavy-Tech Renaissance\n\nRaising institutional capital for atoms has historically been fraught with long development cycles and manufacturing risk. Yet founders are adopting agile hardware methodologies:\n\n1. **Rapid Additive Prototyping**: Iterating physical kinematics within 48-hour cycles rather than waiting months for overseas tooling.\n2. **Deterministic Edge Compute**: Running local vision and sensor-fusion models on hardware without reliance on centralized cloud latency.\n3. **Vertically Integrated Assembly**: Keeping core manufacturing in-house during the first 1,000 units to discover design flaws instantly.\n\n> "If your product doesn't have weight and resistance to physical force, you're not solving the hardest problems of the next quarter-century."\n> — Marcus Vance, VP of Hardware at Aether Systems\n\n### The Founder's Dilemma: Speed vs. Physics\n\nUnlike SaaS, where a broken deploy can be rolled back in four seconds, a miscalculated thermodynamic envelope in aerospace hardware destroys months of progress. The founders succeeding today combine the obsessive sprint cadence of Silicon Valley with the rigorous safety standards of aviation engineering.`,
      featured_image: '/src/assets/images/hero_founder_deeptech_1793245609042.jpg',
      author_name: 'Julian Thorne',
      author_avatar: '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
      category_slug: 'startups',
      read_time_minutes: 6,
      status: 'published',
      is_lead_story: 1,
      is_featured: 1,
      source_urls: 'https://dynamiq.media/sources/physical-ai-2026',
      seo_title: 'The Physical AI Frontier — Hard-Tech Founders & Real Hardware | DYNamiQ',
      seo_description: 'Inside the hangars and labs where founders are building physical robotics, micro-actuators, and escaping pure software fatigue.',
      social_image: '/src/assets/images/hero_founder_deeptech_1793245609042.jpg',
      published_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      updated_at: new Date().toISOString(),
      tags: JSON.stringify(['Robotics', 'Hardware', 'Venture Capital', 'Deep Tech'])
    },
    {
      id: 'art_hangar_robotics_lessons',
      slug: 'lessons-from-500-hours-on-factory-floor',
      title: 'Building in the Hangar: Lessons from 500 Hours on the Factory Floor',
      subtitle: 'Why pure software engineers are relearning mechanical tolerances, high-voltage battery packaging, and the unforgiving laws of physical hardware.',
      excerpt: 'Why pure-code engineers are relearning mechanical tolerances, high-voltage battery packaging, and the unforgiving laws of physical hardware.',
      content: `### The Culture Shock of Real World Gravity\n\nWhen software engineers transition to robotic assembly, the first humbling realization is that physical components do not throw stack traces with line numbers.\n\n"A bolt either threads correctly or strips the casing," says Marcus Vance. "You cannot grep for a vibration resonance—you must attach physical accelerometers and interpret dirty analogue wave patterns."\n\n### Three Hard Rules for Hardware Teams\n\n1. **Thermal Budgets Are Inflexible**: Heat dissipation governs your compute limit, not your cloud subscription tier.\n2. **Supply Chain Redundancy from Day Zero**: Never design around single-source proprietary solenoids or custom ASIC chips without secondary pin-compatible alternatives.\n3. **Ergonomics for Field Technicians**: If a field mechanic cannot service your assembly with standard metric tools in wet weather, your system will fail adoption tests.`,
      featured_image: '/src/assets/images/story_autonomous_robotics_1793245609797.jpg',
      author_name: 'Claire Moreau',
      author_avatar: '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
      category_slug: 'startups',
      read_time_minutes: 5,
      status: 'published',
      is_lead_story: 0,
      is_featured: 1,
      source_urls: 'https://dynamiq.media/sources/hardware-fieldwork',
      seo_title: 'Building in the Hangar: 500 Hours on Factory Floor | DYNamiQ',
      seo_description: 'What happens when software developers meet mechanical engineering and industrial robotics.',
      social_image: '/src/assets/images/story_autonomous_robotics_1793245609797.jpg',
      published_at: new Date(Date.now() - 3600000 * 18).toISOString(),
      updated_at: new Date().toISOString(),
      tags: JSON.stringify(['Robotics', 'Engineering', 'Manufacturing'])
    },
    {
      id: 'art_solana_subsecond_finality',
      slug: 'solana-subsecond-finality-media-rails',
      title: 'Sub-Second Finality and the Re-Architecting of Internet Media Rails',
      subtitle: 'High-throughput state machines enable creator micro-tipping, decentralized content licensing, and autonomous publication syndication.',
      excerpt: 'How high-throughput state machines enable creator micro-tipping, decentralized content licensing, and autonomous publication syndication.',
      content: `### The Failure of Traditional Ad Rails\n\nThe traditional digital media model is broken: intrusive programmatic banner ads, privacy-violating tracking scripts, and platforms taking 30% to 50% cuts from creator livelihoods.\n\nBuilders in the Solana ecosystem are proving that micro-payments with transaction costs below $0.0005 make direct reader-to-journalist patronage mathematically feasible for the first time.\n\n### State Compression and Media Licensing\n\nWith Solana's concurrent execution and state compression, digital credentials, press passes, and syndicated publication rights can be minted and transferred at scale without congesting the global network.`,
      featured_image: '/src/assets/images/story_solana_builders_1793245610210.jpg',
      author_name: 'Soren Vance',
      author_avatar: '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
      category_slug: 'solana',
      read_time_minutes: 4,
      status: 'published',
      is_lead_story: 0,
      is_featured: 1,
      source_urls: 'https://solana.com/news',
      seo_title: 'Sub-Second Finality & Internet Media Rails | DYNamiQ',
      seo_description: 'How high-throughput Solana state machines are changing content monetization and creator economies.',
      social_image: '/src/assets/images/story_solana_builders_1793245610210.jpg',
      published_at: new Date(Date.now() - 3600000 * 32).toISOString(),
      updated_at: new Date().toISOString(),
      tags: JSON.stringify(['Solana', 'Decentralized Media', 'Web3', 'Architecture'])
    },
    {
      id: 'art_fundraising_in_down_markets',
      slug: 'the-art-of-quiet-capital-surviving-seed-slump',
      title: 'The Art of Quiet Capital: How Resilient Founders Close Without Twitter Hype',
      subtitle: 'The best rounds are no longer announced with emoji confetti; they are closed in quiet backrooms on customer metrics.',
      excerpt: 'Why the era of press-release fundraising gave way to disciplined milestone execution, non-dilutive grant stacking, and founder leverage.',
      content: `In 2021, a funding round was treated as the finish line. Today, the most respected founders treat capital as fuel for unit-economics survival.\n\nWe sat down with five founders who quietly closed institutional A-rounds without issuing a single hype thread. Here are the common themes:\n\n- **Customer-Funded R&D**: Demanding upfront pilot fees from enterprise customers before committing engineering sprints.\n- **Runway Discipline**: Maintaining 24 to 36 months of cash runway by maintaining lean, senior-heavy pods rather than bloated mid-management.\n- **Valuation Realism**: Choosing clean terms and aligned investors over inflated paper valuations that poison future follow-ons.`,
      featured_image: '/src/assets/images/founder_sarah_chen_1793245609558.jpg',
      author_name: 'Julian Thorne',
      author_avatar: '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
      category_slug: 'founders',
      read_time_minutes: 5,
      status: 'published',
      is_lead_story: 0,
      is_featured: 1,
      source_urls: 'https://dynamiq.media/articles/quiet-capital',
      seo_title: 'The Art of Quiet Capital: Surviving the Seed Slump | DYNamiQ',
      seo_description: 'How modern startup founders close institutional capital and navigate realistic valuations.',
      social_image: '/src/assets/images/founder_sarah_chen_1793245609558.jpg',
      published_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      updated_at: new Date().toISOString(),
      tags: JSON.stringify(['Fundraising', 'Founders', 'Venture Capital'])
    },
    {
      id: 'art_gross_margins_ai',
      slug: 'the-return-of-gross-margins-enterprise-ai-audit',
      title: 'The Return of Gross Margins: Why Enterprise CIOs Are Auditing AI Wrappers',
      subtitle: 'Enterprise IT directors are purging pass-through generative tools in favor of deterministic on-premise execution.',
      excerpt: 'Why Fortune 500 technology budgets are slashing thin middleware subscriptions and refocusing spend on proprietary inference and data pipelines.',
      content: `The honeymoon phase of enterprise artificial intelligence experimentation is over. The invoice reconciliation phase has begun.\n\nAccording to a quarterly survey of 64 enterprise CIOs conducted by DYNamiQ, corporate IT departments are cutting 40% of first-generation "AI wrapper" seats.\n\n"We were paying three separate vendors for what was essentially identical model pass-through with custom system prompts," says David Sterling, CTO of Global Fleet Logistics. "We brought inference in-house with dedicated GPU instances and cut monthly spend by 68%."`,
      featured_image: '/src/assets/images/story_autonomous_robotics_1793245609797.jpg',
      author_name: 'Elena Rostova',
      author_avatar: '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
      category_slug: 'startups',
      read_time_minutes: 5,
      status: 'published',
      is_lead_story: 0,
      is_featured: 0,
      source_urls: 'https://dynamiq.media/research/enterprise-ai-audit',
      seo_title: 'The Return of Gross Margins: Enterprise AI Audits | DYNamiQ',
      seo_description: 'Inside the enterprise shift from AI wrappers to in-house inference pipelines.',
      social_image: '/src/assets/images/story_autonomous_robotics_1793245609797.jpg',
      published_at: new Date(Date.now() - 3600000 * 60).toISOString(),
      updated_at: new Date().toISOString(),
      tags: JSON.stringify(['Enterprise', 'SaaS', 'Artificial Intelligence', 'Unit Economics'])
    },
    {
      id: 'art_power_grids_compute',
      slug: 'power-grids-and-compute-densities-infrastructure-frontier',
      title: 'Power Grids and Compute Densities: The Next Decade in Data Infrastructure',
      subtitle: 'Gigawatt-scale substations, private geothermal taps, and the physical reality of powering next-generation models.',
      excerpt: 'How power access replaced software talent as the primary bottleneck for technological supremacy, driving builders to clean geothermal and nuclear colocation.',
      content: `In 2026, the question is no longer who can train the model, but who has the physical megawatts to keep the transformers cool.\n\nFrom Iceland to Texas, modular compute facilities are establishing direct grid interconnects with baseload nuclear generators and high-temperature geothermal wells.\n\n"We spent four years obsessing over algorithmic quantization," explains hardware architect Marcus Vance. "Now we spend our mornings negotiating high-voltage transmission rights with regional utility boards."`,
      featured_image: '/src/assets/images/hero_founder_deeptech_1793245609042.jpg',
      author_name: 'Claire Moreau',
      author_avatar: '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
      category_slug: 'startups',
      read_time_minutes: 6,
      status: 'published',
      is_lead_story: 0,
      is_featured: 0,
      source_urls: 'https://dynamiq.media/energy/power-grids-compute',
      seo_title: 'Power Grids and Compute Densities | DYNamiQ',
      seo_description: 'The physical energy and cooling constraints determining future compute infrastructure.',
      social_image: '/src/assets/images/hero_founder_deeptech_1793245609042.jpg',
      published_at: new Date(Date.now() - 3600000 * 75).toISOString(),
      updated_at: new Date().toISOString(),
      tags: JSON.stringify(['Energy', 'Compute', 'Infrastructure', 'Hard Tech'])
    },
    {
      id: 'art_solana_rust_concurrency',
      slug: 'solana-rust-concurrency-high-frequency-state',
      title: 'The Systems Architecture Wave: Why Rust Programmers Choose Solana',
      subtitle: 'Parallel transaction execution via Sealevel, deterministic fee markets, and the revival of bare-metal optimization.',
      excerpt: 'A technical retrospective on memory layout, account concurrency, and why high-throughput systems engineering is attracting veteran C++ and Rust developers.',
      content: `While general-purpose blockchains struggle with single-threaded state queues, Solana developers approach blockchain from the perspective of operating systems and GPU kernel dispatchers.\n\n"When you write a Solana program in Rust, you are forced to reason about memory layout, byte alignment, and read/write lock contention," says Koa Jensen. "It feels less like financial scripting and more like writing high-frequency trading drivers."`,
      featured_image: '/src/assets/images/story_solana_builders_1793245610210.jpg',
      author_name: 'Soren Vance',
      author_avatar: '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
      category_slug: 'solana',
      read_time_minutes: 5,
      status: 'published',
      is_lead_story: 0,
      is_featured: 0,
      source_urls: 'https://solana.com/docs',
      seo_title: 'Why Systems Engineers Choose Solana Concurrency | DYNamiQ',
      seo_description: 'An architectural deep-dive into Sealevel and parallel state execution.',
      social_image: '/src/assets/images/story_solana_builders_1793245610210.jpg',
      published_at: new Date(Date.now() - 3600000 * 90).toISOString(),
      updated_at: new Date().toISOString(),
      tags: JSON.stringify(['Solana', 'Rust', 'Concurrency', 'Architecture'])
    },
    {
      id: 'art_seed_stage_discipline',
      slug: 'seed-stage-valuation-discipline-120-term-sheets',
      title: 'Seed Stage Valuation Discipline: An Empirical Study of 120 Term Sheets',
      subtitle: 'Clean liquidation preferences, cap table hygiene, and the death of stacked SAFEs.',
      excerpt: 'Data from 120 institutional seed deals shows a massive return to standard priced rounds and non-participating preferred equity.',
      content: `The era of stacking six consecutive unpriced SAFEs with disparate valuation caps has reached its inevitable reckoning.\n\nFounders who raised multiple high-cap notes in 2024 are discovering that their Series A dilution exceeded 45%, leaving insufficient equity pools to recruit key executive hires.\n\nSmart founders in 2026 are setting clean, realistic priced seed valuations that incentivize long-term co-ownership with institutional leads.`,
      featured_image: '/src/assets/images/founder_sarah_chen_1793245609558.jpg',
      author_name: 'Julian Thorne',
      author_avatar: '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
      category_slug: 'founders',
      read_time_minutes: 5,
      status: 'published',
      is_lead_story: 0,
      is_featured: 0,
      source_urls: 'https://dynamiq.media/research/seed-term-sheets',
      seo_title: 'Seed Stage Valuation Discipline | DYNamiQ',
      seo_description: 'Empirical analysis of 120 seed term sheets and cap table dilution.',
      social_image: '/src/assets/images/founder_sarah_chen_1793245609558.jpg',
      published_at: new Date(Date.now() - 3600000 * 110).toISOString(),
      updated_at: new Date().toISOString(),
      tags: JSON.stringify(['Fundraising', 'Term Sheets', 'Cap Tables', 'Venture'])
    }
  ];

  const insertArticle = db.prepare(`
    INSERT OR REPLACE INTO articles (
      id, slug, title, subtitle, excerpt, content, featured_image, author_name,
      author_avatar, category_slug, read_time_minutes, status, is_lead_story,
      is_featured, source_urls, seo_title, seo_description, social_image,
      published_at, updated_at, tags
    ) VALUES (
      @id, @slug, @title, @subtitle, @excerpt, @content, @featured_image, @author_name,
      @author_avatar, @category_slug, @read_time_minutes, @status, @is_lead_story,
      @is_featured, @source_urls, @seo_title, @seo_description, @social_image,
      @published_at, @updated_at, @tags
    )
  `);

  for (const art of articles) {
    insertArticle.run(art);
  }

  // Seed Founders
  const founders = [
    {
      id: 'fnd_sarah_chen',
      slug: 'sarah-chen',
      name: 'Sarah Chen',
      company: 'Kinetiq Systems',
      role_title: 'Founder & CEO',
      bio: 'Former aerospace propulsion engineer turned industrial robotics pioneer. Sarah spent six years building flight hardware before founding Kinetiq to bring high-speed autonomous tooling to domestic manufacturing lines.',
      portrait_url: '/src/assets/images/founder_sarah_chen_1793245609558.jpg',
      website_url: 'https://kinetiqsystems.io',
      twitter_url: 'https://x.com/sarahchen_builds',
      linkedin_url: 'https://linkedin.com/in/sarahchen-kinetiq',
      key_takeaway: 'Never compromise on kinematic tolerances. Software can be patched in seconds; structural mass failure can destroy an entire enterprise.',
      fundraising_stage: 'Series A ($18.5M closed)',
      interview_notes: 'Featured on DYNamiQ Podcast Desk Ep. 42. Discussed navigating hardware supply shortages during 2025.',
      is_featured: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'fnd_marcus_vance',
      slug: 'marcus-vance',
      name: 'Marcus Vance',
      company: 'Aether Robotics',
      role_title: 'Co-Founder & CTO',
      bio: 'Specialist in distributed sensor fusion and real-time edge kinematics. Pioneered low-latency CAN-bus architectures for autonomous assembly arms.',
      portrait_url: '/src/assets/images/story_autonomous_robotics_1793245609797.jpg',
      website_url: 'https://aether-robotics.tech',
      twitter_url: 'https://x.com/marcusvance_hw',
      linkedin_url: 'https://linkedin.com/in/marcusvance',
      key_takeaway: 'Your software speed is throttled by your thermal envelope. Solve the heat dissipation before writing your machine learning models.',
      fundraising_stage: 'Seed ($4.2M closed)',
      interview_notes: 'Guest speaker at DYNamiQ Founders Summit.',
      is_featured: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'fnd_aris_thorne',
      slug: 'dr-aris-thorne',
      name: 'Dr. Aris Thorne',
      company: 'Helios Node Labs',
      role_title: 'Founder & Chief Architect',
      bio: 'Distributed systems researcher focused on sub-millisecond Solana validator clustering and high-throughput zero-knowledge state proofs.',
      portrait_url: '/src/assets/images/story_solana_builders_1793245610210.jpg',
      website_url: 'https://helioslabs.network',
      twitter_url: 'https://x.com/aristhorne',
      linkedin_url: 'https://linkedin.com/in/aristhorne',
      key_takeaway: 'Optimize for deterministic latency rather than peak theoretical throughput. Reliability wins enterprise workloads every time.',
      fundraising_stage: 'Series A ($12M closed)',
      interview_notes: 'Featured in Solana Builder Spotlight.',
      is_featured: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'fnd_elena_rostova',
      slug: 'elena-rostova',
      name: 'Elena Rostova',
      company: 'Apex Frontier Ventures',
      role_title: 'Founding Partner',
      bio: 'Hardware-first investor backing deep tech and energy transitions across North America and Europe. Former engineering director at European Space Agency subcontractors.',
      portrait_url: '/src/assets/images/hero_founder_deeptech_1793245609042.jpg',
      website_url: 'https://apexfrontier.vc',
      twitter_url: 'https://x.com/elena_apex',
      linkedin_url: 'https://linkedin.com/in/elenarostova',
      key_takeaway: 'Unit economics are non-negotiable. If your gross margin depends on unpriced carbon subsidies, you are a policy play, not a technology company.',
      fundraising_stage: 'Fund II ($150M active)',
      interview_notes: 'Host guest on Podcast Desk Ep. 40.',
      is_featured: 1,
      created_at: new Date().toISOString()
    }
  ];

  const insertFounder = db.prepare(`
    INSERT OR REPLACE INTO founders (
      id, slug, name, company, role_title, bio, portrait_url, website_url,
      twitter_url, linkedin_url, key_takeaway, fundraising_stage,
      interview_notes, is_featured, created_at
    ) VALUES (
      @id, @slug, @name, @company, @role_title, @bio, @portrait_url, @website_url,
      @twitter_url, @linkedin_url, @key_takeaway, @fundraising_stage,
      @interview_notes, @is_featured, @created_at
    )
  `);

  for (const f of founders) {
    insertFounder.run(f);
  }

  // Seed Brands
  const brands = [
    {
      id: 'brd_kinetiq',
      slug: 'kinetiq-systems',
      name: 'Kinetiq Systems',
      logo_url: '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
      description: 'Next-generation industrial automation and modular physical actuators for precision manufacturing lines.',
      industry: 'Deep Tech & Robotics',
      founder_name: 'Sarah Chen',
      website_url: 'https://kinetiqsystems.io',
      is_featured: 1,
      is_sponsored: 0,
      sponsored_disclosure: '',
      coverage_summary: 'Featured in DYNamiQ Lead Story: The Physical AI Frontier and Podcast Episode 42.',
      created_at: new Date().toISOString()
    },
    {
      id: 'brd_aether',
      slug: 'aether-robotics',
      name: 'Aether Robotics',
      logo_url: '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
      description: 'Heavy payload autonomous logistics platforms built for defense and aerospace ground support.',
      industry: 'Industrial Aerospace',
      founder_name: 'Marcus Vance',
      website_url: 'https://aether-robotics.tech',
      is_featured: 1,
      is_sponsored: 0,
      sponsored_disclosure: '',
      coverage_summary: 'In-depth coverage on factory floor trials and edge sensor telemetry.',
      created_at: new Date().toISOString()
    },
    {
      id: 'brd_sol_infra',
      slug: 'helios-node-labs',
      name: 'Helios Node Labs',
      logo_url: '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
      description: 'Ultra-low latency RPC endpoints and telemetry infrastructure engineered for high-frequency Solana applications.',
      industry: 'Solana Infrastructure',
      founder_name: 'Dr. Aris Thorne',
      website_url: 'https://helioslabs.network',
      is_featured: 1,
      is_sponsored: 0,
      sponsored_disclosure: '',
      coverage_summary: 'Profiled in Solana Builder Spotlight Series.',
      created_at: new Date().toISOString()
    },
    {
      id: 'brd_apex_vc',
      slug: 'apex-frontier-ventures',
      name: 'Apex Frontier Ventures',
      logo_url: '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
      description: 'Early-stage venture fund investing exclusively in atoms, robotics, grid infrastructure, and space kinematics.',
      industry: 'Venture Capital',
      founder_name: 'Elena Rostova',
      website_url: 'https://apexfrontier.vc',
      is_featured: 1,
      is_sponsored: 1,
      sponsored_disclosure: 'Partner spotlight. DYNamiQ maintains independent editorial assessment over all portfolio company reviews.',
      coverage_summary: 'Sponsor of the DYNamiQ Annual Hard Tech Report.',
      created_at: new Date().toISOString()
    }
  ];

  const insertBrand = db.prepare(`
    INSERT OR REPLACE INTO brands (
      id, slug, name, logo_url, description, industry, founder_name,
      website_url, is_featured, is_sponsored, sponsored_disclosure,
      coverage_summary, created_at
    ) VALUES (
      @id, @slug, @name, @logo_url, @description, @industry, @founder_name,
      @website_url, @is_featured, @is_sponsored, @sponsored_disclosure,
      @coverage_summary, @created_at
    )
  `);

  for (const b of brands) {
    insertBrand.run(b);
  }

  // Seed Podcasts
  const podcasts = [
    {
      id: 'pod_ep_42',
      slug: 'ep-42-from-pre-seed-to-factory-production',
      title: 'Ep. 42: From Pre-Seed to Factory Production — The Hard Truths of Scale',
      episode_number: 42,
      guest_name: 'Sarah Chen & Marcus Vance',
      guest_role: 'Founders, Kinetiq & Aether',
      host_name: 'Julian Thorne',
      description: 'In this extended studio session, Sarah and Marcus break down the reality of hardware procurement, avoiding fatal vendor lock-ins, and closing tier-1 venture checks without vanity pitch decks.',
      thumbnail_url: '/src/assets/images/podcast_desk_episode_1793245611154.jpg',
      embed_url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      audio_url: '',
      source_url: 'https://youtube.com',
      duration: '58:24',
      transcript: 'Full transcript available: Sarah Chen walks through how Kinetiq secured its first three automotive plant contracts before completing their Series A.',
      status: 'published',
      published_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
    },
    {
      id: 'pod_ep_41',
      slug: 'ep-41-solana-speed-and-high-throughput-communities',
      title: 'Ep. 41: Solana Speed, Community Capital, and Why Attention Liquidity Wins',
      episode_number: 41,
      guest_name: 'Koa Jensen',
      guest_role: 'Solana Ecosystem Researcher',
      host_name: 'Soren Vance',
      description: 'A deep dive into how viral community momentum on Solana turns into sticky developer gravity and cultural media capital.',
      thumbnail_url: '/src/assets/images/story_solana_builders_1793245610210.jpg',
      embed_url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      audio_url: '',
      source_url: 'https://youtube.com',
      duration: '46:12',
      transcript: 'Koa Jensen discusses memetics, token alignment, and how media publications can empower digital native communities.',
      status: 'published',
      published_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString()
    },
    {
      id: 'pod_ep_40',
      slug: 'ep-40-unit-economics-or-die-the-multiple-contraction',
      title: 'Ep. 40: Unit Economics or Die — The Great Valuation Reset',
      episode_number: 40,
      guest_name: 'Elena Rostova',
      guest_role: 'Founding Partner, Apex Frontier',
      host_name: 'Julian Thorne',
      description: 'Why the era of subsidizing customer acquisition with venture debt is officially closed, and why gross margin discipline is the ultimate competitive advantage.',
      thumbnail_url: '/src/assets/images/hero_founder_deeptech_1793245609042.jpg',
      embed_url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      audio_url: '',
      source_url: 'https://youtube.com',
      duration: '51:18',
      transcript: 'Elena breaks down the return to classical accounting principles across deep tech cap tables.',
      status: 'published',
      published_at: new Date(Date.now() - 3600000 * 24 * 14).toISOString()
    }
  ];

  const insertPodcast = db.prepare(`
    INSERT OR REPLACE INTO podcasts (
      id, slug, title, episode_number, guest_name, guest_role, host_name,
      description, thumbnail_url, embed_url, audio_url, source_url,
      duration, transcript, status, published_at
    ) VALUES (
      @id, @slug, @title, @episode_number, @guest_name, @guest_role, @host_name,
      @description, @thumbnail_url, @embed_url, @audio_url, @source_url,
      @duration, @transcript, @status, @published_at
    )
  `);

  for (const p of podcasts) {
    insertPodcast.run(p);
  }

  // Seed Culture Memes
  const memes = [
    {
      id: 'meme_01',
      title: 'The SaaS Multiple Compression Realization',
      image_url: '/src/assets/images/story_autonomous_robotics_1793245609797.jpg',
      caption: 'Software founders visiting a friend with a functional CNC mill for the first time in 2026: "Wait, you make things people can touch?"',
      attribution: '@startup_monk on X',
      source_url: 'https://x.com',
      likes_count: 842,
      created_at: new Date().toISOString()
    },
    {
      id: 'meme_02',
      title: 'Pitching Deep Tech vs Pitching B2B CRM',
      image_url: '/src/assets/images/hero_founder_deeptech_1793245609042.jpg',
      caption: '"Our margins are 18% today but in 12 years we will control orbital launch payloads."',
      attribution: 'DYNamiQ Editorial Room',
      source_url: 'https://dynamiq.media',
      likes_count: 1205,
      created_at: new Date().toISOString()
    },
    {
      id: 'meme_03',
      title: 'The GPU Cloud Invoice Stare',
      image_url: '/src/assets/images/story_solana_builders_1793245610210.jpg',
      caption: 'When the seed round was $3M and the inference compute bill for month two is $184,000.',
      attribution: 'Newsroom Slack',
      source_url: 'https://dynamiq.media',
      likes_count: 940,
      created_at: new Date().toISOString()
    }
  ];

  const insertMeme = db.prepare(`
    INSERT OR REPLACE INTO culture_memes (
      id, title, image_url, caption, attribution, source_url, likes_count, created_at
    ) VALUES (
      @id, @title, @image_url, @caption, @attribution, @source_url, @likes_count, @created_at
    )
  `);

  for (const m of memes) {
    insertMeme.run(m);
  }
}
