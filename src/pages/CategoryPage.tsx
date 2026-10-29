import React, { useState, useEffect } from 'react';
import { Article } from '../types.ts';
import { useData } from '../context/DataContext.tsx';
import { ArticleCard } from '../components/ArticleCard.tsx';

export const CategoryPage: React.FC<{ categorySlug: string; title: string; subtitle: string }> = ({
  categorySlug,
  title,
  subtitle
}) => {
  const { navigate } = useData();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryArticles = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/articles?category=${categorySlug}`);
        const data = await res.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error('Failed to load category articles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryArticles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categorySlug]);

  return (
    <div className="min-h-screen bg-[#080908] pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-[#1C201C] pb-8 mb-12">
          <span className="text-xs uppercase tracking-widest text-[#C6FF53] font-semibold block mb-2">
            Editorial Section
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-['Outfit'] mb-3">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl">
            {subtitle}
          </p>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-xs uppercase tracking-widest text-[#71717A]">
            Loading category coverage...
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-[#1A1D1A] rounded-xl p-8 bg-[#0D0F0D]">
            <p className="text-sm text-[#A1A1AA] mb-4">No stories published in this section yet.</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-[#161816] hover:bg-[#202420] text-white text-xs uppercase tracking-wider font-semibold rounded"
            >
              Back to Home
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
