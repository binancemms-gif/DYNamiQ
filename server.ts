import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { db, initDatabase, hashPassword, verifyPassword } from './server/db.ts';

// Initialize Database & Tables
initDatabase();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Upload directory setup
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOAD_DIR));

// Configure Multer for secure uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif|svg|mp4|webm|mp3|wav|pdf/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype.toLowerCase();
    if (allowedTypes.test(ext) || mime.startsWith('image/') || mime.startsWith('audio/') || mime.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('File format not supported. Only images, audio, and video files are permitted.'));
    }
  }
});

// Helper for audit logging
function recordAudit(userId: string | null, userEmail: string | null, action: string, details: string) {
  try {
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_email, action, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(`log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, userId, userEmail, action, details, new Date().toISOString());
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar_url?: string;
  };
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers['x-session-token']) {
    token = String(req.headers['x-session-token']);
  }

  if (!token) {
    return next();
  }

  try {
    const session = db.prepare(`
      SELECT s.token, s.expires_at, u.id, u.email, u.name, u.role, u.avatar_url
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ?
    `).get(token) as any;

    if (session) {
      if (new Date(session.expires_at) > new Date()) {
        req.user = {
          id: session.id,
          email: session.email,
          name: session.name,
          role: session.role,
          avatar_url: session.avatar_url
        };
      } else {
        // Expired session
        db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
      }
    }
  } catch (err) {
    console.error('Session lookup failed:', err);
  }

  next();
}

function requireAuth(allowedRoles?: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }

    if (allowedRoles && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. You do not have permission for this resource.' });
    }

    next();
  };
}

app.use(authMiddleware);

/* ==========================================================================
   PUBLIC API ROUTES
   ========================================================================== */

// Fast initial bootstrap bundle
app.get('/api/public/bootstrap', (_req: Request, res: Response) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    const hpConfig = db.prepare('SELECT * FROM homepage_config WHERE id = ?').get('main') as any;

    // Lead story
    let leadStory = null;
    if (hpConfig?.lead_story_id) {
      leadStory = db.prepare('SELECT * FROM articles WHERE id = ? AND status = ?').get(hpConfig.lead_story_id, 'published');
    }
    if (!leadStory) {
      leadStory = db.prepare('SELECT * FROM articles WHERE status = ? ORDER BY published_at DESC LIMIT 1').get('published');
    }

    const featuredStories = db.prepare(`
      SELECT * FROM articles
      WHERE status = 'published' AND id != ?
      ORDER BY is_featured DESC, published_at DESC
      LIMIT 6
    `).all(leadStory ? (leadStory as any).id : '');

    const latestArticles = db.prepare(`
      SELECT id, slug, title, subtitle, excerpt, featured_image, author_name, category_slug, read_time_minutes, published_at, tags
      FROM articles
      WHERE status = 'published'
      ORDER BY published_at DESC
      LIMIT 12
    `).all();

    const founders = db.prepare('SELECT * FROM founders ORDER BY is_featured DESC, created_at DESC LIMIT 8').all();
    const brands = db.prepare('SELECT * FROM brands ORDER BY is_featured DESC, created_at DESC LIMIT 8').all();
    const podcasts = db.prepare(`SELECT * FROM podcasts WHERE status = 'published' ORDER BY episode_number DESC LIMIT 6`).all();
    const cultureMemes = db.prepare('SELECT * FROM culture_memes ORDER BY likes_count DESC, created_at DESC LIMIT 8').all();

    const settingsRows = db.prepare('SELECT key, value FROM site_settings').all() as any[];
    const settings: Record<string, string> = {};
    for (const row of settingsRows) {
      settings[row.key] = row.value;
    }

    res.json({
      categories,
      homepage_config: hpConfig ? {
        ...hpConfig,
        section_order: JSON.parse(hpConfig.section_order || '[]'),
        visible_sections: JSON.parse(hpConfig.visible_sections || '{}')
      } : null,
      lead_story: leadStory,
      featured_stories: featuredStories,
      latest_articles: latestArticles,
      founders,
      brands,
      podcasts,
      culture_memes: cultureMemes,
      settings
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load bootstrap data', details: err.message });
  }
});

// Articles list
app.get('/api/articles', (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    let query = `SELECT * FROM articles WHERE status = 'published'`;
    const params: any[] = [];

    if (category) {
      query += ' AND category_slug = ?';
      params.push(category);
    }

    query += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const articles = db.prepare(query).all(...params);
    const totalCount = db.prepare(
      category ? `SELECT COUNT(*) as count FROM articles WHERE status = 'published' AND category_slug = ?` : `SELECT COUNT(*) as count FROM articles WHERE status = 'published'`
    ).get(...(category ? [category] : [])) as { count: number };

    res.json({ articles, total: totalCount.count });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch articles', details: err.message });
  }
});

// Single Article by Slug
app.get('/api/articles/:slug', (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const article = db.prepare('SELECT * FROM articles WHERE slug = ?').get(slug) as any;

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Related articles
    const related = db.prepare(`
      SELECT id, slug, title, excerpt, featured_image, author_name, category_slug, read_time_minutes, published_at
      FROM articles
      WHERE status = 'published' AND slug != ? AND category_slug = ?
      ORDER BY published_at DESC
      LIMIT 3
    `).all(slug, article.category_slug);

    res.json({ article, related });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch article', details: err.message });
  }
});

// Founders list & single
app.get('/api/founders', (_req: Request, res: Response) => {
  try {
    const founders = db.prepare('SELECT * FROM founders ORDER BY is_featured DESC, name ASC').all();
    res.json(founders);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch founders', details: err.message });
  }
});

app.get('/api/founders/:slug', (req: Request, res: Response) => {
  try {
    const founder = db.prepare('SELECT * FROM founders WHERE slug = ?').get(req.params.slug) as any;
    if (!founder) return res.status(404).json({ error: 'Founder profile not found' });

    // Articles related to this founder or company
    const relatedArticles = db.prepare(`
      SELECT id, slug, title, excerpt, featured_image, published_at, category_slug
      FROM articles
      WHERE status = 'published' AND (title LIKE ? OR content LIKE ? OR excerpt LIKE ?)
      ORDER BY published_at DESC LIMIT 3
    `).all(`%${founder.name}%`, `%${founder.name}%`, `%${founder.company}%`);

    res.json({ founder, related_articles: relatedArticles });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch founder', details: err.message });
  }
});

// Brands list & single
app.get('/api/brands', (_req: Request, res: Response) => {
  try {
    const brands = db.prepare('SELECT * FROM brands ORDER BY is_featured DESC, name ASC').all();
    res.json(brands);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch brands', details: err.message });
  }
});

app.get('/api/brands/:slug', (req: Request, res: Response) => {
  try {
    const brand = db.prepare('SELECT * FROM brands WHERE slug = ?').get(req.params.slug) as any;
    if (!brand) return res.status(404).json({ error: 'Brand record not found' });

    const relatedArticles = db.prepare(`
      SELECT id, slug, title, excerpt, featured_image, published_at, category_slug
      FROM articles
      WHERE status = 'published' AND (title LIKE ? OR content LIKE ? OR excerpt LIKE ?)
      ORDER BY published_at DESC LIMIT 3
    `).all(`%${brand.name}%`, `%${brand.name}%`, `%${brand.name}%`);

    res.json({ brand, related_articles: relatedArticles });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch brand', details: err.message });
  }
});

// Podcasts list & single
app.get('/api/podcasts', (_req: Request, res: Response) => {
  try {
    const podcasts = db.prepare(`SELECT * FROM podcasts WHERE status = 'published' ORDER BY episode_number DESC`).all();
    res.json(podcasts);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch podcasts', details: err.message });
  }
});

app.get('/api/podcasts/:slug', (req: Request, res: Response) => {
  try {
    const podcast = db.prepare('SELECT * FROM podcasts WHERE slug = ?').get(req.params.slug);
    if (!podcast) return res.status(404).json({ error: 'Podcast episode not found' });
    res.json(podcast);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch podcast', details: err.message });
  }
});

// Culture items
app.get('/api/culture', (_req: Request, res: Response) => {
  try {
    const memes = db.prepare('SELECT * FROM culture_memes ORDER BY likes_count DESC, created_at DESC').all();
    res.json(memes);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch culture memes', details: err.message });
  }
});

// Global Search
app.get('/api/search', (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) {
      return res.json({ articles: [], founders: [], brands: [], podcasts: [] });
    }

    const likeTerm = `%${query}%`;
    const articles = db.prepare(`
      SELECT id, slug, title, subtitle, excerpt, featured_image, category_slug, published_at
      FROM articles
      WHERE status = 'published' AND (title LIKE ? OR excerpt LIKE ? OR content LIKE ? OR tags LIKE ?)
      ORDER BY published_at DESC LIMIT 10
    `).all(likeTerm, likeTerm, likeTerm, likeTerm);

    const founders = db.prepare(`
      SELECT id, slug, name, company, role_title, portrait_url, bio
      FROM founders
      WHERE name LIKE ? OR company LIKE ? OR bio LIKE ?
      LIMIT 6
    `).all(likeTerm, likeTerm, likeTerm);

    const brands = db.prepare(`
      SELECT id, slug, name, logo_url, description, industry
      FROM brands
      WHERE name LIKE ? OR description LIKE ? OR industry LIKE ?
      LIMIT 6
    `).all(likeTerm, likeTerm, likeTerm);

    const podcasts = db.prepare(`
      SELECT id, slug, title, episode_number, guest_name, thumbnail_url, duration
      FROM podcasts
      WHERE status = 'published' AND (title LIKE ? OR guest_name LIKE ? OR description LIKE ?)
      LIMIT 6
    `).all(likeTerm, likeTerm, likeTerm);

    res.json({ articles, founders, brands, podcasts, query });
  } catch (err: any) {
    res.status(500).json({ error: 'Search execution failed', details: err.message });
  }
});

// Newsletter Subscription
app.post('/api/newsletter/subscribe', (req: Request, res: Response) => {
  try {
    const { email, source = 'footer' } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.prepare('SELECT id FROM subscribers WHERE email = ?').get(cleanEmail);

    if (existing) {
      return res.json({ success: true, message: 'You are already subscribed to DYNamiQ Editorial Intelligence.' });
    }

    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    db.prepare(`
      INSERT INTO subscribers (id, email, source, status, consent, created_at)
      VALUES (?, ?, ?, 'active', 1, ?)
    `).run(id, cleanEmail, source, new Date().toISOString());

    res.json({ success: true, message: 'Subscribed successfully. Welcome to DYNamiQ.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process subscription', details: err.message });
  }
});

// Partnership / Advertise Inquiry
app.post('/api/inquiries', (req: Request, res: Response) => {
  try {
    const { company, contact_name, email, campaign_type, budget_range, message } = req.body;

    if (!company || !contact_name || !email || !message) {
      return res.status(400).json({ error: 'Company, contact name, email, and message are required.' });
    }

    const id = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    db.prepare(`
      INSERT INTO inquiries (id, company, contact_name, email, campaign_type, budget_range, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)
    `).run(id, company, contact_name, email, campaign_type || 'Brand Radar Spotlight', budget_range || '$5k - $15k', message, new Date().toISOString());

    res.json({ success: true, message: 'Your campaign inquiry has been received. The DYNamiQ media desk will respond within 24 business hours.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit inquiry', details: err.message });
  }
});

// Public Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT key, value FROM site_settings').all() as any[];
    const settings: Record<string, string> = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch settings', details: err.message });
  }
});

// Dynamic Sitemap
app.get('/sitemap.xml', (_req: Request, res: Response) => {
  try {
    const baseUrl = process.env.APP_URL || 'https://dynamiq.media';
    const articles = db.prepare(`SELECT slug, updated_at FROM articles WHERE status = 'published'`).all() as any[];
    const founders = db.prepare('SELECT slug FROM founders').all() as any[];
    const brands = db.prepare('SELECT slug FROM brands').all() as any[];
    const podcasts = db.prepare(`SELECT slug FROM podcasts WHERE status = 'published'`).all() as any[];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>
  <url><loc>${baseUrl}/startups</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${baseUrl}/founders</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${baseUrl}/podcasts</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/brands</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/culture</loc><changefreq>daily</changefreq><priority>0.7</priority></url>
  <url><loc>${baseUrl}/solana</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/about</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${baseUrl}/advertise</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>${baseUrl}/editorial-policy</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>
`;

    for (const a of articles) {
      xml += `  <url><loc>${baseUrl}/news/${a.slug}</loc><lastmod>${a.updated_at.split('T')[0]}</lastmod><priority>0.8</priority></url>\n`;
    }
    for (const f of founders) {
      xml += `  <url><loc>${baseUrl}/founders/${f.slug}</loc><priority>0.7</priority></url>\n`;
    }
    for (const b of brands) {
      xml += `  <url><loc>${baseUrl}/brands/${b.slug}</loc><priority>0.7</priority></url>\n`;
    }
    for (const p of podcasts) {
      xml += `  <url><loc>${baseUrl}/podcasts/${p.slug}</loc><priority>0.7</priority></url>\n`;
    }

    xml += `</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

// Dynamic Robots.txt
app.get('/robots.txt', (_req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://dynamiq.media';
  res.type('text/plain');
  res.send(`User-agent: *\nDisallow: /admin\nDisallow: /api/admin\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`);
});

/* ==========================================================================
   AUTHENTICATION ROUTES
   ========================================================================== */

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate secure 30-day session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(token, user.id, expiresAt, new Date().toISOString());

    recordAudit(user.id, user.email, 'USER_LOGIN', 'Staff member signed in to admin console');

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar_url: user.avatar_url
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Authentication failed', details: err.message });
  }
});

app.post('/api/auth/logout', (req: AuthenticatedRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-session-token'] as string);
    if (token) {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    }
    if (req.user) {
      recordAudit(req.user.id, req.user.email, 'USER_LOGOUT', 'Staff member signed out');
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Logout failed', details: err.message });
  }
});

app.get('/api/auth/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.user });
});

/* ==========================================================================
   ADMIN MANAGEMENT API ROUTES (Protected)
   ========================================================================== */

// Dashboard Overview Metrics
app.get('/api/admin/overview', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const publishedArticles = db.prepare(`SELECT COUNT(*) as count FROM articles WHERE status = 'published'`).get() as any;
    const draftArticles = db.prepare(`SELECT COUNT(*) as count FROM articles WHERE status = 'draft'`).get() as any;
    const scheduledArticles = db.prepare(`SELECT COUNT(*) as count FROM articles WHERE status = 'scheduled'`).get() as any;
    const totalFounders = db.prepare('SELECT COUNT(*) as count FROM founders').get() as any;
    const totalBrands = db.prepare('SELECT COUNT(*) as count FROM brands').get() as any;
    const totalPodcasts = db.prepare(`SELECT COUNT(*) as count FROM podcasts WHERE status = 'published'`).get() as any;
    const totalSubscribers = db.prepare(`SELECT COUNT(*) as count FROM subscribers WHERE status = 'active'`).get() as any;
    const newInquiries = db.prepare(`SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'`).get() as any;
    const recentActivity = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 8').all();

    res.json({
      published_articles: publishedArticles.count,
      draft_articles: draftArticles.count,
      scheduled_articles: scheduledArticles.count,
      total_founders: totalFounders.count,
      total_brands: totalBrands.count,
      total_podcasts: totalPodcasts.count,
      total_subscribers: totalSubscribers.count,
      new_inquiries: newInquiries.count,
      recent_activity: recentActivity
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve admin overview', details: err.message });
  }
});

// Articles Management
app.get('/api/admin/articles', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const articles = db.prepare('SELECT * FROM articles ORDER BY published_at DESC').all();
    res.json(articles);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch articles', details: err.message });
  }
});

