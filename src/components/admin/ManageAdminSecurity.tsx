import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  ShieldCheck,
  KeyRound,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  Lock,
  User,
  Mail,
  AlertTriangle,
  Sparkles,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  LogOut,
  Info,
} from 'lucide-react';

export const ManageAdminSecurity: React.FC = () => {
  const {
    adminSecuritySettings,
    updateAdminSecuritySettings,
    logoutAdmin,
    setCurrentFrontendPage,
  } = useSchool();

  // Custom Link State
  const [customPath, setCustomPath] = useState(
    adminSecuritySettings.customLoginPath || 'admin-login'
  );
  const [copiedLink, setCopiedLink] = useState(false);

  // Credentials State
  const [newUsername, setNewUsername] = useState(
    adminSecuritySettings.username || 'admin'
  );
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Google Email State
  const [googleEmail, setGoogleEmail] = useState(
    adminSecuritySettings.allowedGoogleEmail || 'aicourse.nabin@gmail.com'
  );

  // Feedback states
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fullLoginUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?page=${encodeURIComponent(customPath.trim().toLowerCase())}`
      : `/?page=${customPath}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullLoginUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveCustomLink = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanSlug = customPath
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');

    if (!cleanSlug) {
      setErrorMessage('অনুগ্রহ করে একটি সঠিক কাস্টম ইউআরএল স্লাগ দিন (যেমন: admin-login)');
      return;
    }

    updateAdminSecuritySettings({
      customLoginPath: cleanSlug,
    });
    setCustomPath(cleanSlug);
    setSuccessMessage('কাস্টম অ্যাডমিন লিংক সফলভাবে আপডেট করা হয়েছে!');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!newUsername.trim()) {
      setErrorMessage('ইউজার আইডি বা ইউজারনেম ফাঁকা রাখা যাবে না।');
      return;
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPasswordInput) {
        setErrorMessage('পাসওয়ার্ড পরিবর্তনের জন্য বর্তমান পাসওয়ার্ড প্রদান করা আবশ্যক।');
        return;
      }
      if (currentPasswordInput !== adminSecuritySettings.passwordHash) {
        setErrorMessage('বর্তমান পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।');
        return;
      }
      if (newPassword.length < 4) {
        setErrorMessage('নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('নতুন পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড মিলছে না।');
        return;
      }
    }

    updateAdminSecuritySettings({
      username: newUsername.trim(),
      ...(newPassword ? { passwordHash: newPassword } : {}),
      allowedGoogleEmail: googleEmail.trim(),
    });

    setCurrentPasswordInput('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMessage('অ্যাডমিন ইউজার আইডি ও পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleResetToDefault = () => {
    if (
      window.confirm(
        'আপনি কি নিশ্চিত যে ক্রেডেনশিয়ালস ডিফল্ট মানে রিসেট করতে চান? (ইউজার: admin, পাসওয়ার্ড: admin123)'
      )
    ) {
      updateAdminSecuritySettings({
        username: 'admin',
        passwordHash: 'admin123',
        customLoginPath: 'admin-login',
        allowedGoogleEmail: 'aicourse.nabin@gmail.com',
      });
      setNewUsername('admin');
      setCustomPath('admin-login');
      setGoogleEmail('aicourse.nabin@gmail.com');
      setCurrentPasswordInput('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('ক্রেডেনশিয়ালস সফলভাবে ডিফল্ট মানে রিসেট করা হয়েছে!');
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const testLoginUrl = () => {
    setCurrentFrontendPage('admin-login');
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8 font-sans">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                অ্যাডমিন সিকিউরিটি ও কাস্টম লিংক সেটিংস
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                গোপন অ্যাডমিন লিংক, ইউজার আইডি, পাসওয়ার্ড ও গুগল সাইন-ইন নিয়ন্ত্রণ করুন
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={logoutAdmin}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>অ্যাডমিন সেশন লগআউট</span>
        </button>
      </div>

      {/* Global Success / Error Banners */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-fadeIn shadow-2xs">
          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-fadeIn shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Section 1: Custom Secret Admin Link / URL (As requested by user) */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                অ্যাডমিন প্যানেলে প্রবেশের কাস্টম গোপন লিংক (Secret URL)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                হোমপেজ ও ফুটার থেকে সকল লগইন বাটন লুকানো হয়েছে; শুধুমাত্র এই কাস্টম লিংকে প্রবেশ করা যাবে
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">
              কেন কাস্টম লিংক ব্যবহার করা হয়?
            </p>
            <p className="text-blue-800/80 leading-relaxed text-[11.5px]">
              সাধারণ ভিজিটরদের কাছে অ্যাডমিন লগইন বাটন প্রদর্শিত হয় না। আপনি নিজের পছন্দমতো একটি গোপন লিংক সেট করে রাখবেন এবং শুধুমাত্র সেই লিংক ভিজিট করে অথবা <strong>Ctrl + Shift + A</strong> প্রেস করে লগইন পেজ খুলতে পারবেন।
            </p>
          </div>
        </div>

        {/* Live URL Box & Copy */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700">
            বর্তমানে সক্রিয় অ্যাডমিন লগইন ইউআরএল:
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-gray-50 border border-gray-300 rounded-2xl p-2 sm:pl-4">
            <span className="font-mono text-xs sm:text-sm text-gray-800 break-all select-all flex-1 py-1">
              {fullLoginUrl}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'কপি হয়েছে!' : 'লিংক কপি করুন'}</span>
              </button>
              <button
                type="button"
                onClick={testLoginUrl}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition cursor-pointer"
                title="লগইন পেজে যান"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>পেজ দেখুন</span>
              </button>
            </div>
          </div>
        </div>

        {/* Change Custom Slug Form */}
        <form onSubmit={handleSaveCustomLink} className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-gray-700">
            কাস্টম স্লাগ / লিংক পরিবর্তন করুন:
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">
                /?page=
              </span>
              <input
                type="text"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                placeholder="যেমন: admin-login, secure-panel, secret2026"
                className="w-full pl-20 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-mono font-bold text-gray-900 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#15803d] hover:bg-[#166534] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>লিংক সংরক্ষণ করুন</span>
            </button>
          </div>
          <p className="text-[11px] text-gray-500">
            * ইংরেজি ছোট অক্ষর, সংখ্যা এবং হাইফেন (-) ব্যবহার করুন। যেমন: <code>admin-login</code>, <code>secure-admin</code>
          </p>
        </form>
      </div>

      {/* Section 2: Change Admin User ID & Password (As requested by user) */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                অ্যাডমিন ইউজার আইডি ও পাসওয়ার্ড পরিবর্তন
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                অ্যাডমিন একাউন্টে প্রবেশ করার জন্য ইউজার আইডি ও গোপন পাসওয়ার্ড সেট করুন
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-gray-400 block">বর্তমান সক্রিয় ইউজার:</span>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {adminSecuritySettings.username || 'admin'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveCredentials} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User ID / Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                অ্যাডমিন ইউজার আইডি (Username) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="যেমন: admin বা আপনার নাম"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-mono font-bold text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-hidden focus:border-emerald-600 transition"
                  required
                />
                <User className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Current Password (required if changing password) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>বর্তমান পাসওয়ার্ড (পাসওয়ার্ড বদলাতে চাইলে)</span>
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="text-[11px] text-emerald-700 hover:underline cursor-pointer flex items-center gap-1 font-normal"
                >
                  {showPasswords ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPasswords ? 'লুকান' : 'দেখান'}</span>
                </button>
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  placeholder="বর্তমান পাসওয়ার্ড দিন..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-mono text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-hidden focus:border-emerald-600 transition"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                নতুন পাসওয়ার্ড (ঐচ্ছিক - শুধু পরিবর্তন করতে চাইলে)
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="নতুন পাসওয়ার্ড দিন..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-mono text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-hidden focus:border-emerald-600 transition"
              />
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                নতুন পাসওয়ার্ড নিশ্চিত করুন
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-mono text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-hidden focus:border-emerald-600 transition"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ডিফল্ট মানে রিসেট (admin / admin123)</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>ক্রেডেনশিয়ালস আপডেট করুন</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 3: Google Login Settings */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              অনুমোদিত গুগল অ্যাকাউন্ট (Google Sign-In)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              যে গুগল ইমেইল দিয়ে লগইন পেজ থেকে এক ক্লিকে অ্যাডমিন প্যানেলে প্রবেশ করা যাবে
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-700">
            অনুমোদিত অ্যাডমিন গুগল ইমেইল:
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="email"
              value={googleEmail}
              onChange={(e) => setGoogleEmail(e.target.value)}
              placeholder="aicourse.nabin@gmail.com"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-mono text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-hidden focus:border-emerald-600 transition"
            />
            <button
              type="button"
              onClick={() => {
                updateAdminSecuritySettings({ allowedGoogleEmail: googleEmail.trim() });
                setSuccessMessage('অনুমোদিত গুগল ইমেইল সংরক্ষণ করা হয়েছে!');
                setTimeout(() => setSuccessMessage(null), 3000);
              }}
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>ইমেইল সংরক্ষণ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
