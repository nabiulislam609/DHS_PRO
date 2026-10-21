import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  GraduationCap,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Mail,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const {
    siteSettings,
    loginAdmin,
    setCurrentFrontendPage,
    adminLoginError,
    setAdminLoginError,
  } = useSchool();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setAdminLoginError(null);

    if (!email.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার Firebase অ্যাডমিন ইমেইল প্রদান করুন।');
      return;
    }
    if (!password) {
      setErrorMessage('অনুগ্রহ করে পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginAdmin(email, password);
      if (!res.success) {
        setErrorMessage(res.message || 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'লগইন করার সময় একটি সমস্যা দেখা দিয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-white flex flex-col lg:flex-row font-sans selection:bg-rose-900 selection:text-white">
      {/* Left Panel: Deep burgundy / wine atmospheric branding section (Matching Image 3) */}
      <div className="lg:w-1/2 min-h-[380px] lg:min-h-screen bg-gradient-to-br from-[#1e0714] via-[#2a091c] to-[#0c0308] p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
        {/* Soft Ambient Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(244,63,94,0.14),_transparent_70%)] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-950/30 rounded-full blur-3xl pointer-events-none" />

        {/* Top Left: School Logo / Brand name */}
        <div className="relative z-10 flex items-center justify-between">
          <div
            onClick={() => setCurrentFrontendPage('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <img
              src={siteSettings.logoUrl || '/assets/aistudio/image_08094a8b.png'}
              alt="Logo"
              className="w-8 h-8 rounded-full object-cover border-[2px] border-[#F59E0B] shadow-sm bg-[#00A859]"
            />
            <div>
              <span className="font-extrabold text-sm tracking-wider uppercase text-white/90 group-hover:text-white transition">
                {siteSettings.schoolNameEnglish || 'DADRA HIGH SCHOOL'}
              </span>
              <span className="block text-[10px] text-rose-300/80 font-medium">
                {siteSettings.schoolNameBangla}
              </span>
            </div>
          </div>

          <button
            onClick={() => setCurrentFrontendPage('home')}
            className="lg:hidden flex items-center gap-1.5 text-xs text-rose-200 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>মূল সাইট</span>
          </button>
        </div>

        {/* Center: Big Prominent Logo Card (Matching Image 3) */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto py-10">
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-[#090307]/90 border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-md p-8 flex flex-col items-center justify-center text-center transition transform hover:scale-[1.02] duration-300 group">
            <div className="space-y-4">
              <img
                src={siteSettings.logoUrl || '/assets/aistudio/image_08094a8b.png'}
                alt="School Emblem"
                className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full object-cover border-[3px] border-[#F59E0B] shadow-2xl bg-[#00A859] p-0.5"
              />
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase font-mono">
                  {siteSettings.shortName || 'DADRA HS'}
                </h3>
                <p className="text-xs text-rose-300/80 font-semibold tracking-widest uppercase mt-0.5">
                  ADMIN PORTAL
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tagline / Subtitle */}
        <div className="relative z-10 text-center lg:text-left space-y-1">
          <p className="text-xs font-bold text-rose-200/90 tracking-wider uppercase">
            {siteSettings.schoolNameEnglish} • SECURE ADMIN PORTAL
          </p>
          <p className="text-[11px] text-rose-300/60 leading-relaxed">
            {siteSettings.tagline || 'অনলাইন স্কুল ম্যানেজমেন্ট ও কন্ট্রোল প্যানেল'} • শিক্ষাবর্ষ ২০২৬
          </p>
        </div>
      </div>

      {/* Right Panel: Clean dark auth form (Matching Image 3) */}
      <div className="lg:w-1/2 min-h-[500px] lg:min-h-screen bg-[#0a0a0c] p-6 sm:p-12 lg:p-20 flex flex-col justify-center items-center">
        <div className="w-full max-w-sm sm:max-w-md space-y-7">
          {/* Top Return Button (Desktop) */}
          <div className="hidden lg:flex items-center justify-between">
            <button
              onClick={() => setCurrentFrontendPage('home')}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>মূল ওয়েবসাইটে ফিরে যান</span>
            </button>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>SSL এনক্রিপ্টেড সুরক্ষিত</span>
            </span>
          </div>

          {/* Heading Section */}
          <div className="space-y-1.5 text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              এডমিন লগইন
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Firebase Authentication ইমেইল ও পাসওয়ার্ড প্রদান করে অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করুন
            </p>
          </div>

          {/* Error Alert (Displays both login and authorization errors in Bengali) */}
          {(errorMessage || adminLoginError) && (
            <div className="bg-rose-950/70 border border-rose-700 text-rose-200 text-xs sm:text-sm px-4 py-3 rounded-xl flex items-start gap-2.5 animate-fadeIn shadow-lg">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMessage || adminLoginError}</span>
            </div>
          )}

          {/* Auth Form - Strictly Email & Password with Firebase Auth */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Firebase এডমিন ইমেইল (Admin Email)
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="যেমন: nabiulislam609@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                    if (adminLoginError) setAdminLoginError(null);
                  }}
                  className="w-full px-4 py-3 bg-[#131317] border border-gray-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-sm text-white placeholder-gray-500 transition outline-hidden font-mono"
                  autoFocus
                  required
                />
                <Mail className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                পাসওয়ার্ড (Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                    if (adminLoginError) setAdminLoginError(null);
                  }}
                  className="w-full px-4 py-3 bg-[#131317] border border-gray-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-sm text-white placeholder-gray-500 transition outline-hidden font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Continue Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3.5 px-4 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <span>লগইন করুন (Sign In)</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
