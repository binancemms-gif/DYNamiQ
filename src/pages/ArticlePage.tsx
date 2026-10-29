import React, { useState, useEffect } from 'react';
import { Article } from '../types.ts';
import { useData } from '../context/DataContext.tsx';
import { ArticleCard } from '../components/ArticleCard.tsx';
import { ArrowLeft, Share2, Twitter, Linkedin, Check, Clock, ExternalLink } from 'lucide-react';

export const ArticlePage: React.FC<{ slug: string }> = ({ slug }) => {
  const { navigate } = useData();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/articles/${slug}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Article not found.');
          throw new Error('Failed to load article.');
        }
        const data = await res.json();
        setArticle(data.article);
        setRelated(data.related || []);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    if (!article) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${article.title} via @dynamiqmedia`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    if (!article) return;
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080908] flex items-center justify-center">
        <div className="text-center">
          <img
            src="/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png"
            alt="DYNamiQ"
            className="w-10 h-10 object-contain mx-auto mb-3 animate-pulse"
          />
          <p className="text-xs uppercase tracking-widest text-[#71717A]">
            Retrieving dispatch...
          </p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#080908] py-20 px-4">
        <div className="max-w-xl mx-auto text-center border border-[#202420] rounded-xl p-8 bg-[#0D0F0D]">
          <h2 className="text-2xl font-bold text-white mb-2 font-['Outfit']">Story Not Found</h2>
          <p className="text-sm text-[#A1A1AA] mb-6">
            The article you requested could not be located or may have been unlisted by the editorial desk.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-[#C6FF53] text-black font-bold text-xs uppercase tracking-wider rounded-md"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const categoryName = article.category_slug.charAt(0).toUpperCase() + article.category_slug.slice(1);
  const tags: string[] = article.tags ? JSON.parse(article.tags || '[]') : [];

  return (
    <article className="min-h-screen bg-[#080908] pt-8 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#181B18] text-xs text-[#71717A]">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to stories</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[#C6FF53] uppercase tracking-wider font-semibold">{categoryName}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{article.read_time_minutes} min read</span>
          </div>
        </div>

        {/* Article Header */}
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-4 font-['Outfit'] text-balance">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-lg sm:text-xl text-[#A1A1AA] leading-relaxed mb-6 font-normal">
              {article.subtitle}
            </p>
          )}

          {/* Author Byline & Social Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-[#1C201C] gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#161816] border border-[#242924] shrink-0">
                <img
                  src={article.author_avatar || '/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png'}
                  alt={article.author_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-sm font-semibold text-white block">
                  {article.author_name}
                </span>
                <div className="flex items-center gap-2 text-xs text-[#71717A]">
                  <span className="tabular-nums">Published {formattedDate}</span>
                </div>
              </div>
            </div>

            {/* Sharing Bar */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#D4D4D8] bg-[#141714] border border-[#242924] hover:border-[#3A453A] rounded-md transition-colors"
                title="Copy link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#C6FF53]" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>

              <button
                onClick={handleShareTwitter}
                className="p-2 text-[#A1A1AA] hover:text-white bg-[#141714] border border-[#242924] hover:border-[#3A453A] rounded-md transition-colors"
                title="Share on X"
              >
                <Twitter className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleShareLinkedIn}
                className="p-2 text-[#A1A1AA] hover:text-white bg-[#141714] border border-[#242924] hover:border-[#3A453A] rounded-md transition-colors"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Hero Visual */}
        <div className="overflow-hidden rounded-xl aspect-[16/9] mb-12 bg-[#121412] border border-[#1C201C]">
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Rich Article Prose Layout */}
        <div className="prose prose-invert max-w-none mb-14 text-[#D4D4D8] text-base sm:text-lg leading-relaxed font-sans">
          {article.content.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-xl sm:text-2xl font-bold text-white mt-10 mb-4 font-['Outfit']">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('> ')) {
              return (
                <blockquote key={idx} className="my-8 py-4 px-6 border-y border-[#262B26] text-lg sm:text-xl italic text-white bg-[#0D0F0D]">
                  {paragraph.replace('> ', '')}
                </blockquote>
              );
            }
            if (paragraph.startsWith('1. ') || paragraph.startsWith('- ')) {
              const lines = paragraph.split('\n');
              return (
                <ul key={idx} className="my-4 space-y-2 list-disc list-inside text-sm sm:text-base">
                  {lines.map((li, lIdx) => (
                    <li key={lIdx} className="leading-relaxed">
                      {li.replace(/^[0-9]+\.\s*|-\s*/, '')}
                    </li>
                  ))}
                </ul>
              );
            }

            // Drop cap for first paragraph
            if (idx === 0) {
              return (
                <p key={idx} className="mb-6 first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#C6FF53]">
                  {paragraph}
                </p>
              );
            }

            return (
              <p key={idx} className="mb-6">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Tags & Source Attribution */}
        <div className="pt-8 border-t border-[#1C201C] space-y-4 mb-16">
          {tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider text-[#71717A] mr-2">Topics:</span>
              {tags.map((tag, tIdx) => (
                <span key={tIdx} className="text-xs text-[#A1A1AA] hover:text-white transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {article.source_urls && (
            <div className="flex items-center gap-2 text-xs text-[#71717A]">
              <span>Verified Source Reference:</span>
              <a
                href={article.source_urls}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C6FF53] hover:underline flex items-center gap-1"
              >
                <span>{article.source_urls}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Related Stories */}
        {related.length > 0 && (
          <section className="pt-12 border-t border-[#1C201C]">
            <h3 className="text-xs uppercase tracking-widest text-[#C6FF53] font-bold mb-6">
              Related Editorial Coverage
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </section>
        )}

      </div>
    </article>
  );
};
