import React, { useState } from 'react';
import { useData } from '../context/DataContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Search, Menu, X, Shield, ArrowUpRight } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentPath, navigate } = useData();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Startups', path: '/startups' },
    { label: 'Founders', path: '/founders' },
    { label: 'Podcasts', path: '/podcasts' },
    { label: 'Brands', path: '/brands' },
    { label: 'Culture', path: '/culture' },
    { label: 'Solana', path: '/solana' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#080908]/90 backdrop-blur-md border-b border-[#1C201C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          
          {/* Zone 1: Brand Symbol & Name */}
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="flex items-center gap-3 group shrink-0"
            aria-label="DYNamiQ Homepage"
          >
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <img
                src="/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png"
                alt="DYNamiQ Emblem"
                className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-[#C6FF53] transition-colors font-['Outfit']">
                DYNamiQ
              </span>
            </div>
          </a>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => {
              const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleLinkClick(e, item.path)}
                  className={`text-sm font-medium tracking-wide transition-colors whitespace-nowrap py-1 relative ${
                    isActive
                      ? 'text-[#C6FF53]'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C6FF53] rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions (Search & Subscribe / Admin) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/search')}
              className="p-2 text-[#A1A1AA] hover:text-white hover:bg-[#161816] rounded-md transition-colors"
              aria-label="Search articles and founders"
            >
              <Search className="w-5 h-5" />
            </button>

            {user ? (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#161916] text-[#C6FF53] border border-[#242924] rounded-md hover:border-[#C6FF53] transition-colors whitespace-nowrap"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/admin')}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#71717A] hover:text-white transition-colors"
                title="Staff sign in"
              >
                Staff
              </button>
            )}

            <button
              onClick={() => {
                const el = document.getElementById('newsletter-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/#newsletter-section');
                }
              }}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-black bg-[#C6FF53] hover:bg-[#b0f230] rounded-md transition-colors shadow-sm whitespace-nowrap"
            >
              Subscribe
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#A1A1AA] hover:text-white hover:bg-[#161816] rounded-md transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A0C0A] border-b border-[#1C201C] px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navItems.map((item) => {
              const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleLinkClick(e, item.path)}
                  className={`text-base font-medium py-2 px-3 rounded-md transition-colors ${
                    isActive
                      ? 'text-[#C6FF53] bg-[#161916]'
                      : 'text-[#D4D4D8] hover:text-white hover:bg-[#121412]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#1C201C] flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/admin');
              }}
              className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-[#C6FF53]"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Management</span>
            </button>
            <a
              href="/advertise"
              onClick={(e) => handleLinkClick(e, '/advertise')}
              className="text-xs uppercase tracking-wider font-semibold text-[#C6FF53] flex items-center gap-1"
            >
              <span>Partner With Us</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
