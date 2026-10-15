import React, { useState } from 'react';
import { useSchool, AdminTab } from '../../context/SchoolContext';
import {
  Users,
  GraduationCap,
  Briefcase,
  FileText,
  Newspaper,
  Calendar,
  Image as ImageIcon,
  Inbox,
  Mail,
  Trophy,
  Clock,
  Trash2,
  FileSpreadsheet,
  Database,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { BulkImportModal, BulkImportType } from './BulkImportModal';

export const AdminDashboard: React.FC = () => {
  const {
    students,
    teachers,
    staff,
    notices,
    news,
    events,
    achievements,
    admissions,
    unreadMessageCount,
    totalGalleryPhotos,
    activities,
    clearActivities,
    setAdminTab,
    addMultipleTeachers,
    addMultipleStaff,
    addMultipleStudents,
    isFirestoreLoading,
    loadDataFromFirestore,
    seedDemoDataToFirestore,
  } = useSchool();

  const [bulkModalType, setBulkModalType] = useState<BulkImportType | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleSeedData = async () => {
    if (!window.confirm('আপনি কি ডাটাবেসে প্রাথমিক ডেমো তথ্য সংরক্ষণ করতে চান?')) return;
    setSeeding(true);
    try {
      await seedDemoDataToFirestore();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 4000);
    } finally {
      setSeeding(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDataFromFirestore();
    } finally {
      setRefreshing(false);
    }
  };

  // Helper to convert English numbers to Bengali numerals
  const toBanglaNum = (num: number) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num
      .toString()
      .split('')
      .map((d) => banglaDigits[parseInt(d, 10)] ?? d)
      .join('');
  };

  const statCards = [
    {
      id: 'students' as AdminTab,
      label: 'শিক্ষার্থী',
      count: toBanglaNum(students.length || 4),
      icon: Users,
      bgColor: 'bg-[#10b981]',
      textColor: 'text-white',
    },
    {
      id: 'teachers' as AdminTab,
      label: 'শিক্ষক',
      count: toBanglaNum(teachers.length),
      icon: GraduationCap,
      bgColor: 'bg-[#ea580c]',
      textColor: 'text-white',
    },
    {
      id: 'staff' as AdminTab,
      label: 'কর্মচারী',
      count: toBanglaNum(staff.length || 4),
      icon: Briefcase,
      bgColor: 'bg-[#0284c7]',
      textColor: 'text-white',
    },
    {
      id: 'notices' as AdminTab,
      label: 'নোটিশ',
      count: toBanglaNum(notices.length),
      icon: FileText,
      bgColor: 'bg-[#e11d48]',
      textColor: 'text-white',
    },
    {
      id: 'news' as AdminTab,
      label: 'সংবাদ',
      count: toBanglaNum(news.length || 4),
      icon: Newspaper,
      bgColor: 'bg-[#9333ea]',
      textColor: 'text-white',
    },
    {
      id: 'events' as AdminTab,
      label: 'ইভেন্ট',
      count: toBanglaNum(events.length || 4),
      icon: Calendar,
      bgColor: 'bg-[#0d9488]',
      textColor: 'text-white',
    },
    {
      id: 'gallery' as AdminTab,
      label: 'গ্যালারি',
      count: toBanglaNum(totalGalleryPhotos || 25),
      icon: ImageIcon,
      bgColor: 'bg-[#db2777]',
      textColor: 'text-white',
    },
    {
      id: 'admissions' as AdminTab,
      label: 'ভর্তি আবেদন',
      count: toBanglaNum(admissions.length),
      icon: Inbox,
      bgColor: 'bg-[#f97316]',
      textColor: 'text-white',
    },
    {
      id: 'messages' as AdminTab,
      label: 'অপঠিত বার্তা',
      count: toBanglaNum(unreadMessageCount),
      icon: Mail,
      bgColor: 'bg-[#dc2626]',
      textColor: 'text-white',
    },
    {
      id: 'achievements' as AdminTab,
      label: 'অর্জন',
      count: toBanglaNum(achievements.length || 5),
      icon: Trophy,
      bgColor: 'bg-[#ca8a04]',
      textColor: 'text-white',
    },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            ড্যাশবোর্ড
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            এক নজরে বিদ্যালয়ের তথ্য ও সাম্প্রতিক কার্যক্রম
          </p>
        </div>

        {/* Firestore Sync Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing || isFirestoreLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
            title="Firestore থেকে সর্বশেষ ডাটা রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${refreshing || isFirestoreLoading ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'লোড হচ্ছে...' : 'ডাটা রিফ্রেশ'}</span>
          </button>

          <button
            type="button"
            onClick={handleSeedData}
            disabled={seeding}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer disabled:opacity-50"
            title="ডাটাবেস খালি থাকলে প্রাথমিক ডেমো তথ্য সংরক্ষণ করুন"
          >
            <Database className="w-3.5 h-3.5 text-emerald-700" />
            <span>{seeding ? 'সংরক্ষণ হচ্ছে...' : 'ডেমো ডাটা সিঙ্ক'}</span>
          </button>
        </div>
      </div>

      {seedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>প্রাথমিক ডেমো তথ্য সফলভাবে Firebase Firestore-এ সংরক্ষণ করা হয়েছে!</span>
        </div>
      )}

      {/* Empty Database Helper Notice */}
      {teachers.length === 0 && students.length === 0 && notices.length === 0 && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                ডাটাবেসে কোনো তথ্য নেই (Empty Database)
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                বর্তমানে আপনার ক্লাউড ডাটাবেস সম্পূর্ণ খালি অবস্থায় রয়েছে। আপনি চাইলে বিদ্যালয়টির প্রাথমিক ডেমো তথ্য এক ক্লিকেই Firestore-এ সংরক্ষণ করতে পারেন।
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSeedData}
            disabled={seeding}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0 cursor-pointer disabled:opacity-50"
          >
            {seeding ? 'সংরক্ষণ হচ্ছে...' : 'প্রাথমিক ডেমো তথ্য যুক্ত করুন'}
          </button>
        </div>
      )}

      {/* 10 Stat Cards in 2 rows of 5 matching screenshot */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => setAdminTab(card.id)}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between h-36 group"
            >
              {/* Rounded icon box matching the screenshot */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs transition group-hover:scale-105 ${card.bgColor} ${card.textColor}`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Number and Label */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-800 transition">
                  {card.count}
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  {card.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Bulk Import Section (Teachers, Staff, Students) */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-emerald-800/40 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>বাল্ক আপলোড হাব (Excel • CSV • Google Drive)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              একসাথে বহু শিক্ষক, কর্মচারী ও শিক্ষার্থী যুক্ত করুন
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              কম্পিউটার থেকে এক্সেল/সিএসভি ফাইল আপলোড করুন অথবা গুগল ড্রাইভ/গুগল শিটের শেয়ার লিঙ্ক দিয়ে সরাসরি ব্যাকএন্ডে তথ্য সংরক্ষণ করুন।
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setBulkModalType('students')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
              title="একসাথে একাধিক শিক্ষার্থী যুক্ত করুন"
            >
              <Users className="w-4 h-4" />
              <span>শিক্ষার্থী বাল্ক আপলোড</span>
            </button>

            <button
              type="button"
              onClick={() => setBulkModalType('teachers')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
              title="একসাথে একাধিক শিক্ষক যুক্ত করুন"
            >
              <GraduationCap className="w-4 h-4" />
              <span>শিক্ষক বাল্ক আপলোড</span>
            </button>

            <button
              type="button"
              onClick={() => setBulkModalType('staff')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
              title="একসাথে একাধিক কর্মকর্তা ও কর্মচারী যুক্ত করুন"
            >
              <Briefcase className="w-4 h-4" />
              <span>কর্মচারী বাল্ক আপলোড</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activities Section matching screenshot */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>সাম্প্রতিক কার্যকলাপ</span>
          </div>
          {activities.length > 0 && (
            <button
              onClick={clearActivities}
              className="text-xs text-gray-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>মুছে ফেলুন</span>
            </button>
          )}
        </div>

        <div className="p-8">
          {activities.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">
              কোনো সাম্প্রতিক কার্যকলাপ নেই
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((act, index) => (
                <div
                  key={`${act.id || 'act'}-${index}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 hover:bg-gray-100/80 transition text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="text-gray-800 font-medium">{act.action}</span>
                  </div>
                  <span className="text-gray-400 shrink-0 font-mono text-[11px]">
                    {act.timestamp}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Import Modal from Dashboard */}
      {bulkModalType && (
        <BulkImportModal
          isOpen={!!bulkModalType}
          onClose={() => setBulkModalType(null)}
          type={bulkModalType}
          onImportTeachers={(items) => addMultipleTeachers(items)}
          onImportStaff={(items) => addMultipleStaff(items)}
          onImportStudents={(items) => addMultipleStudents(items)}
        />
      )}
    </div>
  );
};