app.post('/api/admin/articles', requireAuth(['admin', 'editor', 'author']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      slug,
      subtitle = '',
      excerpt = '',
      content = '',
      featured_image,
      author_name,
      category_slug,
      read_time_minutes = 4,
      status = 'draft',
      is_lead_story = 0,
      is_featured = 0,
      source_urls = '',
      seo_title = '',
      seo_description = '',
      social_image = '',
      tags = '[]'
    } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ error: 'Title and URL slug are required.' });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const existing = db.prepare('SELECT id FROM articles WHERE slug = ?').get(cleanSlug);
    if (existing) {
      return res.status(400).json({ error: 'An article with this slug already exists.' });
    }

    const id = `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    if (is_lead_story) {
      db.prepare('UPDATE articles SET is_lead_story = 0').run();
      db.prepare(`UPDATE homepage_config SET lead_story_id = ? WHERE id = 'main'`).run(id);
    }

    db.prepare(`
      INSERT INTO articles (
        id, slug, title, subtitle, excerpt, content, featured_image,
        author_name, author_avatar, category_slug, read_time_minutes,
        status, is_lead_story, is_featured, source_urls, seo_title,
        seo_description, social_image, published_at, updated_at, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      cleanSlug,
      title,
      subtitle,
      excerpt,
      content,
      featured_image || '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
      author_name || req.user?.name || 'DYNamiQ Editor',
      req.user?.avatar_url || '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
      category_slug || 'startups',
      read_time_minutes,
      status,
      is_lead_story ? 1 : 0,
      is_featured ? 1 : 0,
      source_urls,
      seo_title || title,
      seo_description || excerpt,
      social_image || featured_image,
      now,
      now,
      typeof tags === 'string' ? tags : JSON.stringify(tags)
    );

    recordAudit(req.user?.id || null, req.user?.email || null, 'CREATE_ARTICLE', `Created article "${title}" [${status}]`);
    res.json({ success: true, id, slug: cleanSlug });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create article', details: err.message });
  }
});

