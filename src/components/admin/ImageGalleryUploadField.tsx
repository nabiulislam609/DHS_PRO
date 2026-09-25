import React, { useRef, useState } from 'react';
import { Upload, X, Star, Layers, Loader2, Image as ImageIcon, Eye } from 'lucide-react';
import { compressImageFile } from '../../utils/imageUpload';

interface ImageGalleryUploadFieldProps {
  coverImage: string;
  onCoverImageChange: (url: string) => void;
  additionalImages: string[];
  onAdditionalImagesChange: (images: string[]) => void;
  coverLabel?: string;
  additionalLabel?: string;
}

export const ImageGalleryUploadField: React.FC<ImageGalleryUploadFieldProps> = ({
  coverImage,
  onCoverImageChange,
  additionalImages = [],
  onAdditionalImagesChange,
  coverLabel = 'প্রধান কভার ছবি (Cover Photo)',
  additionalLabel = 'কভার ছবি ছাড়াও আরও ছবি যোগ করুন (Additional Photos)',
}) => {
  const coverFileRef = useRef<HTMLInputElement | null>(null);
  const additionalFilesRef = useRef<HTMLInputElement | null>(null);

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [additionalUrlInput, setAdditionalUrlInput] = useState('');
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);

  // Handle Cover File Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      setUploadError(null);
      const base64 = await compressImageFile(file, 1200, 800, 0.82);
      onCoverImageChange(base64);
    } catch (err: any) {
      setUploadError(err.message || 'কভার ছবি আপলোড করতে ব্যর্থ হয়েছে');
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  // Handle Multiple Additional Files Upload
  const handleAdditionalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploadingAdditional(true);
      setUploadError(null);
      const compressed: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const base64 = await compressImageFile(files[i], 1200, 800, 0.82);
        compressed.push(base64);
      }
      onAdditionalImagesChange([...additionalImages, ...compressed]);
    } catch (err: any) {
      setUploadError(err.message || 'অতিরিক্ত ছবি আপলোড করতে ব্যর্থ হয়েছে');
    } finally {
      setUploadingAdditional(false);
      e.target.value = '';
    }
  };

  // Add Additional Photo via URL
  const handleAddAdditionalUrl = () => {
    if (!additionalUrlInput.trim()) return;
    onAdditionalImagesChange([...additionalImages, additionalUrlInput.trim()]);
    setAdditionalUrlInput('');
  };

  // Remove Single Additional Photo
  const handleRemoveAdditional = (index: number) => {
    onAdditionalImagesChange(additionalImages.filter((_, idx) => idx !== index));
  };

  // Swap an Additional Photo to become Cover Photo
  const handleMakeCover = (index: number) => {
    const targetImage = additionalImages[index];
    const oldCover = coverImage;
    const newAdditionals = additionalImages.filter((_, idx) => idx !== index);
    if (oldCover) {
      newAdditionals.unshift(oldCover);
    }
    onCoverImageChange(targetImage);
    onAdditionalImagesChange(newAdditionals);
  };

  return (
    <div className="space-y-4">
      {uploadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
          {uploadError}
        </div>
      )}

      {/* 1. Main Cover Image Section */}
      <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-200/70 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
            <span>{coverLabel}</span>
          </label>

          <input
            type="file"
            ref={coverFileRef}
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => coverFileRef.current?.click()}
            disabled={uploadingCover}
            className="inline-flex items-center gap-1.5 bg-[#059669] hover:bg-[#047857] text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition self-start sm:self-auto shrink-0"
          >
            {uploadingCover ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>{uploadingCover ? 'আপলোড হচ্ছে...' : 'ডিভাইস থেকে কভার নির্বাচন'}</span>
          </button>
        </div>

        {coverImage ? (
          <div className="relative h-40 rounded-xl overflow-hidden border-2 border-emerald-500 group shadow-xs">
            <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 bg-emerald-900/90 text-amber-300 text-[10px] px-2 py-0.5 rounded font-bold border border-amber-400/40 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>নির্বাচিত কভার ছবি</span>
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPreviewZoomImage(coverImage)}
                className="bg-black/60 hover:bg-black/80 text-white p-1 rounded-md text-xs cursor-pointer shadow-xs"
                title="বড় করে দেখুন"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onCoverImageChange('')}
                className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-md text-xs cursor-pointer shadow-xs"
                title="কভার ছবি সরান"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-emerald-300 rounded-xl p-3 text-center bg-white/70">
            <ImageIcon className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
            <p className="text-gray-500 text-[11px]">
              ডিভাইস থেকে কভার ছবি আপলোড করুন অথবা নিচে সরাসরি ছবির লিংক পেস্ট করুন
            </p>
          </div>
        )}

        <input
          type="text"
          placeholder="বা কভার ছবির সরাসরি URL দিন"
          value={coverImage}
          onChange={(e) => onCoverImageChange(e.target.value)}
          className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-mono focus:outline-hidden focus:border-emerald-600"
        />
      </div>

      {/* 2. Additional Images Section */}
      <div className="bg-gray-50/90 p-4 rounded-2xl border border-gray-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="font-bold text-gray-800 flex items-center gap-1.5 text-xs">
              <Layers className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{additionalLabel}</span>
            </label>
            <p className="text-[11px] text-gray-500 mt-0.5">
              ডিভাইস থেকে একসাথে একাধিক ছবি নির্বাচন করতে পারেন
            </p>
          </div>

          <input
            type="file"
            ref={additionalFilesRef}
            accept="image/*"
            multiple
            onChange={handleAdditionalUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => additionalFilesRef.current?.click()}
            disabled={uploadingAdditional}
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition self-start sm:self-auto shrink-0"
          >
            {uploadingAdditional ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>{uploadingAdditional ? 'আপলোড হচ্ছে...' : 'ডিভাইস থেকে একাধিক ছবি যোগ'}</span>
          </button>
        </div>

        {/* Additional URL Input Field */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="বা কোনো ছবির সরাসরি URL পেস্ট করে যোগ করুন"
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
            className="px-3.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-xs transition cursor-pointer shrink-0"
          >
            + যোগ করুন
          </button>
        </div>

        {/* Additional Images Grid Previews */}
        {additionalImages.length > 0 ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] text-gray-600 font-medium">
              <span>সংযোজিত অতিরিক্ত ছবি ({additionalImages.length} টি):</span>
              <span className="text-emerald-700 font-bold">
                কভার সহ মোট {(coverImage ? 1 : 0) + additionalImages.length} টি ছবি
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-48 overflow-y-auto p-1.5 bg-white rounded-xl border border-gray-200">
              {additionalImages.map((img, idx) => (
                <div
                  key={idx}
                  className="relative h-20 rounded-lg overflow-hidden border border-gray-200 group/img shadow-2xs bg-gray-100"
                >
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute top-1 right-1 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewZoomImage(img)}
                      className="bg-black/60 hover:bg-black/80 text-white p-1 rounded-full cursor-pointer shadow-xs"
                      title="বড় করে দেখুন"
                    >
                      <Eye className="w-2.5 h-2.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveAdditional(idx)}
                      className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full cursor-pointer shadow-xs"
                      title="ছবিটি মুছুন"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMakeCover(idx)}
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
          <div className="text-center py-2.5 text-gray-400 text-xs border border-dashed border-gray-200 rounded-xl bg-white/50">
            এখনো কোনো অতিরিক্ত ছবি যোগ করা হয়নি (ঐচ্ছিক)
          </div>
        )}
      </div>

      {/* Lightbox / Zoom Preview Modal */}
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
