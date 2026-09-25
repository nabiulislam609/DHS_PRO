import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Calendar, Clock, MapPin, X, Layers } from 'lucide-react';
import { EventItem } from '../../types';

export const EventsSection: React.FC = () => {
  const { events } = useSchool();
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  return (
    <section id="events" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto bg-gray-50/50 rounded-3xl my-8">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full">
          ইভেন্ট
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          আসন্ন ইভেন্ট
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          বিদ্যালয়ের আসন্ন কার্যক্রম ও অনুষ্ঠান
        </p>
      </div>

      {/* Grid of 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {events.map((evt) => {
          const allImages = [
            ...(evt.imageUrl ? [evt.imageUrl] : []),
            ...(evt.images || []),
          ];

          return (
            <div
              key={evt.id}
              onClick={() => {
                setSelectedEvent(evt);
                setActivePhoto(evt.imageUrl || (evt.images && evt.images[0]) || null);
              }}
              className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition cursor-pointer group"
            >
              {/* Event Cover Photo or Soft Warm Header Bar */}
              {evt.imageUrl ? (
                <div className="h-36 w-full overflow-hidden relative bg-gray-100">
                  <img
                    src={evt.imageUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {evt.category || 'ইভেন্ট'}
                    </span>
                  </div>
                  {allImages.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5 text-emerald-400" />
                      <span>{allImages.length}</span>
                    </span>
                  )}
                </div>
              ) : (
                <div className="h-28 bg-amber-50/80 border-b border-amber-100/50 p-4 flex flex-col justify-between relative">
                  <span className="inline-block bg-amber-200/60 text-amber-900 text-[11px] font-bold px-2 py-0.5 rounded self-start">
                    {evt.category || 'ইভেন্ট'}
                  </span>
                  <Calendar className="w-8 h-8 text-amber-400/50 absolute right-4 bottom-4" />
                </div>
              )}

              {/* Event Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-base text-gray-900 group-hover:text-emerald-800 transition mb-3 line-clamp-2">
                    {evt.title}
                  </h4>

                  <div className="space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700 group-hover:underline">
                    বিস্তারিত দেখুন →
                  </span>
                  {allImages.length > 0 && (
                    <span className="text-[10px] text-gray-400 font-medium">
                      {allImages.length}টি ছবি
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Detail & Gallery Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full mb-2">
              {selectedEvent.category || 'ইভেন্ট'}
            </span>

            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {selectedEvent.title}
            </h3>

            {/* Photos Viewer */}
            {(() => {
              const allImages = [
                ...(selectedEvent.imageUrl ? [selectedEvent.imageUrl] : []),
                ...(selectedEvent.images || []),
              ];

              if (allImages.length === 0) return null;
              const activeImg = activePhoto || allImages[0];

              return (
                <div className="space-y-2 mb-4">
                  <div className="h-56 sm:h-64 w-full rounded-2xl overflow-hidden bg-black/5 border border-gray-200">
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

            <div className="bg-gray-50 rounded-2xl p-3.5 space-y-2 text-xs text-gray-600 mb-4 border border-gray-100">
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>তারিখ: {selectedEvent.date}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>সময়: {selectedEvent.time}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>স্থান: {selectedEvent.location}</span>
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
              {selectedEvent.description}
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
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
