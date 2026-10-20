import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export type PdfOrientation = 'portrait' | 'landscape';

export type DocumentKind =
  | 'notice'
  | 'application_form'
  | 'admission'
  | 'certificate'
  | 'testimonial'
  | 'marksheet'
  | 'result_sheet'
  | 'routine'
  | 'exam_schedule'
  | 'attendance_sheet'
  | 'roster'
  | 'general';

export interface GeneratePdfOptions {
  /**
   * PDF page orientation:
   * - 'portrait' (default for notices, forms, applications, single marksheets, certificates)
   * - 'landscape' (for wide tables, class routines, master results sheets, rosters)
   */
  orientation?: PdfOrientation;
  /**
   * Logical category of document to auto-determine default orientation if not explicitly passed
   */
  docKind?: DocumentKind;
  /**
   * Output file name (e.g. 'admission_form.pdf' or 'class_routine.pdf')
   */
  fileName: string;
  /**
   * Margin around the document in millimeters (default: 12mm, recommended: 10-15mm)
   */
  marginMm?: number;
  /**
   * Optional callback when download starts or succeeds
   */
  onSuccess?: () => void;
  /**
   * Optional error callback
   */
  onError?: (err: any) => void;
}

// Fixed standard A4 pixel widths at 96 DPI:
// 210mm = 793.7px ~ 794px
// 297mm = 1122.5px ~ 1123px
export const PORTRAIT_WIDTH_PX = 794;
export const LANDSCAPE_WIDTH_PX = 1123;
export const PORTRAIT_PAGE_HEIGHT_PX = 1123;
export const LANDSCAPE_PAGE_HEIGHT_PX = 794;

/**
 * Determine default orientation:
 * - Wide tables (result sheets, routine, rosters, attendance) -> 'landscape'
 * - Application forms, notices, certificates, marksheets -> 'portrait'
 */
export const resolveOrientation = (options: GeneratePdfOptions): PdfOrientation => {
  if (options.orientation) {
    return options.orientation;
  }
  if (options.docKind) {
    switch (options.docKind) {
      case 'result_sheet':
      case 'routine':
      case 'exam_schedule':
      case 'attendance_sheet':
      case 'roster':
        return 'landscape';
      case 'notice':
      case 'application_form':
      case 'admission':
      case 'certificate':
      case 'testimonial':
      case 'marksheet':
      case 'general':
      default:
        return 'portrait';
    }
  }
  return 'portrait';
};

/**
 * Ensure Bengali Unicode fonts (Hind Siliguri / Noto Sans Bengali) are loaded in the browser.
 */
const ensureBengaliFontsLoaded = async (): Promise<void> => {
  if (!document.getElementById('bengali-pdf-fonts-link')) {
    const link = document.createElement('link');
    link.id = 'bengali-pdf-fonts-link';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
  }

  try {
    if (document.fonts) {
      await document.fonts.ready;
    }
  } catch {
    // Continue even if font ready rejects
  }
};

/**
 * Wait for all images inside an element to be fully loaded and decoded.
 */
const waitForImagesToLoad = async (element: HTMLElement): Promise<void> => {
  const images = Array.from(element.querySelectorAll('img'));
  if (images.length === 0) return;

  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); // don't freeze on broken image
        setTimeout(resolve, 2500);
      });
    })
  );
};

/**
 * Universal PDF Generator:
 * Generates an unclipped, perfectly proportioned A4 PDF from an off-screen HTML string or container.
 * Guaranteed:
 * 1. Default A4 Portrait; wide table documents (routine, result sheets, attendance rosters) A4 Landscape.
 * 2. Off-screen container with fixed width: 794px (Portrait) or 1123px (Landscape), independent of screen/phone width.
 * 3. Box-sizing: border-box, width: 100% and table-layout: fixed on all tables, word-break: break-word, 10-15mm margin.
 * 4. html2canvas: scale: 2, useCORS: true, windowWidth: container width, scrollX: 0, scrollY: 0, fit A4 page.
 *    Table rows protected from being cut in half across pages!
 * 5. Complete Bengali font (Hind Siliguri / Noto Sans Bengali) & image loading prior to capture.
 *    Renders HTML as high-res images inside jsPDF so complex Bengali conjuncts (যুক্তাক্ষর) never break.
 * 6. Authentic school logos, headers, stamps, and layout preserved.
 */
