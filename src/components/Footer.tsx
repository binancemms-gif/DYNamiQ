import React, { useState } from 'react';
import { useData } from '../context/DataContext.tsx';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { data, navigate, subscribeNewsletter } = useData();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const settings = data?.settings || {};
  const slogan = settings.editorial_slogan || 'Built by founders. Watched by everyone.';
  const tagline = settings.tagline || 'Stories in Motion.';

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus('loading');
    const res = await subscribeNewsletter(email);
    if (res.success) {
      setStatus('success');
      setMessage(res.message);
      setEmail('');
    } else {
      setStatus('error');
      setMessage(res.message);
    }
  };

  const navTo = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <footer className="bg-[#050605] border-t border-[#1C201C] pt-16 pb-12 text-[#A1A1AA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter Section */}
        <div id="newsletter-section" className="bg-[#0C0E0C] border border-[#202520] rounded-xl p-8 lg:p-12 mb-16 relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-widest text-[#C6FF53] font-semibold">
              Editorial Dispatch
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-3 font-['Outfit']">
              Intelligence from the founder frontier. Delivered weekly.
            </h3>
            <p className="text-sm text-[#A1A1AA] mb-6 leading-relaxed">
              No hype cycles, no sponsored listicles. Just candid founder retrospectives, hard-tech breakthroughs, capital realities, and internet culture dispatches.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@venture.com"
                required
                className="flex-1 bg-[#161816] border border-[#2B312B] focus:border-[#C6FF53] focus:outline-none text-white text-sm px-4 py-3 rounded-md placeholder-[#52525B]"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-[#C6FF53] hover:bg-[#b0f230] text-black font-bold text-xs uppercase tracking-wider rounded-md transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                {status === 'loading' ? 'Joining...' : 'Subscribe'}
              </button>
            </form>

            {status === 'success' && (
              <div className="flex items-center gap-2 text-xs text-[#C6FF53] mt-3">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}
            {status === 'error' && (
              <p className="text-xs text-rose-400 mt-3">{message}</p>
            )}
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#1C201C]">
          
          {/* Column 1: Brand & Slogan */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png"
                alt="DYNamiQ Emblem"
                className="w-8 h-8 object-contain"
              />
              <span className="font-extrabold text-lg text-white font-['Outfit']">DYNamiQ</span>
            </div>
            <p className="text-xs text-[#C6FF53] font-medium tracking-wide">
              {tagline}
            </p>
            <p className="text-xs text-[#71717A] leading-relaxed">
              {slogan}
            </p>
          </div>

          {/* Column 2: Editorial */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-white font-semibold">Editorial</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/startups" onClick={(e) => navTo(e, '/startups')} className="hover:text-white transition-colors">Startups & Tech</a></li>
              <li><a href="/founders" onClick={(e) => navTo(e, '/founders')} className="hover:text-white transition-colors">Founder Files</a></li>
              <li><a href="/podcasts" onClick={(e) => navTo(e, '/podcasts')} className="hover:text-white transition-colors">Podcast Desk</a></li>
              <li><a href="/brands" onClick={(e) => navTo(e, '/brands')} className="hover:text-white transition-colors">Brand Radar</a></li>
              <li><a href="/culture" onClick={(e) => navTo(e, '/culture')} className="hover:text-white transition-colors">Culture & Memes</a></li>
              <li><a href="/solana" onClick={(e) => navTo(e, '/solana')} className="hover:text-white transition-colors">Solana Ecosystem</a></li>
            </ul>
          </div>

          {/* Column 3: Publication & Governance */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-white font-semibold">About & Standards</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" onClick={(e) => navTo(e, '/about')} className="hover:text-white transition-colors">About DYNamiQ</a></li>
              <li><a href="/editorial-policy" onClick={(e) => navTo(e, '/editorial-policy')} className="hover:text-white transition-colors">Editorial Policy</a></li>
              <li><a href="/contact" onClick={(e) => navTo(e, '/contact')} className="hover:text-white transition-colors">Corrections & Pitches</a></li>
              <li><a href="/advertise" onClick={(e) => navTo(e, '/advertise')} className="hover:text-white transition-colors flex items-center gap-1">
                <span>Advertise with Us</span>
                <ArrowUpRight className="w-3 h-3 text-[#C6FF53]" />
              </a></li>
              <li><a href="/privacy" onClick={(e) => navTo(e, '/privacy')} className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" onClick={(e) => navTo(e, '/terms')} className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Column 4: Community & Real Socials */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-white font-semibold">Community</h4>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Global startup media powered by an internet-native builder community on Solana.
            </p>
            <div className="flex flex-col space-y-2 text-sm">
              {settings.social_twitter && (
                <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" className="hover:text-[#C6FF53] transition-colors flex items-center gap-1">
                  <span>X / Twitter</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
              {settings.social_youtube && (
                <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="hover:text-[#C6FF53] transition-colors flex items-center gap-1">
                  <span>YouTube Studio</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
              {settings.social_linkedin && (
                <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-[#C6FF53] transition-colors flex items-center gap-1">
                  <span>LinkedIn Publication</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
              {settings.social_telegram && (
                <a href={settings.social_telegram} target="_blank" rel="noopener noreferrer" className="hover:text-[#C6FF53] transition-colors flex items-center gap-1">
                  <span>Telegram Dispatch</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#52525B] gap-4">
          <p>© {new Date().getFullYear()} DYNamiQ Media. All editorial rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-[#3F3F46]">Stories in Motion</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => navigate('/admin')}
              className="text-[#52525B] hover:text-[#A1A1AA] transition-colors"
            >
              Staff Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
