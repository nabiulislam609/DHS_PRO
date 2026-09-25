import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Save, CheckCircle, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { compressImageFile } from '../../utils/imageUpload';

export const ManageLeadership: React.FC = () => {
  const { leadership, updateLeadership } = useSchool();
  const [items, setItems] = useState([...leadership]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleSave = (id: string, updated: any) => {
    updateLeadership(id, updated);
    setSavedId(id);
    setTimeout(() => setSavedId(null), 3000);
  };

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
    leaderId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadError(null);
      const dataUrl = await compressImageFile(file, 600, 600, 0.85);
      const next = [...items];
      next[idx] = {
        ...next[idx],
        image: dataUrl,
      };
      setItems(next);
      // Auto save or let them click save
      updateLeadership(leaderId, { image: dataUrl });
      setSavedId(leaderId);
      setTimeout(() => setSavedId(null), 2500);
    } catch (err: any) {
      setUploadError(err.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে');
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveImage = (idx: number, leaderId: string) => {
    const next = [...items];
    next[idx] = {
      ...next[idx],
      image: undefined,
    };
    setItems(next);
    updateLeadership(leaderId, { image: undefined });
    setSavedId(leaderId);
    setTimeout(() => setSavedId(null), 2000);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">নেতৃত্বের বার্তা সম্পাদনা</h1>
        <p className="text-xs text-gray-500">
          প্রধান শিক্ষক ও সভাপতি মহোদয়ের ছবি, বাণী ও পরিচয় তথ্য হালনাগাদ করুন
        </p>
      </div>

      {uploadError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
          {uploadError}
        </div>
      )}

      <div className="space-y-6">
        {items.map((leader, idx) => (
          <div key={leader.id} className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-5">
            {/* Header & Photo Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                {/* Photo or initial circle */}
                <div className="relative group shrink-0">
                  {leader.image ? (
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-800 font-bold text-2xl flex items-center justify-center">
                      {leader.initial || leader.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900">{leader.role}</h3>
                  <p className="text-xs text-gray-500 font-medium">{leader.name}</p>
                  <p className="text-[11px] text-gray-400">ব্যক্তিত্ব {idx + 1}</p>
                </div>
              </div>

              {/* Upload photo button from device */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={(el) => { fileInputRefs.current[leader.id] = el; }}
                  accept="image/*"
                  onChange={(e) => handleImageFileChange(e, idx, leader.id)}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRefs.current[leader.id]?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{leader.image ? 'ছবি পরিবর্তন করুন' : 'ডিভাইস থেকে ছবি আপলোড করুন'}</span>
                </button>

                {leader.image && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx, leader.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition cursor-pointer"
                    title="ছবি মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Fields Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">নাম</label>
                <input
                  type="text"
                  value={leader.name}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx].name = e.target.value;
                    setItems(next);
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">পদবী / পরিচয়</label>
                <input
                  type="text"
                  value={leader.role}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx].role = e.target.value;
                    setItems(next);
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">শিক্ষাগত যোগ্যতা / পদমর্যাদা</label>
                <input
                  type="text"
                  value={leader.credentials}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx].credentials = e.target.value;
                    setItems(next);
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">বাণী / বক্তব্য</label>
                <textarea
                  rows={4}
                  value={leader.message}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx].message = e.target.value;
                    setItems(next);
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Footer with save confirmation & button */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                {savedId === leader.id && (
                  <div className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>সফলভাবে সংরক্ষিত হয়েছে!</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleSave(leader.id, leader)}
                className="inline-flex items-center gap-1.5 bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
