import React, { Component, ReactNode, ErrorInfo } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { FrontendView } from './components/frontend/FrontendView';
import { AdminPanel } from './components/admin/AdminPanel';
import { DedicatedResultsPage } from './components/frontend/DedicatedResultsPage';
import { DedicatedNoticesPage } from './components/frontend/DedicatedNoticesPage';
import { DedicatedTeachersPage } from './components/frontend/DedicatedTeachersPage';
import { DedicatedStaffPage } from './components/frontend/DedicatedStaffPage';
import { DedicatedAdmitCardPage } from './components/frontend/DedicatedAdmitCardPage';
import { DedicatedFormsPage } from './components/frontend/DedicatedFormsPage';
import { AdminLoginPage } from './components/frontend/AdminLoginPage';
import { AdmissionModal } from './components/frontend/AdmissionModal';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Captured by App ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">একটি অনাকাঙ্ক্ষিত সমস্যা দেখা দিয়েছে</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              ওয়েবসাইটটি আবার সঠিকভাবে লোড করতে নিচের বাটনে ক্লিক করুন।
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>পেজ রিফ্রেশ করুন</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const SEOManager: React.FC = () => {
  const { siteSettings, currentFrontendPage } = useSchool();

  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Dynamic page title
    let pageTitle = siteSettings.metaTitle || `${siteSettings.schoolNameBangla} | ${siteSettings.schoolNameEnglish} — জয়পুরহাট`;
    if (currentFrontendPage === 'results') {
      pageTitle = `একাডেমিক ফলাফল ও নম্বরপত্র | ${siteSettings.schoolNameBangla}`;
    } else if (currentFrontendPage === 'notices') {
      pageTitle = `নোটিশ বোর্ড ও সার্কুলার | ${siteSettings.schoolNameBangla}`;
    } else if (currentFrontendPage === 'admit-card') {
      pageTitle = `অনলাইন প্রবেশপত্র (Admit Card) | ${siteSettings.schoolNameBangla}`;
    } else if (currentFrontendPage === 'important-forms' || currentFrontendPage === 'downloads') {
      pageTitle = `ফরম ও ডাউনলোড পোর্টাল | ${siteSettings.schoolNameBangla}`;
    } else if (currentFrontendPage === 'teachers') {
      pageTitle = `শিক্ষক মণ্ডলী | ${siteSettings.schoolNameBangla}`;
    } else if (currentFrontendPage === 'staff') {
      pageTitle = `কর্মকর্তা ও কর্মচারী | ${siteSettings.schoolNameBangla}`;
    } else if (currentFrontendPage === 'admin-login') {
      pageTitle = `অ্যাডমিন লগইন | ${siteSettings.schoolNameBangla}`;
    }

    document.title = pageTitle;

    // 2. OpenGraph & Meta Tag sync
    const origin =
      typeof window !== 'undefined' &&
      window.location.origin &&
      !window.location.origin.includes('localhost') &&
      !window.location.origin.includes('run.app')
        ? window.location.origin
        : 'https://dhsedu.vercel.app';
    const currentUrl =
      typeof window !== 'undefined' &&
      window.location.origin &&
      !window.location.origin.includes('localhost') &&
      !window.location.origin.includes('run.app')
        ? window.location.href
        : `https://dhsedu.vercel.app${typeof window !== 'undefined' ? window.location.search : ''}`;
    const defaultOgImage = `${origin}/assets/og-preview.png`;
    const ogImage = siteSettings.ogImageUrl
      ? siteSettings.ogImageUrl.startsWith('http')
        ? siteSettings.ogImageUrl
        : `${origin}${siteSettings.ogImageUrl}`
      : defaultOgImage;

    const description =
      siteSettings.metaDescription ||
      siteSettings.tagline ||
      'দাদরা উচ্চ বিদ্যালয়ের অফিসিয়াল ওয়েব পোর্টাল ও ম্যানেজমেন্ট সিস্টেম — অনলাইন প্রবেশপত্র, পরীক্ষার ফলাফল, নোটিশ বোর্ড ও ভর্তি কার্যক্রম।';

    const setMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
      let tag = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', description);
    if (currentUrl) setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:image:secure_url', ogImage);
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical && currentUrl) {
      canonical.setAttribute('href', currentUrl);
    }
  }, [siteSettings, currentFrontendPage]);

  return null;
};

const MainApp: React.FC = () => {
  const {
    viewMode,
    currentFrontendPage,
    isAdminAuthenticated,
    adminUser,
    ADMIN_EMAILS,
    isAuthLoading,
  } = useSchool();

  const renderContent = () => {
    if (currentFrontendPage === 'admin-login') {
      return <AdminLoginPage />;
    }
    if (currentFrontendPage === 'results') {
      return <DedicatedResultsPage />;
    }
    if (currentFrontendPage === 'notices') {
      return <DedicatedNoticesPage />;
    }
    if (currentFrontendPage === 'teachers') {
      return <DedicatedTeachersPage />;
    }
    if (currentFrontendPage === 'staff') {
      return <DedicatedStaffPage />;
    }
    if (currentFrontendPage === 'admit-card') {
      return <DedicatedAdmitCardPage />;
    }
    if (currentFrontendPage === 'important-forms' || currentFrontendPage === 'downloads') {
      return <DedicatedFormsPage />;
    }

    if (viewMode === 'backend') {
      if (isAuthLoading) {
        return (
          <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 space-y-4 font-sans">
            <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-sm font-semibold text-gray-300">অ্যাডমিন অ্যাক্সেস ও নিরাপত্তা যাচাই করা হচ্ছে...</p>
          </div>
        );
      }
      const userEmail = (adminUser?.email || '').trim().toLowerCase();
      if (!isAdminAuthenticated || !adminUser || !ADMIN_EMAILS.includes(userEmail)) {
        return <AdminLoginPage />;
      }
      return <AdminPanel />;
    }

    return <FrontendView />;
  };

  return (
    <div className="relative">
      {/* Dynamic SEO & Social Share Meta Manager */}
      <SEOManager />

      {/* Main View Router */}
      {renderContent()}

      {/* Global Admission Modal */}
      <AdmissionModal />
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <SchoolProvider>
        <MainApp />
      </SchoolProvider>
    </ErrorBoundary>
  );
}

export default App;