app.put('/api/admin/articles/:id', requireAuth(['admin', 'editor', 'author']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM articles WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const {
      title,
      slug,
      subtitle,
      excerpt,
      content,
      featured_image,
      author_name,
      category_slug,
      read_time_minutes,
      status,
      is_lead_story,
      is_featured,
      source_urls,
      seo_title,
      seo_description,
      social_image,
      tags
    } = req.body;

    const cleanSlug = (slug || existing.slug).toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const now = new Date().toISOString();

    if (is_lead_story) {
      db.prepare('UPDATE articles SET is_lead_story = 0').run();
      db.prepare(`UPDATE homepage_config SET lead_story_id = ? WHERE id = 'main'`).run(id);
    }

    db.prepare(`
      UPDATE articles SET
        slug = ?,
        title = ?,
        subtitle = ?,
        excerpt = ?,
        content = ?,
        featured_image = ?,
        author_name = ?,
        category_slug = ?,
        read_time_minutes = ?,
        status = ?,
        is_lead_story = ?,
        is_featured = ?,
        source_urls = ?,
        seo_title = ?,
        seo_description = ?,
        social_image = ?,
        updated_at = ?,
        tags = ?
      WHERE id = ?
    `).run(
      cleanSlug,
      title ?? existing.title,
      subtitle ?? existing.subtitle,
      excerpt ?? existing.excerpt,
      content ?? existing.content,
      featured_image ?? existing.featured_image,
      author_name ?? existing.author_name,
      category_slug ?? existing.category_slug,
      read_time_minutes ?? existing.read_time_minutes,
      status ?? existing.status,
      is_lead_story !== undefined ? (is_lead_story ? 1 : 0) : existing.is_lead_story,
      is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured,
      source_urls ?? existing.source_urls,
      seo_title ?? existing.seo_title,
      seo_description ?? existing.seo_description,
      social_image ?? existing.social_image,
      now,
      tags !== undefined ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : existing.tags,
      id
    );

    recordAudit(req.user?.id || null, req.user?.email || null, 'UPDATE_ARTICLE', `Updated article "${title || existing.title}"`);
    res.json({ success: true, id, slug: cleanSlug });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update article', details: err.message });
  }
});

