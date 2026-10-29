import React, { useState, useEffect } from 'react';
import { Founder, Article } from '../types.ts';
import { useData } from '../context/DataContext.tsx';
import { ArticleCard } from '../components/ArticleCard.tsx';
import { ArrowLeft, Globe, Twitter, Linkedin, Building2, Award } from 'lucide-react';

export const FounderDetailPage: React.FC<{ slug: string }> = ({ slug }) => {
  const { navigate } = useData();
  const [founder, setFounder] = useState<Founder | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFounder = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/founders/${slug}`);
        if (!res.ok) throw new Error('Founder profile not found.');
        const data = await res.json();
        setFounder(data.founder);
        setRelatedArticles(data.related_articles || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFounder();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080908] flex items-center justify-center text-xs text-[#71717A] uppercase tracking-widest">
        Loading Founder Dossier...
      </div>
    );
  }

  if (error || !founder) {
    return (
      <div className="min-h-screen bg-[#080908] py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-white mb-4">Founder Profile Not Found</h2>
        <button
          onClick={() => navigate('/founders')}
          className="px-4 py-2 bg-[#C6FF53] text-black font-semibold text-xs uppercase rounded"
        >
          Return to Founders
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080908] pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <button
          onClick={() => navigate('/founders')}
          className="flex items-center gap-1.5 text-xs text-[#71717A] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Founder Profiles</span>
        </button>

        {/* Founder Hero Card */}
        <div className="bg-[#0D0F0D] border border-[#202520] rounded-2xl p-8 mb-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden shrink-0 border border-[#283028] bg-[#161816]">
              <img
                src={founder.portrait_url}
                alt={founder.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <span className="text-xs uppercase tracking-widest text-[#C6FF53] font-semibold block mb-1">
                Founder Dossier
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit'] mb-2">
                {founder.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-[#A1A1AA] mb-4">
                <span className="text-white font-medium">{founder.role_title}</span>
                <span className="text-[#C6FF53]">·</span>
                <span className="flex items-center gap-1 text-white">
                  <Building2 className="w-3.5 h-3.5 text-[#C6FF53]" />
                  <span>{founder.company}</span>
                </span>
                {founder.fundraising_stage && (
                  <>
                    <span className="text-[#C6FF53]">·</span>
                    <span className="text-[#71717A]">{founder.fundraising_stage}</span>
                  </>
                )}
              </div>

              {/* Social / Web links */}
              <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
                {founder.website_url && (
                  <a
                    href={founder.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#C6FF53] hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Company Website</span>
                  </a>
                )}
                {founder.twitter_url && (
                  <a
                    href={founder.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-[#A1A1AA] hover:text-white bg-[#161916] rounded"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                  </a>
                )}
                {founder.linkedin_url && (
                  <a
                    href={founder.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-[#A1A1AA] hover:text-white bg-[#161916] rounded"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Biography & Key Takeaways */}
          <div className="mt-8 pt-8 border-t border-[#1C201C] space-y-6">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-[#71717A] font-semibold mb-2">
                Background & Journey
              </h3>
              <p className="text-sm sm:text-base text-[#D4D4D8] leading-relaxed">
                {founder.bio}
              </p>
            </div>

            {founder.key_takeaway && (
              <div className="bg-[#121612] border border-[#232B23] rounded-lg p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#C6FF53] font-bold mb-2">
                  <Award className="w-4 h-4" />
                  <span>Core Operational Takeaway</span>
                </div>
                <p className="text-sm sm:text-base text-white italic leading-relaxed">
                  "{founder.key_takeaway}"
                </p>
              </div>
            )}

            {founder.interview_notes && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-[#71717A] font-semibold mb-2">
                  Editorial Notes & Coverage History
                </h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  {founder.interview_notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Coverage */}
        {relatedArticles.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[#C6FF53] font-bold mb-6">
              Coverage Involving {founder.name} & {founder.company}
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
