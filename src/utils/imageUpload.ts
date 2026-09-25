/**
 * Utility to process, resize and optimize user uploaded images from their device
 * into lightweight base64 Data URLs so they can be stored in localStorage safely.
 */
export const compressImageFile = (
  file: File,
  maxWidth = 500,
  maxHeight = 500,
  quality = 0.82
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('দয়া করে একটি ইমেজ ফাইল নির্বাচন করুন (JPG, PNG, ইত্যাদি)'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ছবি পড়তে সমস্যা হয়েছে'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('ছবি প্রসেস করতে ত্রুটি হয়েছে'));
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use standard jpeg for compact size and broad compatibility
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(optimizedDataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export interface ProcessedAttachment {
  dataUrl: string;
  type: 'image' | 'pdf';
  name: string;
  size: string;
}

/**
 * Handles uploading photos or PDF documents for Notices from user's device.
 */
export const processNoticeFile = async (file: File): Promise<ProcessedAttachment> => {
  const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name);
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

  if (!isImage && !isPdf) {
    throw new Error('শুধুমাত্র ছবি (JPG, PNG, WebP) অথবা পিডিএফ (.pdf) ফাইল আপলোড করুন');
  }

  // Safety check for file size (8MB max)
  const maxBytes = 8 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error('ফাইলের আকার ৮ মেগাবাইট (8 MB) এর কম হতে হবে');
  }

  if (isImage) {
    const compressed = await compressImageFile(file, 1200, 1200, 0.85);
    return {
      dataUrl: compressed,
      type: 'image',
      name: file.name,
      size: formatFileSize(file.size),
    };
  }

  // PDF processing
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('পিডিএফ ফাইলটি পড়তে ব্যর্থ হয়েছে'));
    reader.onload = () => {
      resolve({
        dataUrl: reader.result as string,
        type: 'pdf',
        name: file.name,
        size: formatFileSize(file.size),
      });
    };
    reader.readAsDataURL(file);
  });
};
