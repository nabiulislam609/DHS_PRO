import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Calendar, Clock, ArrowRight, X, Layers } from 'lucide-react';
import { NewsItem } from '../../types';

export const NewsSection: React.FC = () => {
  const { news } = useSchool();
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const featured = news.find((n) => n.featured) || news[0];
  const otherNews = news.filter((n) => n.id !== featured?.id).slice(0, 3);

  const openNewsModal = (item: NewsItem) => {
    setSelectedNews(item);
    setActivePhoto(item.imageUrl || (item.images && item.images[0]) || null);
  };

  return (
    <section id="news" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full">
          সংবাদ
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          সর্বশেষ সংবাদ
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          বিদ্যালয়ের সাম্প্রতিক ঘটনাবলি ও সংবাদ
        </p>
      </div>

      {/* Grid: 1 large on left, 3 small on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Featured News) */}
        {featured && (
          <div
            onClick={() => openNewsModal(featured)}
            className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden cursor-pointer group flex flex-col justify-between hover:shadow-md transition"
          >
            <div className="relative h-64 sm:h-72 w-full overflow-hidden">
              <img
                src={featured.imageUrl}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                  {featured.category}
                </span>
                {featured.images && featured.images.length > 0 && (
                  <span className="bg-black/60 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Layers className="w-3 h-3 text-emerald-400" />
                    <span>{1 + featured.images.length}টি ছবি</span>
                  </span>
                )}
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-3 text-xs text-gray-300 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {featured.date}
                  </span>
                  {featured.readTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featured.readTime}
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                  {featured.title}
                </h3>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                {featured.summary}
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 group-hover:text-emerald-900">
                <span>সম্পূর্ণ পড়ুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        )}

        {/* Right Column (Side News Items) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {otherNews.map((item) => (
            <div
              key={item.id}
              onClick={() => openNewsModal(item)}
              className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 flex gap-4 cursor-pointer hover:shadow-md transition group"
            >
              {item.imageUrl && (
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative bg-gray-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  {item.images && item.images.length > 0 && (
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                      +{item.images.length}
                    </span>
                  )}
                </div>
              )}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  <h4 className="font-bold text-sm text-gray-900 mt-1 line-clamp-2 group-hover:text-emerald-800 transition">
                    {item.title}
                  </h4>
                </div>
                <span className="text-[11px] text-gray-400 font-mono mt-2">{item.date}</span>
              </div>
            </div>
          ))}

          {/* View All Button */}
          <div className="text-center pt-2">
            <button
              onClick={() => featured && openNewsModal(featured)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
            >
              <span>সব সংবাদ দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* News Modal with Photos Viewer */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedNews(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo Gallery Viewer */}
            {(() => {
              const allImages = [
                ...(selectedNews.imageUrl ? [selectedNews.imageUrl] : []),
                ...(selectedNews.images || []),
              ];

              if (allImages.length === 0) return null;
              const activeImg = activePhoto || allImages[0];

              return (
                <div className="space-y-2 mb-4">
                  <div className="h-60 sm:h-72 w-full rounded-2xl overflow-hidden bg-black/5 border border-gray-200">
                    <img src={activeImg} alt="" className="w-full h-full object-cover" />
                  </div>

                  {allImages.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {allImages.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActivePhoto(img)}
                          className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition ${
                            img === activeImg
                              ? 'border-emerald-600 ring-2 ring-emerald-200'
                              : 'border-gray-200 hover:border-emerald-400 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                {selectedNews.category}
              </span>
              <span>•</span>
              <Calendar className="w-3.5 h-3.5" />
              <span>{selectedNews.date}</span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
              {selectedNews.title}
            </h3>

            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-6">
              {selectedNews.content || selectedNews.summary}
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedNews(null)}
                className="bg-emerald-700 text-white text-xs font-semibold px-5 py-2 rounded-xl hover:bg-emerald-800 transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
