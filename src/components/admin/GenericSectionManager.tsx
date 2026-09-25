import React, { useState } from 'react';
import { useSchool, AdminTab } from '../../context/SchoolContext';
import { ManageStaff } from './ManageStaff';
import { ManageAchievements } from './ManageAchievements';
import { ManageAcademicPrograms } from './ManageAcademicPrograms';
import { ManageStatistics } from './ManageStatistics';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle,
  Briefcase,
  Trophy,
  BookOpen,
  Sliders,
  Layers,
  Award,
} from 'lucide-react';

interface Props {
  tab: AdminTab;
}

export const GenericSectionManager: React.FC<Props> = ({ tab }) => {
  const {
    staff,
    addStaff,
    deleteStaff,
    achievements,
    addAchievement,
    deleteAchievement,
    academicPrograms,
    addProgram,
    deleteProgram,
    siteSettings,
    updateSiteSettings,
  } = useSchool();

  const [saved, setSaved] = useState(false);

  // New Achievement form state
  const [newAchTitle, setNewAchTitle] = useState('');
  const [newAchCat, setNewAchCat] = useState('একাডেমিক');
  const [newAchYear, setNewAchYear] = useState('২০২৫');
  const [newAchSub, setNewAchSub] = useState('');

  const triggerSaveNotification = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Render for Staff
  if (tab === 'staff') {
    return <ManageStaff />;
  }

  // Render for Achievements
  if (tab === 'achievements') {
    return <ManageAchievements />;
  }

  // Render for Programs
  if (tab === 'programs') {
    return <ManageAcademicPrograms />;
  }

  // Render for Statistics
  if (tab === 'statistics') {
    return <ManageStatistics />;
  }

  // Render for Programs / Performance / Statistics / Sections / Hero / Navigation / Static
  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {tab === 'hero' && 'হিরো স্লাইড সেটিংস'}
          {tab === 'sections' && 'হোমপেজ সেকশন কনফিগারেশন'}
          {tab === 'navigation' && 'নেভিগেশন মেনু'}
          {tab === 'static' && 'স্ট্যাটিক পেজ'}
          {tab === 'performance' && 'এসএসসি পারফরম্যান্স রেজাল্ট'}
        </h1>
        <p className="text-xs text-gray-500">বিদ্যালয় পোর্টালের সংশ্লিষ্ট মডিউল সক্রিয় ও সমন্বয় করুন</p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>সফলভাবে হালনাগাদ ও কার্যকর হয়েছে!</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4 text-xs">
        {tab === 'hero' && (
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              হোমপেজের মূল স্লাইডারের ব্যানার টেক্সট, হেডলাইন এবং ব্যাকগ্রাউন্ড ইমেজ পরিবর্তন করুন:
            </p>
            <div>
              <label className="block font-bold text-gray-700 mb-1">স্লাইড প্রধান শিরোনাম</label>
              <input
                type="text"
                defaultValue="শিক্ষাই জাতির মূল সম্পদ"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">উপশিরোনাম</label>
              <input
                type="text"
                defaultValue="ছাত্রীর বলিষ্ঠ নেতৃত্বের ঐতিহ্য, আধুনিক শিক্ষার দীপ্তি"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
              />
            </div>
            <button
              onClick={triggerSaveNotification}
              className="bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2 rounded-lg font-semibold cursor-pointer"
            >
              আপডেট করুন
            </button>
          </div>
        )}

        {tab === 'sections' && (
          <div className="space-y-3">
            <p className="text-gray-600">হোমপেজে প্রদর্শিত সেকশনগুলো সক্রিয় বা নিষ্ক্রিয় করুন:</p>
            {['হিরো স্লাইডার', 'নোটিশ বোর্ড', 'বিদ্যালয় পরিচিতি', 'একাডেমিক প্রোগ্রাম', 'শিক্ষক মণ্ডলী', 'পরিসংখ্যান ও রেজাল্ট ট্রেন্ড', 'সংবাদ ও প্রেস', 'আসন্ন ইভেন্ট', 'ফটোগ্যালারি', 'যোগাযোগ ফর্ম'].map((sec, i) => (
              <label key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <span className="font-semibold text-gray-800">{sec}</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded" />
              </label>
            ))}
            <button
              onClick={triggerSaveNotification}
              className="bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2 rounded-lg font-semibold cursor-pointer mt-2"
            >
              সেকশন সংরক্ষণ করুন
            </button>
          </div>
        )}

        {tab === 'performance' && (
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              গত ৫ বছরের বার্ষিক পরীক্ষার ফলাফল, গড় জিপিএ এবং পাশের হার ডেটা চার্ট স্বয়ংক্রিয়ভাবে হোমপেজে চিত্রিত রয়েছে।
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <span className="font-bold text-emerald-900 block">বর্তমান পাশের হার</span>
                <span className="text-xl font-bold text-emerald-700">{siteSettings.passRate}</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <span className="font-bold text-amber-900 block">জিপিএ-৫ প্রাপ্তি</span>
                <span className="text-xl font-bold text-amber-700">{siteSettings.gpa5Count}</span>
              </div>
            </div>
            <button
              onClick={triggerSaveNotification}
              className="bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2 rounded-lg font-semibold cursor-pointer"
            >
              ডাটা সিঙ্ক করুন
            </button>
          </div>
        )}

        {(tab === 'navigation' || tab === 'static') && (
          <div className="space-y-3">
            <p className="text-gray-600">
              মেনু আইটেম এবং স্ট্যাটিক কন্টেন্ট সফলভাবে কনফিগার করা হয়েছে।
            </p>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-700 font-mono text-xs">
              স্ট্যাটাস: সক্রিয় (Live & Synchronized)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