app.delete('/api/admin/articles/:id', requireAuth(['admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const article = db.prepare('SELECT title FROM articles WHERE id = ?').get(id) as any;
    if (!article) return res.status(404).json({ error: 'Article not found' });

    db.prepare('DELETE FROM articles WHERE id = ?').run(id);
    recordAudit(req.user?.id || null, req.user?.email || null, 'DELETE_ARTICLE', `Deleted article "${article.title}"`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete article', details: err.message });
  }
});

// Homepage Configuration CRUD
app.get('/api/admin/homepage-config', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const config = db.prepare(`SELECT * FROM homepage_config WHERE id = 'main'`).get() as any;
    if (!config) return res.status(404).json({ error: 'Homepage config not found' });

    res.json({
      ...config,
      section_order: JSON.parse(config.section_order || '[]'),
      visible_sections: JSON.parse(config.visible_sections || '{}')
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get homepage config', details: err.message });
  }
});

app.put('/api/admin/homepage-config', requireAuth(['admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      hero_headline,
      hero_subcopy,
      hero_cta_primary_text,
      hero_cta_primary_link,
      hero_cta_secondary_text,
      hero_cta_secondary_link,
      lead_story_id,
      section_order,
      visible_sections
    } = req.body;

    const now = new Date().toISOString();

    if (lead_story_id) {
      db.prepare('UPDATE articles SET is_lead_story = 0').run();
      db.prepare('UPDATE articles SET is_lead_story = 1 WHERE id = ?').run(lead_story_id);
    }

    db.prepare(`
      UPDATE homepage_config SET
        hero_headline = ?,
        hero_subcopy = ?,
        hero_cta_primary_text = ?,
        hero_cta_primary_link = ?,
        hero_cta_secondary_text = ?,
        hero_cta_secondary_link = ?,
        lead_story_id = ?,
        section_order = ?,
        visible_sections = ?,
        updated_at = ?
      WHERE id = 'main'
    `).run(
      hero_headline,
      hero_subcopy,
      hero_cta_primary_text,
      hero_cta_primary_link,
      hero_cta_secondary_text,
      hero_cta_secondary_link,
      lead_story_id,
      JSON.stringify(section_order),
      JSON.stringify(visible_sections),
      now
    );

    recordAudit(req.user?.id || null, req.user?.email || null, 'UPDATE_HOMEPAGE_CONFIG', 'Saved homepage editorial layout and lead story settings');
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update homepage config', details: err.message });
  }
});

