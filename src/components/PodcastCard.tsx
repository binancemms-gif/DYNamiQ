import React, { useState } from 'react';
import { Podcast } from '../types.ts';
import { useData } from '../context/DataContext.tsx';
import { Play, Clock, ArrowUpRight, X } from 'lucide-react';

export const PodcastCard: React.FC<{ podcast: Podcast }> = ({ podcast }) => {
  const { navigate } = useData();
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      <div className="group bg-[#0D0F0D] border border-[#1E221E] hover:border-[#333B33] rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200">
        <div>
          {/* Media Thumbnail with Real Play Button */}
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#161816]">
            <img
              src={podcast.thumbnail_url}
              alt={podcast.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                onClick={() => setIsPlaying(true)}
                className="w-12 h-12 rounded-full bg-[#C6FF53] text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                aria-label={`Play ${podcast.title}`}
              >
                <Play className="w-5 h-5 ml-0.5 fill-current" />
              </button>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] px-2 py-0.5 rounded flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="tabular-nums">{podcast.duration}</span>
            </div>
          </div>

          <div className="p-5">
            {/* Zero-Pill Unboxed Metadata */}
            <div className="flex items-center gap-2 text-xs text-[#71717A] uppercase tracking-wider mb-2">
              <span className="text-[#C6FF53] font-semibold">Episode {podcast.episode_number}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#A1A1AA]">Guest: {podcast.guest_name}</span>
            </div>

            <h4
              onClick={() => navigate(`/podcasts/${podcast.slug}`)}
              className="text-base sm:text-lg font-bold text-white group-hover:text-[#C6FF53] transition-colors font-['Outfit'] leading-snug mb-2 cursor-pointer"
            >
              {podcast.title}
            </h4>

            <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed line-clamp-2">
              {podcast.description}
            </p>
          </div>
        </div>

        <div className="p-5 pt-0">
          <div className="pt-3 border-t border-[#181B18] flex items-center justify-between text-xs text-[#71717A]">
            <span>{podcast.guest_role}</span>
            <button
              onClick={() => navigate(`/podcasts/${podcast.slug}`)}
              className="flex items-center gap-1 text-[#C6FF53] font-semibold hover:underline"
            >
              <span>Notes & Transcript</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Player Modal */}
      {isPlaying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-[#0F110F] border border-[#2B312B] rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#202520]">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-[#C6FF53] font-bold">
                  DYNamiQ Studio Broadcast · Ep. {podcast.episode_number}
                </span>
              </div>
              <button
                onClick={() => setIsPlaying(false)}
                className="text-[#A1A1AA] hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              {podcast.embed_url ? (
                <iframe
                  src={podcast.embed_url}
                  title={podcast.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                  <Play className="w-12 h-12 text-[#C6FF53] mb-4" />
                  <p className="text-white text-base font-medium">{podcast.title}</p>
                  <p className="text-xs text-[#71717A] mt-2">Streaming feed from studio archive</p>
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-1 font-['Outfit']">{podcast.title}</h3>
              <p className="text-xs text-[#A1A1AA]">{podcast.guest_name} · {podcast.guest_role}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
