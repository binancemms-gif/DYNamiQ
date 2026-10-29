import React, { useState } from 'react';
import { useData } from '../context/DataContext.tsx';
import { ArrowLeft, CheckCircle2, ShieldCheck, Mail, Send, Award, BookOpen } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigate } = useData();

  return (
    <div className="min-h-screen bg-[#080908] pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-[#71717A] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <div className="border-b border-[#1C201C] pb-8 mb-10">
          <span className="text-xs uppercase tracking-widest text-[#C6FF53] font-semibold block mb-2">
            The DYNamiQ Manifesto
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Outfit'] mb-4">
            Built by founders. Watched by everyone.
          </h1>
          <p className="text-lg text-[#C6FF53] font-medium">
            Stories in Motion.
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-[#D4D4D8] text-base sm:text-lg leading-relaxed space-y-6">
          <p>
            DYNamiQ was founded on an unapologetic observation: <strong>the tech world is drowning in superficial noise, manufactured controversies, and synthetic PR cycles.</strong>
          </p>
          <p>
            The genuine breakthroughs of our generation—autonomous physical robotics, high-voltage battery packaging, sub-second decentralized state transitions, and capital discipline under compressed SaaS multiples—are not happening on viral consumer feeds. They are happening in dusty aerospace hangars, precision CNC machine shops, and high-intensity founder trenches.
          </p>
          <p>
            DYNamiQ exists to document that physical and architectural reality. We publish in-depth journalism, technical retrospectives, candid founder retrospectives, and studio broadcasts.
          </p>

          <div className="my-10 bg-[#0C0E0C] border border-[#202520] rounded-xl p-8 space-y-4">
            <h3 className="text-xl font-bold text-white font-['Outfit']">Our Editorial Standards</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-[#A1A1AA]">
              <li><strong>Zero Fabricated Metrics:</strong> We verify funding stages, traction claims, and prototype readiness.</li>
              <li><strong>Clear Sponsor Transparency:</strong> Any sponsored profile or partner company on Brand Radar is explicitly disclosed.</li>
              <li><strong>Founder Candor:</strong> We encourage founders to discuss their failures, near-death balance sheet crises, and operational lessons.</li>
              <li><strong>Solana Community Alignment:</strong> We bridge internet-native decentralized culture with world-class institutional journalism.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdvertisePage: React.FC = () => {
  const { navigate } = useData();
  const [formData, setFormData] = useState({
    company: '',
    contact_name: '',
    email: '',
    campaign_type: 'Brand Radar Spotlight',
    budget_range: '$5,000 - $15,000',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseMsg, setResponseMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setResponseMsg(data.message);
        setFormData({
          company: '',
          contact_name: '',
          email: '',
          campaign_type: 'Brand Radar Spotlight',
          budget_range: '$5,000 - $15,000',
          message: ''
        });
      } else {
        setStatus('error');
        setResponseMsg(data.error || 'Failed to submit inquiry.');
      }
    } catch (err: any) {
      setStatus('error');
      setResponseMsg(err.message || 'Submission failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080908] pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-[#71717A] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <div className="border-b border-[#1C201C] pb-8 mb-10">
          <span className="text-xs uppercase tracking-widest text-[#C6FF53] font-semibold block mb-2">
            Partnership & Brand Radar
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Outfit'] mb-4">
            Reach Founders & Builders in Motion
          </h1>
          <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl">
            Partner with DYNamiQ across Brand Radar company spotlights, Podcast Desk integrations, and weekly editorial dispatches.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form */}
          <div className="lg:col-span-7 bg-[#0C0E0C] border border-[#202520] rounded-xl p-8">
            <h3 className="text-lg font-bold text-white mb-6 font-['Outfit']">Submit Campaign Inquiry</h3>

            {status === 'success' ? (
              <div className="bg-[#121A12] border border-[#233523] rounded-lg p-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-[#C6FF53] mx-auto mb-3" />
                <h4 className="text-base font-bold text-white mb-2">Inquiry Recorded</h4>
                <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">{responseMsg}</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="px-4 py-2 bg-[#1C201C] hover:bg-[#252B25] text-white text-xs font-semibold rounded"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Kinetiq Systems"
                    className="w-full bg-[#141614] border border-[#262C26] focus:border-[#C6FF53] rounded-md px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full bg-[#141614] border border-[#262C26] focus:border-[#C6FF53] rounded-md px-3.5 py-2.5 text-sm text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">Corporate Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@company.com"
                      className="w-full bg-[#141614] border border-[#262C26] focus:border-[#C6FF53] rounded-md px-3.5 py-2.5 text-sm text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">Campaign Format</label>
                    <select
                      value={formData.campaign_type}
                      onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value })}
                      className="w-full bg-[#141614] border border-[#262C26] focus:border-[#C6FF53] rounded-md px-3.5 py-2.5 text-sm text-white outline-none"
                    >
                      <option value="Brand Radar Spotlight">Brand Radar Spotlight</option>
                      <option value="Podcast Episode Sponsorship">Podcast Desk Studio Integration</option>
                      <option value="Editorial Dispatch Newsletter">Editorial Newsletter Placement</option>
                      <option value="Custom Builder Series">Custom Builder Multi-Series</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">Planned Budget</label>
                    <select
                      value={formData.budget_range}
                      onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                      className="w-full bg-[#141614] border border-[#262C26] focus:border-[#C6FF53] rounded-md px-3.5 py-2.5 text-sm text-white outline-none"
                    >
                      <option value="$5,000 - $15,000">$5,000 - $15,000</option>
                      <option value="$15,000 - $35,000">$15,000 - $35,000</option>
                      <option value="$35,000+">$35,000+ Enterprise Partnership</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">Campaign Objectives & Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your brand milestone, product launch, or audience target..."
                    className="w-full bg-[#141614] border border-[#262C26] focus:border-[#C6FF53] rounded-md px-3.5 py-2.5 text-sm text-white outline-none resize-none"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-xs text-rose-400">{responseMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3.5 bg-[#C6FF53] hover:bg-[#b0f230] text-black font-bold text-xs uppercase tracking-wider rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{status === 'loading' ? 'Transmitting...' : 'Submit Campaign Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Guidelines Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0C0E0C] border border-[#202520] rounded-xl p-6">
              <div className="flex items-center gap-2 text-xs font-bold text-[#C6FF53] uppercase tracking-wider mb-3">
                <ShieldCheck className="w-4 h-4" />
                <span>Editorial Independence Guarantee</span>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
                DYNamiQ maintains a strict wall between commercial sponsors and editorial evaluations. All sponsored inclusions carry prominent disclosures in compliance with FTC guidelines.
              </p>
              <div className="text-xs text-[#71717A] space-y-2">
                <p>• Inquiries reviewed within 24 business hours</p>
                <p>• Verified metrics & impression reporting provided</p>
                <p>• Native high-fidelity visual asset preparation</p>
              </div>
            </div>

            <div className="p-6 border border-[#1A1D1A] rounded-xl text-xs text-[#71717A]">
              Questions regarding press releases, executive interviews, or breaking coverage? Contact our newsroom directly at <strong className="text-white">press@dynamiq.media</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EditorialPolicyPage: React.FC = () => {
  const { navigate } = useData();

  return (
    <div className="min-h-screen bg-[#080908] pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-[#71717A] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <div className="border-b border-[#1C201C] pb-8 mb-10">
          <span className="text-xs uppercase tracking-widest text-[#C6FF53] font-semibold block mb-2">
            Standards & Governance
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Outfit'] mb-4">
            Editorial Policy & Independence
          </h1>
          <p className="text-sm text-[#A1A1AA]">
            Last updated: October 2026 · DYNamiQ Standards Committee
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-[#D4D4D8] space-y-6 text-base leading-relaxed">
          <h3 className="text-xl font-bold text-white font-['Outfit']">1. Editorial Independence</h3>
          <p>
            DYNamiQ journalists, editors, and podcast hosts operate with complete editorial autonomy. Commercial partnerships, token community holding status, or advertising campaigns never dictate our news coverage or product reviews.
          </p>

          <h3 className="text-xl font-bold text-white font-['Outfit']">2. Sourcing and Attribution</h3>
          <p>
            We attribute original reporting, company statements, and research papers transparently. We do not invent breaking news, confidential funding valuations, or source leaks.
          </p>

          <h3 className="text-xl font-bold text-white font-['Outfit']">3. Corrections and Updates</h3>
          <p>
            When factual errors occur, we correct them swiftly and transparently with an editorial footnote indicating the nature of the correction and the timestamp.
          </p>

          <h3 className="text-xl font-bold text-white font-['Outfit']">4. Community Token & Conflict of Interest</h3>
          <p>
            Editorial staff members are prohibited from trading short-term memetic tokens in advance of article publications. Token disclosures and risk warnings are mandatory on all blockchain-adjacent coverage.
          </p>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { navigate } = useData();

  return (
    <div className="min-h-screen bg-[#080908] pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-[#71717A] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <div className="border-b border-[#1C201C] pb-8 mb-10">
          <span className="text-xs uppercase tracking-widest text-[#C6FF53] font-semibold block mb-2">
            Newsroom Desk
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Outfit'] mb-4">
            Contact DYNamiQ
          </h1>
          <p className="text-base sm:text-lg text-[#A1A1AA]">
            Direct channels for founder pitches, story corrections, and studio requests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0C0E0C] border border-[#202520] rounded-xl p-6">
            <Mail className="w-5 h-5 text-[#C6FF53] mb-3" />
            <h4 className="text-base font-bold text-white mb-1 font-['Outfit']">Editorial & Pitches</h4>
            <p className="text-xs text-[#A1A1AA] mb-4">Send confidential tips, pitch decks, and founder journey stories.</p>
            <p className="text-sm font-mono text-[#C6FF53]">editorial@dynamiq.media</p>
          </div>

          <div className="bg-[#0C0E0C] border border-[#202520] rounded-xl p-6">
            <Award className="w-5 h-5 text-[#C6FF53] mb-3" />
            <h4 className="text-base font-bold text-white mb-1 font-['Outfit']">Brand Radar & Advertising</h4>
            <p className="text-xs text-[#A1A1AA] mb-4">For company spotlights, studio integrations, and newsletter sponsorships.</p>
            <p className="text-sm font-mono text-[#C6FF53]">partners@dynamiq.media</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LegalPage: React.FC<{ type: 'privacy' | 'terms' }> = ({ type }) => {
  const { navigate } = useData();
  const isPrivacy = type === 'privacy';

  return (
    <div className="min-h-screen bg-[#080908] pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-[#71717A] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <div className="border-b border-[#1C201C] pb-8 mb-10">
          <span className="text-xs uppercase tracking-widest text-[#C6FF53] font-semibold block mb-2">
            Governance & Legal
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Outfit'] mb-4">
            {isPrivacy ? 'Privacy Policy & Data Retention' : 'Terms of Service'}
          </h1>
          <p className="text-xs text-[#71717A]">
            Applicable across DYNamiQ publication channels · 2026
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-[#D4D4D8] space-y-6 text-sm sm:text-base leading-relaxed">
          {isPrivacy ? (
            <>
              <p>
                DYNamiQ respects your privacy. We collect only necessary operational information: subscriber email addresses for newsletter delivery and campaign inquiry details submitted voluntarily.
              </p>
              <p>
                We do not sell subscriber lists to third-party data brokers. Subscribers can request deletion or unsubscribe at any time.
              </p>
            </>
          ) : (
            <>
              <p>
                By accessing DYNamiQ, you agree to access editorial content solely for informational and personal reading purposes.
              </p>
              <p>
                Nothing on this publication constitutes legal, tax, or investment advice. Community meme token references are strictly educational and experimental.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
