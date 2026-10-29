import React from 'react';
import { Brand } from '../types.ts';
import { useData } from '../context/DataContext.tsx';
import { ArrowUpRight, ExternalLink } from 'lucide-react';

export const BrandCard: React.FC<{ brand: Brand }> = ({ brand }) => {
  const { navigate } = useData();

  return (
    <div
      onClick={() => navigate(`/brands/${brand.slug}`)}
      className="group cursor-pointer bg-[#0D0F0D] border border-[#1E221E] hover:border-[#333B33] rounded-xl p-5 flex flex-col justify-between transition-all duration-200"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#141714] border border-[#232823] p-2 flex items-center justify-center shrink-0">
              <img
                src={brand.logo_url}
                alt={brand.name}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
            <div>
              <h4 className="text-base font-bold text-white group-hover:text-[#C6FF53] transition-colors font-['Outfit']">
                {brand.name}
              </h4>
              <span className="text-xs text-[#71717A] block">
                {brand.industry}
              </span>
            </div>
          </div>

          {/* Paid / Sponsored Clear Disclosure */}
          {brand.is_sponsored === 1 ? (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#F59E0B] bg-[#291B00] border border-[#78350F] px-2 py-0.5 rounded">
              Partner
            </span>
          ) : brand.is_featured === 1 ? (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#C6FF53] bg-[#162016] border border-[#233523] px-2 py-0.5 rounded">
              Spotlight
            </span>
          ) : null}
        </div>

        <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed line-clamp-3 mb-3">
          {brand.description}
        </p>

        {brand.founder_name && (
          <p className="text-xs text-[#71717A] mb-3">
            Leadership: <span className="text-[#D4D4D8]">{brand.founder_name}</span>
          </p>
        )}

        {brand.is_sponsored === 1 && brand.sponsored_disclosure && (
          <p className="text-[11px] text-[#A1A1AA] italic bg-[#141514] p-2 rounded border border-[#202520] mb-3">
            Disclosure: {brand.sponsored_disclosure}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-[#181B18] flex items-center justify-between text-xs text-[#71717A]">
        {brand.website_url ? (
          <a
            href={brand.website_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="hover:text-white transition-colors flex items-center gap-1 text-[#A1A1AA]"
          >
            <span>Website</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : <span />}

        <span className="flex items-center gap-1 text-[#C6FF53] font-semibold">
          <span>Coverage</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
