import React from 'react';
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
} from 'lucide-react';

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
  } = useSchool();

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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          ড্যাশবোর্ড
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          এক নজরে বিদ্যালয়ের তথ্য ও সাম্প্রতিক কার্যক্রম
        </p>
      </div>

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
    </div>
  );
};
