import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  BookOpen,
  GraduationCap,
  Layers,
  Search,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { AcademicProgram } from '../../types';

export const ManageAcademicPrograms: React.FC = () => {
  const { academicPrograms, addProgram, updateProgram, deleteProgram } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<AcademicProgram | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [form, setForm] = useState({
    title: '',
    level: '',
    description: '',
    subjectsText: '',
  });

  const filteredPrograms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return academicPrograms;
    return academicPrograms.filter((p) => {
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchLevel = p.level.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchSubj = p.subjects.some((s) => s.toLowerCase().includes(q));
      return matchTitle || matchLevel || matchDesc || matchSubj;
    });
  }, [academicPrograms, searchQuery]);

  const openAddModal = () => {
    setEditingProgram(null);
    setForm({
      title: '',
      level: 'শ্রেণি: ৯ম-১০ম',
      description: '',
      subjectsText: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (prog: AcademicProgram) => {
    setEditingProgram(prog);
    setForm({
      title: prog.title,
      level: prog.level,
      description: prog.description,
      subjectsText: prog.subjects.join(', '),
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const subjects = form.subjectsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingProgram) {
      updateProgram(editingProgram.id, {
        title: form.title.trim(),
        level: form.level.trim() || 'শ্রেণি: সাধারণ',
        description: form.description.trim(),
        subjects: subjects.length > 0 ? subjects : ['সাধারণ বিষয়সমূহ'],
      });
      showToast('একাডেমিক প্রোগ্রাম সফলভাবে আপডেট করা হয়েছে');
    } else {
      addProgram({
        title: form.title.trim(),
        level: form.level.trim() || 'শ্রেণি: সাধারণ',
        description: form.description.trim(),
        subjects: subjects.length > 0 ? subjects : ['সাধারণ বিষয়সমূহ'],
      });
      showToast('নতুন একাডেমিক প্রোগ্রাম সফলভাবে যোগ করা হয়েছে');
    }

    setModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`আপনি কি "${title}" প্রোগ্রামটি মুছে ফেলতে চান?`)) {
      deleteProgram(id);
      showToast(`"${title}" মুছে ফেলা হয়েছে`);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">একাডেমিক প্রোগ্রাম</h1>
          <p className="text-xs text-gray-500">
            বিদ্যালয় পোর্টালের সংশ্লিষ্ট মডিউল সক্রিয় ও সমন্বয় করুন
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>মোট প্রোগ্রাম: {academicPrograms.length} টি</span>
          </span>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন প্রোগ্রাম যোগ করুন</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold shadow-xs animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="প্রোগ্রামের নাম, শ্রেণি বা বিষয় দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Programs List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>বিদ্যমান প্রোগ্রামসমূহ ({filteredPrograms.length} টি)</span>
          </h3>
        </div>

        {filteredPrograms.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            কোনো একাডেমিক প্রোগ্রাম পাওয়া যায়নি
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPrograms.map((p) => (
              <div
                key={p.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 p-3 rounded-xl transition"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="font-bold text-sm text-gray-900">{p.title}</h4>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      {p.level}
                    </span>
                  </div>

                  <p className="text-gray-600 text-xs leading-relaxed">
                    {p.description || 'জাতীয় শিক্ষাক্রম অনুযায়ী মৌলিক শিক্ষা ও মেধা বিকাশের পাঠদান।'}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-gray-400 text-[11px]">বিষয়সমূহ:</span>
                    {p.subjects.map((subj, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium"
                      >
                        {subj}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(p)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition cursor-pointer"
                    title="সম্পাদনা করুন"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>এডিট</span>
                  </button>

                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold transition cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ডিলিট</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-700" />
              <span>{editingProgram ? 'একাডেমিক প্রোগ্রাম সম্পাদনা করুন' : 'নতুন প্রোগ্রাম যোগ করুন'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">প্রোগ্রামের শিরোনাম / নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: বিজ্ঞান বিভাগ, কারিগরী শিক্ষা, প্রাথমিক স্তর"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">শ্রেণি বা স্তর *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: শ্রেণি: ৯ম-১০ম, শ্রেণি: ৬ষ্ঠ-৮ম"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">সংক্ষিপ্ত বিবরণ বা উদ্দেশ্য</label>
                <textarea
                  rows={3}
                  placeholder="প্রোগ্রাম সম্পর্কে সংক্ষিপ্ত বিবরণ..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  অন্তর্ভুক্ত বিষয়সমূহ (কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, উচ্চতর গণিত, আইসিটি"
                  value={form.subjectsText}
                  onChange={(e) => setForm({ ...form, subjectsText: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 text-xs text-gray-900"
                />
                <p className="text-[10px] text-gray-400 mt-1">প্রতিটি বিষয়ের নাম কমা (,) দিয়ে লিখুন।</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#15803d] hover:bg-[#166534] text-white font-semibold rounded-lg transition cursor-pointer shadow-xs"
                >
                  {editingProgram ? 'আপডেট করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
