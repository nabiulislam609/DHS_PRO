import React from 'react';
import { useSchool, AdminTab } from '../../context/SchoolContext';
import {
  GraduationCap,
  LayoutDashboard,
  Settings,
  LayoutTemplate,
  Sliders,
  SlidersHorizontal,
  Navigation,
  FileCode,
  Users,
  Briefcase,
  UserCheck,
  User,
  FileText,
  Newspaper,
  Calendar,
  Trophy,
  Image as ImageIcon,
  BookOpen,
  BarChart3,
  Award,
  Inbox,
  Mail,
  Eye,
  LogOut,
  ChevronRight,
  Bookmark,
  Download,
} from 'lucide-react';

interface MenuItem {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface MenuSection {
  group: string;
  items: MenuItem[];
}

export const AdminSidebar: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    adminTab,
    setAdminTab,
    unreadMessageCount,
    admissions,
    siteSettings,
  } = useSchool();

  const menuSections: MenuSection[] = [
    {
      group: 'প্রধান',
      items: [
        { id: 'dashboard' as AdminTab, label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
        { id: 'settings' as AdminTab, label: 'সাইট সেটিংস', icon: Settings },
        { id: 'header_settings' as AdminTab, label: 'হেডার ও নোটিফিকেশন বার', icon: SlidersHorizontal },
        { id: 'sections' as AdminTab, label: 'হোমপেজ সেকশন (Show/Hide)', icon: LayoutTemplate },
      ],
    },
    {
      group: 'ওয়েবসাইট',
      items: [
        { id: 'hero' as AdminTab, label: 'হিরো স্লাইড', icon: Sliders },
        { id: 'navigation' as AdminTab, label: 'নেভিগেশন মেনু', icon: Navigation },
        { id: 'downloads' as AdminTab, label: 'ডাউনলোড ও ফরম মেনু', icon: Download },
        { id: 'static' as AdminTab, label: 'স্ট্যাটিক পেজ', icon: FileCode },
      ],
    },
    {
      group: 'মানুষ',
      items: [
        { id: 'teachers' as AdminTab, label: 'শিক্ষক', icon: GraduationCap },
        { id: 'staff' as AdminTab, label: 'কর্মকর্তা ও কর্মচারী', icon: Briefcase },
        { id: 'students' as AdminTab, label: 'শিক্ষার্থী', icon: Users },
        { id: 'leadership' as AdminTab, label: 'নেতৃত্ব', icon: User },
      ],
    },
    {
      group: 'কনটেন্ট',
      items: [
        { id: 'notices' as AdminTab, label: 'নোটিশ', icon: FileText },
        { id: 'news' as AdminTab, label: 'সংবাদ', icon: Newspaper },
        { id: 'events' as AdminTab, label: 'ইভেন্ট', icon: Calendar },
        { id: 'achievements' as AdminTab, label: 'অর্জন', icon: Trophy },
        { id: 'gallery' as AdminTab, label: 'গ্যালারি', icon: ImageIcon },
      ],
    },
    {
      group: 'একাডেমিক',
      items: [
        { id: 'results' as AdminTab, label: 'Exam Results Sheet', icon: Bookmark },
        { id: 'programs' as AdminTab, label: 'প্রোগ্রাম', icon: BookOpen },
        { id: 'statistics' as AdminTab, label: 'পরিসংখ্যান', icon: BarChart3 },
        { id: 'performance' as AdminTab, label: 'ফলাফলের ধারা চার্ট', icon: Award },
      ],
    },
    {
      group: 'যোগাযোগ',
      items: [
        {
          id: 'admissions' as AdminTab,
          label: 'ভর্তি আবেদন',
          icon: Inbox,
          badge: admissions.length > 0 ? admissions.length : undefined,
        },
        {
          id: 'messages' as AdminTab,
          label: 'বার্তা',
          icon: Mail,
          badge: unreadMessageCount > 0 ? unreadMessageCount : undefined,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#051c14] text-gray-300 h-screen max-h-screen sticky top-0 flex flex-col select-none shrink-0 border-r border-[#0d3124] overflow-hidden z-20">
      {/* Top Section: Brand Header (Fixed top) */}
      <div className="p-4 border-b border-[#0d3124] flex items-center gap-3 shrink-0 bg-[#051c14]">
        {siteSettings.logoUrl ? (
          <img
            src={siteSettings.logoUrl}
            alt="Logo"
            className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shrink-0 bg-white"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-amber-400 border-2 border-emerald-950 flex items-center justify-center text-emerald-950 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
        )}
        <div className="overflow-hidden">
          <h2 className="text-sm font-bold text-white tracking-wide truncate">
            {siteSettings.shortName || siteSettings.schoolNameBangla || 'Dadra HS'}
          </h2>
          <p className="text-[11px] text-emerald-400 font-medium tracking-wide">
            Admin Panel
          </p>
        </div>
      </div>

      {/* Navigation Groups: Scrollable Middle Section with visible custom scrollbar */}
      <div className="flex-1 min-h-0 py-3 px-3 space-y-4 overflow-y-auto overscroll-contain custom-sidebar-scrollbar pr-1.5">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 block">
              {section.group}
            </span>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setAdminTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-[#0f4632] text-white shadow-xs'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge !== undefined && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Fixed Bottom Section: Live CMS Sync Card + Action Buttons (Permanently fixed at bottom) */}
      <div className="shrink-0 mt-auto border-t border-[#0d3124] bg-[#041710] shadow-lg">
        <div className="p-3 pb-2">
          <div className="bg-[#0b3323] border border-emerald-500/30 rounded-2xl p-3 text-[11px] text-emerald-100/90 space-y-1">
            <span className="font-bold text-emerald-300 block text-xs">Live CMS Synchronization</span>
            <p className="text-[10px] leading-relaxed text-emerald-200/70">
              All changes to notices, admissions, and exam marks immediately update and reflect on the public portal without redeployment.
            </p>
          </div>
        </div>

        <div className="p-3 pt-1 space-y-1">
          <button
            onClick={() => setViewMode('frontend')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>ওয়েবসাইট দেখুন</span>
          </button>

          <button
            onClick={() => setViewMode('frontend')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-950/40 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>লগআউট</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
