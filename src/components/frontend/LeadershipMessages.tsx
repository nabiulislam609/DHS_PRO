import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Quote, Eye, X, Sparkles } from 'lucide-react';

export const LeadershipMessages: React.FC = () => {
  const { leadership, siteSettings } = useSchool();
  const [activeLightbox, setActiveLightbox] = useState<{
    url: string;
    name: string;
    role: string;
  } | null>(null);

  const badgeText = siteSettings.leadershipBadge || 'নেতৃত্ব';
  const titleText = siteSettings.leadershipTitle || 'নেতৃত্বের বার্তা';
  const subtitleText = siteSettings.leadershipSubtitle || 'বিদ্যালয়ের প্রধান ও পরিচালনা পরিষদের বার্তা';

  return (
    <section id="leadership" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto bg-gray-50/60 rounded-3xl my-8">
      {/* Section Header */}
      <div className="text-center mb-10">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
          {badgeText}
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          {titleText}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {subtitleText}
        </p>
      </div>

      {/* Two Column Message Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {leadership.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs hover:shadow-md transition relative flex flex-col justify-between"
          >
            {/* Top quote icon */}
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <Quote className="w-5 h-5 fill-emerald-600" />
            </div>

            {/* Quote body */}
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed italic mb-6">
              "{item.message}"
            </p>

            {/* Author Info with Enlarged Circular Profile Picture (112px on Desktop, 88px on Mobile) */}
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-5 pt-5 border-t border-gray-100 text-center sm:text-left">
              {item.image ? (
                <div
                  onClick={() => setActiveLightbox({ url: item.image!, name: item.name, role: item.role })}
                  className="w-[88px] h-[88px] sm:w-[112px] sm:h-[112px] aspect-square rounded-full overflow-hidden border-4 border-emerald-600 shadow-md shrink-0 cursor-pointer hover:scale-105 hover:border-emerald-700 transition duration-300 relative group"
                  title={`${item.name}-এর বড় ছবি দেখতে ক্লিক করুন`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover object-[center_top] aspect-square"
                  />
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white rounded-full backdrop-blur-2xs">
                    <Eye className="w-5 h-5" />
                    <span className="text-[9px] font-bold mt-0.5">বড় দেখুন</span>
                  </div>
                </div>
              ) : (
                <div className="w-[88px] h-[88px] sm:w-[112px] sm:h-[112px] aspect-square rounded-full bg-emerald-100 text-emerald-800 font-black text-3xl sm:text-4xl flex items-center justify-center border-4 border-emerald-300 shrink-0 shadow-md">
                  {item.initial || item.name.charAt(0)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                  {item.name}
                </h4>
                <p className="text-xs sm:text-sm font-bold text-emerald-700 mt-1">
                  {item.role}
                </p>
                {item.credentials && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.credentials}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Photo Lightbox Modal */}
      {activeLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveLightbox(null)}
        >
          <div
            className="bg-white rounded-3xl p-5 sm:p-7 max-w-md w-full text-center relative shadow-2xl border border-white/20 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveLightbox(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-52 h-52 sm:w-64 sm:h-64 aspect-square rounded-full overflow-hidden border-4 border-emerald-600 shadow-xl mx-auto mb-4 bg-gray-100">
              <img
                src={activeLightbox.url}
                alt={activeLightbox.name}
                className="w-full h-full object-cover object-[center_top] aspect-square"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{activeLightbox.role}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {activeLightbox.name}
            </h3>
          </div>
        </div>
      )}
    </section>
  );
};
