import React from 'react';
import { Founder } from '../types.ts';
import { useData } from '../context/DataContext.tsx';
import { ArrowUpRight, Globe, Twitter, Linkedin } from 'lucide-react';

export const FounderCard: React.FC<{ founder: Founder }> = ({ founder }) => {
  const { navigate } = useData();

  return (
    <div
      onClick={() => navigate(`/founders/${founder.slug}`)}
      className="group cursor-pointer bg-[#0D0F0D] border border-[#1E221E] hover:border-[#333B33] rounded-xl p-5 flex flex-col justify-between transition-all duration-200"
    >
      <div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-[#1A1D1A] border border-[#2A302A]">
            <img
              src={founder.portrait_url}
              alt={founder.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white group-hover:text-[#C6FF53] transition-colors font-['Outfit']">
              {founder.name}
            </h4>
            <p className="text-xs text-[#A1A1AA]">
              {founder.role_title} <span className="text-[#C6FF53]">·</span> {founder.company}
            </p>
            {founder.fundraising_stage && (
              <span className="text-[11px] text-[#71717A] block mt-0.5">
                {founder.fundraising_stage}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed line-clamp-3 mb-4">
          {founder.bio}
        </p>

        {founder.key_takeaway && (
          <div className="bg-[#121512] border border-[#202520] rounded-md p-3 mb-4">
            <span className="text-[10px] uppercase tracking-wider text-[#C6FF53] font-semibold block mb-1">
              Founder Playbook Lesson
            </span>
            <p className="text-xs text-[#D4D4D8] italic leading-snug line-clamp-2">
              "{founder.key_takeaway}"
            </p>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[#181B18] flex items-center justify-between text-xs text-[#71717A]">
        <div className="flex items-center gap-2">
          {founder.website_url && (
            <a
              href={founder.website_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:text-white transition-colors"
              aria-label="Official Website"
            >
              <Globe className="w-3.5 h-3.5" />
            </a>
          )}
          {founder.twitter_url && (
            <a
              href={founder.twitter_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:text-white transition-colors"
              aria-label="X Profile"
            >
              <Twitter className="w-3.5 h-3.5" />
            </a>
          )}
          {founder.linkedin_url && (
            <a
              href={founder.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:text-white transition-colors"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <span className="flex items-center gap-1 text-[#C6FF53] font-semibold">
          <span>Profile</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
