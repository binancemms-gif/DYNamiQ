import React, { useState, useEffect } from 'react';
import { Podcast } from '../types.ts';
import { useData } from '../context/DataContext.tsx';
import { ArrowLeft, Clock, User, ExternalLink, Play } from 'lucide-react';

export const PodcastDetailPage: React.FC<{ slug: string }> = ({ slug }) => {
  const { navigate } = useData();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/podcasts/${slug}`);
        if (!res.ok) throw new Error('Episode not found');
        const data = await res.json();
        setPodcast(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPodcast();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080908] flex items-center justify-center text-xs text-[#71717A] uppercase tracking-widest">
        Loading Episode...
      </div>
    );
  }

  if (error || !podcast) {
    return (
      <div className="min-h-screen bg-[#080908] py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-white mb-4">Episode Not Found</h2>
        <button
          onClick={() => navigate('/podcasts')}
          className="px-4 py-2 bg-[#C6FF53] text-black font-semibold text-xs uppercase rounded"
        >
          Return to Podcasts
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080908] pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <button
          onClick={() => navigate('/podcasts')}
          className="flex items-center gap-1.5 text-xs text-[#71717A] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Podcast Episodes</span>
        </button>

        {/* Episode Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-[#71717A] mb-3">
            <span className="text-[#C6FF53] font-bold">Episode {podcast.episode_number}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="tabular-nums">{podcast.duration}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit'] mb-4 leading-tight">
            {podcast.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-[#A1A1AA]">
            <span className="flex items-center gap-1.5 text-white">
              <User className="w-4 h-4 text-[#C6FF53]" />
              <strong>Guest: {podcast.guest_name}</strong> ({podcast.guest_role})
            </span>
            <span>·</span>
            <span>Host: {podcast.host_name}</span>
          </div>
        </div>

        {/* Video / Audio Embed Player */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-[#242A24] mb-10 shadow-2xl">
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
            </div>
          )}
        </div>

        {/* Episode Notes & Full Transcript */}
        <div className="space-y-8 bg-[#0D0F0D] border border-[#202520] rounded-xl p-8">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-[#71717A] font-semibold mb-2">
              Episode Synopsis
            </h3>
            <p className="text-sm sm:text-base text-[#D4D4D8] leading-relaxed">
              {podcast.description}
            </p>
          </div>

          {podcast.transcript && (
            <div className="pt-6 border-t border-[#1C201C]">
              <h3 className="text-xs uppercase tracking-wider text-[#C6FF53] font-semibold mb-3">
                Key Transcript Highlights & Notes
              </h3>
              <div className="text-sm text-[#A1A1AA] leading-relaxed bg-[#121512] p-5 rounded-lg border border-[#202520]">
                {podcast.transcript}
              </div>
            </div>
          )}

          {podcast.source_url && (
            <div className="pt-4 border-t border-[#1C201C] flex items-center justify-between text-xs text-[#71717A]">
              <span>Official broadcast archive</span>
              <a
                href={podcast.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C6FF53] hover:underline flex items-center gap-1"
              >
                <span>View on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