// Founders CRUD
app.get('/api/admin/founders', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const founders = db.prepare('SELECT * FROM founders ORDER BY created_at DESC').all();
    res.json(founders);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load founders', details: err.message });
  }
});

app.post('/api/admin/founders', requireAuth(['admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, company, role_title, bio, portrait_url, website_url, twitter_url, linkedin_url, key_takeaway, fundraising_stage, interview_notes, is_featured } = req.body;
    if (!name || !company) return res.status(400).json({ error: 'Name and company are required.' });

    const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const id = `fnd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    db.prepare(`
      INSERT INTO founders (id, slug, name, company, role_title, bio, portrait_url, website_url, twitter_url, linkedin_url, key_takeaway, fundraising_stage, interview_notes, is_featured, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, slug, name, company, role_title || 'Founder', bio || '', portrait_url || '', website_url || '', twitter_url || '', linkedin_url || '', key_takeaway || '', fundraising_stage || '', interview_notes || '', is_featured ? 1 : 0, new Date().toISOString());

    recordAudit(req.user?.id || null, req.user?.email || null, 'CREATE_FOUNDER', `Created founder profile "${name}"`);
    res.json({ success: true, id, slug });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create founder profile', details: err.message });
  }
});

app.put('/api/admin/founders/:id', requireAuth(['admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, company, role_title, bio, portrait_url, website_url, twitter_url, linkedin_url, key_takeaway, fundraising_stage, interview_notes, is_featured } = req.body;

    db.prepare(`
      UPDATE founders SET
        name = ?, company = ?, role_title = ?, bio = ?, portrait_url = ?,
        website_url = ?, twitter_url = ?, linkedin_url = ?, key_takeaway = ?,
        fundraising_stage = ?, interview_notes = ?, is_featured = ?
      WHERE id = ?
    `).run(name, company, role_title, bio, portrait_url, website_url, twitter_url, linkedin_url, key_takeaway, fundraising_stage, interview_notes, is_featured ? 1 : 0, id);

    recordAudit(req.user?.id || null, req.user?.email || null, 'UPDATE_FOUNDER', `Updated founder profile "${name}"`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update founder profile', details: err.message });
  }
});

app.delete('/api/admin/founders/:id', requireAuth(['admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM founders WHERE id = ?').run(id);
    recordAudit(req.user?.id || null, req.user?.email || null, 'DELETE_FOUNDER', `Deleted founder id ${id}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete founder', details: err.message });
  }
});

// Brands CRUD
app.get('/api/admin/brands', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const brands = db.prepare('SELECT * FROM brands ORDER BY created_at DESC').all();
    res.json(brands);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load brands', details: err.message });
  }
});

app.post('/api/admin/brands', requireAuth(['admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, logo_url, description, industry, founder_name, website_url, is_featured, is_sponsored, sponsored_disclosure, coverage_summary } = req.body;
    if (!name) return res.status(400).json({ error: 'Brand name is required.' });

    const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const id = `brd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    db.prepare(`
      INSERT INTO brands (id, slug, name, logo_url, description, industry, founder_name, website_url, is_featured, is_sponsored, sponsored_disclosure, coverage_summary, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, slug, name, logo_url || '', description || '', industry || 'Technology', founder_name || '', website_url || '', is_featured ? 1 : 0, is_sponsored ? 1 : 0, sponsored_disclosure || '', coverage_summary || '', new Date().toISOString());

    recordAudit(req.user?.id || null, req.user?.email || null, 'CREATE_BRAND', `Created brand "${name}"`);
    res.json({ success: true, id, slug });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create brand', details: err.message });
  }
});

app.put('/api/admin/brands/:id', requireAuth(['admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, logo_url, description, industry, founder_name, website_url, is_featured, is_sponsored, sponsored_disclosure, coverage_summary } = req.body;

    db.prepare(`
      UPDATE brands SET
        name = ?, logo_url = ?, description = ?, industry = ?, founder_name = ?,
        website_url = ?, is_featured = ?, is_sponsored = ?, sponsored_disclosure = ?,
        coverage_summary = ?
      WHERE id = ?
    `).run(name, logo_url, description, industry, founder_name, website_url, is_featured ? 1 : 0, is_sponsored ? 1 : 0, sponsored_disclosure, coverage_summary, id);

    recordAudit(req.user?.id || null, req.user?.email || null, 'UPDATE_BRAND', `Updated brand "${name}"`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update brand', details: err.message });
  }
});

app.delete('/api/admin/brands/:id', requireAuth(['admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM brands WHERE id = ?').run(id);
    recordAudit(req.user?.id || null, req.user?.email || null, 'DELETE_BRAND', `Deleted brand id ${id}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete brand', details: err.message });
  }
});

// Podcasts CRUD
app.get('/api/admin/podcasts', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const podcasts = db.prepare('SELECT * FROM podcasts ORDER BY episode_number DESC').all();
    res.json(podcasts);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load podcasts', details: err.message });
  }
});

