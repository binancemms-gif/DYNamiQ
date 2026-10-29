import React, { useState, useEffect } from 'react';
import { Brand } from '../types.ts';
import { BrandCard } from '../components/BrandCard.tsx';
import { useData } from '../context/DataContext.tsx';
import { ArrowUpRight } from 'lucide-react';

export const BrandsPage: React.FC = () => {
  const { navigate } = useData();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/brands');
        const data = await res.json();
        setBrands(data || []);
      } catch (err) {
        console.error('Failed to load brands:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#080908] pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#1C201C] pb-8 mb-12 gap-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#C6FF53] font-semibold block mb-2">
              Corporate & Startup Directory
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-['Outfit'] mb-3">
              Brand Radar
            </h1>
            <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl leading-relaxed">
              Tracking deep-tech enterprises, hardware manufacturers, and high-throughput Solana infrastructure shaping the next industrial cycle.
            </p>
          </div>

          <button
            onClick={() => navigate('/advertise')}
            className="px-5 py-3 bg-[#141814] border border-[#2B352B] hover:border-[#C6FF53] text-[#C6FF53] text-xs font-bold uppercase tracking-wider rounded-md transition-colors flex items-center gap-1.5 self-start md:self-auto shrink-0"
          >
            <span>Feature Your Brand</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-xs uppercase tracking-widest text-[#71717A]">
            Loading Brand Radar...
          </div>
        ) : brands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((b) => (
              <BrandCard key={b.id} brand={b} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-sm text-[#71717A]">
            No brands currently profiled.
          </div>
        )}

      </div>
    </div>
  );
};
