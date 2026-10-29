import React, { useState, useEffect } from 'react';
import { Podcast } from '../types.ts';
import { PodcastCard } from '../components/PodcastCard.tsx';
import { Radio } from 'lucide-react';

export const PodcastsPage: React.FC = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/podcasts');
        const data = await res.json();
        setPodcasts(data || []);
      } catch (err) {
        console.error('Failed to load podcasts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPodcasts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#080908] pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-[#1C201C] pb-8 mb-12">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C6FF53] font-semibold mb-2">
            <Radio className="w-4 h-4" />
            <span>Studio Broadcasts & Tapes</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-['Outfit'] mb-3">
            The Podcast & Video Desk
          </h1>
          <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl leading-relaxed">
            Unfiltered studio conversations with founders building aerospace systems, physical hardware, deep AI tooling, and decentralized networks.
          </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-xs uppercase tracking-widest text-[#71717A]">
            Loading Podcast Catalog...
          </div>
        ) : podcasts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {podcasts.map((p) => (
              <PodcastCard key={p.id} podcast={p} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-sm text-[#71717A]">
            No podcast episodes currently published.
          </div>
        )}

      </div>
    </div>
  );
};
