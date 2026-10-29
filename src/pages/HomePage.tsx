import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext.tsx';
import { LeadHero } from '../components/LeadHero.tsx';
import { ArticleCard } from '../components/ArticleCard.tsx';
import { FounderCard } from '../components/FounderCard.tsx';
import { BrandCard } from '../components/BrandCard.tsx';
import { PodcastCard } from '../components/PodcastCard.tsx';
import { CultureSection } from '../components/CultureSection.tsx';
import { SolanaCommunitySection } from '../components/SolanaCommunitySection.tsx';
import { ArrowUpRight, TrendingUp, Users, Radio, ShieldCheck, Flame } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { data, navigate, isLoading } = useData();
  const [newsCategoryFilter, setNewsCategoryFilter] = useState<string>('all');

  // De-duplicate stories across sections so no article repeats on the homepage
  const { leadStory, primaryFeatured, secondaryFeatured, newsArticles } = useMemo(() => {
    const displayedIds = new Set<string>();

    // 1. Lead Story
    const lead = data?.lead_story || null;
    if (lead?.id) displayedIds.add(lead.id);

    // 2. Curated Features (Must not duplicate Lead Story)
    const availableFeatured = (data?.featured_stories || []).filter(a => !displayedIds.has(a.id));
    const prim = availableFeatured[0] || null;
    if (prim?.id) displayedIds.add(prim.id);

    const sec = availableFeatured.slice(1, 4);
    sec.forEach(a => displayedIds.add(a.id));

    // 3. News Desk (Must not duplicate Lead or Curated Features)
    const allLatest = data?.latest_articles || [];
    const nonDuplicatedNews = allLatest.filter(a => !displayedIds.has(a.id));

    return {
      leadStory: lead,
      primaryFeatured: prim,
      secondaryFeatured: sec,
      newsArticles: nonDuplicatedNews
    };
  }, [data]);

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-[#080908] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png"
            alt="DYNamiQ"
            className="w-12 h-12 object-contain animate-pulse"
          />
          <p className="text-xs uppercase tracking-widest text-[#71717A]">
            Loading DYNamiQ Editorial Edition...
          </p>
        </div>
      </div>
    );
  }

  const hpConfig = data?.homepage_config;
  const visible = hpConfig?.visible_sections || {
    hero: true,
    featured_grid: true,
    founder_files: true,
    startup_news: true,
    podcast_desk: true,
    brand_radar: true,
    internet_culture: true,
    solana_community: true
  };

  const founders = data?.founders || [];
  const brands = data?.brands || [];
  const podcasts = data?.podcasts || [];

  // Filter startup news by category
  const filteredNews = newsCategoryFilter === 'all'
    ? newsArticles
    : (data?.latest_articles || []).filter(a => {
        // Exclude lead story from category feed as well
        if (leadStory && a.id === leadStory.id) return false;
        return a.category_slug === newsCategoryFilter;
      });

  return (
    <div className="min-h-screen bg-[#080908]">
      
      {/* 1. Lead Hero Section */}
      {visible.hero !== false && <LeadHero />}

      {/* 2. Featured Stories Section (Strictly Non-Duplicate) */}
      {visible.featured_grid !== false && primaryFeatured && (
        <section id="featured-stories" className="py-16 border-b border-[#1C201C] bg-[#090A09]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#181B18]">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#C6FF53]" />
                <h2 className="text-xs uppercase tracking-widest text-white font-bold">
                  Curated Editorial Features
                </h2>
              </div>
              <span className="text-xs text-[#71717A]">Edition Vol. 2026</span>
            </div>

            {/* Top Featured Article */}
            <div className="mb-8">
              <ArticleCard article={primaryFeatured} featured={true} />
            </div>

            {/* Secondary Stories Grid */}
            {secondaryFeatured.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {secondaryFeatured.map((art) => (
                  <ArticleCard key={art.id} article={art} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. Founder Files Section */}
      {visible.founder_files !== false && founders.length > 0 && (
        <section className="py-16 border-b border-[#1C201C] bg-[#0A0C0A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#1C201C] gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C6FF53] font-semibold mb-2">
                  <Users className="w-4 h-4" />
                  <span>The Founder Files</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
                  Candid Lessons from the Frontlines
                </h2>
              </div>
              <button
                onClick={() => navigate('/founders')}
                className="text-xs font-semibold text-[#C6FF53] hover:underline flex items-center gap-1 self-start md:self-auto"
              >
                <span>View All Founder Profiles</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {founders.slice(0, 4).map((f) => (
                <FounderCard key={f.id} founder={f} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Startup News Desk (Strictly De-duplicated from Hero and Features) */}
      {visible.startup_news !== false && (
        <section className="py-16 border-b border-[#1C201C] bg-[#080908]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#1C201C] gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#A1A1AA] font-semibold mb-2">
                  <TrendingUp className="w-4 h-4 text-[#C6FF53]" />
                  <span>Startup News Desk</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
                  Latest Technology & Business Reporting
                </h2>
              </div>

              {/* Segmented Filter Buttons */}
              <div className="flex items-center gap-1 p-1 bg-[#121412] border border-[#202420] rounded-lg overflow-x-auto max-w-full">
                {[
                  { id: 'all', label: 'All News' },
                  { id: 'startups', label: 'Startups' },
                  { id: 'founders', label: 'Founders' },
                  { id: 'solana', label: 'Solana' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setNewsCategoryFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      newsCategoryFilter === tab.id
                        ? 'bg-[#1C201C] text-[#C6FF53] font-semibold'
                        : 'text-[#71717A] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredNews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.slice(0, 6).map((art) => (
                  <ArticleCard key={art.id} article={art} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-[#71717A] text-sm">
                No additional articles in this filter.
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. Podcast and Video Desk */}
      {visible.podcast_desk !== false && podcasts.length > 0 && (
        <section className="py-16 border-b border-[#1C201C] bg-[#0A0B0A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#1C201C] gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C6FF53] font-semibold mb-2">
                  <Radio className="w-4 h-4" />
                  <span>DYNamiQ Studio</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
                  The Podcast Desk & Video Interviews
                </h2>
              </div>
              <button
                onClick={() => navigate('/podcasts')}
                className="text-xs font-semibold text-[#C6FF53] hover:underline flex items-center gap-1 self-start md:self-auto"
              >
                <span>View Full Episode Catalog</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {podcasts.slice(0, 2).map((p) => (
                <PodcastCard key={p.id} podcast={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Brand Radar Section */}
      {visible.brand_radar !== false && brands.length > 0 && (
        <section className="py-16 border-b border-[#1C201C] bg-[#080908]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#1C201C] gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C6FF53] font-semibold mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Company Spotlights</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
                  Brand Radar
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="/advertise"
                  onClick={(e) => { e.preventDefault(); navigate('/advertise'); }}
                  className="text-xs text-[#71717A] hover:text-white"
                >
                  Feature your company
                </a>
                <button
                  onClick={() => navigate('/brands')}
                  className="text-xs font-semibold text-[#C6FF53] hover:underline flex items-center gap-1"
                >
                  <span>All Brands</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {brands.slice(0, 3).map((b) => (
                <BrandCard key={b.id} brand={b} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Internet Culture & Memetics */}
      {visible.internet_culture !== false && <CultureSection />}

      {/* 8. Solana Ecosystem Section */}
      {visible.solana_community !== false && <SolanaCommunitySection />}

    </div>
  );
};
