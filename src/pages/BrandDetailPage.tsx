import React, { useState, useEffect } from 'react';
import { Brand, Article } from '../types.ts';
import { useData } from '../context/DataContext.tsx';
import { ArticleCard } from '../components/ArticleCard.tsx';
import { ArrowLeft, ExternalLink, ShieldCheck, User } from 'lucide-react';

export const BrandDetailPage: React.FC<{ slug: string }> = ({ slug }) => {
  const { navigate } = useData();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/brands/${slug}`);
        if (!res.ok) throw new Error('Brand record not found.');
        const data = await res.json();
        setBrand(data.brand);
        setRelatedArticles(data.related_articles || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrand();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080908] flex items-center justify-center text-xs text-[#71717A] uppercase tracking-widest">
        Loading Brand Radar Profile...
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen bg-[#080908] py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-white mb-4">Brand Record Not Found</h2>
        <button
          onClick={() => navigate('/brands')}
          className="px-4 py-2 bg-[#C6FF53] text-black font-semibold text-xs uppercase rounded"
        >
          Return to Brands
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080908] pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <button
          onClick={() => navigate('/brands')}
          className="flex items-center gap-1.5 text-xs text-[#71717A] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Brand Profiles</span>
        </button>

        {/* Brand Card */}
        <div className="bg-[#0D0F0D] border border-[#202520] rounded-2xl p-8 mb-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-[#1C201C]">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-xl bg-[#141714] border border-[#232823] p-3 flex items-center justify-center shrink-0">
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-[#C6FF53] font-semibold block mb-1">
                  {brand.industry}
                </span>
                <h1 className="text-3xl font-extrabold text-white font-['Outfit']">
                  {brand.name}
                </h1>
                {brand.founder_name && (
                  <p className="text-xs text-[#A1A1AA] mt-1 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-[#71717A]" />
                    <span>Founder / Leader: <strong className="text-white">{brand.founder_name}</strong></span>
                  </p>
                )}
              </div>
            </div>

            {brand.website_url && (
              <a
                href={brand.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#161916] hover:bg-[#202420] text-[#C6FF53] border border-[#2A332A] rounded-md text-xs font-semibold flex items-center gap-1.5 self-center sm:self-auto"
              >
                <span>Visit Official Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-[#71717A] font-semibold mb-2">
                Company Overview
              </h3>
              <p className="text-sm sm:text-base text-[#D4D4D8] leading-relaxed">
                {brand.description}
              </p>
            </div>

            {brand.coverage_summary && (
              <div className="bg-[#121612] border border-[#232B23] rounded-lg p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#C6FF53] font-bold mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>DYNamiQ Coverage Summary</span>
                </div>
                <p className="text-xs sm:text-sm text-[#D4D4D8] leading-relaxed">
                  {brand.coverage_summary}
                </p>
              </div>
            )}

            {brand.is_sponsored === 1 && brand.sponsored_disclosure && (
              <div className="bg-[#1A150D] border border-[#422D0A] rounded-lg p-4 text-xs text-[#FBBF24]">
                <strong className="block mb-1 font-semibold">Advertising Disclosure</strong>
                {brand.sponsored_disclosure}
              </div>
            )}
          </div>
        </div>

        {/* Related Coverage */}
        {relatedArticles.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[#C6FF53] font-bold mb-6">
              Editorial Reporting Involving {brand.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.map((art) => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
