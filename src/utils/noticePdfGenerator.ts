import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Notice, SiteSettings } from '../types';
import { triggerFileDownload } from './fileDownloader';

/**
 * Utility functions for Printing and PDF generation of school notices
 * Built with full Bengali Unicode support, native text shaping, and strict Portrait A4 orientation.
 */

// Helper to safely convert an image URL to Data URL to avoid canvas tainting
const getSafeImageDataUrl = async (url: string): Promise<string> => {
  if (!url) return '';
  if (url.startsWith('data:')) return url;

  try {
    const res = await fetch(url, { mode: 'cors', cache: 'force-cache' });
    if (!res.ok) return '';
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch {
    // If CORS blocked or network error, return empty string so canvas doesn't taint
    return '';
  }
};

/**
 * Generates the clean HTML string for official notice memo
 * Uses strict Portrait A4 proportions (794px x 1123px min-height) with flex layout
 * to ensure all browsers and PDF readers format and print in 100% Portrait.
 */
export const buildNoticeHtml = (
  notice: Notice,
  siteSettings?: Partial<SiteSettings>,
  safeLogoDataUrl?: string,
  safeAttachmentDataUrl?: string
): string => {
  const schoolNameBn = siteSettings?.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়';
  const schoolNameEn = siteSettings?.schoolNameEnglish || 'Dadra High School';
  const address = siteSettings?.address || 'দাদরা, জয়পুরহাট সদর, জয়পুরহাট';
  const phone = siteSettings?.phone1 || siteSettings?.emergencyPhone || '০১৭১২-৩৪৫৬৭৮';
  const email = siteSettings?.email || 'info@dadrahs.edu.bd';
  const estd = siteSettings?.establishedYear || '১৯৮২';
  const memoNo = notice.code ? `DHS/২০২৬/বিজ্ঞপ্তি-${notice.code}` : 'DHS/২০২৬/বিজ্ঞপ্তি';
  const logo = safeLogoDataUrl || siteSettings?.logoUrl || '';
  const attachmentImg = safeAttachmentDataUrl || notice.attachmentUrl || '';

  return `
    <div class="official-notice-letterhead" style="font-family: 'Hind Siliguri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.6; width: 794px; max-width: 794px; min-height: 1123px; margin: 0 auto; background: #ffffff; padding: 40px 48px; box-sizing: border-box; text-align: left; display: flex; flex-direction: column; justify-content: space-between;">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
        @page {
          size: portrait !important;
          size: A4 portrait !important;
          size: 210mm 297mm !important;
          margin: 10mm !important;
        }
        .official-notice-letterhead {
          width: 794px !important;
          max-width: 794px !important;
          min-height: 1123px !important;
          box-sizing: border-box !important;
        }
        .official-notice-letterhead, .official-notice-letterhead * {
          font-family: 'Hind Siliguri', 'SolaimanLipi', 'Kalpurush', -apple-system, BlinkMacSystemFont, sans-serif !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      </style>

      <!-- Main Body Container (Header, Memo, Subject, Notice Content) -->
      <div style="flex: 1 0 auto;">
        <!-- Letterhead Header -->
        <div style="text-align: center; border-bottom: 2px solid #064e3b; padding-bottom: 14px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 6px;">
            ${
              logo
                ? `<img src="${logo}" alt="Logo" style="width: 56px; height: 56px; object-fit: contain; border-radius: 8px;" crossOrigin="anonymous" />`
                : `<div style="width: 52px; height: 52px; border-radius: 50%; background: #064e3b; color: #fde047; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 24px; border: 2px solid #047857; text-align: center; line-height: 52px;">দ</div>`
            }
            <div style="text-align: center;">
              <h1 style="font-size: 24px; font-weight: 900; color: #064e3b; margin: 0; line-height: 1.2;">${schoolNameBn}</h1>
              <p style="font-size: 13px; font-weight: 700; color: #475569; margin: 2px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px;">${schoolNameEn}</p>
            </div>
          </div>
          <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">
            ${address} • স্থাপিত: ${estd} • EIIN: ১২৩৪৫৬ • ফোন: ${phone} • ইমেইল: ${email}
          </p>
        </div>

        <!-- Badge -->
        <div style="text-align: center; margin: 12px 0 16px 0;">
          <span style="background: #064e3b; color: #ffffff; padding: 5px 26px; border-radius: 4px; font-size: 13px; font-weight: 800; letter-spacing: 0.5px; display: inline-block;">
            অফিসিয়াল বিজ্ঞপ্তি / নোটিশ
          </span>
        </div>

        <!-- Memo & Date Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 12px; background: #f8fafc; border: 1px solid #cbd5e1;">
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; width: 35%;">
              <strong style="color: #334155;">স্মারক নম্বর:</strong> ${memoNo}
            </td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; width: 35%;">
              <strong style="color: #334155;">তারিখ:</strong> ${notice.date}
            </td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; width: 30%;">
              <strong style="color: #334155;">ধরন:</strong> ${notice.category}
            </td>
          </tr>
        </table>

        <!-- Subject Box -->
        <div style="background: #f1f5f9; border-left: 4px solid #064e3b; padding: 10px 14px; margin-bottom: 18px;">
          <div style="font-size: 15px; font-weight: 800; color: #0f172a;">
            বিষয়: ${notice.title}
          </div>
        </div>

        <!-- Notice Content -->
        <div style="font-size: 13.5px; line-height: 1.85; color: #1e293b; margin-bottom: 24px; white-space: pre-wrap; text-align: justify; word-break: break-word;">
${notice.content}
        </div>

        <!-- Attachment Preview if any -->
        ${
          notice.attachmentUrl && notice.attachmentType === 'image'
            ? `<div style="margin-top: 16px; padding: 12px; background: #f8fafc; border: 1px dashed #94a3b8; border-radius: 6px; text-align: center;">
                <p style="font-size: 11px; font-weight: 700; color: #475569; margin: 0 0 8px 0;">সংযুক্ত অফিসিয়াল কপি:</p>
                <img src="${attachmentImg}" style="max-width: 100%; max-height: 260px; object-fit: contain; border-radius: 6px; border: 1px solid #e2e8f0;" alt="Attached document" crossOrigin="anonymous" />
              </div>`
            : notice.attachmentUrl && notice.attachmentType === 'pdf'
            ? `<div style="margin-top: 16px; padding: 10px 14px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; font-size: 12px; color: #9f1239;">
                📄 <strong>সংযুক্ত দলিল:</strong> অফিসিয়াল পিডিএফ অনুলিপি সংরক্ষিত (${notice.attachmentName || 'Official-Document.pdf'}${notice.attachmentSize ? ' - ' + notice.attachmentSize : ''})
              </div>`
            : ''
        }
      </div>

      <!-- Footer & Signature Section (Anchored to Bottom of Portrait Sheet) -->
      <div style="flex-shrink: 0; margin-top: 40px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
          <div style="width: 80px; height: 80px; border: 2px dashed #064e3b; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 9px; font-weight: 800; color: #064e3b; transform: rotate(-10deg); opacity: 0.85;">
            বিদ্যালয়<br>অফিসিয়াল<br>সিলমোহর
          </div>

          <div style="text-align: center; width: 180px;">
            <div style="font-family: cursive, sans-serif; font-size: 13px; color: #334155; margin-bottom: 2px;">
              স্বাক্ষরিত
            </div>
            <div style="width: 140px; border-bottom: 1px solid #475569; margin: 0 auto 6px auto;"></div>
            <div style="font-weight: 800; font-size: 13px; color: #0f172a;">প্রধান শিক্ষক</div>
            <div style="font-size: 11px; color: #64748b;">${schoolNameBn}</div>
          </div>
        </div>

        <!-- Footer Note -->
        <div style="margin-top: 30px; padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8;">
          <span>দাদরা উচ্চ বিদ্যালয় ডিজিটাল নোটিশ আর্কাইভ</span>
          <span>মুদ্রণ তারিখ: ${new Date().toLocaleDateString('bn-BD')}</span>
        </div>
      </div>
    </div>
  `;
};

/**
 * Direct Print Fallback for standalone window printing (Strict Portrait)
 */
const triggerDirectWindowPrint = (notice: Notice, siteSettings?: Partial<SiteSettings>): void => {
  // Remove any previous instance
  const existing = document.getElementById('printable-notice-direct');
  if (existing && existing.parentElement) {
    existing.parentElement.removeChild(existing);
  }

  const printEl = document.createElement('div');
  printEl.id = 'printable-notice-direct';
  printEl.className = 'printable-notice-container';
  printEl.style.width = '210mm';
  printEl.style.maxWidth = '210mm';
  printEl.style.minHeight = '297mm';
  printEl.style.margin = '0 auto';
  printEl.innerHTML = buildNoticeHtml(notice, siteSettings);
  document.body.appendChild(printEl);

  document.body.classList.add('printing-active-notice');

  window.focus();
  setTimeout(() => {
    window.print();
  }, 100);

  // Clean up safely after print completes
  const cleanup = () => {
    document.body.classList.remove('printing-active-notice');
    if (document.body.contains(printEl)) {
      document.body.removeChild(printEl);
    }
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);
  setTimeout(cleanup, 60000);
};

/**
 * Robust Print for School Notices
 * Uses an isolated hidden iframe with strict A4 Portrait styling as primary,
 * with a clean fallback to direct window print.
 */
export const printNotice = (notice: Notice, siteSettings?: Partial<SiteSettings>): void => {
  try {
    const noticeHtml = buildNoticeHtml(notice, siteSettings);

    // 1. Remove any old print iframe
    const oldFrame = document.getElementById('notice-print-frame');
    if (oldFrame && oldFrame.parentElement) {
      oldFrame.parentElement.removeChild(oldFrame);
    }

    // 2. Create isolated iframe sized specifically for Portrait A4
    const iframe = document.createElement('iframe');
    iframe.id = 'notice-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '794px'; // 210mm
    iframe.style.height = '1123px'; // 297mm
    iframe.style.border = 'none';
    iframe.style.zIndex = '-9999';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html lang="bn">
        <head>
          <meta charset="UTF-8">
          <title>${notice.title || 'নোটিশ'}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: portrait !important;
              size: A4 portrait !important;
              size: 210mm 297mm !important;
              margin: 10mm !important;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-family: 'Hind Siliguri', 'SolaimanLipi', sans-serif !important;
            }
            html, body {
              width: 210mm !important;
              max-width: 210mm !important;
              min-height: 297mm !important;
              margin: 0 auto !important;
              padding: 0 !important;
              background: #ffffff !important;
            }
          </style>
        </head>
        <body style="width: 210mm; margin: 0 auto; background: #ffffff;">
          ${noticeHtml}
        </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (iframeErr) {
          console.warn('Iframe print failed, falling back to direct print:', iframeErr);
          triggerDirectWindowPrint(notice, siteSettings);
        }
      }, 350);

      // Clean up iframe after 60s
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 60000);
      return;
    }
  } catch (err) {
    console.warn('Print iframe error:', err);
  }

  // Direct print fallback
  triggerDirectWindowPrint(notice, siteSettings);
};

