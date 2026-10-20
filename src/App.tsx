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
