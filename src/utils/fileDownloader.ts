/**
 * Utility for handling file downloads and previews from Base64 Data URLs or web URLs
 * Fully compatible with sandboxed iframes and popup blockers
 */

export const triggerFileDownload = (fileUrl: string, defaultName = 'download'): void => {
  try {
    let downloadHref = fileUrl;
    let isCreatedBlob = false;

    if (fileUrl.startsWith('data:')) {
      // Convert base64 dataUrl to Blob for cleaner browser downloading
      try {
        const arr = fileUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        downloadHref = URL.createObjectURL(blob);
        isCreatedBlob = true;
      } catch (conversionErr) {
        console.warn('DataURL to Blob conversion failed, using raw dataUrl', conversionErr);
        downloadHref = fileUrl;
      }
    }

    const link = document.createElement('a');
    link.href = downloadHref;
    link.download = defaultName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      if (isCreatedBlob) {
        URL.revokeObjectURL(downloadHref);
      }
    }, 2000);
  } catch (err) {
    console.error('Failed to trigger download', err);
  }
};

export const openFileInNewTab = (fileUrl: string, fileName = 'document'): void => {
  try {
    let targetUrl = fileUrl;
    let isCreatedBlob = false;

    if (fileUrl.startsWith('data:')) {
      try {
        const arr = fileUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        targetUrl = URL.createObjectURL(blob);
        isCreatedBlob = true;
      } catch (e) {
        console.warn('Could not parse dataUrl blob', e);
        targetUrl = fileUrl;
      }
    }

    // Use anchor click which bypasses most popup blockers in modern browsers
    const a = document.createElement('a');
    a.href = targetUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      if (isCreatedBlob) {
        URL.revokeObjectURL(targetUrl);
      }
    }, 5000);
  } catch (err) {
    console.error('Failed to open file in new tab', err);
    // Fallback to trigger download
    triggerFileDownload(fileUrl, fileName);
  }
};
