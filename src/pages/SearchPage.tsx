import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext.tsx';
import { Article, Founder, Brand, Podcast } from '../types.ts';
import { ArticleCard } from '../components/ArticleCard.tsx';
import { FounderCard } from '../components/FounderCard.tsx';
import { BrandCard } from '../components/BrandCard.tsx';
import { PodcastCard } from '../components/PodcastCard.tsx';
import { Search, Filter, X } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'articles' | 'founders' | 'brands' | 'podcasts'>('all');
  const [results, setResults] = useState<{
    articles: Article[];
    founders: Founder[];
    brands: Brand[];
    podcasts: Podcast[];
  }>({ articles: [], founders: [], brands: [], podcasts: [] });
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults({ articles: [], founders: [], brands: [], podcasts: [] });
      return;
    }

    const performSearch = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        const data = await res.json();
        setResults({
          articles: data.articles || [],
          founders: data.founders || [],
          brands: data.brands || [],
          podcasts: data.podcasts || []
        });
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const totalResults = results.articles.length + results.founders.length + results.brands.length + results.podcasts.length;

  return (
    <div className="min-h-screen bg-[#080908] pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search Header & Input */}
        <div className="max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#C6FF53] font-semibold block mb-2 text-center">
            Global Publication Query
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit'] text-center mb-6">
            Search DYNamiQ
          </h1>

          <div className="relative">
            <Search className="w-5 h-5 text-[#71717A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles, founders, company spotlights, or podcast episodes..."
              autoFocus
              className="w-full bg-[#101210] border border-[#2B312B] focus:border-[#C6FF53] text-white text-base pl-12 pr-10 py-4 rounded-xl outline-none placeholder-[#52525B] shadow-lg"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          {debouncedQuery && (
            <div className="flex items-center justify-center gap-1.5 mt-6 flex-wrap">
              {[
                { id: 'all', label: `All Results (${totalResults})` },
                { id: 'articles', label: `Articles (${results.articles.length})` },
                { id: 'founders', label: `Founders (${results.founders.length})` },
                { id: 'brands', label: `Brands (${results.brands.length})` },
                { id: 'podcasts', label: `Podcasts (${results.podcasts.length})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    activeFilter === tab.id
                      ? 'bg-[#C6FF53] text-black font-bold'
                      : 'bg-[#141614] text-[#A1A1AA] hover:text-white border border-[#202520]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results Area */}
        {isLoading ? (
          <div className="py-20 text-center text-xs uppercase tracking-widest text-[#71717A]">
            Searching publication database...
          </div>
        ) : debouncedQuery ? (
          totalResults === 0 ? (
            <div className="max-w-md mx-auto text-center py-16 border border-[#202520] rounded-xl p-8 bg-[#0D0F0D]">
              <p className="text-white text-base font-semibold mb-1">No results found for "{debouncedQuery}"</p>
              <p className="text-xs text-[#71717A]">Try querying by founder name, robotics, hardware, Solana, or specific company topics.</p>
            </div>
          ) : (
            <div className="space-y-12">
              
              {/* Articles Section */}
              {(activeFilter === 'all' || activeFilter === 'articles') && results.articles.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[#C6FF53] font-bold mb-4 pb-2 border-b border-[#181B18]">
                    Articles ({results.articles.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.articles.map((art) => (
                      <ArticleCard key={art.id} article={art} />
                    ))}
                  </div>
                </div>
              )}

              {/* Founders Section */}
              {(activeFilter === 'all' || activeFilter === 'founders') && results.founders.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[#C6FF53] font-bold mb-4 pb-2 border-b border-[#181B18]">
                    Founders ({results.founders.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.founders.map((f) => (
                      <FounderCard key={f.id} founder={f} />
                    ))}
                  </div>
                </div>
              )}

              {/* Brands Section */}
              {(activeFilter === 'all' || activeFilter === 'brands') && results.brands.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[#C6FF53] font-bold mb-4 pb-2 border-b border-[#181B18]">
                    Brands & Companies ({results.brands.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {results.brands.map((b) => (
                      <BrandCard key={b.id} brand={b} />
                    ))}
                  </div>
                </div>
              )}

              {/* Podcasts Section */}
              {(activeFilter === 'all' || activeFilter === 'podcasts') && results.podcasts.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[#C6FF53] font-bold mb-4 pb-2 border-b border-[#181B18]">
                    Podcasts ({results.podcasts.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.podcasts.map((p) => (
                      <PodcastCard key={p.id} podcast={p} />
                    ))}
                  </div>
                </div>
              )}

            </div>
          )
        ) : (
          <div className="max-w-lg mx-auto text-center py-16 text-[#71717A] text-sm">
            Enter a keyword above to search through all published stories, founder dossiers, company spotlights, and podcast recordings.
          </div>
        )}

      </div>
    </div>
  );
};