/**
 * Real, High-Fidelity PDF Generator with Guaranteed Bengali Unicode Text & Strict Portrait A4 Orientation
 * Uses browser-native HTML5 Canvas rasterization (Hind Siliguri Unicode text shaping)
 * followed by Portrait A4 jsPDF packaging and instant download.
 */
export const downloadNoticePdf = async (
  notice: Notice,
  siteSettings?: Partial<SiteSettings>,
  _sourceElementId?: string
): Promise<boolean> => {
  let createdTempContainer: HTMLElement | null = null;

  try {
    const cleanTitle = (notice.title || 'Notice')
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, '_')
      .slice(0, 35);
    const fileName = `Notice_${notice.code || 'DHS'}_${cleanTitle}.pdf`;

    // 1. Safely resolve logo and attachment to Data URLs to prevent canvas tainting
    const safeLogo = siteSettings?.logoUrl ? await getSafeImageDataUrl(siteSettings.logoUrl) : '';
    const safeAttachment =
      notice.attachmentUrl && notice.attachmentType === 'image'
        ? await getSafeImageDataUrl(notice.attachmentUrl)
        : '';

    // 2. Create capture container with explicit Portrait A4 dimensions (794px width x 1123px min-height)
    createdTempContainer = document.createElement('div');
    createdTempContainer.id = 'pdf-capture-temp-container';
    createdTempContainer.style.position = 'fixed';
    createdTempContainer.style.left = '0';
    createdTempContainer.style.top = '0';
    createdTempContainer.style.width = '794px'; // Exact A4 portrait width at 96 DPI
    createdTempContainer.style.minHeight = '1123px'; // Exact A4 portrait height at 96 DPI
    createdTempContainer.style.zIndex = '-99999';
    createdTempContainer.style.background = '#ffffff';
    createdTempContainer.style.opacity = '1';
    createdTempContainer.style.pointerEvents = 'none';
    createdTempContainer.style.overflow = 'visible';
    createdTempContainer.style.boxSizing = 'border-box';

    // Build the official letterhead HTML
    createdTempContainer.innerHTML = buildNoticeHtml(notice, siteSettings, safeLogo, safeAttachment);
    document.body.appendChild(createdTempContainer);

    // Wait for Unicode fonts (Hind Siliguri) to be fully loaded
    try {
      if (document.fonts) {
        await document.fonts.ready;
      }
    } catch {
      // Continue even if document.fonts.ready rejects
    }
    await new Promise((resolve) => setTimeout(resolve, 200));

    const captureWidth = 794;
    // Guaranteed to be at least 1123px to enforce strict portrait proportions
    const captureHeight = Math.max(
      createdTempContainer.scrollHeight || 0,
      createdTempContainer.offsetHeight || 0,
      1123
    );

    // 3. Render Canvas with native browser HarfBuzz Bengali text shaping in 2x resolution
    let canvas: HTMLCanvasElement;
    try {
      canvas = await html2canvas(createdTempContainer, {
        scale: 2, // 2x resolution for razor-sharp Bengali typography
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        width: captureWidth,
        height: captureHeight,
        windowWidth: captureWidth,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
      });
    } catch (h2cErr) {
      console.warn('html2canvas error, using html-to-image fallback:', h2cErr);
      const dataUrl = await toPng(createdTempContainer, {
        width: captureWidth,
        height: captureHeight,
        canvasWidth: captureWidth * 2,
        canvasHeight: captureHeight * 2,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        skipFonts: true,
        cacheBust: true,
      });
      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image render error'));
      });
      canvas = document.createElement('canvas');
      canvas.width = captureWidth * 2;
      canvas.height = captureHeight * 2;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
    }

    const imgData = canvas.toDataURL('image/png', 1.0);

    // 4. Construct Strict Portrait A4 PDF Document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // Exactly 210mm
    const pdfPageHeight = pdf.internal.pageSize.getHeight(); // Exactly 297mm
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Draw first portrait page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfPageHeight;

    // Draw subsequent portrait pages if the notice content extends past 1 page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage('a4', 'portrait');
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfPageHeight;
    }

    // 5. Trigger download (Blob URL link + pdf.save fallback)
    let downloaded = false;
    try {
      const blob = pdf.output('blob');
      const blobUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.style.display = 'none';
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      downloadLink.target = '_blank';
      downloadLink.rel = 'noopener noreferrer';
      document.body.appendChild(downloadLink);
      downloadLink.click();

      setTimeout(() => {
        if (document.body.contains(downloadLink)) {
          document.body.removeChild(downloadLink);
        }
        window.URL.revokeObjectURL(blobUrl);
      }, 2000);
      downloaded = true;
    } catch {
      pdf.save(fileName);
      downloaded = true;
    }

    return downloaded;
  } catch (error) {
    console.error('PDF Generation error:', error);

    // Direct fallback 1: If notice has an attachment PDF, trigger download of that file
    if (notice.attachmentUrl && notice.attachmentType === 'pdf') {
      triggerFileDownload(notice.attachmentUrl, notice.attachmentName || 'notice-document.pdf');
      return true;
    }

    // Direct fallback 2: Open print dialog
    printNotice(notice, siteSettings);
    return true;
  } finally {
    if (createdTempContainer && document.body.contains(createdTempContainer)) {
      document.body.removeChild(createdTempContainer);
    }
  }
};