app.post('/api/admin/podcasts', requireAuth(['admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, episode_number, guest_name, guest_role, host_name, description, thumbnail_url, embed_url, source_url, duration, transcript, status } = req.body;
    if (!title || !guest_name) return res.status(400).json({ error: 'Title and guest name required' });

    const slug = `ep-${episode_number || Date.now()}-${title.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`;
    const id = `pod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    db.prepare(`
      INSERT INTO podcasts (id, slug, title, episode_number, guest_name, guest_role, host_name, description, thumbnail_url, embed_url, audio_url, source_url, duration, transcript, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?)
    `).run(id, slug, title, episode_number || 1, guest_name, guest_role || 'Founder', host_name || 'DYNamiQ Media Desk', description || '', thumbnail_url || '', embed_url || '', source_url || '', duration || '45:00', transcript || '', status || 'published', new Date().toISOString());

    recordAudit(req.user?.id || null, req.user?.email || null, 'CREATE_PODCAST', `Added podcast episode "${title}"`);
    res.json({ success: true, id, slug });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add podcast', details: err.message });
  }
});

app.put('/api/admin/podcasts/:id', requireAuth(['admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, episode_number, guest_name, guest_role, host_name, description, thumbnail_url, embed_url, source_url, duration, transcript, status } = req.body;

    db.prepare(`
      UPDATE podcasts SET
        title = ?, episode_number = ?, guest_name = ?, guest_role = ?, host_name = ?,
        description = ?, thumbnail_url = ?, embed_url = ?, source_url = ?, duration = ?,
        transcript = ?, status = ?
      WHERE id = ?
    `).run(title, episode_number, guest_name, guest_role, host_name, description, thumbnail_url, embed_url, source_url, duration, transcript, status, id);

    recordAudit(req.user?.id || null, req.user?.email || null, 'UPDATE_PODCAST', `Updated podcast episode "${title}"`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update podcast', details: err.message });
  }
});

app.delete('/api/admin/podcasts/:id', requireAuth(['admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM podcasts WHERE id = ?').run(id);
    recordAudit(req.user?.id || null, req.user?.email || null, 'DELETE_PODCAST', `Deleted podcast id ${id}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete podcast', details: err.message });
  }
});

