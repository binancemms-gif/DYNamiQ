import React from 'react';
import { useData } from '../context/DataContext.tsx';
import { ArrowUpRight, BookOpen, Users } from 'lucide-react';

export const LeadHero: React.FC = () => {
  const { data, navigate } = useData();
  const hpConfig = data?.homepage_config;
  const leadStory = data?.lead_story;

  const headline = hpConfig?.hero_headline || "The startup world doesn’t need more noise. It needs better stories.";
  const subcopy = hpConfig?.hero_subcopy || "The founders building through uncertainty. The businesses solving real problems. The conversations that change how we think.";
  const ctaPrimaryText = hpConfig?.hero_cta_primary_text || "Explore the stories";
  const ctaPrimaryLink = hpConfig?.hero_cta_primary_link || "#featured-stories";
  const ctaSecondaryText = hpConfig?.hero_cta_secondary_text || "Meet the founders";
  const ctaSecondaryLink = hpConfig?.hero_cta_secondary_link || "/founders";

  const handleCtaClick = (link: string) => {
    if (link.startsWith('#')) {
      const el = document.querySelector(link);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(link);
    }
  };

  const formattedDate = leadStory
    ? new Date(leadStory.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  return (
    <section className="relative pt-8 pb-16 lg:pb-24 border-b border-[#1C201C] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Masthead Bar */}
        <div className="flex items-center justify-between text-xs text-[#71717A] uppercase tracking-widest border-b border-[#181B18] pb-3 mb-10">
          <div className="flex items-center gap-2">
            <span className="text-[#C6FF53] font-semibold">Editorial Edition</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">Global Tech & Venture</span>
          </div>
          <span className="hidden sm:inline">Built by founders. Watched by everyone.</span>
        </div>

        {/* 2-Column Split: Mission Statement vs Lead Story Visual Anchor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left Column: Provocative Editorial Manifesto */}
          <div className="lg:col-span-5 flex flex-col justify-between py-2">
            <div>
              <div className="inline-block text-xs uppercase tracking-widest text-[#C6FF53] font-semibold mb-4">
                DYNamiQ Publication
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 font-['Outfit'] text-balance">
                {headline}
              </h1>

              <p className="text-base sm:text-lg text-[#A1A1AA] leading-relaxed mb-8 max-w-xl">
                {subcopy}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#181B18]">
              <button
                onClick={() => handleCtaClick(ctaPrimaryLink)}
                className="px-6 py-3.5 bg-[#C6FF53] hover:bg-[#b0f230] text-black font-bold text-xs uppercase tracking-wider rounded-md transition-all duration-150 flex items-center gap-2 shadow-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>{ctaPrimaryText}</span>
              </button>

              <button
                onClick={() => handleCtaClick(ctaSecondaryLink)}
                className="px-6 py-3.5 bg-[#121412] hover:bg-[#1A1D1A] text-white border border-[#242924] hover:border-[#384138] font-bold text-xs uppercase tracking-wider rounded-md transition-all duration-150 flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-[#C6FF53]" />
                <span>{ctaSecondaryText}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Administrator-Selected Lead Story Anchor */}
          <div className="lg:col-span-7 flex flex-col">
            {leadStory ? (
              <div
                onClick={() => navigate(`/news/${leadStory.slug}`)}
                className="group cursor-pointer flex-1 flex flex-col justify-between bg-[#0E100E] border border-[#202520] hover:border-[#3A453A] rounded-xl overflow-hidden transition-all duration-200"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#161816]">
                  <img
                    src={leadStory.featured_image}
                    alt={leadStory.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E100E] via-transparent to-transparent opacity-80" />
                  <div className="absolute top-4 left-4">
                    <span className="text-xs uppercase tracking-widest font-bold text-black bg-[#C6FF53] px-2.5 py-1 rounded">
                      Lead Feature
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Zero-Pill Unboxed Metadata */}
                    <div className="flex items-center gap-2 text-xs text-[#A1A1AA] uppercase tracking-wider mb-2">
                      <span className="text-[#C6FF53] font-semibold">{leadStory.category_slug}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{formattedDate}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{leadStory.read_time_minutes} min read</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white group-hover:text-[#C6FF53] transition-colors font-['Outfit'] leading-snug mb-3 text-balance">
                      {leadStory.title}
                    </h2>

                    <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed line-clamp-2">
                      {leadStory.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#1C201C] flex items-center justify-between text-xs text-[#71717A]">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{leadStory.author_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#C6FF53] font-semibold">
                      <span>Read Lead Dispatch</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-12 border border-[#202520] rounded-xl text-center text-[#71717A]">
                No lead story selected yet. Set one in the admin dashboard.
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
