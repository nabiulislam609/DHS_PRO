import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Plus,
  Trash2,
  X,
  Image as ImageIcon,
  Upload,
  Eye,
  Star,
  Layers,
  Sparkles,
  Check,
  Loader2,
  FolderPlus,
} from 'lucide-react';
import { compressImageFile } from '../../utils/imageUpload';
import { GalleryAlbum } from '../../types';

export const ManageGallery: React.FC = () => {
  const {
    galleryAlbums,
    addGalleryAlbum,
    deleteGalleryAlbum,
    addImageToAlbum,
    addImagesToAlbum,
    removeImageFromAlbum,
    setAlbumCoverImage,
  } = useSchool();

  // Modals state
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [managePhotosModalOpen, setManagePhotosModalOpen] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Uploading state
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);
  const [uploadingToAlbum, setUploadingToAlbum] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // File input refs
  const albumCoverFileRef = useRef<HTMLInputElement | null>(null);
  const albumAdditionalFilesRef = useRef<HTMLInputElement | null>(null);
  const manageAlbumFilesRef = useRef<HTMLInputElement | null>(null);

  // New Album Form state (Cover image + Additional Images)
  const [albumForm, setAlbumForm] = useState({
    title: '',
    category: 'campus',
    imageUrl: '',
    additionalImages: [] as string[],
  });

  const [additionalUrlInput, setAdditionalUrlInput] = useState('');
  const [modalUrlInput, setModalUrlInput] = useState('');

  // Selected album object for the photo manager modal
  const selectedAlbum: GalleryAlbum | undefined = galleryAlbums.find(
    (a) => a.id === selectedAlbumId
  );

  // Handle Cover Photo file for new album
  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      setUploadError(null);
      const base64 = await compressImageFile(file, 1200, 800, 0.82);
      setAlbumForm((prev) => ({ ...prev, imageUrl: base64 }));
    } catch (err: any) {
      setUploadError(err.message || 'কভার ছবি আপলোড করতে ব্যর্থ হয়েছে');
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  // Handle Multiple Additional Photos for new album
  const handleAdditionalFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploadingAdditional(true);
      setUploadError(null);
      const compressedList: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const base64 = await compressImageFile(files[i], 1200, 800, 0.82);
        compressedList.push(base64);
      }

      setAlbumForm((prev) => ({
        ...prev,
        additionalImages: [...prev.additionalImages, ...compressedList],
      }));
    } catch (err: any) {
      setUploadError(err.message || 'অতিরিক্ত ছবি আপলোড করতে ব্যর্থ হয়েছে');
    } finally {
      setUploadingAdditional(false);
      e.target.value = '';
    }
  };

  // Add additional photo by URL for new album
  const handleAddAdditionalUrl = () => {
    if (!additionalUrlInput.trim()) return;
    setAlbumForm((prev) => ({
      ...prev,
      additionalImages: [...prev.additionalImages, additionalUrlInput.trim()],
    }));
    setAdditionalUrlInput('');
  };

  // Remove single additional photo from new album form
  const handleRemoveAdditionalImage = (index: number) => {
    setAlbumForm((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index),
    }));
  };

  // Swap an additional image to become the Cover Photo in new album form
  const handleMakeCoverInForm = (index: number) => {
    setAlbumForm((prev) => {
      const targetImg = prev.additionalImages[index];
      const oldCover = prev.imageUrl;
      const newAdditional = prev.additionalImages.filter((_, i) => i !== index);
      if (oldCover) {
        newAdditional.unshift(oldCover);
      }
      return {
        ...prev,
        imageUrl: targetImg,
        additionalImages: newAdditional,
      };
    });
  };

  // Create new album submission
  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumForm.title.trim()) return;

    const cover =
      albumForm.imageUrl ||
      (albumForm.additionalImages.length > 0
        ? albumForm.additionalImages[0]
        : 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=800&auto=format&fit=crop&q=80');

    // Filter out the cover from additional if it was taken from index 0
    const remaining =
      !albumForm.imageUrl && albumForm.additionalImages.length > 0
        ? albumForm.additionalImages.slice(1)
        : albumForm.additionalImages;

    const allImages = [cover, ...remaining];

    addGalleryAlbum({
      title: albumForm.title.trim(),
      category: albumForm.category,
      imageUrl: cover,
      itemCountText: `${allImages.length} টি ছবি`,
      images: allImages,
    });

    setAlbumModalOpen(false);
    setAlbumForm({
      title: '',
      category: 'campus',
      imageUrl: '',
      additionalImages: [],
    });
    setUploadError(null);
  };

  // Handle Multiple Photos Upload inside existing Album Manager modal
  const handleUploadMultipleToExistingAlbum = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedAlbumId) return;
    try {
      setUploadingToAlbum(true);
      setUploadError(null);
      const compressedList: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const base64 = await compressImageFile(files[i], 1200, 800, 0.82);
        compressedList.push(base64);
      }

      addImagesToAlbum(selectedAlbumId, compressedList);
    } catch (err: any) {
      setUploadError(err.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে');
    } finally {
      setUploadingToAlbum(false);
      e.target.value = '';
    }
  };

  // Add single photo by URL in existing album modal
  const handleAddUrlToExistingAlbum = () => {
    if (!modalUrlInput.trim() || !selectedAlbumId) return;
    addImageToAlbum(selectedAlbumId, modalUrlInput.trim());
    setModalUrlInput('');
  };

  // Open modal to manage photos of a specific album
  const openAlbumManager = (albumId: string) => {
    setSelectedAlbumId(albumId);
    setUploadError(null);
    setModalUrlInput('');
    setManagePhotosModalOpen(true);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">গ্যালারি ব্যবস্থাপনা</h1>
          <p className="text-xs text-gray-500">
            বিদ্যালয়ের সকল ফটো অ্যালবাম, কভার ছবি ও অতিরিক্ত ছবি ব্যবস্থাপনা
          </p>
        </div>
        <button
          onClick={() => {
            setAlbumForm({
              title: '',
              category: 'campus',
              imageUrl: '',
              additionalImages: [],
            });
            setUploadError(null);
            setAlbumModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন অ্যালবাম তৈরি করুন</span>
        </button>
      </div>

      {/* Album Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryAlbums.map((album) => {
          const allImages = album.images && album.images.length > 0 ? album.images : [album.imageUrl];
          const otherImages = allImages.filter((img) => img !== album.imageUrl);

          return (
            <div
              key={album.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Cover Photo */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                  src={album.imageUrl}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (confirm(`আপনি কি "${album.title}" অ্যালবামটি সম্পূর্ণ মুছে ফেলতে চান?`)) {
                        deleteGalleryAlbum(album.id);
                      }
                    }}
                    className="bg-black/60 hover:bg-rose-600 text-white p-1.5 rounded-lg backdrop-blur-xs transition cursor-pointer"
                    title="অ্যালবাম মুছুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute top-2.5 left-2.5">
                  <span className="bg-emerald-900/85 backdrop-blur-xs text-amber-300 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-amber-400/30 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>কভার ছবি</span>
                  </span>
                </div>

                <span className="absolute bottom-2.5 left-2.5 bg-black/65 backdrop-blur-xs text-white text-[11px] px-2.5 py-0.5 rounded-md uppercase font-semibold">
                  {album.category}
                </span>

                <span className="absolute bottom-2.5 right-2.5 bg-emerald-800/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                  {allImages.length} টি ছবি
                </span>
              </div>

              {/* Album Details & Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-base leading-snug">{album.title}</h3>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>ক্যাটাগরি: {album.category}</span>
                    <span className="font-mono text-[11px] text-gray-400">ID: {album.id}</span>
                  </div>
                </div>

                {/* Additional Photos Mini Thumbnail Preview Strip */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="font-semibold text-gray-700 text-[11px] flex items-center gap-1">
                      <Layers className="w-3 h-3 text-emerald-700" />
                      <span>অ্যালবামের ছবিসমূহ ({allImages.length}):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => openAlbumManager(album.id)}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                    >
                      সকল ছবি দেখুন ({allImages.length})
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {allImages.slice(0, 5).map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => openAlbumManager(album.id)}
                        className={`w-11 h-11 rounded-lg overflow-hidden border shrink-0 relative cursor-pointer group/thumb ${
                          img === album.imageUrl
                            ? 'border-emerald-500 ring-2 ring-emerald-200'
                            : 'border-gray-200 hover:border-emerald-400'
                        }`}
                        title={img === album.imageUrl ? 'কভার ছবি' : `ছবি #${idx + 1}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        {img === album.imageUrl && (
                          <div className="absolute inset-0 bg-emerald-900/30 flex items-center justify-center">
                            <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                          </div>
                        )}
                      </div>
                    ))}

                    {allImages.length > 5 && (
                      <button
                        type="button"
                        onClick={() => openAlbumManager(album.id)}
                        className="w-11 h-11 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0 transition cursor-pointer"
                      >
                        +{allImages.length - 5}
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openAlbumManager(album.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition cursor-pointer border border-emerald-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ছবি যোগ / পরিচালনা</span>
                  </button>
                  <button
                    onClick={() => setPreviewImage(album.imageUrl)}
                    className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                    title="কভার ছবি বড় করে দেখুন"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Create New Album with Cover + Additional Photos */}
      {albumModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative border border-gray-100 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setAlbumModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <FolderPlus className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">নতুন অ্যালবাম তৈরি করুন</h3>
                <p className="text-xs text-gray-500">
                  কভার ছবি সহ অ্যালবামের একাধিক ছবি একসাথে যোগ করতে পারবেন
                </p>
              </div>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleCreateAlbum} className="space-y-4 text-xs">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">অ্যালবামের শিরোনাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: বার্ষিক বিজ্ঞান মেলা ২০২৬"
                    value={albumForm.title}
                    onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={albumForm.category}
                    onChange={(e) => setAlbumForm({ ...albumForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 font-semibold text-gray-800"
                  >
                    <option value="campus">Campus (ক্যাম্পাস)</option>
                    <option value="classroom">Classroom (শ্রেণিকক্ষ)</option>
                    <option value="sports">Sports (ক্রীড়া)</option>
                    <option value="cultural">Cultural (সাংস্কৃতিক)</option>
                    <option value="science">Science (বিজ্ঞান)</option>
                  </select>
                </div>
              </div>

              {/* 1. Main Cover Photo Section */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>১. অ্যালবামের প্রধান কভার ছবি (Cover Photo)</span>
                  </label>

                  <input
                    type="file"
                    ref={albumCoverFileRef}
                    accept="image/*"
                    onChange={handleCoverFile}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => albumCoverFileRef.current?.click()}
                    disabled={uploadingCover}
                    className="inline-flex items-center gap-1.5 bg-[#059669] hover:bg-[#047857] text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition"
                  >
                    {uploadingCover ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{uploadingCover ? 'আপলোড হচ্ছে...' : 'ডিভাইস থেকে কভার নির্বাচন'}</span>
                  </button>
                </div>

                {albumForm.imageUrl ? (
                  <div className="relative h-36 rounded-xl overflow-hidden border-2 border-emerald-500 group shadow-2xs">
                    <img
                      src={albumForm.imageUrl}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-emerald-900/90 text-amber-300 text-[10px] px-2 py-0.5 rounded font-bold border border-amber-400/40 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>নির্বাচিত কভার ছবি</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAlbumForm((prev) => ({ ...prev, imageUrl: '' }))}
                      className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-md text-xs hover:bg-rose-700 cursor-pointer shadow-xs"
                      title="কভার ছবি সরান"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-emerald-300 rounded-xl p-3 text-center bg-white/70">
                    <ImageIcon className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                    <p className="text-gray-500 text-[11px]">
                      ডিভাইস থেকে কভার ছবি আপলোড করুন অথবা নিচে সরাসরি ছবির লিংক দিন
                    </p>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="বা কভার ছবির সরাসরি URL দিন"
                  value={albumForm.imageUrl}
                  onChange={(e) => setAlbumForm({ ...albumForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-mono focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* 2. Additional Photos Section (কভার ছবি ছাড়াও অন্যান্য ছবি যোগ করুন) */}
              <div className="bg-gray-50/90 p-4 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-bold text-gray-800 flex items-center gap-1.5 text-xs">
                      <Layers className="w-4 h-4 text-emerald-700" />
                      <span>২. কভার ছবি ছাড়াও অ্যালবামের আরও ছবি যোগ করুন (Additional Photos)</span>
                    </label>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      ডিভাইস থেকে একসাথে একাধিক ছবি নির্বাচন করতে পারবেন
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={albumAdditionalFilesRef}
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalFiles}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => albumAdditionalFilesRef.current?.click()}
                    disabled={uploadingAdditional}
                    className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition self-start sm:self-auto shrink-0"
                  >
                    {uploadingAdditional ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{uploadingAdditional ? 'আপলোড হচ্ছে...' : 'ডিভাইস থেকে একাধিক ছবি যোগ করুন'}</span>
                  </button>
                </div>

                {/* Additional URL Input Field */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="বা কোনো ছবির URL পেস্ট করে যোগ করুন"
                    value={additionalUrlInput}
                    onChange={(e) => setAdditionalUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAdditionalUrl();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-mono focus:outline-hidden focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddAdditionalUrl}
                    className="px-3.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    + যোগ করুন
                  </button>
                </div>

                {/* Additional Images Grid Previews */}
                {albumForm.additionalImages.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-600 font-medium">
                      <span>সংযোজিত অতিরিক্ত ছবি ({albumForm.additionalImages.length} টি):</span>
                      <span className="text-emerald-700 font-bold">
                        কভার ছবি সহ মোট {1 + albumForm.additionalImages.length} টি ছবি
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-48 overflow-y-auto p-1 bg-white rounded-xl border border-gray-200">
                      {albumForm.additionalImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative h-20 rounded-lg overflow-hidden border border-gray-200 group/img shadow-2xs"
                        >
                          <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveAdditionalImage(idx)}
                            className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 cursor-pointer shadow-xs"
                            title="ছবিটি মুছুন"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMakeCoverInForm(idx)}
                            className="absolute bottom-1 left-1 right-1 bg-emerald-800/90 text-amber-300 text-[9px] font-bold py-0.5 px-1 rounded opacity-0 group-hover/img:opacity-100 transition cursor-pointer text-center"
                            title="এটিকে প্রধান কভার ছবি বানান"
                          >
                            কভার বানান
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3 text-gray-400 text-xs border border-dashed border-gray-200 rounded-xl bg-white/50">
                    এখনো কোনো অতিরিক্ত ছবি যোগ করা হয়নি (ঐচ্ছিক)
                  </div>
                )}
              </div>

              {/* Total Summary Badge & Actions */}
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-gray-600">
                  <span className="font-bold text-emerald-800">
                    মোট ছবি সংরক্ষিত হবে: {albumForm.imageUrl ? 1 : 0}টি কভার + {albumForm.additionalImages.length}টি অতিরিক্ত ={' '}
                    {(albumForm.imageUrl ? 1 : 0) + albumForm.additionalImages.length} টি
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAlbumModalOpen(false)}
                    className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#15803d] hover:bg-[#166534] text-white font-bold rounded-xl transition cursor-pointer shadow-xs"
                  >
                    অ্যালবাম সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Manage & Add Photos inside an Existing Album */}
      {managePhotosModalOpen && selectedAlbum && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setManagePhotosModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
                <Layers className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedAlbum.title} — ছবিসমূহ পরিচালনা
                </h3>
                <p className="text-xs text-gray-500">
                  ক্যাটাগরি: <span className="font-semibold text-gray-700 uppercase">{selectedAlbum.category}</span> • মোট ছবি:{' '}
                  <span className="font-bold text-emerald-800 font-mono">
                    {selectedAlbum.images ? selectedAlbum.images.length : 1} টি
                  </span>
                </p>
              </div>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {uploadError}
              </div>
            )}

            {/* Upload Zone inside Album */}
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80 mb-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-700" />
                    <span>এই অ্যালবামে আরও নতুন ছবি যোগ করুন</span>
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    ডিভাইস থেকে একসাথে একাধিক ছবি নির্বাচন করতে পারেন
                  </p>
                </div>

                <input
                  type="file"
                  ref={manageAlbumFilesRef}
                  accept="image/*"
                  multiple
                  onChange={handleUploadMultipleToExistingAlbum}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => manageAlbumFilesRef.current?.click()}
                  disabled={uploadingToAlbum}
                  className="inline-flex items-center gap-1.5 bg-[#059669] hover:bg-[#047857] text-white px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition self-start sm:self-auto shrink-0"
                >
                  {uploadingToAlbum ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{uploadingToAlbum ? 'ছবিগুলো আপলোড হচ্ছে...' : 'ডিভাইস থেকে একাধিক ছবি আপলোড'}</span>
                </button>
              </div>

              {/* URL Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="বা সরাসরি কোনো ছবির URL পেস্ট করুন"
                  value={modalUrlInput}
                  onChange={(e) => setModalUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddUrlToExistingAlbum();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-mono focus:outline-hidden focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleAddUrlToExistingAlbum}
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  + যোগ করুন
                </button>
              </div>
            </div>

            {/* Existing Photos Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-800">
                  অ্যালবামে থাকা সমস্ত ছবি ({selectedAlbum.images?.length || 1} টি):
                </span>
                <span className="text-[11px] text-gray-500">
                  যেকোনো ছবিকে কভার ছবি হিসেবে সেট বা মুছে ফেলতে পারেন
                </span>
              </div>

              {(() => {
                const photos =
                  selectedAlbum.images && selectedAlbum.images.length > 0
                    ? selectedAlbum.images
                    : [selectedAlbum.imageUrl];

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    {photos.map((img, idx) => {
                      const isCover = img === selectedAlbum.imageUrl;

                      return (
                        <div
                          key={idx}
                          className={`relative rounded-xl overflow-hidden border-2 group bg-gray-100 flex flex-col ${
                            isCover ? 'border-emerald-600 ring-2 ring-emerald-200 shadow-sm' : 'border-gray-200'
                          }`}
                        >
                          <div className="relative h-28 w-full overflow-hidden">
                            <img
                              src={img}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />

                            {/* View Full Size Overlay button */}
                            <button
                              type="button"
                              onClick={() => setPreviewImage(img)}
                              className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer"
                            >
                              <Eye className="w-5 h-5" />
                            </button>

                            {/* Cover Badge */}
                            {isCover && (
                              <div className="absolute top-2 left-2 bg-emerald-900/90 text-amber-300 text-[9px] px-2 py-0.5 rounded font-bold border border-amber-400/40 flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                <span>কভার ছবি</span>
                              </div>
                            )}

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => {
                                if (photos.length <= 1) {
                                  alert('অ্যালবামে কমপক্ষে একটি ছবি থাকতে হবে। পুরো অ্যালবাম মুছতে প্রধান পাতা থেকে মুছুন।');
                                  return;
                                }
                                if (confirm('আপনি কি এই ছবিটি অ্যালবাম থেকে মুছে ফেলতে চান?')) {
                                  removeImageFromAlbum(selectedAlbum.id, idx);
                                }
                              }}
                              className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-md opacity-90 hover:opacity-100 transition cursor-pointer shadow-xs"
                              title="ছবিটি মুছুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Action Footer */}
                          <div className="p-2 bg-white flex items-center justify-between text-[11px] border-t border-gray-100">
                            <span className="text-gray-400 font-mono text-[10px]">#{idx + 1}</span>
                            {!isCover ? (
                              <button
                                type="button"
                                onClick={() => setAlbumCoverImage(selectedAlbum.id, img)}
                                className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline cursor-pointer flex items-center gap-1 text-[10px]"
                              >
                                <Star className="w-3 h-3 text-amber-500" />
                                <span>কভার সেট করুন</span>
                              </button>
                            ) : (
                              <span className="text-emerald-800 font-bold text-[10px] flex items-center gap-0.5">
                                <Check className="w-3 h-3" />
                                <span>মূল কভার</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setManagePhotosModalOpen(false)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                সম্পন্ন / বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Zoom Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[88vh] flex items-center justify-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 p-1"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
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
