import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const AdminLogin: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@dynamiq.media');
  const [password, setPassword] = useState('admin2026!');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@dynamiq.media');
    setPassword('admin2026!');
  };

  return (
    <div className="min-h-screen bg-[#060806] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0D0F0D] border border-[#202520] rounded-2xl p-8 shadow-2xl">
        
        {/* Brand Emblem */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <img
              src="/assets/aistudio/A3EA77F2-C54C-4D7D-B276-6FDEB7FC7308_4e57c212.png"
              alt="DYNamiQ Emblem"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-white font-['Outfit']">DYNamiQ Staff Portal</h2>
          <p className="text-xs text-[#71717A] mt-1">Editorial Administration & Content Management</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">
              Editorial Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@dynamiq.media"
                className="w-full bg-[#141714] border border-[#262D26] focus:border-[#C6FF53] text-white text-sm pl-10 pr-3.5 py-2.5 rounded-md outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">
              Secure Key
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#141714] border border-[#262D26] focus:border-[#C6FF53] text-white text-sm pl-10 pr-3.5 py-2.5 rounded-md outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#C6FF53] hover:bg-[#b0f230] text-black font-bold text-xs uppercase tracking-wider rounded-md transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Newsroom'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Helper */}
        <div className="mt-8 pt-6 border-t border-[#1C201C] text-center">
          <p className="text-xs text-[#71717A] mb-2">Default Initial Administrator Credentials:</p>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-xs font-mono text-[#C6FF53] hover:underline"
          >
            admin@dynamiq.media / admin2026!
          </button>
        </div>
      </div>
    </div>
  );
};
