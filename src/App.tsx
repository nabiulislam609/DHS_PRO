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
import { AdmissionModal } from './components/frontend/AdmissionModal';
import { Shield, Globe, AlertTriangle, RotateCcw } from 'lucide-react';

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
  const { viewMode, setViewMode, currentFrontendPage } = useSchool();

  const renderContent = () => {
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
    return viewMode === 'frontend' ? <FrontendView /> : <AdminPanel />;
  };

  return (
    <div className="relative">
      {/* Floating Toggle Button between Frontend & Backend for convenience */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setViewMode(viewMode === 'frontend' ? 'backend' : 'frontend')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl font-bold text-xs transition transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20 bg-emerald-800 hover:bg-emerald-900 text-white"
          title={viewMode === 'frontend' ? 'অ্যাডমিন প্যানেল এ যান' : 'ওয়েবসাইট ভিউ এ যান'}
        >
          {viewMode === 'frontend' ? (
            <>
              <Shield className="w-4 h-4 text-amber-300" />
              <span>এডমিন প্যানেল</span>
            </>
          ) : (
            <>
              <Globe className="w-4 h-4 text-emerald-300" />
              <span>ওয়েবসাইট দেখুন</span>
            </>
          )}
        </button>
      </div>

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
