import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Plus, Edit2, Trash2, X, Newspaper, Calendar, Eye, Layers } from 'lucide-react';
import { NewsItem } from '../../types';
import { ImageGalleryUploadField } from './ImageGalleryUploadField';

export const ManageNews: React.FC = () => {
  const { news, addNews, updateNews, deleteNews } = useSchool();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<NewsItem | null>(null);
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    category: 'একাডেমিক',
    date: '',
    summary: '',
    content: '',
    imageUrl: '',
    images: [] as string[],
    featured: false,
  });

  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      title: '',
      category: 'একাডেমিক',
      date: '25 Sep 2026',
      summary: '',
      content: '',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80',
      images: [],
      featured: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: NewsItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      category: item.category,
      date: item.date,
      summary: item.summary,
      content: item.content || item.summary,
      imageUrl: item.imageUrl || '',
      images: item.images || [],
      featured: !!item.featured,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const payload: Omit<NewsItem, 'id'> = {
      title: form.title.trim(),
      category: form.category.trim() || 'একাডেমিক',
      date: form.date.trim() || '25 Sep 2026',
      summary: form.summary.trim(),
      content: form.content.trim() || form.summary.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
      images: form.images.length > 0 ? form.images : undefined,
      featured: form.featured,
    };

    if (editingItem) {
      updateNews(editingItem.id, payload);
    } else {
      addNews(payload);
    }

    setModalOpen(false);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">সংবাদ ব্যবস্থাপনা</h1>
          <p className="text-xs text-gray-500">
            বিদ্যালয়ের সকল সংবাদ ও প্রেস রিলিজ, প্রধান কভার ছবি ও একাধিক ছবির গ্যালারি পরিচালনা
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন সংবাদ যোগ করুন</span>
        </button>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => {
          const allImages = [
            ...(item.imageUrl ? [item.imageUrl] : []),
            ...(item.images || []),
          ];

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition group"
            >
              <div>
                {/* News Cover Image Banner */}
                {item.imageUrl ? (
                  <div className="h-44 w-full overflow-hidden relative bg-gray-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    </div>

                    {item.featured && (
                      <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        ফিচার্ড
                      </span>
                    )}

                    {allImages.length > 1 && (
                      <span className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Layers className="w-3 h-3 text-emerald-400" />
                        <span>{allImages.length} টি ছবি</span>
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{item.date}</span>
                  </div>
                )}

                {/* News Details */}
                <div className="p-4 space-y-2">
                  <span className="text-[11px] text-gray-400 font-mono block">{item.date}</span>
                  <h4 className="font-bold text-base text-gray-900 line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>

                  {/* Additional Images Thumbnail Strip */}
                  {item.images && item.images.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 mt-2">
                      <span className="text-[10px] font-bold text-gray-500 block mb-1.5 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-emerald-700" />
                        <span>অতিরিক্ত ছবিসমূহ ({item.images.length} টি):</span>
                      </span>
                      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                        {item.images.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setPreviewZoomImage(img)}
                            className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 shrink-0 cursor-pointer hover:border-emerald-500 transition shadow-2xs"
                            title="বড় করে দেখুন"
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono">আইডি: {item.id}</span>
                <div className="flex items-center gap-1.5">
                  {item.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewZoomImage(item.imageUrl!)}
                      className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition cursor-pointer"
                      title="কভার ছবি বড় করে দেখুন"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700 transition cursor-pointer"
                    title="সম্পাদনা করুন"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative border border-gray-100 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <Newspaper className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingItem ? 'সংবাদ সম্পাদনা' : 'নতুন সংবাদ যোগ করুন'}
                </h3>
                <p className="text-xs text-gray-500">
                  কভার ছবি ও অতিরিক্ত একাধিক ছবি সহ সংবাদের পূর্ণ তথ্য দিন
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">সংবাদের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: এসএসসিতে শতভাগ পাসের সাফল্য"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ক্যাটাগরি</label>
                  <input
                    type="text"
                    placeholder="যেমন: একাডেমিক, অর্জন, ক্যাম্পাস"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">তারিখ</label>
                  <input
                    type="text"
                    placeholder="যেমন: 25 Sep 2026"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">সংক্ষেপ (সারমর্ম) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="সংবাদের সংক্ষেপ লিখুন..."
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 resize-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">পূর্ণ সংবাদ বক্তব্য</label>
                <textarea
                  rows={4}
                  placeholder="বিস্তারিত সংবাদ লিখুন..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 resize-none font-medium"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featuredNews"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="featuredNews" className="text-gray-800 font-semibold cursor-pointer">
                  হোমপেজে প্রধান সংবাদ (Featured) হিসেবে প্রদর্শন করুন
                </label>
              </div>

              {/* Cover Image + Additional Photos Upload Section */}
              <ImageGalleryUploadField
                coverImage={form.imageUrl}
                onCoverImageChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
                additionalImages={form.images}
                onAdditionalImagesChange={(imgs) => setForm((prev) => ({ ...prev, images: imgs }))}
                coverLabel="সংবাদের প্রধান কভার ছবি (Cover Photo)"
                additionalLabel="কভার ছাড়াও সংবাদের আরও ছবি যোগ করুন (Additional Photos)"
              />

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#15803d] hover:bg-[#166534] text-white font-bold rounded-xl transition cursor-pointer shadow-xs"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6 text-rose-600" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900">সংবাদ মুছে ফেলবেন?</h3>
              <p className="text-xs text-gray-500">
                আপনি কি নিশ্চিত যে <b className="text-gray-800">"{itemToDelete.title}"</b> সংবাদটি তালিকা থেকে মুছে ফেলতে চান?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteNews(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="flex-1 py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer shadow-xs transition"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Lightbox Modal */}
      {previewZoomImage && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewZoomImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[88vh] flex items-center justify-center">
            <button
              onClick={() => setPreviewZoomImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 p-1 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewZoomImage}
              alt="Enlarged preview"
              className="max-h-[82vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/20"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
