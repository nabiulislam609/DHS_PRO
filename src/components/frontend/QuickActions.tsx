import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  GraduationCap,
  FileText,
  Calendar,
  Image as ImageIcon,
  BookOpen,
  Award,
  Users,
  PhoneCall,
} from 'lucide-react';

export const QuickActions: React.FC = () => {
  const { setIsAdmissionModalOpen, setCurrentFrontendPage } = useSchool();

  const actions = [
    {
      label: 'ভর্তি আবেদন',
      icon: GraduationCap,
      color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200',
      action: () => setIsAdmissionModalOpen(true),
    },
    {
      label: 'নোটিশ',
      icon: FileText,
      color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200',
      action: () => document.getElementById('notices')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      label: 'ইভেন্ট',
      icon: Calendar,
      color: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200',
      action: () => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      label: 'গ্যালারি',
      icon: ImageIcon,
      color: 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200',
      action: () => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      label: 'একাডেমিক',
      icon: BookOpen,
      color: 'bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200',
      action: () => document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      label: 'ফলাফল',
      icon: Award,
      color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200',
      action: () => setCurrentFrontendPage('results'),
    },
    {
      label: 'শিক্ষক',
      icon: Users,
      color: 'bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200',
      action: () => setCurrentFrontendPage('teachers'),
    },
    {
      label: 'যোগাযোগ',
      icon: PhoneCall,
      color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200',
      action: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 relative z-10">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-4 sm:p-6 grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4 transition-all">
        {actions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={item.action}
              className="flex flex-col items-center justify-center gap-2 p-2.5 rounded-xl hover:scale-105 transition-all duration-200 cursor-pointer group"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs transition group-hover:shadow-md ${item.color}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-emerald-800 text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
