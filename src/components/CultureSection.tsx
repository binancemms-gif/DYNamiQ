import React, { useState } from 'react';
import { useData } from '../context/DataContext.tsx';
import { CultureMeme } from '../types.ts';
import { Heart, Sparkles, ExternalLink, ArrowUpRight } from 'lucide-react';

export const CultureSection: React.FC = () => {
  const { data, navigate } = useData();
  const memes = data?.culture_memes || [];
  const [likes, setLikes] = useState<Record<string, number>>({});

  const handleLike = (id: string, initialLikes: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes(prev => ({
      ...prev,
      [id]: (prev[id] ?? initialLikes) + 1
    }));
  };

  return (
    <section className="py-16 border-b border-[#1C201C] bg-[#0A0C0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#1C201C] gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#E4E4E7] font-semibold mb-2">
              <Sparkles className="w-4 h-4 text-[#C6FF53]" />
              <span>Internet Culture & Founder Memetics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
              The Reality of Building in Public
            </h2>
          </div>
          <button
            onClick={() => navigate('/culture')}
            className="text-xs font-semibold text-[#C6FF53] hover:underline flex items-center gap-1 self-start md:self-auto"
          >
            <span>All Culture Dispatches</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Culture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {memes.map((m: CultureMeme) => {
            const currentLikes = likes[m.id] ?? m.likes_count;
            return (
              <div
                key={m.id}
                className="group bg-[#0E100E] border border-[#202520] hover:border-[#384138] rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#161816]">
                    <img
                      src={m.image_url}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E100E] via-transparent to-transparent opacity-80" />
                  </div>

                  <div className="p-6">
                    <h4 className="text-lg font-bold text-white mb-2 font-['Outfit'] group-hover:text-[#C6FF53] transition-colors">
                      {m.title}
                    </h4>
                    <p className="text-sm text-[#D4D4D8] leading-relaxed mb-4">
                      "{m.caption}"
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-[#1A1D1A] text-xs text-[#71717A]">
                  <div className="flex items-center gap-2">
                    <span>Credit: <strong className="text-[#A1A1AA] font-medium">{m.attribution || 'DYNamiQ Editorial'}</strong></span>
                    {m.source_url && (
                      <a
                        href={m.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#71717A] hover:text-[#C6FF53]"
                        aria-label="Source Link"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleLike(m.id, m.likes_count, e)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161916] hover:bg-[#202420] text-rose-400 text-xs transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span className="tabular-nums font-semibold">{currentLikes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
