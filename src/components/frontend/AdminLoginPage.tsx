import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  GraduationCap,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const {
    siteSettings,
    adminSecuritySettings,
    loginAdmin,
    loginWithGoogle,
    setCurrentFrontendPage,
  } = useSchool();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('অনুগ্রহ করে ইউজার আইডি / ইউজারনেম প্রদান করুন।');
      return;
    }
    if (!password) {
      setErrorMessage('অনুগ্রহ করে পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginAdmin(username, password);
      if (!res.success) {
        setErrorMessage(res.message || 'ইউজার আইডি অথবা পাসওয়ার্ড সঠিক নয়।');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleGoogleSignIn = () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    setTimeout(() => {
      const targetEmail = adminSecuritySettings.allowedGoogleEmail || 'aicourse.nabin@gmail.com';
      loginWithGoogle(targetEmail);
      setGoogleLoading(false);
    }, 500);
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
            {siteSettings.logoUrl ? (
              <img
                src={siteSettings.logoUrl}
                alt="Logo"
                className="w-8 h-8 rounded-lg object-cover border border-white/20 shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 font-extrabold text-sm">
                দ
              </div>
            )}
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
            {siteSettings.logoUrl ? (
              <div className="space-y-4">
                <img
                  src={siteSettings.logoUrl}
                  alt="School Emblem"
                  className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-2xl object-cover border-2 border-white/15 shadow-xl bg-white/5 p-1"
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
            ) : (
              <div className="space-y-3">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-gradient-to-br from-rose-900/60 to-purple-950/70 border border-rose-500/30 flex items-center justify-center shadow-inner group-hover:border-rose-400/50 transition">
                  <GraduationCap className="w-12 h-12 text-rose-200" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-widest uppercase font-mono">
                  {siteSettings.shortName || 'DADRA HS'}
                </h3>
                <p className="text-[11px] text-rose-300 font-bold tracking-widest uppercase">
                  MANAGEMENT PORTAL
                </p>
              </div>
            )}
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
              Welcome!
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              অ্যাডমিন প্যানেলে প্রবেশ করতে আপনার তথ্য প্রদান করুন
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs px-4 py-3 rounded-xl flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username / User ID Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                User ID / Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="যেমন: admin বা user id"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full px-4 py-3 bg-[#131317] border border-gray-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-sm text-white placeholder-gray-500 transition outline-hidden font-mono"
                  autoFocus
                />
                <User className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full px-4 py-3 bg-[#131317] border border-gray-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-sm text-white placeholder-gray-500 transition outline-hidden font-mono"
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

            {/* Continue Submit Button (Matching Image 3) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-[#4a4a52] hover:bg-[#5a5a64] active:bg-[#3a3a40] text-white font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-gray-800 w-full" />
            <span className="bg-[#0a0a0c] px-3 text-[11px] text-gray-500 uppercase tracking-wider font-medium shrink-0">
              or continue with
            </span>
            <div className="border-t border-gray-800 w-full" />
          </div>

          {/* Google Account Login Button (Matching Image 3) */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-3 transition shadow-md cursor-pointer disabled:opacity-60"
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>
              Sign in with Google
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