// Culture / Memes CRUD
app.get('/api/admin/culture', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const culture = db.prepare('SELECT * FROM culture_memes ORDER BY created_at DESC').all();
    res.json(culture);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load culture items', details: err.message });
  }
});

app.post('/api/admin/culture', requireAuth(['admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, image_url, caption, attribution, source_url, likes_count = 0 } = req.body;
    if (!title || !image_url) return res.status(400).json({ error: 'Title and image URL required' });

    const id = `meme_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    db.prepare(`
      INSERT INTO culture_memes (id, title, image_url, caption, attribution, source_url, likes_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, image_url, caption || '', attribution || '', source_url || '', likes_count, new Date().toISOString());

    recordAudit(req.user?.id || null, req.user?.email || null, 'CREATE_MEME', `Added meme "${title}"`);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create culture item', details: err.message });
  }
});

app.delete('/api/admin/culture/:id', requireAuth(['admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM culture_memes WHERE id = ?').run(id);
    recordAudit(req.user?.id || null, req.user?.email || null, 'DELETE_MEME', `Deleted meme ${id}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete culture item', details: err.message });
  }
});

// Media Library Management
app.get('/api/admin/media', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const media = db.prepare('SELECT * FROM media_assets ORDER BY created_at DESC').all();
    res.json(media);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to list media assets', details: err.message });
  }
});

app.post('/api/admin/media/upload', requireAuth(['admin', 'editor', 'author']), upload.single('file'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { alt_text = '' } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;
    const id = `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    db.prepare(`
      INSERT INTO media_assets (id, filename, original_name, file_path, file_size, mime_type, alt_text, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.file.filename, req.file.originalname, fileUrl, req.file.size, req.file.mimetype, alt_text, new Date().toISOString());

    recordAudit(req.user?.id || null, req.user?.email || null, 'UPLOAD_MEDIA', `Uploaded media file ${req.file.originalname}`);
    res.json({
      success: true,
      media: {
        id,
        filename: req.file.filename,
        original_name: req.file.originalname,
        file_path: fileUrl,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        alt_text
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Media upload failed', details: err.message });
  }
});

app.delete('/api/admin/media/:id', requireAuth(['admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const item = db.prepare('SELECT * FROM media_assets WHERE id = ?').get(id) as any;
    if (!item) return res.status(404).json({ error: 'Media asset not found' });

    const localDiskPath = path.join(UPLOAD_DIR, item.filename);
    if (fs.existsSync(localDiskPath)) {
      fs.unlinkSync(localDiskPath);
    }

    db.prepare('DELETE FROM media_assets WHERE id = ?').run(id);
    recordAudit(req.user?.id || null, req.user?.email || null, 'DELETE_MEDIA', `Deleted media asset ${item.filename}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete media', details: err.message });
  }
});

// Newsletter Subscribers Management
app.get('/api/admin/subscribers', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const subscribers = db.prepare('SELECT * FROM subscribers ORDER BY created_at DESC').all();
    res.json(subscribers);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load subscribers', details: err.message });
  }
});

