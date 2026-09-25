import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Plus, Edit2, Trash2, X, Calendar, Clock, MapPin, Eye, Layers } from 'lucide-react';
import { EventItem } from '../../types';
import { ImageGalleryUploadField } from './ImageGalleryUploadField';

export const ManageEvents: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent } = useSchool();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EventItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<EventItem | null>(null);
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    category: 'অনুষ্ঠান',
    imageUrl: '',
    images: [] as string[],
  });

  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      title: '',
      date: '15 Jan 2026',
      time: '10:00 - 14:00',
      location: 'বিদ্যালয় প্রাঙ্গণ',
      description: '',
      category: 'অনুষ্ঠান',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
      images: [],
    });
    setModalOpen(true);
  };

  const openEditModal = (item: EventItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      date: item.date,
      time: item.time,
      location: item.location,
      description: item.description,
      category: item.category || 'অনুষ্ঠান',
      imageUrl: item.imageUrl || '',
      images: item.images || [],
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const payload = {
      title: form.title.trim(),
      date: form.date.trim() || '15 Jan 2026',
      time: form.time.trim() || '10:00 - 14:00',
      location: form.location.trim() || 'বিদ্যালয় প্রাঙ্গণ',
      description: form.description.trim(),
      category: form.category.trim() || 'অনুষ্ঠান',
      imageUrl: form.imageUrl.trim() || undefined,
      images: form.images.length > 0 ? form.images : undefined,
    };

    if (editingItem) {
      updateEvent(editingItem.id, payload);
    } else {
      addEvent(payload);
    }

    setModalOpen(false);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ইভেন্ট ব্যবস্থাপনা</h1>
          <p className="text-xs text-gray-500">
            বিদ্যালয়ের সকল অনুষ্ঠান ও ইভেন্টের সময়সূচি, কভার ছবি ও ফটো গ্যালারি পরিচালনা
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ইভেন্ট যোগ করুন</span>
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((evt) => {
          const allImages = [
            ...(evt.imageUrl ? [evt.imageUrl] : []),
            ...(evt.images || []),
          ];

          return (
            <div
              key={evt.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition group"
            >
              <div>
                {/* Event Cover Photo or Graphic Banner */}
                {evt.imageUrl ? (
                  <div className="h-44 w-full overflow-hidden relative bg-gray-100">
                    <img
                      src={evt.imageUrl}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                        {evt.category || 'ইভেন্ট'}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-emerald-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                        {evt.date}
                      </span>
                    </div>
                    {allImages.length > 1 && (
                      <span className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Layers className="w-3 h-3 text-emerald-400" />
                        <span>{allImages.length} টি ছবি</span>
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/70 border-b border-amber-100/50 flex items-center justify-between">
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                      {evt.category || 'ইভেন্ট'}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{evt.date}</span>
                  </div>
                )}

                {/* Event Details */}
                <div className="p-5 space-y-2.5">
                  <h4 className="font-bold text-base text-gray-900 leading-snug">{evt.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-3">{evt.description}</p>

                  <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{evt.location}</span>
                    </div>
                  </div>

                  {/* Additional Images Thumbnail Strip */}
                  {evt.images && evt.images.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 mt-2">
                      <span className="text-[10px] font-bold text-gray-500 block mb-1.5 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-emerald-700" />
                        <span>অতিরিক্ত ছবিসমূহ ({evt.images.length} টি):</span>
                      </span>
                      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                        {evt.images.map((img, idx) => (
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
                <span className="text-[10px] text-gray-400 font-mono">আইডি: {evt.id}</span>
                <div className="flex items-center gap-1.5">
                  {evt.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewZoomImage(evt.imageUrl!)}
                      className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition cursor-pointer"
                      title="কভার ছবি বড় করে দেখুন"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEditModal(evt)}
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700 transition cursor-pointer"
                    title="সম্পাদনা করুন"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemToDelete(evt)}
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
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingItem ? 'ইভেন্ট সম্পাদনা' : 'নতুন ইভেন্ট যোগ করুন'}
                </h3>
                <p className="text-xs text-gray-500">
                  কভার ছবি ও অতিরিক্ত একাধিক ছবি সহ ইভেন্টের বিস্তারিত বিবরণ দিন
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">ইভেন্টের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: বিজ্ঞান মেলা ২০২৬"
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
                    placeholder="যেমন: ক্রীড়া, সাংস্কৃতিক, বিজ্ঞান মেলা"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">তারিখ</label>
                  <input
                    type="text"
                    placeholder="যেমন: 25 Jan 2026"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">সময়</label>
                  <input
                    type="text"
                    placeholder="যেমন: 10:00 - 15:00"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">স্থান</label>
                  <input
                    type="text"
                    placeholder="যেমন: বিদ্যালয় প্রাঙ্গণ বা অডিটোরিয়াম"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ইভেন্টের বিবরণ</label>
                <textarea
                  rows={3}
                  placeholder="ইভেন্টের বিস্তারিত তথ্য লিখুন..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 resize-none font-medium"
                />
              </div>

              {/* Cover Image + Additional Photos Upload Section */}
              <ImageGalleryUploadField
                coverImage={form.imageUrl}
                onCoverImageChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
                additionalImages={form.images}
                onAdditionalImagesChange={(imgs) => setForm((prev) => ({ ...prev, images: imgs }))}
                coverLabel="ইভেন্টের প্রধান কভার ছবি (Cover Photo)"
                additionalLabel="কভার ছাড়াও ইভেন্টের আরও ছবি যোগ করুন (Additional Photos)"
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
              <h3 className="text-base font-bold text-gray-900">ইভেন্ট মুছে ফেলবেন?</h3>
              <p className="text-xs text-gray-500">
                আপনি কি নিশ্চিত যে <b className="text-gray-800">"{itemToDelete.title}"</b> ইভেন্টটি তালিকা থেকে মুছে ফেলতে চান?
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
                  deleteEvent(itemToDelete.id);
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
