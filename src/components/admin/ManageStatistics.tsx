import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  TrendingUp,
  Award,
  Users,
  GraduationCap,
  Building,
  Trophy,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  Save,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { CustomStatItem } from '../../types';

export const ManageStatistics: React.FC = () => {
  const { siteSettings, updateSiteSettings } = useSchool();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // State for core KPI edit modal
  const [editingCoreKey, setEditingCoreKey] = useState<string | null>(null);
  const [coreForm, setCoreForm] = useState({ label: '', value: '' });

  // State for custom stat add/edit modal
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  const [customForm, setCustomForm] = useState({
    label: '',
    value: '',
    description: '',
  });

  const coreStats = [
    {
      key: 'passRate',
      label: 'বর্তমান পাশের হার',
      value: siteSettings.passRate || '৯৮%',
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      key: 'gpa5Count',
      label: 'জিপিএ-৫ প্রাপ্তি',
      value: siteSettings.gpa5Count || '৪২',
      icon: Award,
      color: 'bg-amber-50 text-amber-900 border-amber-200',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      key: 'totalStudents',
      label: 'মোট শিক্ষার্থী',
      value: siteSettings.totalStudents || '১,২০০+',
      icon: Users,
      color: 'bg-blue-50 text-blue-900 border-blue-200',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      key: 'totalTeachers',
      label: 'শিক্ষক মণ্ডলী',
      value: siteSettings.totalTeachers || '২৮+',
      icon: GraduationCap,
      color: 'bg-teal-50 text-teal-900 border-teal-200',
      badgeColor: 'bg-teal-100 text-teal-800',
    },
    {
      key: 'totalClassrooms',
      label: 'ক্লাসরুম ও ল্যাব',
      value: siteSettings.totalClassrooms || '৬০+',
      icon: Building,
      color: 'bg-purple-50 text-purple-900 border-purple-200',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      key: 'totalAwards',
      label: 'অর্জিত পুরস্কার',
      value: siteSettings.totalAwards || '১৭',
      icon: Trophy,
      color: 'bg-rose-50 text-rose-900 border-rose-200',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
  ];

  const customStats: CustomStatItem[] = siteSettings.customStats || [];

  // Handle core KPI edit
  const openEditCore = (key: string, label: string, value: string) => {
    setEditingCoreKey(key);
    setCoreForm({ label, value });
  };

  const handleSaveCore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoreKey) return;

    updateSiteSettings({
      [editingCoreKey]: coreForm.value.trim(),
    });

    showToast(`"${coreForm.label}" সফলভাবে আপডেট করা হয়েছে`);
    setEditingCoreKey(null);
  };

  // Handle custom stat add/edit
  const openAddCustom = () => {
    setEditingCustomId(null);
    setCustomForm({ label: '', value: '', description: '' });
    setCustomModalOpen(true);
  };

  const openEditCustom = (item: CustomStatItem) => {
    setEditingCustomId(item.id);
    setCustomForm({
      label: item.label,
      value: item.value,
      description: item.description || '',
    });
    setCustomModalOpen(true);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.label.trim() || !customForm.value.trim()) return;

    if (editingCustomId) {
      const updated = customStats.map((cs) =>
        cs.id === editingCustomId
          ? {
              ...cs,
              label: customForm.label.trim(),
              value: customForm.value.trim(),
              description: customForm.description.trim(),
            }
          : cs
      );
      updateSiteSettings({ customStats: updated });
      showToast('পরিসংখ্যান কার্ড সফলভাবে আপডেট করা হয়েছে');
    } else {
      const newStat: CustomStatItem = {
        id: `stat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        label: customForm.label.trim(),
        value: customForm.value.trim(),
        description: customForm.description.trim(),
      };
      updateSiteSettings({ customStats: [...customStats, newStat] });
      showToast('নতুন পরিসংখ্যান কার্ড সফলভাবে যোগ করা হয়েছে');
    }

    setCustomModalOpen(false);
  };

  const handleDeleteCustom = (id: string, label: string) => {
    if (confirm(`আপনি কি "${label}" পরিসংখ্যান কার্ডটি মুছে ফেলতে চান?`)) {
      const updated = customStats.filter((cs) => cs.id !== id);
      updateSiteSettings({ customStats: updated });
      showToast(`"${label}" মুছে ফেলা হয়েছে`);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">পরিসংখ্যান ডাটা</h1>
          <p className="text-xs text-gray-500">
            বিদ্যালয় পোর্টালের সংশ্লিষ্ট মডিউল সক্রিয় ও সমন্বয় করুন
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openAddCustom}
            className="inline-flex items-center gap-1.5 bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ডাটা কার্ড যোগ করুন</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold shadow-xs animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Stats Overview Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-6 text-xs">
        <div className="space-y-1">
          <p className="text-gray-600 leading-relaxed">
            গত ৫ বছরের বার্ষিক পরীক্ষার ফলাফল, গড় জিপিএ এবং পাশের হার ডেটা চার্ট স্বয়ংক্রিয়ভাবে হোমপেজে চিত্রিত রয়েছে।
          </p>
          <p className="text-gray-400 text-[11px]">
            যেকোনো কার্ডের মান পরিবর্তন বা সম্পাদনা করতে 'এডিট' বাটনে ক্লিক করুন।
          </p>
        </div>

        {/* Core Statistical Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coreStats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className={`p-4 rounded-xl border ${item.color} flex items-center justify-between gap-3 shadow-2xs`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center shadow-xs">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 block text-xs">{item.label}</span>
                    <span className="text-xl font-bold tracking-tight text-gray-900 font-mono">
                      {item.value}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => openEditCore(item.key, item.label, item.value)}
                  className="p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-lg text-xs font-semibold shadow-2xs hover:shadow-xs transition cursor-pointer"
                  title="মান পরিবর্তন করুন"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Custom Statistical Cards (if any) */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>কাস্টম পরিসংখ্যান কার্ডসমূহ ({customStats.length} টি)</span>
            </h3>
            <button
              onClick={openAddCustom}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
            >
              + নতুন কার্ড যোগ করুন
            </button>
          </div>

          {customStats.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-400 border border-dashed border-gray-200">
              কোনো কাস্টম পরিসংখ্যান কার্ড যোগ করা হয়নি। প্রয়োজনে '+ নতুন ডাটা কার্ড যোগ করুন' বাটনে চাপ দিয়ে যুক্ত করতে পারেন।
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {customStats.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-xs text-emerald-700 font-bold">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block text-xs">{item.label}</span>
                      <span className="text-xl font-bold tracking-tight text-emerald-800 font-mono">
                        {item.value}
                      </span>
                      {item.description && (
                        <p className="text-[10px] text-gray-500 mt-0.5">{item.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditCustom(item)}
                      className="p-1.5 bg-white hover:bg-gray-100 text-blue-700 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                      title="সম্পাদনা করুন"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustom(item.id, item.label)}
                      className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sync Button */}
        <div className="pt-2">
          <button
            onClick={() => showToast('পরিসংখ্যান ডাটা সফলভাবে সিঙ্ক ও সংরক্ষিত হয়েছে!')}
            className="bg-[#15803d] hover:bg-[#166534] text-white px-5 py-2.5 rounded-xl font-semibold cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>ডাটা সিঙ্ক করুন</span>
          </button>
        </div>
      </div>

      {/* Edit Core KPI Modal */}
      {editingCoreKey && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setEditingCoreKey(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-emerald-700" />
              <span>পরিসংখ্যানের মান পরিবর্তন করুন</span>
            </h3>

            <form onSubmit={handleSaveCore} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">শিরোনাম</label>
                <input
                  type="text"
                  disabled
                  value={coreForm.label}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">মান / সংখ্যা *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ৯৮%, ৪২, ১,২৫০+"
                  value={coreForm.value}
                  onChange={(e) => setCoreForm({ ...coreForm, value: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono text-sm text-gray-900 font-bold"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCoreKey(null)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#15803d] hover:bg-[#166534] text-white font-semibold rounded-lg transition cursor-pointer shadow-xs"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Custom Stat Modal */}
      {customModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setCustomModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-700" />
              <span>{editingCustomId ? 'কার্ড সম্পাদনা করুন' : 'নতুন পরিসংখ্যান কার্ড যোগ করুন'}</span>
            </h3>

            <form onSubmit={handleSaveCustom} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">শিরোনাম / লেবেল *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: নিয়মিত উপস্থিতি, কম্পিউটার ল্যাব পিসি"
                  value={customForm.label}
                  onChange={(e) => setCustomForm({ ...customForm, label: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">মান / সংখ্যা *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ৯৫%, ৩৫+, ১২০ জন"
                  value={customForm.value}
                  onChange={(e) => setCustomForm({ ...customForm, value: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono text-sm text-gray-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">সাবটাইটেল বা বিবরণ (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="যেমন: বার্ষিক গড় উপস্থিতি হার"
                  value={customForm.description}
                  onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 text-xs text-gray-900"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#15803d] hover:bg-[#166534] text-white font-semibold rounded-lg transition cursor-pointer shadow-xs"
                >
                  {editingCustomId ? 'আপডেট করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
