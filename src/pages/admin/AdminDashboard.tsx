import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useData } from '../../context/DataContext.tsx';
import { AdminLogin } from './AdminLogin.tsx';
import { Article, Founder, Brand, Podcast, CultureMeme, Subscriber, Inquiry, HomepageConfig, MediaAsset, AuditLog, User } from '../../types.ts';
import {
  LayoutDashboard,
  FileText,
  Sliders,
  Users,
  Building2,
  Radio,
  Sparkles,
  Image as ImageIcon,
  Mail,
  Inbox,
  Settings,
  ShieldCheck,
  History,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  Upload,
  Download,
  Eye,
  AlertCircle,
  X
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, token, logout, isLoading: authLoading } = useAuth();
  const { navigate, refreshData } = useData();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Overview metrics
  const [overview, setOverview] = useState<any>(null);

  // Articles
  const [articles, setArticles] = useState<Article[]>([]);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [articleModalOpen, setArticleModalOpen] = useState(false);

  // Homepage Config
  const [hpConfig, setHpConfig] = useState<HomepageConfig | null>(null);

  // Founders
  const [founders, setFounders] = useState<Founder[]>([]);
  const [editingFounder, setEditingFounder] = useState<Partial<Founder> | null>(null);
  const [founderModalOpen, setFounderModalOpen] = useState(false);

  // Brands
  const [brands, setBrands] = useState<Brand[]>([]);
  const [editingBrand, setEditingBrand] = useState<Partial<Brand> | null>(null);
  const [brandModalOpen, setBrandModalOpen] = useState(false);

  // Podcasts
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [editingPodcast, setEditingPodcast] = useState<Partial<Podcast> | null>(null);
  const [podcastModalOpen, setPodcastModalOpen] = useState(false);

  // Culture Memes
  const [memes, setMemes] = useState<CultureMeme[]>([]);
  const [newMeme, setNewMeme] = useState({ title: '', image_url: '', caption: '', attribution: '', source_url: '' });

  // Media Library
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploading, setUploading] = useState(false);

  // Subscribers
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  // Inquiries
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // Settings
  const [settings, setSettings] = useState<Record<string, string>>({});

  // Staff Users & Audit Logs
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ email: '', name: '', password: '', role: 'editor' });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  });

  // Fetch data per tab
  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/admin/overview', { headers: getAuthHeaders() });
      if (res.ok) setOverview(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/admin/articles', { headers: getAuthHeaders() });
      if (res.ok) setArticles(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHpConfig = async () => {
    try {
      const res = await fetch('/api/admin/homepage-config', { headers: getAuthHeaders() });
      if (res.ok) setHpConfig(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFounders = async () => {
    try {
      const res = await fetch('/api/admin/founders', { headers: getAuthHeaders() });
      if (res.ok) setFounders(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/admin/brands', { headers: getAuthHeaders() });
      if (res.ok) setBrands(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPodcasts = async () => {
    try {
      const res = await fetch('/api/admin/podcasts', { headers: getAuthHeaders() });
      if (res.ok) setPodcasts(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCulture = async () => {
    try {
      const res = await fetch('/api/admin/culture', { headers: getAuthHeaders() });
      if (res.ok) setMemes(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/admin/media', { headers: getAuthHeaders() });
      if (res.ok) setMediaAssets(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/admin/subscribers', { headers: getAuthHeaders() });
      if (res.ok) setSubscribers(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/admin/inquiries', { headers: getAuthHeaders() });
      if (res.ok) setInquiries(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', { headers: getAuthHeaders() });
      if (res.ok) setSettings(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/admin/users', { headers: getAuthHeaders() });
      if (res.ok) setStaffUsers(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs', { headers: getAuthHeaders() });
      if (res.ok) setAuditLogs(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!token || !user) return;
    if (activeTab === 'overview') fetchOverview();
    if (activeTab === 'articles') fetchArticles();
    if (activeTab === 'homepage') { fetchHpConfig(); fetchArticles(); }
    if (activeTab === 'founders') fetchFounders();
    if (activeTab === 'brands') fetchBrands();
    if (activeTab === 'podcasts') fetchPodcasts();
    if (activeTab === 'culture') fetchCulture();
    if (activeTab === 'media') fetchMedia();
    if (activeTab === 'subscribers') fetchSubscribers();
    if (activeTab === 'inquiries') fetchInquiries();
    if (activeTab === 'settings') fetchSettings();
    if (activeTab === 'staff') fetchStaff();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab, token, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#080908] flex items-center justify-center text-xs text-[#71717A] uppercase tracking-widest">
        Verifying Security Credentials...
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onSuccess={() => { fetchOverview(); }} />;
  }

  // --- Article Save/Delete ---
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle?.title || !editingArticle?.slug) {
      showNotification('error', 'Title and slug are required');
      return;
    }

    try {
      const isNew = !editingArticle.id;
      const url = isNew ? '/api/admin/articles' : `/api/admin/articles/${editingArticle.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(editingArticle)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save article');

      showNotification('success', `Article "${editingArticle.title}" saved successfully.`);
      setArticleModalOpen(false);
      setEditingArticle(null);
      fetchArticles();
      refreshData();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Deletion failed');
      showNotification('success', 'Article deleted.');
      fetchArticles();
      refreshData();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  // --- Homepage Config Save ---
  const handleSaveHpConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hpConfig) return;

    try {
      const res = await fetch('/api/admin/homepage-config', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(hpConfig)
      });
      if (!res.ok) throw new Error('Failed to update homepage');
      showNotification('success', 'Homepage configuration updated.');
      refreshData();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  // --- Media Upload ---
  const handleMediaUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('alt_text', uploadAlt);

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      showNotification('success', 'Media file uploaded successfully.');
      setUploadFile(null);
      setUploadAlt('');
      fetchMedia();
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm('Permanently remove this media asset?')) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Delete failed');
      showNotification('success', 'Media asset removed.');
      fetchMedia();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  // --- Settings Save ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Settings save failed');
      showNotification('success', 'Global publication settings updated.');
      refreshData();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#060806] text-white flex flex-col">
      
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#0B0D0B] border-b border-[#1C201C] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png"
              alt="DYNamiQ Emblem"
              className="w-7 h-7 object-contain"
            />
            <span className="font-extrabold text-lg text-white font-['Outfit']">DYNamiQ Admin</span>
          </div>

          <span className="text-xs uppercase tracking-wider text-black font-bold bg-[#C6FF53] px-2 py-0.5 rounded">
            {user.role}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#C6FF53] transition-colors"
          >
            <span>Live Publication</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-[#202520]" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-white font-medium">{user.name}</span>
            <button
              onClick={() => logout()}
              className="p-1.5 text-[#71717A] hover:text-rose-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {notification && (
        <div className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-[#142314] text-[#C6FF53] border-b border-[#233523]' : 'bg-rose-950 text-rose-300 border-b border-rose-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Admin Shell */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-[#0A0C0A] border-r border-[#1C201C] p-4 space-y-1 shrink-0">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'articles', label: 'Articles & Content', icon: FileText },
            { id: 'homepage', label: 'Homepage Editor', icon: Sliders },
            { id: 'founders', label: 'Founder Profiles', icon: Users },
            { id: 'brands', label: 'Brand Radar', icon: Building2 },
            { id: 'podcasts', label: 'Podcast Desk', icon: Radio },
            { id: 'culture', label: 'Memes & Culture', icon: Sparkles },
            { id: 'media', label: 'Media Library', icon: ImageIcon },
            { id: 'subscribers', label: 'Subscribers', icon: Mail },
            { id: 'inquiries', label: 'Partnership Inbox', icon: Inbox },
            { id: 'settings', label: 'Publication Settings', icon: Settings },
            { id: 'staff', label: 'Staff & Roles', icon: ShieldCheck },
            { id: 'audit', label: 'Security Audit Log', icon: History },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? 'bg-[#161916] text-[#C6FF53] font-semibold border border-[#262C26]'
                    : 'text-[#A1A1AA] hover:text-white hover:bg-[#121412]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content View */}
        <main className="flex-1 p-6 md:p-10 bg-[#080908] overflow-y-auto">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold font-['Outfit'] text-white">Editorial Dashboard</h1>
                <p className="text-xs text-[#71717A] mt-1">Real-time database-backed publishing statistics</p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Published Stories', value: overview?.published_articles ?? 0, color: '#C6FF53' },
                  { label: 'Draft Articles', value: overview?.draft_articles ?? 0, color: '#F59E0B' },
                  { label: 'Newsletter Readers', value: overview?.total_subscribers ?? 0, color: '#FFFFFF' },
                  { label: 'Brand Inquiries', value: overview?.new_inquiries ?? 0, color: '#14F195' },
                  { label: 'Profiled Founders', value: overview?.total_founders ?? 0, color: '#A1A1AA' },
                  { label: 'Brands on Radar', value: overview?.total_brands ?? 0, color: '#A1A1AA' },
                  { label: 'Studio Podcasts', value: overview?.total_podcasts ?? 0, color: '#A1A1AA' },
                  { label: 'Scheduled Content', value: overview?.scheduled_articles ?? 0, color: '#71717A' },
                ].map((stat, sIdx) => (
                  <div key={sIdx} className="bg-[#0D0F0D] border border-[#1E221E] rounded-xl p-5">
                    <span className="text-xs uppercase tracking-wider text-[#71717A] block mb-1">
                      {stat.label}
                    </span>
                    <span className="text-3xl font-bold tabular-nums font-mono" style={{ color: stat.color }}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="bg-[#0D0F0D] border border-[#1E221E] rounded-xl p-6">
                <h3 className="text-xs uppercase tracking-wider text-[#C6FF53] font-bold mb-4">
                  Recent Staff Publishing Activity
                </h3>
                <div className="space-y-3">
                  {overview?.recent_activity?.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between py-2 border-b border-[#181B18] text-xs">
                      <div>
                        <span className="text-white font-medium">{log.action}</span>
                        <span className="text-[#71717A] ml-2">— {log.details}</span>
                      </div>
                      <span className="text-[#52525B] tabular-nums font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARTICLES */}
          {activeTab === 'articles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#1C201C]">
                <div>
                  <h1 className="text-2xl font-bold font-['Outfit']">Articles & Reporting</h1>
                  <p className="text-xs text-[#71717A]">Create, edit, schedule, or archive editorial articles</p>
                </div>
                <button
                  onClick={() => {
                    setEditingArticle({
                      title: '',
                      slug: '',
                      subtitle: '',
                      excerpt: '',
                      content: '',
                      featured_image: '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
                      author_name: user.name,
                      category_slug: 'startups',
                      read_time_minutes: 4,
                      status: 'published',
                      is_lead_story: 0,
                      is_featured: 0,
                      tags: '["Startups"]'
                    });
                    setArticleModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#C6FF53] text-black font-bold text-xs uppercase tracking-wider rounded-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Draft Story</span>
                </button>
              </div>

              {/* Articles Table */}
              <div className="bg-[#0D0F0D] border border-[#1E221E] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121512] text-[#71717A] uppercase tracking-wider border-b border-[#1C201C]">
                    <tr>
                      <th className="py-3 px-4">Headline</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Published</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181B18]">
                    {articles.map((art) => (
                      <tr key={art.id} className="hover:bg-[#121412] transition-colors">
                        <td className="py-3.5 px-4 font-medium text-white max-w-sm truncate">
                          {art.title}
                          {art.is_lead_story === 1 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-[#C6FF53] text-black font-bold rounded text-[10px]">
                              Lead
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#A1A1AA] uppercase tracking-wider">
                          {art.category_slug}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            art.status === 'published' ? 'bg-[#182618] text-[#C6FF53]' : 'bg-[#291B00] text-[#F59E0B]'
                          }`}>
                            {art.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#71717A] tabular-nums">
                          {new Date(art.published_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingArticle(art);
                              setArticleModalOpen(true);
                            }}
                            className="p-1 text-[#A1A1AA] hover:text-[#C6FF53]"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(art.id, art.title)}
                            className="p-1 text-[#A1A1AA] hover:text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: HOMEPAGE EDITOR */}
          {activeTab === 'homepage' && hpConfig && (
            <div className="max-w-3xl space-y-8">
              <div>
                <h1 className="text-2xl font-bold font-['Outfit']">Homepage & Hero Layout</h1>
                <p className="text-xs text-[#71717A] mt-1">
                  Configure the primary hero headline, lead feature anchor, and section display toggles.
                </p>
              </div>

              <form onSubmit={handleSaveHpConfig} className="space-y-6 bg-[#0D0F0D] border border-[#1E221E] rounded-xl p-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">
                    Hero Headline
                  </label>
                  <textarea
                    rows={2}
                    value={hpConfig.hero_headline}
                    onChange={(e) => setHpConfig({ ...hpConfig, hero_headline: e.target.value })}
                    className="w-full bg-[#141614] border border-[#282E28] focus:border-[#C6FF53] text-white text-base rounded-md p-3 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">
                    Supporting Subcopy
                  </label>
                  <textarea
                    rows={3}
                    value={hpConfig.hero_subcopy}
                    onChange={(e) => setHpConfig({ ...hpConfig, hero_subcopy: e.target.value })}
                    className="w-full bg-[#141614] border border-[#282E28] focus:border-[#C6FF53] text-white text-sm rounded-md p-3 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">
                      Primary CTA Label
                    </label>
                    <input
                      type="text"
                      value={hpConfig.hero_cta_primary_text}
                      onChange={(e) => setHpConfig({ ...hpConfig, hero_cta_primary_text: e.target.value })}
                      className="w-full bg-[#141614] border border-[#282E28] rounded-md px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">
                      Primary CTA Link
                    </label>
                    <input
                      type="text"
                      value={hpConfig.hero_cta_primary_link}
                      onChange={(e) => setHpConfig({ ...hpConfig, hero_cta_primary_link: e.target.value })}
                      className="w-full bg-[#141614] border border-[#282E28] rounded-md px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>

                {/* Lead Story Selection */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">
                    Select Lead Story (Dominant Visual Anchor)
                  </label>
                  <select
                    value={hpConfig.lead_story_id || ''}
                    onChange={(e) => setHpConfig({ ...hpConfig, lead_story_id: e.target.value })}
                    className="w-full bg-[#141614] border border-[#282E28] focus:border-[#C6FF53] rounded-md px-3 py-2.5 text-sm text-white outline-none"
                  >
                    {articles.map((art) => (
                      <option key={art.id} value={art.id}>
                        {art.title} [{art.category_slug}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section Visibility Toggles */}
                <div>
                  <span className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-3">
                    Homepage Sections Visibility
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'hero', label: 'Lead Hero' },
                      { key: 'featured_grid', label: 'Curated Features' },
                      { key: 'founder_files', label: 'Founder Files' },
                      { key: 'startup_news', label: 'Startup News Desk' },
                      { key: 'podcast_desk', label: 'Podcast Desk' },
                      { key: 'brand_radar', label: 'Brand Radar' },
                      { key: 'internet_culture', label: 'Culture & Memes' },
                      { key: 'solana_community', label: 'Solana Ecosystem' },
                    ].map((sec) => (
                      <label key={sec.key} className="flex items-center gap-2 text-xs text-[#D4D4D8] cursor-pointer bg-[#141614] p-2.5 rounded border border-[#232923]">
                        <input
                          type="checkbox"
                          checked={hpConfig.visible_sections[sec.key] !== false}
                          onChange={(e) => setHpConfig({
                            ...hpConfig,
                            visible_sections: {
                              ...hpConfig.visible_sections,
                              [sec.key]: e.target.checked
                            }
                          })}
                          className="accent-[#C6FF53] rounded"
                        />
                        <span>{sec.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C6FF53] hover:bg-[#b0f230] text-black font-bold text-xs uppercase tracking-wider rounded-md transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Homepage Layout</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: FOUNDERS */}
          {activeTab === 'founders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#1C201C]">
                <div>
                  <h1 className="text-2xl font-bold font-['Outfit']">Founder Profiles</h1>
                  <p className="text-xs text-[#71717A]">Manage founder dossiers, lessons, and stage metrics</p>
                </div>
                <button
                  onClick={() => {
                    setEditingFounder({
                      name: '',
                      company: '',
                      role_title: 'Founder & CEO',
                      bio: '',
                      portrait_url: '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
                      website_url: '',
                      key_takeaway: '',
                      fundraising_stage: '',
                      is_featured: 1
                    });
                    setFounderModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#C6FF53] text-black font-bold text-xs uppercase tracking-wider rounded-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Founder</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {founders.map((f) => (
                  <div key={f.id} className="bg-[#0D0F0D] border border-[#1E221E] rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <img src={f.portrait_url} alt={f.name} className="w-12 h-12 rounded-full object-cover border border-[#2B312B]" />
                        <div>
                          <h4 className="text-sm font-bold text-white">{f.name}</h4>
                          <p className="text-xs text-[#A1A1AA]">{f.company}</p>
                        </div>
                      </div>
                      <p className="text-xs text-[#71717A] line-clamp-2">{f.bio}</p>
                    </div>
                    <div className="pt-3 border-t border-[#181B18] flex items-center justify-between text-xs mt-4">
                      <span className="text-[#C6FF53] font-mono">{f.fundraising_stage || 'Profiled'}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingFounder(f);
                            setFounderModalOpen(true);
                          }}
                          className="text-[#71717A] hover:text-[#C6FF53]"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete founder ${f.name}?`)) return;
                            await fetch(`/api/admin/founders/${f.id}`, { method: 'DELETE', headers: getAuthHeaders() });
                            fetchFounders();
                            refreshData();
                          }}
                          className="text-[#71717A] hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BRANDS */}
          {activeTab === 'brands' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#1C201C]">
                <div>
                  <h1 className="text-2xl font-bold font-['Outfit']">Brand Radar Directory</h1>
                  <p className="text-xs text-[#71717A]">Manage company profiles and commercial sponsorships</p>
                </div>
                <button
                  onClick={() => {
                    setEditingBrand({
                      name: '',
                      logo_url: '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png',
                      description: '',
                      industry: 'Deep Tech & Robotics',
                      founder_name: '',
                      website_url: '',
                      is_featured: 1,
                      is_sponsored: 0,
                      sponsored_disclosure: ''
                    });
                    setBrandModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#C6FF53] text-black font-bold text-xs uppercase tracking-wider rounded-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Brand</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {brands.map((b) => (
                  <div key={b.id} className="bg-[#0D0F0D] border border-[#1E221E] rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-white">{b.name}</h4>
                        {b.is_sponsored === 1 && (
                          <span className="text-[10px] text-[#F59E0B] bg-[#291B00] px-1.5 py-0.5 rounded font-semibold">
                            Sponsored
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A1A1AA] line-clamp-2">{b.description}</p>
                    </div>
                    <div className="pt-3 border-t border-[#181B18] flex items-center justify-between text-xs mt-4">
                      <span className="text-[#71717A]">{b.industry}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingBrand(b);
                            setBrandModalOpen(true);
                          }}
                          className="text-[#71717A] hover:text-[#C6FF53]"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete brand ${b.name}?`)) return;
                            await fetch(`/api/admin/brands/${b.id}`, { method: 'DELETE', headers: getAuthHeaders() });
                            fetchBrands();
                            refreshData();
                          }}
                          className="text-[#71717A] hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PODCASTS */}
          {activeTab === 'podcasts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#1C201C]">
                <div>
                  <h1 className="text-2xl font-bold font-['Outfit']">Podcast & Video Catalog</h1>
                  <p className="text-xs text-[#71717A]">Add studio episodes, transcripts, and embed sources</p>
                </div>
                <button
                  onClick={() => {
                    setEditingPodcast({
                      title: '',
                      episode_number: podcasts.length + 1,
                      guest_name: '',
                      guest_role: '',
                      host_name: 'DYNamiQ Media Desk',
                      description: '',
                      thumbnail_url: '/src/assets/images/podcast_desk_episode_1793245611154.jpg',
                      embed_url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
                      duration: '45:00',
                      status: 'published'
                    });
                    setPodcastModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#C6FF53] text-black font-bold text-xs uppercase tracking-wider rounded-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Episode</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {podcasts.map((p) => (
                  <div key={p.id} className="bg-[#0D0F0D] border border-[#1E221E] rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#C6FF53] font-bold mb-1">
                        <span>Ep. {p.episode_number}</span>
                        <span className="text-[#71717A] tabular-nums font-mono">{p.duration}</span>
                      </div>
                      <h4 className="text-base font-bold text-white mb-1 font-['Outfit']">{p.title}</h4>
                      <p className="text-xs text-[#A1A1AA] mb-2">Guest: {p.guest_name}</p>
                      <p className="text-xs text-[#71717A] line-clamp-2">{p.description}</p>
                    </div>
                    <div className="pt-3 border-t border-[#181B18] flex items-center justify-between text-xs mt-4">
                      <span className="text-[#71717A]">{p.status}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingPodcast(p);
                            setPodcastModalOpen(true);
                          }}
                          className="text-[#71717A] hover:text-[#C6FF53]"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete episode ${p.title}?`)) return;
                            await fetch(`/api/admin/podcasts/${p.id}`, { method: 'DELETE', headers: getAuthHeaders() });
                            fetchPodcasts();
                            refreshData();
                          }}
                          className="text-[#71717A] hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: CULTURE & MEMES */}
          {activeTab === 'culture' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#1C201C]">
                <h1 className="text-2xl font-bold font-['Outfit']">Culture & Startup Memes</h1>
                <p className="text-xs text-[#71717A]">Publish original graphics, founder humor, and commentary</p>
              </div>

              {/* Add Meme Form */}
              <div className="bg-[#0D0F0D] border border-[#1E221E] rounded-xl p-6 max-w-xl">
                <h3 className="text-xs uppercase tracking-wider text-[#C6FF53] font-bold mb-4">Add Culture Item</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newMeme.title}
                    onChange={(e) => setNewMeme({ ...newMeme, title: e.target.value })}
                    className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Image URL (e.g. from media library)"
                    value={newMeme.image_url}
                    onChange={(e) => setNewMeme({ ...newMeme, image_url: e.target.value })}
                    className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Caption / Commentary"
                    value={newMeme.caption}
                    onChange={(e) => setNewMeme({ ...newMeme, caption: e.target.value })}
                    className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Attribution / Author"
                    value={newMeme.attribution}
                    onChange={(e) => setNewMeme({ ...newMeme, attribution: e.target.value })}
                    className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                  />
                  <button
                    onClick={async () => {
                      if (!newMeme.title || !newMeme.image_url) return;
                      await fetch('/api/admin/culture', {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify(newMeme)
                      });
                      setNewMeme({ title: '', image_url: '', caption: '', attribution: '', source_url: '' });
                      fetchCulture();
                      refreshData();
                      showNotification('success', 'Meme published');
                    }}
                    className="px-4 py-2 bg-[#C6FF53] text-black font-bold text-xs uppercase rounded"
                  >
                    Post Meme
                  </button>
                </div>
              </div>

              {/* Meme Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {memes.map((m) => (
                  <div key={m.id} className="bg-[#0D0F0D] border border-[#1E221E] rounded-xl overflow-hidden p-3 flex flex-col justify-between">
                    <div>
                      <img src={m.image_url} alt={m.title} className="w-full aspect-video object-cover rounded mb-2" />
                      <h4 className="text-xs font-bold text-white">{m.title}</h4>
                      <p className="text-[11px] text-[#A1A1AA] line-clamp-2 mt-1">"{m.caption}"</p>
                    </div>
                    <div className="pt-2 border-t border-[#181B18] flex items-center justify-between text-xs mt-2">
                      <span className="text-[#71717A]">{m.attribution}</span>
                      <button
                        onClick={async () => {
                          await fetch(`/api/admin/culture/${m.id}`, { method: 'DELETE', headers: getAuthHeaders() });
                          fetchCulture();
                          refreshData();
                        }}
                        className="text-[#71717A] hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: MEDIA LIBRARY */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#1C201C]">
                <h1 className="text-2xl font-bold font-['Outfit']">Media Asset Library</h1>
                <p className="text-xs text-[#71717A]">Upload and manage persistent editorial images, audio, and covers</p>
              </div>

              {/* Upload Box */}
              <form onSubmit={handleMediaUpload} className="bg-[#0D0F0D] border border-[#1E221E] rounded-xl p-6 max-w-xl space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-[#C6FF53] font-bold">Upload New Media Asset</h3>
                <div className="border border-dashed border-[#282E28] hover:border-[#C6FF53] rounded-lg p-6 text-center cursor-pointer">
                  <input
                    type="file"
                    required
                    onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                    className="block w-full text-xs text-[#A1A1AA] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#1C201C] file:text-[#C6FF53] hover:file:bg-[#252B25]"
                  />
                  <p className="text-[11px] text-[#52525B] mt-2">Supports JPG, PNG, WEBP, SVG, MP4 up to 25MB</p>
                </div>

                <input
                  type="text"
                  placeholder="Alt text / description"
                  value={uploadAlt}
                  onChange={(e) => setUploadAlt(e.target.value)}
                  className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                />

                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="px-5 py-2.5 bg-[#C6FF53] text-black font-bold text-xs uppercase tracking-wider rounded-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? 'Storing Asset...' : 'Upload Asset'}</span>
                </button>
              </form>

              {/* Media Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaAssets.map((asset) => (
                  <div key={asset.id} className="bg-[#0D0F0D] border border-[#1E221E] rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <div className="aspect-square w-full rounded bg-[#141614] overflow-hidden mb-2">
                        <img src={asset.file_path} alt={asset.alt_text || asset.original_name} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs text-white truncate font-mono">{asset.original_name}</p>
                      <p className="text-[10px] text-[#71717A]">{(asset.file_size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="pt-2 border-t border-[#181B18] flex items-center justify-between text-xs mt-3">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(asset.file_path);
                          showNotification('success', 'URL copied to clipboard');
                        }}
                        className="text-[#C6FF53] hover:underline text-[11px]"
                      >
                        Copy URL
                      </button>
                      <button
                        onClick={() => handleDeleteMedia(asset.id)}
                        className="text-[#71717A] hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: SUBSCRIBERS */}
          {activeTab === 'subscribers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#1C201C]">
                <div>
                  <h1 className="text-2xl font-bold font-['Outfit']">Newsletter Subscribers</h1>
                  <p className="text-xs text-[#71717A]">Total verified active subscribers: {subscribers.length}</p>
                </div>
                <a
                  href="/api/admin/subscribers/export"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#141714] border border-[#242A24] text-[#C6FF53] hover:border-[#C6FF53] font-bold text-xs uppercase tracking-wider rounded-md flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </a>
              </div>

              <div className="bg-[#0D0F0D] border border-[#1E221E] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121512] text-[#71717A] uppercase tracking-wider border-b border-[#1C201C]">
                    <tr>
                      <th className="py-3 px-4">Subscriber Email</th>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Subscribed Date</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181B18]">
                    {subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#121412]">
                        <td className="py-3 px-4 font-mono text-white">{sub.email}</td>
                        <td className="py-3 px-4 text-[#A1A1AA]">{sub.source}</td>
                        <td className="py-3 px-4 text-[#C6FF53] font-semibold">{sub.status}</td>
                        <td className="py-3 px-4 text-[#71717A] tabular-nums">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={async () => {
                              if (!confirm(`Remove subscriber ${sub.email}?`)) return;
                              await fetch(`/api/admin/subscribers/${sub.id}`, { method: 'DELETE', headers: getAuthHeaders() });
                              fetchSubscribers();
                            }}
                            className="text-[#71717A] hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#1C201C]">
                <h1 className="text-2xl font-bold font-['Outfit']">Partnership & Advertising Inbox</h1>
                <p className="text-xs text-[#71717A]">Campaign proposals submitted via /advertise</p>
              </div>

              <div className="space-y-4">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="bg-[#0D0F0D] border border-[#1E221E] rounded-xl p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-white font-['Outfit']">{inq.company}</span>
                        <span className="text-xs text-[#71717A]">({inq.contact_name} · {inq.email})</span>
                      </div>
                      <select
                        value={inq.status}
                        onChange={async (e) => {
                          await fetch(`/api/admin/inquiries/${inq.id}`, {
                            method: 'PUT',
                            headers: getAuthHeaders(),
                            body: JSON.stringify({ status: e.target.value })
                          });
                          fetchInquiries();
                          showNotification('success', 'Status updated');
                        }}
                        className={`text-xs px-2.5 py-1 rounded font-semibold bg-[#161816] border border-[#293029] ${
                          inq.status === 'new' ? 'text-[#C6FF53]' : inq.status === 'in_progress' ? 'text-[#F59E0B]' : 'text-[#71717A]'
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#A1A1AA]">
                      <span>Format: <strong className="text-white">{inq.campaign_type}</strong></span>
                      <span>Budget: <strong className="text-[#C6FF53]">{inq.budget_range}</strong></span>
                      <span className="text-[#52525B] tabular-nums font-mono">{new Date(inq.created_at).toLocaleString()}</span>
                    </div>

                    <p className="text-xs text-[#D4D4D8] bg-[#121512] p-3 rounded-md border border-[#202520]">
                      "{inq.message}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div className="pb-4 border-b border-[#1C201C]">
                <h1 className="text-2xl font-bold font-['Outfit']">Global Publication Settings</h1>
                <p className="text-xs text-[#71717A]">Brand rules, Solana community parameters, and social links</p>
              </div>

              <form onSubmit={handleSaveSettings} className="bg-[#0D0F0D] border border-[#1E221E] rounded-xl p-6 space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={settings.brand_name || ''}
                    onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
                    className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">Tagline</label>
                  <input
                    type="text"
                    value={settings.tagline || ''}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">Editorial Slogan</label>
                  <input
                    type="text"
                    value={settings.editorial_slogan || ''}
                    onChange={(e) => setSettings({ ...settings, editorial_slogan: e.target.value })}
                    className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="pt-4 border-t border-[#1C201C]">
                  <h4 className="text-xs uppercase tracking-wider text-[#14F195] font-bold mb-3">Solana Community Token Config</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-[#A1A1AA] mb-1">Token Name & Ticker</label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Token Name"
                          value={settings.solana_token_name || ''}
                          onChange={(e) => setSettings({ ...settings, solana_token_name: e.target.value })}
                          className="bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Ticker e.g. $DYN"
                          value={settings.solana_token_ticker || ''}
                          onChange={(e) => setSettings({ ...settings, solana_token_ticker: e.target.value })}
                          className="bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-[#A1A1AA] mb-1">Verified Mint Address (Truthful)</label>
                      <input
                        type="text"
                        placeholder="Leave blank if pre-launch"
                        value={settings.solana_mint_address || ''}
                        onChange={(e) => setSettings({ ...settings, solana_mint_address: e.target.value })}
                        className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs font-mono text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#A1A1AA] mb-1">Solana Explorer URL</label>
                      <input
                        type="text"
                        placeholder="https://solscan.io/token/..."
                        value={settings.solana_explorer_url || ''}
                        onChange={(e) => setSettings({ ...settings, solana_explorer_url: e.target.value })}
                        className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#A1A1AA] mb-1">Mandatory Token Risk Disclosure</label>
                      <textarea
                        rows={3}
                        value={settings.solana_token_disclosures || ''}
                        onChange={(e) => setSettings({ ...settings, solana_token_disclosures: e.target.value })}
                        className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1C201C]">
                  <h4 className="text-xs uppercase tracking-wider text-[#A1A1AA] font-bold mb-3">Social Dispatches</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Twitter URL"
                      value={settings.social_twitter || ''}
                      onChange={(e) => setSettings({ ...settings, social_twitter: e.target.value })}
                      className="bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="YouTube URL"
                      value={settings.social_youtube || ''}
                      onChange={(e) => setSettings({ ...settings, social_youtube: e.target.value })}
                      className="bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="LinkedIn URL"
                      value={settings.social_linkedin || ''}
                      onChange={(e) => setSettings({ ...settings, social_linkedin: e.target.value })}
                      className="bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Telegram URL"
                      value={settings.social_telegram || ''}
                      onChange={(e) => setSettings({ ...settings, social_telegram: e.target.value })}
                      className="bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C6FF53] text-black font-bold text-xs uppercase rounded"
                >
                  Save Global Settings
                </button>
              </form>
            </div>
          )}

          {/* TAB 12: STAFF */}
          {activeTab === 'staff' && (
            <div className="max-w-2xl space-y-6">
              <div className="pb-4 border-b border-[#1C201C]">
                <h1 className="text-2xl font-bold font-['Outfit']">Staff & Role Authorization</h1>
                <p className="text-xs text-[#71717A]">Manage editors, authors, and administrative credentials</p>
              </div>

              {/* Add User */}
              <div className="bg-[#0D0F0D] border border-[#1E221E] rounded-xl p-6 space-y-3">
                <h3 className="text-xs uppercase tracking-wider text-[#C6FF53] font-bold">Invite New Staff Member</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                  >
                    <option value="editor">Editor</option>
                    <option value="author">Author</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <button
                  onClick={async () => {
                    if (!newUser.name || !newUser.email || !newUser.password) return;
                    await fetch('/api/admin/users', {
                      method: 'POST',
                      headers: getAuthHeaders(),
                      body: JSON.stringify(newUser)
                    });
                    setNewUser({ email: '', name: '', password: '', role: 'editor' });
                    fetchStaff();
                    showNotification('success', 'Staff member added');
                  }}
                  className="px-4 py-2 bg-[#C6FF53] text-black font-bold text-xs uppercase rounded"
                >
                  Create Staff Account
                </button>
              </div>

              {/* User List */}
              <div className="bg-[#0D0F0D] border border-[#1E221E] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121512] text-[#71717A] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181B18]">
                    {staffUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[#121412]">
                        <td className="py-3 px-4 font-semibold text-white">{u.name}</td>
                        <td className="py-3 px-4 font-mono text-[#A1A1AA]">{u.email}</td>
                        <td className="py-3 px-4 uppercase text-[#C6FF53] font-bold">{u.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 13: AUDIT LOG */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#1C201C]">
                <h1 className="text-2xl font-bold font-['Outfit']">Administrative Security Audit</h1>
                <p className="text-xs text-[#71717A]">Tamper-resistant audit log of all newsroom changes</p>
              </div>

              <div className="bg-[#0D0F0D] border border-[#1E221E] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121512] text-[#71717A] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Staff</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181B18]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#121412]">
                        <td className="py-3 px-4 font-mono text-[#71717A] tabular-nums whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-medium text-white">{log.user_email || 'System'}</td>
                        <td className="py-3 px-4 font-mono text-[#C6FF53]">{log.action}</td>
                        <td className="py-3 px-4 text-[#A1A1AA]">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ARTICLE CREATE / EDIT MODAL */}
      {articleModalOpen && editingArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl bg-[#0D0F0D] border border-[#2B312B] rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C201C] mb-6">
              <h3 className="text-xl font-bold text-white font-['Outfit']">
                {editingArticle.id ? 'Edit Story' : 'New Story Draft'}
              </h3>
              <button onClick={() => setArticleModalOpen(false)} className="text-[#A1A1AA] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">Headline *</label>
                <input
                  type="text"
                  required
                  value={editingArticle.title || ''}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = !editingArticle.id ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : editingArticle.slug;
                    setEditingArticle({ ...editingArticle, title, slug });
                  }}
                  className="w-full bg-[#141614] border border-[#282E28] rounded px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={editingArticle.slug || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                    className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">Category</label>
                  <select
                    value={editingArticle.category_slug || 'startups'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category_slug: e.target.value })}
                    className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                  >
                    <option value="startups">Startups</option>
                    <option value="founders">Founders</option>
                    <option value="podcasts">Podcasts</option>
                    <option value="brands">Brands</option>
                    <option value="culture">Culture</option>
                    <option value="solana">Solana</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">Subtitle / Deck</label>
                <input
                  type="text"
                  value={editingArticle.subtitle || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, subtitle: e.target.value })}
                  className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">Excerpt / Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={editingArticle.excerpt || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                  className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">Featured Hero Image URL</label>
                <input
                  type="text"
                  value={editingArticle.featured_image || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, featured_image: e.target.value })}
                  className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">Article Body Content (Markdown Supported) *</label>
                <textarea
                  rows={8}
                  required
                  value={editingArticle.content || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  className="w-full bg-[#141614] border border-[#282E28] rounded p-3 text-sm font-sans text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">Publication Status</label>
                  <select
                    value={editingArticle.status || 'published'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, status: e.target.value as any })}
                    className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">Reading Time (min)</label>
                  <input
                    type="number"
                    value={editingArticle.read_time_minutes || 4}
                    onChange={(e) => setEditingArticle({ ...editingArticle, read_time_minutes: parseInt(e.target.value) || 1 })}
                    className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">Author Name</label>
                  <input
                    type="text"
                    value={editingArticle.author_name || user.name}
                    onChange={(e) => setEditingArticle({ ...editingArticle, author_name: e.target.value })}
                    className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-3">
                <label className="flex items-center gap-2 text-xs text-[#D4D4D8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingArticle.is_lead_story === 1}
                    onChange={(e) => setEditingArticle({ ...editingArticle, is_lead_story: e.target.checked ? 1 : 0 })}
                    className="accent-[#C6FF53]"
                  />
                  <span>Promote as Lead Story (Hero Anchor)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#D4D4D8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingArticle.is_featured === 1}
                    onChange={(e) => setEditingArticle({ ...editingArticle, is_featured: e.target.checked ? 1 : 0 })}
                    className="accent-[#C6FF53]"
                  />
                  <span>Feature on Homepage</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#1C201C] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setArticleModalOpen(false)}
                  className="px-4 py-2 bg-[#161816] hover:bg-[#202420] text-white text-xs font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#C6FF53] text-black font-bold text-xs uppercase rounded"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOUNDER MODAL */}
      {founderModalOpen && editingFounder && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0D0F0D] border border-[#2B312B] rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4 font-['Outfit']">Founder Profile Dossier</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Founder Full Name"
                value={editingFounder.name || ''}
                onChange={(e) => setEditingFounder({ ...editingFounder, name: e.target.value })}
                className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Company Name"
                value={editingFounder.company || ''}
                onChange={(e) => setEditingFounder({ ...editingFounder, company: e.target.value })}
                className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Portrait Image URL"
                value={editingFounder.portrait_url || ''}
                onChange={(e) => setEditingFounder({ ...editingFounder, portrait_url: e.target.value })}
                className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
              />
              <textarea
                rows={3}
                placeholder="Biography & Background"
                value={editingFounder.bio || ''}
                onChange={(e) => setEditingFounder({ ...editingFounder, bio: e.target.value })}
                className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Key Operational Lesson / Takeaway"
                value={editingFounder.key_takeaway || ''}
                onChange={(e) => setEditingFounder({ ...editingFounder, key_takeaway: e.target.value })}
                className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Fundraising Stage e.g. Series A ($18M)"
                value={editingFounder.fundraising_stage || ''}
                onChange={(e) => setEditingFounder({ ...editingFounder, fundraising_stage: e.target.value })}
                className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setFounderModalOpen(false)} className="px-3 py-1.5 bg-[#161816] text-xs rounded">Cancel</button>
                <button
                  onClick={async () => {
                    if (!editingFounder.name || !editingFounder.company) return;
                    const isNew = !editingFounder.id;
                    const url = isNew ? '/api/admin/founders' : `/api/admin/founders/${editingFounder.id}`;
                    const method = isNew ? 'POST' : 'PUT';
                    await fetch(url, {
                      method,
                      headers: getAuthHeaders(),
                      body: JSON.stringify(editingFounder)
                    });
                    setFounderModalOpen(false);
                    fetchFounders();
                    refreshData();
                    showNotification('success', isNew ? 'Founder profile added' : 'Founder profile updated');
                  }}
                  className="px-4 py-1.5 bg-[#C6FF53] text-black font-bold text-xs uppercase rounded"
                >
                  Save Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BRAND MODAL */}
      {brandModalOpen && editingBrand && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0D0F0D] border border-[#2B312B] rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4 font-['Outfit']">Brand Radar Company Profile</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Brand / Company Name"
                value={editingBrand.name || ''}
                onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Logo URL"
                value={editingBrand.logo_url || ''}
                onChange={(e) => setEditingBrand({ ...editingBrand, logo_url: e.target.value })}
                className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Industry Category (e.g. Deep Tech & Robotics)"
                value={editingBrand.industry || ''}
                onChange={(e) => setEditingBrand({ ...editingBrand, industry: e.target.value })}
                className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
              />
              <textarea
                rows={3}
                placeholder="Description"
                value={editingBrand.description || ''}
                onChange={(e) => setEditingBrand({ ...editingBrand, description: e.target.value })}
                className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Website URL"
                value={editingBrand.website_url || ''}
                onChange={(e) => setEditingBrand({ ...editingBrand, website_url: e.target.value })}
                className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
              />
              <label className="flex items-center gap-2 text-xs text-[#D4D4D8] cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={editingBrand.is_sponsored === 1}
                  onChange={(e) => setEditingBrand({ ...editingBrand, is_sponsored: e.target.checked ? 1 : 0 })}
                  className="accent-[#C6FF53]"
                />
                <span>Commercial Partner / Sponsored Disclosure</span>
              </label>
              {editingBrand.is_sponsored === 1 && (
                <input
                  type="text"
                  placeholder="Sponsored Disclosure Statement"
                  value={editingBrand.sponsored_disclosure || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, sponsored_disclosure: e.target.value })}
                  className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                />
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setBrandModalOpen(false)} className="px-3 py-1.5 bg-[#161816] text-xs rounded">Cancel</button>
                <button
                  onClick={async () => {
                    if (!editingBrand.name) return;
                    const isNew = !editingBrand.id;
                    const url = isNew ? '/api/admin/brands' : `/api/admin/brands/${editingBrand.id}`;
                    const method = isNew ? 'POST' : 'PUT';
                    await fetch(url, {
                      method,
                      headers: getAuthHeaders(),
                      body: JSON.stringify(editingBrand)
                    });
                    setBrandModalOpen(false);
                    fetchBrands();
                    refreshData();
                    showNotification('success', isNew ? 'Brand record added' : 'Brand record updated');
                  }}
                  className="px-4 py-1.5 bg-[#C6FF53] text-black font-bold text-xs uppercase rounded"
                >
                  Save Brand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PODCAST MODAL */}
      {podcastModalOpen && editingPodcast && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0D0F0D] border border-[#2B312B] rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4 font-['Outfit']">Podcast Episode</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Episode Title"
                value={editingPodcast.title || ''}
                onChange={(e) => setEditingPodcast({ ...editingPodcast, title: e.target.value })}
                className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Guest Name"
                  value={editingPodcast.guest_name || ''}
                  onChange={(e) => setEditingPodcast({ ...editingPodcast, guest_name: e.target.value })}
                  className="bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Guest Role"
                  value={editingPodcast.guest_role || ''}
                  onChange={(e) => setEditingPodcast({ ...editingPodcast, guest_role: e.target.value })}
                  className="bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
                />
              </div>
              <input
                type="text"
                placeholder="Embed URL (e.g. YouTube nocookie embed)"
                value={editingPodcast.embed_url || ''}
                onChange={(e) => setEditingPodcast({ ...editingPodcast, embed_url: e.target.value })}
                className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Duration (e.g. 52:14)"
                value={editingPodcast.duration || ''}
                onChange={(e) => setEditingPodcast({ ...editingPodcast, duration: e.target.value })}
                className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
              />
              <textarea
                rows={3}
                placeholder="Description"
                value={editingPodcast.description || ''}
                onChange={(e) => setEditingPodcast({ ...editingPodcast, description: e.target.value })}
                className="w-full bg-[#141614] border border-[#282E28] rounded px-3 py-2 text-xs text-white"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setPodcastModalOpen(false)} className="px-3 py-1.5 bg-[#161816] text-xs rounded">Cancel</button>
                <button
                  onClick={async () => {
                    if (!editingPodcast.title || !editingPodcast.guest_name) return;
                    const isNew = !editingPodcast.id;
                    const url = isNew ? '/api/admin/podcasts' : `/api/admin/podcasts/${editingPodcast.id}`;
                    const method = isNew ? 'POST' : 'PUT';
                    await fetch(url, {
                      method,
                      headers: getAuthHeaders(),
                      body: JSON.stringify(editingPodcast)
                    });
                    setPodcastModalOpen(false);
                    fetchPodcasts();
                    refreshData();
                    showNotification('success', isNew ? 'Episode recorded' : 'Episode updated');
                  }}
                  className="px-4 py-1.5 bg-[#C6FF53] text-black font-bold text-xs uppercase rounded"
                >
                  Save Episode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
