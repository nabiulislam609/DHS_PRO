import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { ManageTeachers } from './ManageTeachers';
import { ManageNotices } from './ManageNotices';
import { ManageAdmissions } from './ManageAdmissions';
import { ManageMessages } from './ManageMessages';
import { ManageNews } from './ManageNews';
import { ManageEvents } from './ManageEvents';
import { ManageGallery } from './ManageGallery';
import { ManageSiteSettings } from './ManageSiteSettings';
import { ManageStudents } from './ManageStudents';
import { ManageStaff } from './ManageStaff';
import { ManageLeadership } from './ManageLeadership';
import { ManageExamResults } from './ManageExamResults';
import { ManageHeroSlides } from './ManageHeroSlides';
import { ManageNavigation } from './ManageNavigation';
import { ManageHomepageSections } from './ManageHomepageSections';
import { ManageHeaderAndTicker } from './ManageHeaderAndTicker';
import { ManagePerformanceTrends } from './ManagePerformanceTrends';
import { ManageAchievements } from './ManageAchievements';
import { ManageAcademicPrograms } from './ManageAcademicPrograms';
import { ManageStatistics } from './ManageStatistics';
import { ManageDownloads } from './ManageDownloads';
import { ManageAdminSecurity } from './ManageAdminSecurity';
import { GenericSectionManager } from './GenericSectionManager';
import { AdminLoginPage } from '../frontend/AdminLoginPage';
import { Eye, Bell, ShieldCheck, LogOut, AlertTriangle, X } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    adminTab,
    setViewMode,
    unreadMessageCount,
    admissions,
    adminSecuritySettings,
    adminUser,
    isAdminAuthenticated,
    ADMIN_EMAILS,
    logoutAdmin,
    firestoreError,
    clearFirestoreError,
  } = useSchool();

  const userEmail = (adminUser?.email || '').trim().toLowerCase();
  if (!isAdminAuthenticated || !adminUser || !ADMIN_EMAILS.includes(userEmail)) {
    return <AdminLoginPage />;
  }

  const renderActiveTab = () => {
    switch (adminTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'security':
        return <ManageAdminSecurity />;
      case 'results':
        return <ManageExamResults />;
      case 'teachers':
        return <ManageTeachers />;
      case 'notices':
        return <ManageNotices />;
      case 'admissions':
        return <ManageAdmissions />;
      case 'messages':
        return <ManageMessages />;
      case 'news':
        return <ManageNews />;
      case 'events':
        return <ManageEvents />;
      case 'achievements':
        return <ManageAchievements />;
      case 'gallery':
        return <ManageGallery />;
      case 'settings':
        return <ManageSiteSettings />;
      case 'header_settings':
        return <ManageHeaderAndTicker />;
      case 'hero':
        return <ManageHeroSlides />;
      case 'navigation':
        return <ManageNavigation />;
      case 'downloads':
        return <ManageDownloads />;
      case 'sections':
        return <ManageHomepageSections />;
      case 'performance':
        return <ManagePerformanceTrends />;
      case 'students':
        return <ManageStudents />;
      case 'staff':
        return <ManageStaff />;
      case 'leadership':
        return <ManageLeadership />;
      case 'programs':
        return <ManageAcademicPrograms />;
      case 'statistics':
        return <ManageStatistics />;
      default:
        return <GenericSectionManager tab={adminTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-row">
      {/* Fixed Left Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>এডমিন একাউন্ট সক্রিয়</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* View Website Button */}
            <button
              onClick={() => setViewMode('frontend')}
              className="inline-flex items-center gap-1.5 bg-[#15803d] hover:bg-[#166534] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>ওয়েবসাইট ভিউ</span>
            </button>

            {/* Notification bell */}
            <div className="relative cursor-pointer" onClick={() => setViewMode('backend')}>
              <Bell className="w-5 h-5 text-gray-500 hover:text-emerald-700" />
              {(unreadMessageCount > 0 || admissions.length > 0) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
              )}
            </div>

            {/* Admin Avatar & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div
                className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs uppercase"
                title={adminUser?.email || adminSecuritySettings.username || 'Admin'}
              >
                {adminUser?.email?.charAt(0) || adminSecuritySettings.username?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-gray-800 block truncate max-w-[150px]">
                  {adminUser?.email || adminSecuritySettings.username || 'এডমিন'}
                </span>
                <span className="text-[10px] text-emerald-700 block font-medium">Firebase Auth</span>
              </div>
              <button
                onClick={logoutAdmin}
                className="ml-1 p-1 text-gray-400 hover:text-rose-600 transition cursor-pointer"
                title="লগআউট করুন"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Global Firestore Error Notification Banner */}
        {firestoreError && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 flex items-center justify-between text-rose-800 text-sm animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="font-bold">ডাটাবেস ত্রুটি:</span>
                <span className="font-medium text-rose-700">{firestoreError}</span>
              </div>
            </div>
            <button
              onClick={clearFirestoreError}
              className="inline-flex items-center gap-1 text-xs bg-rose-200 hover:bg-rose-300 text-rose-900 px-2.5 py-1 rounded-md font-semibold cursor-pointer transition shrink-0 ml-4"
              title="বিজ্ঞপ্তি বন্ধ করুন"
            >
              <X className="w-3.5 h-3.5" />
              <span>মুছে দিন</span>
            </button>
          </div>
        )}

        {/* Dynamic Admin Body View */}
        <main className="flex-1 pb-16">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
};
