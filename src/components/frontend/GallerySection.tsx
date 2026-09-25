import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GalleryAlbum } from '../../types';

export const GallerySection: React.FC = () => {
  const { galleryAlbums } = useSchool();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [activeAlbum, setActiveAlbum] = useState<GalleryAlbum | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  const filterTabs = [
    { key: 'all', label: 'সব' },
    { key: 'campus', label: 'Campus' },
    { key: 'classroom', label: 'Classroom' },
    { key: 'sports', label: 'Sports' },
    { key: 'cultural', label: 'Cultural' },
    { key: 'science', label: 'Science' },
  ];

  const filteredAlbums =
    activeTab === 'all'
      ? galleryAlbums
      : galleryAlbums.filter((a) => a.category.toLowerCase() === activeTab.toLowerCase());

  const openLightbox = (album: GalleryAlbum) => {
    setActiveAlbum(album);
    setLightboxIndex(0);
  };

  return (
    <section id="gallery" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full">
          ফটোগ্যালারি
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          আলোকিত গ্যালারি
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          ক্যাম্পাস, অনুষ্ঠান ও শিক্ষার্থী জীবনের কিছু মুহূর্ত
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[#0f5338] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Albums Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {filteredAlbums.map((album) => (
          <div
            key={album.id}
            onClick={() => openLightbox(album)}
            className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-lg transition transform hover:-translate-y-1"
          >
            <img
              src={album.imageUrl}
              alt={album.title}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Bottom Title & Count Badge */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h4 className="text-base font-bold text-white drop-shadow-xs">
                {album.title}
              </h4>
              <p className="text-xs text-emerald-300 font-medium mt-0.5">
                {album.itemCountText}
              </p>
            </div>

            {/* Top Hover View Icon */}
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeAlbum && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col justify-between p-4 sm:p-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white max-w-5xl mx-auto w-full">
            <div>
              <h3 className="text-lg font-bold">{activeAlbum.title}</h3>
              <p className="text-xs text-gray-400">
                ছবি {lightboxIndex + 1} / {activeAlbum.images?.length || 1}
              </p>
            </div>
            <button
              onClick={() => setActiveAlbum(null)}
              className="p-2 rounded-full hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Image View */}
          <div className="relative max-w-4xl max-h-[70vh] mx-auto flex items-center justify-center my-auto">
            {activeAlbum.images && activeAlbum.images.length > 1 && (
              <button
                onClick={() =>
                  setLightboxIndex(
                    (prev) => (prev - 1 + activeAlbum.images!.length) % activeAlbum.images!.length
                  )
                }
                className="absolute left-2 sm:-left-12 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full cursor-pointer z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={
                activeAlbum.images
                  ? activeAlbum.images[lightboxIndex]
                  : activeAlbum.imageUrl
              }
              alt={activeAlbum.title}
              className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl"
            />

            {activeAlbum.images && activeAlbum.images.length > 1 && (
              <button
                onClick={() =>
                  setLightboxIndex((prev) => (prev + 1) % activeAlbum.images!.length)
                }
                className="absolute right-2 sm:-right-12 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full cursor-pointer z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Thumbnail list */}
          {activeAlbum.images && activeAlbum.images.length > 1 && (
            <div className="flex items-center justify-center gap-2 max-w-xl mx-auto overflow-x-auto py-2">
              {activeAlbum.images.map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 cursor-pointer shrink-0 transition ${
                    lightboxIndex === i ? 'border-amber-400 scale-105' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
