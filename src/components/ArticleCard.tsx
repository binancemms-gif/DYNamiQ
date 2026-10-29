import React from 'react';
import { Article } from '../types.ts';
import { useData } from '../context/DataContext.tsx';
import { ArrowUpRight } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, featured = false }) => {
  const { navigate } = useData();

  const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const categoryName = article.category_slug.charAt(0).toUpperCase() + article.category_slug.slice(1);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/news/${article.slug}`);
  };

  if (featured) {
    return (
      <article
        onClick={handleClick}
        className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0E100E] border border-[#202520] hover:border-[#384138] rounded-xl p-6 transition-all duration-200"
      >
        <div className="lg:col-span-7 overflow-hidden rounded-lg aspect-[16/10] bg-[#161816]">
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <div className="lg:col-span-5 flex flex-col justify-between py-2">
          <div>
            {/* Zero-Pill Unboxed Metadata */}
            <div className="flex items-center gap-2 text-xs text-[#A1A1AA] uppercase tracking-wider mb-3">
              <span className="text-[#C6FF53] font-semibold">{categoryName}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{formattedDate}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{article.read_time_minutes} min read</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#C6FF53] transition-colors font-['Outfit'] leading-snug mb-3">
              {article.title}
            </h3>

            <p className="text-sm text-[#A1A1AA] leading-relaxed line-clamp-3 mb-4">
              {article.excerpt}
            </p>
          </div>

          <div className="pt-4 border-t border-[#1C201C] flex items-center justify-between text-xs text-[#71717A]">
            <span className="text-white font-medium">{article.author_name}</span>
            <span className="flex items-center gap-1 text-[#C6FF53] font-semibold group-hover:translate-x-0.5 transition-transform">
              <span>Read Story</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={handleClick}
      className="group cursor-pointer flex flex-col justify-between bg-[#0C0E0C] border border-[#1C201C] hover:border-[#2F362F] rounded-lg p-5 transition-all duration-200"
    >
      <div>
        <div className="overflow-hidden rounded-md aspect-[16/10] mb-4 bg-[#161816]">
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Zero-Pill Unboxed Metadata */}
        <div className="flex items-center gap-2 text-xs text-[#71717A] uppercase tracking-wider mb-2">
          <span className="text-[#C6FF53] font-semibold">{categoryName}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{formattedDate}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{article.read_time_minutes} min</span>
        </div>

        <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-[#C6FF53] transition-colors font-['Outfit'] leading-snug mb-2 line-clamp-2">
          {article.title}
        </h4>

        <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed line-clamp-2 mb-4">
          {article.excerpt}
        </p>
      </div>

      <div className="pt-3 border-t border-[#181B18] flex items-center justify-between text-xs text-[#71717A]">
        <span>{article.author_name}</span>
        <span className="text-[#C6FF53] group-hover:translate-x-0.5 transition-transform flex items-center">
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
};
