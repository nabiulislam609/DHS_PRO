import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Award, Trophy, Medal, Star, Cpu, Layers, X, Eye } from 'lucide-react';
import { AchievementItem } from '../../types';

export const AchievementsSection: React.FC = () => {
  const { achievements } = useSchool();
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementItem | null>(null);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const getAchievementIcon = (type: AchievementItem['iconType']) => {
    switch (type) {
      case 'olympiad':
        return { icon: Medal, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'sports':
        return { icon: Trophy, color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'scholarship':
        return { icon: Star, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'tech':
        return { icon: Cpu, color: 'bg-teal-50 text-teal-700 border-teal-200' };
      default:
        return { icon: Award, color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  return (
    <section id="achievements" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full">
          অর্জন
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          আমাদের গর্ব
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          মেধা ও ঐতিহ্যে বিদ্যালয়ের অর্জনের কিছু দৃষ্টান্ত
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {achievements.map((item) => {
          const { icon: Icon, color } = getAchievementIcon(item.iconType);
          const allImages = [
            ...(item.imageUrl ? [item.imageUrl] : []),
            ...(item.images || []),
          ];

          return (
            <div
              key={item.id}
              onClick={() => {
                setSelectedAchievement(item);
                setActivePhoto(item.imageUrl || (item.images && item.images[0]) || null);
              }}
              className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden cursor-pointer group"
            >
              <div>
                {/* Optional Cover Photo Thumbnail */}
                {item.imageUrl && (
                  <div className="h-32 w-full overflow-hidden relative bg-gray-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {item.year}
                      </span>
                    </div>
                    {allImages.length > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <Layers className="w-2.5 h-2.5 text-emerald-400" />
                        <span>{allImages.length}</span>
                      </span>
                    )}
                  </div>
                )}

                <div className="p-4">
                  {!item.imageUrl && (
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold text-gray-400 font-mono">
                        {item.year}
                      </span>
                    </div>
                  )}

                  <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 block mb-1">
                    {item.category}
                  </span>

                  <h4 className="text-sm font-bold text-gray-900 mb-1 leading-snug group-hover:text-emerald-800 transition line-clamp-2">
                    {item.title}
                  </h4>

                  <p className="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-2">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-3">
                {item.authorOrTeam && (
                  <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500 font-medium truncate">
                    {item.authorOrTeam}
                  </div>
                )}
                {allImages.length > 0 && (
                  <div className="text-[10px] text-emerald-700 font-bold group-hover:underline pt-1 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>ছবি দেখুন ({allImages.length}টি)</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Achievement Detail & Photo Gallery Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedAchievement(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {selectedAchievement.category}
              </span>
              <span className="text-xs text-gray-400 font-mono font-bold">• {selectedAchievement.year}</span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedAchievement.title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">{selectedAchievement.subtitle}</p>

            {selectedAchievement.authorOrTeam && (
              <p className="text-xs text-gray-500 mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                অর্জনকারী: <b className="text-gray-800">{selectedAchievement.authorOrTeam}</b>
              </p>
            )}

            {/* Photo Viewer */}
            {(() => {
              const allImages = [
                ...(selectedAchievement.imageUrl ? [selectedAchievement.imageUrl] : []),
                ...(selectedAchievement.images || []),
              ];

              if (allImages.length === 0) return null;

              const activeImg = activePhoto || allImages[0];

              return (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-black/5 border border-gray-200">
                    <img src={activeImg} alt="" className="w-full h-full object-contain bg-black/40" />
                  </div>

                  {allImages.length > 1 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-gray-500">
                        সকল ছবি ({allImages.length}টি):
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto py-1">
                        {allImages.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActivePhoto(img)}
                            className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition ${
                              img === activeImg
                                ? 'border-emerald-600 ring-2 ring-emerald-200'
                                : 'border-gray-200 hover:border-emerald-400 opacity-75 hover:opacity-100'
                            }`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAchievement(null)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
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
