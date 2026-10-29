import React from 'react';
import { useData } from '../context/DataContext.tsx';
import { ExternalLink, ShieldAlert, Cpu, ArrowUpRight } from 'lucide-react';

export const SolanaCommunitySection: React.FC = () => {
  const { data, navigate } = useData();
  const settings = data?.settings || {};

  const tokenName = settings.solana_token_name || 'DYNamiQ Community Token';
  const tokenTicker = settings.solana_token_ticker || '$DYN';
  const network = settings.solana_network || 'Solana Mainnet';
  const mintAddress = settings.solana_mint_address || '';
  const explorerUrl = settings.solana_explorer_url || '';
  const disclosures = settings.solana_token_disclosures || 'Meme token community experiment. Holds zero equity, zero guarantees of utility or monetary value. High volatility risk. Never invest funds you cannot afford to lose.';

  const solanaArticles = data?.latest_articles?.filter(a => a.category_slug === 'solana') || [];

  return (
    <section className="py-16 border-b border-[#1C201C] bg-[#070907]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#1C201C] gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#14F195] font-semibold mb-2">
              <Cpu className="w-4 h-4" />
              <span>Solana Builder Desk & Community</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
              High-Throughput Internet Media & Culture
            </h2>
          </div>
          <button
            onClick={() => navigate('/solana')}
            className="text-xs font-semibold text-[#14F195] hover:underline flex items-center gap-1 self-start md:self-auto"
          >
            <span>Explore Solana Coverage</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Solana Ecosystem Editorial Stories */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-[#71717A] font-semibold">
              Recent Ecosystem Dispatches
            </h3>

            {solanaArticles.length > 0 ? (
              solanaArticles.slice(0, 2).map((art) => (
                <div
                  key={art.id}
                  onClick={() => navigate(`/news/${art.slug}`)}
                  className="group cursor-pointer bg-[#0D0F0D] border border-[#1E221E] hover:border-[#2C3E2C] rounded-xl p-5 flex flex-col sm:flex-row gap-5 transition-all duration-200"
                >
                  <div className="sm:w-44 aspect-[16/10] overflow-hidden rounded-md bg-[#161816] shrink-0">
                    <img
                      src={art.featured_image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-[#71717A] uppercase tracking-wider mb-1">
                        <span className="text-[#14F195] font-semibold">Solana Builder</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{art.read_time_minutes} min read</span>
                      </div>
                      <h4 className="text-base font-bold text-white group-hover:text-[#14F195] transition-colors font-['Outfit'] mb-2">
                        {art.title}
                      </h4>
                      <p className="text-xs text-[#A1A1AA] line-clamp-2">
                        {art.excerpt}
                      </p>
                    </div>
                    <span className="text-xs text-[#14F195] font-medium flex items-center gap-1 mt-3">
                      <span>Read Story</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#71717A]">No Solana articles published yet.</p>
            )}
          </div>

          {/* Right Column: Community Token Spec & Truthful Disclosures */}
          <div className="lg:col-span-5 bg-[#0C0E0C] border border-[#1F251F] rounded-xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1A201A] mb-5">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#14F195] font-bold">
                  Community Experiment
                </span>
                <h4 className="text-lg font-bold text-white font-['Outfit']">
                  {tokenName} ({tokenTicker})
                </h4>
              </div>
              <span className="text-xs font-mono text-[#A1A1AA] bg-[#141814] px-2 py-1 rounded border border-[#202920]">
                {network}
              </span>
            </div>

            {/* Token Mint Address with truthful deployment status */}
            <div className="space-y-3 mb-6">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#71717A] block mb-1">
                  Verified Mint Address
                </span>
                {mintAddress ? (
                  <div className="flex items-center justify-between bg-[#121512] border border-[#232B23] p-2.5 rounded-md text-xs font-mono text-[#14F195]">
                    <span className="truncate pr-2">{mintAddress}</span>
                    {explorerUrl && (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-[#14F195] shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#121512] border border-[#232B23] p-3 rounded-md text-xs text-[#A1A1AA]">
                    <span className="text-[#C6FF53] font-medium">Pre-Launch / Pending Mint:</span> The token contract is undergoing architecture audits. Official contract address will be announced exclusively on official DYNamiQ channels. Beware of impersonators.
                  </div>
                )}
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#71717A] block mb-1">
                  Community Role
                </span>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Community-led meme token supporting independent founder journalism, studio access tokens, and decentralized reader bounties. No wallet connection is required to browse any editorial story on DYNamiQ.
                </p>
              </div>
            </div>

            {/* Clear Mandatory Risk & Token Disclosure */}
            <div className="bg-[#14120C] border border-[#3E3013] rounded-lg p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#F59E0B] mb-1">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>Mandatory Token Disclosure & Risk Notice</span>
              </div>
              <p className="text-[11px] text-[#D4C3A3] leading-relaxed">
                {disclosures}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