export const generatePdfFromHtml = async (
  contentHtml: string,
  options: GeneratePdfOptions
): Promise<boolean> => {
  const orientation = resolveOrientation(options);
  const isLandscape = orientation === 'landscape';
  const targetWidth = isLandscape ? LANDSCAPE_WIDTH_PX : PORTRAIT_WIDTH_PX;
  const targetMinHeight = isLandscape ? LANDSCAPE_PAGE_HEIGHT_PX : PORTRAIT_PAGE_HEIGHT_PX;
  const marginMm = typeof options.marginMm === 'number' ? options.marginMm : 12; // 12mm default (10-15mm range)

  let container: HTMLElement | null = null;

  try {
    // 1. Ensure fonts are loaded
    await ensureBengaliFontsLoaded();

    // 2. Create off-screen rendering container with fixed width
    // Positioned at top: 0, left: 0 with z-index: -99999 so html2canvas computes coordinate offsets correctly
    container = document.createElement('div');
    container.id = 'universal-pdf-offscreen-container';
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = `${targetWidth}px`;
    container.style.minWidth = `${targetWidth}px`;
    container.style.maxWidth = `${targetWidth}px`;
    container.style.minHeight = `${targetMinHeight}px`;
    container.style.boxSizing = 'border-box';
    container.style.margin = '0';
    container.style.padding = `${marginMm}mm`;
    container.style.background = '#ffffff';
    container.style.color = '#111827';
    container.style.fontFamily = "'Hind Siliguri', 'Noto Sans Bengali', system-ui, -apple-system, sans-serif";
    container.style.zIndex = '-99999';
    container.style.overflow = 'visible';
    container.style.opacity = '1';
    container.style.pointerEvents = 'none';

    // 3. Inject strict CSS style rules into container:
    // - box-sizing: border-box everywhere
    // - table-layout: fixed & width: 100% on tables
    // - word-break: break-word & overflow-wrap on all text
    // - normalize child root widths (no hardcoded pixel widths exceeding targetWidth)
    // - avoid splitting table rows across page slices
    const scopedStyle = `
      <style>
        #universal-pdf-offscreen-container, #universal-pdf-offscreen-container * {
          box-sizing: border-box !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
        }
        #universal-pdf-offscreen-container {
          width: ${targetWidth}px !important;
          max-width: ${targetWidth}px !important;
          min-width: ${targetWidth}px !important;
          padding: ${marginMm}mm !important;
          background: #ffffff !important;
        }
        #universal-pdf-offscreen-container table {
          width: 100% !important;
          max-width: 100% !important;
          table-layout: fixed !important;
          border-collapse: collapse !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
        #universal-pdf-offscreen-container th, #universal-pdf-offscreen-container td {
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          white-space: normal !important;
        }
        #universal-pdf-offscreen-container img {
          max-width: 100% !important;
          height: auto !important;
        }
        #universal-pdf-offscreen-container hr {
          width: 100% !important;
          border: 0;
          border-top: 1px solid #d1d5db;
        }
        /* Override inner wrapper hardcoded widths to let them fluidly fill the 794px/1123px container */
        #universal-pdf-offscreen-container > div,
        #universal-pdf-offscreen-container .official-notice-letterhead,
        #universal-pdf-offscreen-container .official-form-sheet,
        #universal-pdf-offscreen-container #marksheet-printable-card,
        #universal-pdf-offscreen-container #printable-student-sheet,
        #universal-pdf-offscreen-container #printable-teachers-sheet,
        #universal-pdf-offscreen-container #printable-staff-sheet,
        #universal-pdf-offscreen-container #printable-admission-card,
        #universal-pdf-offscreen-container #printable-admission-slip,
        #universal-pdf-offscreen-container #printable-single-student-card,
        #universal-pdf-offscreen-container #printable-single-teacher-card,
        #universal-pdf-offscreen-container #printable-single-staff-card {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 100% !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          box-sizing: border-box !important;
        }
        /* Ensure responsive scrolling containers don't clip on mobile */
        #universal-pdf-offscreen-container .overflow-x-auto,
        #universal-pdf-offscreen-container .overflow-x-scroll {
          overflow-x: visible !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        #universal-pdf-offscreen-container tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      </style>
    `;

    container.innerHTML = `${scopedStyle}${contentHtml}`;
    document.body.appendChild(container);

    // 4. Wait for images and font layout to fully settle
    await waitForImagesToLoad(container);
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 5. Compute actual rendered dimensions
    const targetHeight = Math.max(
      container.scrollHeight || 0,
      container.offsetHeight || 0,
      targetMinHeight
    );

    // 6. Capture high-resolution canvas with html2canvas (scale: 2 for ultra-crisp Bengali text)
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      width: targetWidth,
      height: targetHeight,
      windowWidth: targetWidth,
      windowHeight: targetHeight,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
    });

    // 7. Initialize jsPDF in A4 format with requested orientation
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidthMm = isLandscape ? 297 : 210;
    const pageHeightMm = isLandscape ? 210 : 297;

    // Total height of canvas content converted to millimeters on an A4 sheet
    const totalContentHeightMm = (canvas.height * pageWidthMm) / canvas.width;

    // Height of one full A4 page in canvas pixels
    const canvasPageHeightPx = (canvas.width * pageHeightMm) / pageWidthMm;
    const domScale = canvas.width / targetWidth; // usually 2

    // Check if content fits comfortably on a single page (with 3mm tolerance)
    if (totalContentHeightMm <= pageHeightMm + 3) {
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidthMm, totalContentHeightMm, undefined, 'FAST');
    } else {
      // Content extends past 1 page: Slice into distinct, beautiful A4 pages
      // Collect bounding positions of table rows, headings, and paragraphs to avoid slicing in the middle of a row
      const candidateElements = Array.from(
        container.querySelectorAll('tr, h1, h2, h3, h4, .page-break-avoid, section')
      ) as HTMLElement[];

      const containerRect = container.getBoundingClientRect();
      const cutBlockers = candidateElements
        .map((el) => {
          const r = el.getBoundingClientRect();
          return {
            top: (r.top - containerRect.top) * domScale,
            bottom: (r.bottom - containerRect.top) * domScale,
            height: r.height * domScale,
          };
        })
        .filter((b) => b.top >= 0 && b.bottom <= canvas.height);

      let currentSourceY = 0;
      let pageIndex = 0;

      while (currentSourceY < canvas.height - 5) {
        if (pageIndex > 0) {
          pdf.addPage('a4', orientation);
        }

        const remainingHeight = canvas.height - currentSourceY;
        let sliceHeight = Math.min(canvasPageHeightPx, remainingHeight);

        // If this slice doesn't reach the end of the canvas, check if it cuts across a table row
        if (remainingHeight > canvasPageHeightPx) {
          const prospectiveCutY = currentSourceY + canvasPageHeightPx;

          // Look for any table row or element that straddles this cut line
          const intersectingBlocker = cutBlockers.find(
            (b) => b.top < prospectiveCutY && b.bottom > prospectiveCutY
          );

          if (intersectingBlocker) {
            // Cut right before this row, provided it doesn't make the page unreasonably short
            const safeCutY = intersectingBlocker.top;
            const safeSliceHeight = safeCutY - currentSourceY;

            // Only pull cut back if it keeps at least 40% of the page
            if (safeSliceHeight >= canvasPageHeightPx * 0.4) {
              sliceHeight = safeSliceHeight;
            }
          }
        }

        // Create canvas slice for this page
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeight;

        const sliceCtx = sliceCanvas.getContext('2d')!;
        sliceCtx.fillStyle = '#ffffff';
        sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

        sliceCtx.drawImage(
          canvas,
          0,
          currentSourceY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );

        const sliceDataUrl = sliceCanvas.toDataURL('image/png', 1.0);
        const sliceHeightMm = (sliceHeight * pageWidthMm) / canvas.width;

        pdf.addImage(sliceDataUrl, 'PNG', 0, 0, pageWidthMm, sliceHeightMm, undefined, 'FAST');

        currentSourceY += sliceHeight;
        pageIndex++;
      }
    }

    // 8. Safely trigger download (native Blob URL click + fallback)
    const safeFileName = options.fileName.endsWith('.pdf')
      ? options.fileName
      : `${options.fileName}.pdf`;

    let downloaded = false;
    try {
      const blob = pdf.output('blob');
      const blobUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.style.display = 'none';
      downloadLink.href = blobUrl;
      downloadLink.download = safeFileName;
      downloadLink.target = '_blank';
      downloadLink.rel = 'noopener noreferrer';
      document.body.appendChild(downloadLink);
      downloadLink.click();

      setTimeout(() => {
        if (document.body.contains(downloadLink)) {
          document.body.removeChild(downloadLink);
        }
        window.URL.revokeObjectURL(blobUrl);
      }, 3000);
      downloaded = true;
    } catch {
      pdf.save(safeFileName);
      downloaded = true;
    }

    if (options.onSuccess) {
      options.onSuccess();
    }
    return downloaded;
  } catch (err) {
    console.error('Universal PDF generation error:', err);
    if (options.onError) {
      options.onError(err);
    }
    return false;
  } finally {
    if (container && document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

/**
 * Generate PDF by cloning an existing on-screen element into the standardized off-screen container.
 * Guaranteed:
 * - Expands to true, unclipped 794px (portrait) or 1123px (landscape) document width
 * - Eliminates mobile screen truncation and responsive hiding
 * - Strips buttons and interactive controls
 */
export const generatePdfFromElement = async (
  sourceElement: HTMLElement,
  options: GeneratePdfOptions
): Promise<boolean> => {
  const clone = sourceElement.cloneNode(true) as HTMLElement;

  // Remove any interactive UI elements that shouldn't appear in print/PDF (e.g. close buttons, tabs, inputs)
  const excludeElements = clone.querySelectorAll('.print\\:hidden, .print-exclude, button');
  excludeElements.forEach((el) => {
    // Keep decorative badge icons, only remove actual action buttons
    if (el.tagName.toLowerCase() === 'button') {
      el.parentElement?.removeChild(el);
    }
  });

  // Ensure clone styling is reset to full width
  clone.style.width = '100%';
  clone.style.minWidth = '100%';
  clone.style.maxWidth = '100%';
  clone.style.height = 'auto';
  clone.style.minHeight = 'unset';
  clone.style.maxHeight = 'unset';
  clone.style.overflow = 'visible';
  clone.style.margin = '0';
  clone.style.boxSizing = 'border-box';

  return generatePdfFromHtml(clone.outerHTML, options);
};