app.delete('/api/admin/subscribers/:id', requireAuth(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM subscribers WHERE id = ?').run(id);
    recordAudit(req.user?.id || null, req.user?.email || null, 'DELETE_SUBSCRIBER', `Removed subscriber ${id}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to remove subscriber', details: err.message });
  }
});

app.get('/api/admin/subscribers/export', requireAuth(['admin']), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const subscribers = db.prepare('SELECT email, source, status, created_at FROM subscribers ORDER BY created_at DESC').all() as any[];
    let csv = 'Email,Source,Status,Created At\n';
    for (const sub of subscribers) {
      csv += `"${sub.email}","${sub.source}","${sub.status}","${sub.created_at}"\n`;
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="dynamiq_subscribers.csv"');
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: 'Export failed', details: err.message });
  }
});

// Partnership Inquiries Management
app.get('/api/admin/inquiries', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const inquiries = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();
    res.json(inquiries);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch inquiries', details: err.message });
  }
});

app.put('/api/admin/inquiries/:id', requireAuth(['admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['new', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid inquiry status' });
    }

    db.prepare('UPDATE inquiries SET status = ? WHERE id = ?').run(status, id);
    recordAudit(req.user?.id || null, req.user?.email || null, 'UPDATE_INQUIRY', `Changed inquiry ${id} status to ${status}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update inquiry', details: err.message });
  }
});

app.delete('/api/admin/inquiries/:id', requireAuth(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM inquiries WHERE id = ?').run(id);
    recordAudit(req.user?.id || null, req.user?.email || null, 'DELETE_INQUIRY', `Deleted inquiry ${id}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete inquiry', details: err.message });
  }
});

// Site Settings Management
app.get('/api/admin/settings', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const rows = db.prepare('SELECT key, value, updated_at FROM site_settings').all() as any[];
    const settings: Record<string, string> = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load settings', details: err.message });
  }
});

app.put('/api/admin/settings', requireAuth(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = req.body;
    const now = new Date().toISOString();
    const setSetting = db.prepare('INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)');

    for (const [key, value] of Object.entries(updates)) {
      // Disallow dangerous script tags injection
      const sanitized = String(value).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      setSetting.run(key, sanitized, now);
    }

    recordAudit(req.user?.id || null, req.user?.email || null, 'UPDATE_SETTINGS', 'Updated global site settings');
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update settings', details: err.message });
  }
});

// Staff Users Management
app.get('/api/admin/users', requireAuth(['admin']), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const users = db.prepare('SELECT id, email, name, role, avatar_url, created_at, updated_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

app.post('/api/admin/users', requireAuth(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, name, password, role = 'editor' } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, name, and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'A staff member with this email already exists.' });
    }

    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, name, password_hash, role, avatar_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      cleanEmail,
      name,
      hashPassword(password),
      ['admin', 'editor', 'author'].includes(role) ? role : 'editor',
      '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
      now,
      now
    );

    recordAudit(req.user?.id || null, req.user?.email || null, 'CREATE_USER', `Created staff member ${cleanEmail} (${role})`);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
});

app.put('/api/admin/users/:id', requireAuth(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date().toISOString();
    if (password) {
      db.prepare('UPDATE users SET name = ?, role = ?, password_hash = ?, updated_at = ? WHERE id = ?')
        .run(name || user.name, role || user.role, hashPassword(password), now, id);
    } else {
      db.prepare('UPDATE users SET name = ?, role = ?, updated_at = ? WHERE id = ?')
        .run(name || user.name, role || user.role, now, id);
    }

    recordAudit(req.user?.id || null, req.user?.email || null, 'UPDATE_USER', `Updated user ${user.email}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
});

// Audit Logs
app.get('/api/admin/audit-logs', requireAuth(['admin']), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100').all();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve audit logs', details: err.message });
  }
});

/* ==========================================================================
   VITE DEV / PRODUCTION STATIC SERVER
   ========================================================================== */

async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DYNamiQ Editorial Server & Admin listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
