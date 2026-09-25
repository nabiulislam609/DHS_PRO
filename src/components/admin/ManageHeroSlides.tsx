import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { HeroSlide } from '../../types';
import { compressImageFile } from '../../utils/imageUpload';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';

export const ManageHeroSlides: React.FC = () => {
  const {
    heroSlides,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    toggleHeroSlideActive,
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    badgeText: '',
    buttonText: '',
    buttonLink: '#admission',
    active: true,
  });

  const filteredSlides = heroSlides.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.badgeText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredSlides.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openAddModal = () => {
    setEditingSlide(null);
    setForm({
      title: '',
      subtitle: '',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-538b6d0a2e23?w=1600&q=80',
      badgeText: 'দাদরা উচ্চ বিদ্যালয়',
      buttonText: 'ভর্তি চলছে',
      buttonLink: '#admission',
      active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setForm({
      title: slide.title,
      subtitle: slide.subtitle,
      imageUrl: slide.imageUrl,
      badgeText: slide.badgeText,
      buttonText: slide.buttonText,
      buttonLink: slide.buttonLink || '#admission',
      active: slide.active,
    });
    setModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadLoading(true);
      // Compress to 1200x675 for slide aspect ratio, ~60KB
      const base64 = await compressImageFile(file, 1200, 675, 0.8);
      setForm((prev) => ({ ...prev, imageUrl: base64 }));
    } catch (err: any) {
      alert(err.message || 'ছবি আপলোড করতে ত্রুটি হয়েছে');
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.imageUrl.trim()) return;

    if (editingSlide) {
      updateHeroSlide(editingSlide.id, form);
    } else {
      addHeroSlide(form);
    }
    setModalOpen(false);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">হিরো স্লাইড</h1>
          <p className="text-xs text-gray-500">হোমপেজের স্লাইডার ম্যানেজ করুন</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>যোগ করুন</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="অনুসন্ধান করুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:border-emerald-600 shadow-2xs"
        />
      </div>

      {/* Slides Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-[#fcfaf7] text-gray-700 font-bold uppercase text-[11px] border-b border-gray-200/80">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredSlides.length > 0 &&
                      selectedIds.length === filteredSlides.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="py-3.5 px-4">শিরোনাম</th>
                <th className="py-3.5 px-4">সাবটাইটেল</th>
                <th className="py-3.5 px-4">ছবি URL</th>
                <th className="py-3.5 px-4">ব্যাজ টেক্সট</th>
                <th className="py-3.5 px-4">বাটন টেক্সট</th>
                <th className="py-3.5 px-4">সক্রিয়</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSlides.map((slide) => {
                const isSelected = selectedIds.includes(slide.id);
                return (
                  <tr
                    key={slide.id}
                    className={`hover:bg-gray-50/70 transition ${
                      isSelected ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(slide.id)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900 max-w-[200px] truncate">
                      {slide.title}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 max-w-[240px] truncate">
                      {slide.subtitle}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          className="w-10 h-6 object-cover rounded shadow-2xs shrink-0 border border-gray-200"
                        />
                        <span className="font-mono text-gray-400 text-[11px] truncate">
                          {slide.imageUrl.startsWith('data:')
                            ? '[ডিভাইস থেকে আপলোড করা ছবি]'
                            : slide.imageUrl}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-gray-700 font-medium">
                        {slide.badgeText || '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 font-medium">
                      {slide.buttonText || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleHeroSlideActive(slide.id)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            slide.active ? 'bg-[#0f4e34]' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              slide.active ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="text-[11px] text-gray-500">
                          {slide.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(slide)}
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-emerald-700 transition cursor-pointer"
                          title="সম্পাদনা করুন"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`আপনি কি "${slide.title}" স্লাইডটি মুছে ফেলতে চান?`)) {
                              deleteHeroSlide(slide.id);
                            }
                          }}
                          className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredSlides.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    কোনো স্লাইডার পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal with Device Photo Upload */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingSlide ? 'হিরো স্লাইড সম্পাদনা' : 'নতুন হিরো স্লাইড যোগ করুন'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">স্লাইড শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: শিক্ষাই জাতির মূল সম্পদ"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">সাবটাইটেল / বিবরণ</label>
                <textarea
                  rows={2}
                  placeholder="যেমন: ষাটের বেশি বছরের ঐতিহ্য, আধুনিক শিক্ষার দীপ্তি"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* Photo Upload Section */}
              <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-700" />
                    <span>স্লাইডার ব্যানার ছবি *</span>
                  </label>
                  <span className="text-[11px] text-emerald-800 font-medium">
                    ডিভাইস থেকে আপলোড অথবা URL দিন
                  </span>
                </div>

                {/* Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadLoading}
                    className="inline-flex items-center gap-1.5 bg-[#15803d] hover:bg-[#166534] text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadLoading ? 'আপলোড হচ্ছে...' : 'ডিভাইস থেকে ফটো আপলোড করুন'}</span>
                  </button>

                  {form.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: '' })}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold cursor-pointer transition"
                    >
                      ছবি সরান
                    </button>
                  )}
                </div>

                {/* Preview */}
                {form.imageUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 aspect-video max-h-48 bg-gray-900">
                    <img
                      src={form.imageUrl}
                      alt="স্লাইডার প্রিভিউ"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px]">
                      ছবি প্রিভিউ
                    </div>
                  </div>
                )}

                {/* Or Enter Image URL */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    বা সরাসরি ছবির ওয়েব লিংক (URL):
                  </label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ব্যাজ টেক্সট</label>
                  <input
                    type="text"
                    placeholder="যেমন: দাদরা উচ্চ বিদ্যালয়"
                    value={form.badgeText}
                    onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">বাটন টেক্সট</label>
                  <input
                    type="text"
                    placeholder="যেমন: ভর্তি চলছে / একাডেমিক প্রোগ্রাম"
                    value={form.buttonText}
                    onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">বাটন লিংক</label>
                <input
                  type="text"
                  placeholder="যেমন: #admission, #programs, #gallery"
                  value={form.buttonLink}
                  onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="font-bold text-gray-800">স্লাইডটি ওয়েবসাইটে সক্রিয় থাকবে?</span>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, active: !form.active })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    form.active ? 'bg-[#15803d]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      form.active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
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
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
