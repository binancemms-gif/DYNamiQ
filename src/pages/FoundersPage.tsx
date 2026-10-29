import React, { useState, useEffect } from 'react';
import { Founder } from '../types.ts';
import { FounderCard } from '../components/FounderCard.tsx';

export const FoundersPage: React.FC = () => {
  const [founders, setFounders] = useState<Founder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFounders = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/founders');
        const data = await res.json();
        setFounders(data || []);
      } catch (err) {
        console.error('Failed to load founders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFounders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#080908] pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-[#1C201C] pb-8 mb-12">
          <span className="text-xs uppercase tracking-widest text-[#C6FF53] font-semibold block mb-2">
            Founder Intelligence Archive
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-['Outfit'] mb-3">
            The Founder Files
          </h1>
          <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl leading-relaxed">
            Firsthand accounts of early pivots, production bottlenecks, customer discovery, and capital strategy from builders solving genuine physical and digital problems.
          </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-xs uppercase tracking-widest text-[#71717A]">
            Loading founder profiles...
          </div>
        ) : founders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {founders.map((f) => (
              <FounderCard key={f.id} founder={f} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-sm text-[#71717A]">
            No founder profiles currently listed.
          </div>
        )}

      </div>
    </div>
  );
};
