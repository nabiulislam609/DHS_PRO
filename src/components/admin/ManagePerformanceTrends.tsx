import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { PerformanceTrendItem } from '../../types';
import {
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle,
  X,
  BarChart2,
  Award,
  Sparkles,
} from 'lucide-react';

export const ManagePerformanceTrends: React.FC = () => {
  const {
    performanceTrends,
    addPerformanceTrend,
    updatePerformanceTrend,
    deletePerformanceTrend,
    resetPerformanceTrends,
  } = useSchool();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PerformanceTrendItem | null>(null);

  const [form, setForm] = useState({
    year: '',
    passRate: 98.0,
    aPlus: 40,
    gpa: 4.8,
  });

  const sortedTrends = [...performanceTrends].sort((a, b) =>
    a.year.localeCompare(b.year)
  );

  const openAddModal = () => {
    setEditingItem(null);
    const nextYear =
      sortedTrends.length > 0
        ? String(parseInt(sortedTrends[sortedTrends.length - 1].year || '2025') + 1)
        : '2026';

    setForm({
      year: nextYear,
      passRate: 99.0,
      aPlus: 45,
      gpa: 4.9,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: PerformanceTrendItem) => {
    setEditingItem(item);
    setForm({
      year: item.year,
      passRate: item.passRate,
      aPlus: item.aPlus,
      gpa: item.gpa,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.year.trim()) return;

    if (editingItem) {
      updatePerformanceTrend(editingItem.id, {
        year: form.year.trim(),
        passRate: Number(form.passRate) || 0,
        aPlus: Number(form.aPlus) || 0,
        gpa: Number(form.gpa) || 0,
      });
    } else {
      addPerformanceTrend({
        year: form.year.trim(),
        passRate: Number(form.passRate) || 0,
        aPlus: Number(form.aPlus) || 0,
        gpa: Number(form.gpa) || 0,
      });
    }
    setModalOpen(false);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'আপনি কি নিশ্চিত যে ফলাফলের ধারা ডাটা ডিফল্ট অবস্থায় ফিরিয়ে আনতে চান?'
      )
    ) {
      resetPerformanceTrends();
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              এসএসসি ফলাফলের ধারা ও চার্ট ডাটা
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {performanceTrends.length} টি বছরের ডাটা
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            হোমপেজের “এসএসসি ফলাফলের ধারা” চার্টের জন্য বছরের পাশের হার (%), A+ এবং গড় জিপিএ ইনপুট ও নিয়ন্ত্রণ করুন।
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
            title="ডিফল্ট অবস্থায় ফিরিয়ে আনুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট রিসেট</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন বছরের ডাটা যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Info Tip */}
      <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900">
        <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          এখানে যে বছর ও ফলাফল ইনপুট দেবেন, মূল ওয়েবসাইটের <strong>“এসএসসি ফলাফলের ধারা”</strong> চার্ট (পাশের হার, A+ বার চার্ট এবং গড় জিপিএ লাইন গ্রাফ)-এ তা স্বয়ংক্রিয়ভাবে অঙ্কিত হবে।
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-[#fcfaf7] text-gray-700 font-bold uppercase text-[11px] border-b border-gray-200/80">
              <tr>
                <th className="py-3.5 px-4 w-24 text-center">পরীক্ষার বছর</th>
                <th className="py-3.5 px-4 text-center">পাশের হার (%)</th>
                <th className="py-3.5 px-4 text-center">A+ হার / সংখ্যা</th>
                <th className="py-3.5 px-4 text-center">গড় জিপিএ (GPA)</th>
                <th className="py-3.5 px-4 text-right w-28">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedTrends.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/70 transition">
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-bold text-gray-900 text-sm bg-gray-100 px-3 py-1 rounded-md">
                      {item.year}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      {item.passRate}%
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600 text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      {item.aPlus}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-rose-600 text-sm bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      {item.gpa.toFixed(2)} / 5.00
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-emerald-700 transition cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `আপনি কি ${item.year} সালের পারফরম্যান্স ডাটা মুছে ফেলতে চান?`
                            )
                          ) {
                            deletePerformanceTrend(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {sortedTrends.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    কোনো ডাটা পাওয়া যায়নি। “নতুন বছরের ডাটা যোগ করুন” বাটনে ক্লিক করুন।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Preview of the 2 Charts */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-emerald-700" />
          <h2 className="text-sm font-bold text-gray-900">
            লাইভ চার্ট প্রিভিউ (ওয়েবসাইটে যেমন দেখাচ্ছে)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/70 p-4 rounded-xl border border-gray-100">
          {/* Mini Bar Preview */}
          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs">
            <h4 className="text-xs font-bold text-gray-800 mb-3">পাশের হার ও A+ হার</h4>
            <div className="h-44 flex items-end justify-between gap-2 border-b border-gray-200 pb-1 px-2">
              {sortedTrends.map((d) => (
                <div key={d.id} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="flex items-end gap-1 h-full justify-center">
                    <div
                      style={{ height: `${(d.passRate / 100) * 100}%` }}
                      className="w-4 bg-emerald-700 rounded-t-xs"
                      title={`${d.year} পাশের হার: ${d.passRate}%`}
                    />
                    <div
                      style={{ height: `${(d.aPlus / 60) * 100}%` }}
                      className="w-3 bg-amber-400 rounded-t-xs"
                      title={`${d.year} A+: ${d.aPlus}`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-600 font-semibold">{d.year}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Line Preview */}
          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs">
            <h4 className="text-xs font-bold text-gray-800 mb-3">গড় জিপিএ ধারা</h4>
            <div className="h-44 flex flex-col justify-end">
              <svg viewBox="0 0 400 150" className="w-full h-36 overflow-visible">
                <line x1="20" y1="20" x2="380" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="20" y1="70" x2="380" y2="70" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="20" y1="120" x2="380" y2="120" stroke="#f1f5f9" strokeDasharray="3 3" />

                {sortedTrends.length > 0 && (
                  <>
                    <path
                      d={sortedTrends
                        .map((d, i) => {
                          const x =
                            sortedTrends.length <= 1
                              ? 200
                              : 40 + (i / (sortedTrends.length - 1)) * 320;
                          const y = 120 - Math.max(0, Math.min(1, (d.gpa - 4.0) / 1.0)) * 100;
                          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                    />

                    {sortedTrends.map((d, i) => {
                      const x =
                        sortedTrends.length <= 1
                          ? 200
                          : 40 + (i / (sortedTrends.length - 1)) * 320;
                      const y = 120 - Math.max(0, Math.min(1, (d.gpa - 4.0) / 1.0)) * 100;
                      return (
                        <g key={d.id}>
                          <circle cx={x} cy={y} r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                          <text x={x} y={y - 7} fontSize="10" fontWeight="bold" textAnchor="middle" fill="#1f2937">
                            {d.gpa.toFixed(2)}
                          </text>
                          <text x={x} y="142" fontSize="10" textAnchor="middle" fill="#64748b">
                            {d.year}
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {editingItem ? 'বছরের ডাটা সম্পাদনা করুন' : 'নতুন বছরের ডাটা ইনপুট করুন'}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              এসএসসি পরীক্ষার বছর, পাশের হার, A+ সংখ্যা ও গড় জিপিএ নির্ধারণ করুন
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  পরীক্ষার বছর *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: 2026"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  পাশের হার (%) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  placeholder="যেমন: 99.1"
                  value={form.passRate}
                  onChange={(e) =>
                    setForm({ ...form, passRate: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  A+ প্রাপ্তির সংখ্যা বা হার *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="যেমন: 45"
                  value={form.aPlus}
                  onChange={(e) =>
                    setForm({ ...form, aPlus: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  গড় জিপিএ (GPA out of 5.00) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="5.00"
                  required
                  placeholder="যেমন: 4.91"
                  value={form.gpa}
                  onChange={(e) =>
                    setForm({ ...form, gpa: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  {editingItem ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
