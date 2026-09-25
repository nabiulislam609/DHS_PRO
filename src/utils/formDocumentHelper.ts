import { DownloadableForm, SiteSettings } from '../types';
import { triggerFileDownload } from './fileDownloader';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';

/**
 * Builds standard clean official form HTML for preview, printing, and PDF/Word generation
 */
export const buildFormHtml = (
  form: DownloadableForm,
  siteSettings?: Partial<SiteSettings>
): string => {
  const schoolNameBn = siteSettings?.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়';
  const schoolNameEn = siteSettings?.schoolNameEnglish || 'Dadra High School';
  const address = siteSettings?.address || 'দাদরা, জয়পুরহাট সদর, জয়পুরহাট';
  const phone = siteSettings?.phone1 || siteSettings?.emergencyPhone || '০১৭১২-৩৪৫৬৭৮';
  const email = siteSettings?.email || 'info@dadrahs.edu.bd';
  const estd = siteSettings?.establishedYear || '১৯৮২';
  const logo = siteSettings?.logoUrl || '';

  return `
    <div class="official-form-sheet" style="font-family: 'Hind Siliguri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.6; width: 794px; max-width: 794px; min-height: 1123px; margin: 0 auto; background: #ffffff; padding: 36px 44px; box-sizing: border-box; text-align: left; display: flex; flex-direction: column; justify-content: space-between;">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
        @page {
          size: portrait !important;
          size: A4 portrait !important;
          size: 210mm 297mm !important;
          margin: 10mm !important;
        }
        .official-form-sheet {
          width: 794px !important;
          max-width: 794px !important;
          min-height: 1123px !important;
          box-sizing: border-box !important;
        }
        .official-form-sheet, .official-form-sheet * {
          font-family: 'Hind Siliguri', 'SolaimanLipi', 'Kalpurush', -apple-system, BlinkMacSystemFont, sans-serif !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      </style>

      <!-- Main Form Content -->
      <div style="flex: 1 0 auto;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 2px solid #064e3b; padding-bottom: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 6px;">
            ${
              logo
                ? `<img src="${logo}" alt="Logo" style="width: 52px; height: 52px; object-fit: contain; border-radius: 8px;" crossOrigin="anonymous" />`
                : `<div style="width: 48px; height: 48px; border-radius: 50%; background: #064e3b; color: #fde047; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 22px; border: 2px solid #047857; text-align: center; line-height: 48px;">দ</div>`
            }
            <div style="text-align: center;">
              <h1 style="font-size: 23px; font-weight: 900; color: #064e3b; margin: 0; line-height: 1.2;">${schoolNameBn}</h1>
              <p style="font-size: 12px; font-weight: 700; color: #475569; margin: 2px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px;">${schoolNameEn}</p>
            </div>
          </div>
          <p style="font-size: 11px; color: #64748b; margin: 3px 0 0 0;">
            ${address} • স্থাপিত: ${estd} • EIIN: ১২৩৪৫৬ • ফোন: ${phone} • ইমেইল: ${email}
          </p>
        </div>

        <!-- Form Title Box -->
        <div style="text-align: center; margin: 14px 0 16px 0;">
          <span style="background: #064e3b; color: #ffffff; padding: 6px 28px; border-radius: 4px; font-size: 14px; font-weight: 800; letter-spacing: 0.5px; display: inline-block;">
            ${form.title}
          </span>
        </div>

        <!-- Meta Info -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11.5px; background: #f8fafc; border: 1px solid #cbd5e1;">
          <tr>
            <td style="padding: 7px 12px; border: 1px solid #e2e8f0; width: 35%;">
              <strong style="color: #334155;">ক্যাটাগরি:</strong> ${form.category}
            </td>
            <td style="padding: 7px 12px; border: 1px solid #e2e8f0; width: 35%;">
              <strong style="color: #334155;">ফরম্যাট:</strong> ${form.fileType || 'DOCX / PDF'}
            </td>
            <td style="padding: 7px 12px; border: 1px solid #e2e8f0; width: 30%;">
              <strong style="color: #334155;">আপডেট তারিখ:</strong> ${form.updatedDate || '২০২৬'}
            </td>
          </tr>
        </table>

        ${
          form.description
            ? `<div style="background: #f1f5f9; border-left: 4px solid #064e3b; padding: 10px 14px; margin-bottom: 16px; font-size: 12px; color: #334155;">
                <strong>নির্দেশনা:</strong> ${form.description}
              </div>`
            : ''
        }

        <!-- Official Application Form Fields (Fillable on Print/Word) -->
        <div style="margin-top: 14px; space-y: 12px; font-size: 12.5px; color: #1e293b;">
          <p style="margin-bottom: 8px;"><strong>বরাবর,</strong><br/>প্রধান শিক্ষক<br/>${schoolNameBn}, জয়পুরহাট।</p>
          <p style="margin-bottom: 16px;"><strong>বিষয়:</strong> ${form.title} এর জন্য আবেদন।</p>

          <p style="margin-bottom: 14px;">মহোদয়,<br/>বিনীত নিবেদন এই যে, আমি আপনার বিদ্যালয়ের একজন নিয়মিত শিক্ষার্থী। আমার প্রয়োজনীয় তথ্যাবলী নিচে প্রদান করা হলো:</p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 12px; border: 1px solid #94a3b8;">
            <tr>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; width: 30%; background: #f8fafc; font-weight: bold;">শিক্ষার্থীর পূর্ণ নাম:</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; width: 70%;">................................................................................................</td>
            </tr>
            <tr>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">শ্রেণি, শাখা ও রোল:</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">শ্রেণি: .................... শাখা: .................... রোল: ....................</td>
            </tr>
            <tr>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">পিতার নাম:</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">................................................................................................</td>
            </tr>
            <tr>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">মাতার নাম:</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">................................................................................................</td>
            </tr>
            <tr>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">বর্তমান ও স্থায়ী ঠিকানা:</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">................................................................................................</td>
            </tr>
            <tr>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">অভিভাবকের মোবাইল:</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">................................................................................................</td>
            </tr>
            <tr>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">আবেদনের কারণ / বিবরণ:</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; min-height: 60px;">
                ................................................................................................<br/>
                ................................................................................................
              </td>
            </tr>
          </table>

          <p style="margin-top: 12px;">অতএব, মহোদয়ের নিকট বিনীত প্রার্থনা, অনুগ্রহপূর্বক আমার উক্ত আবেদনটি মঞ্জুর করতে মর্জি হয়।</p>
        </div>
      </div>

      <!-- Signatures Block -->
      <div style="flex-shrink: 0; margin-top: 36px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;">
          <div style="text-align: center; width: 170px;">
            <div style="border-bottom: 1px dashed #64748b; height: 35px; margin-bottom: 4px;"></div>
            <span style="font-size: 11px; font-weight: bold; color: #334155;">অভিভাবকের স্বাক্ষর ও তারিখ</span>
          </div>

          <div style="width: 75px; height: 75px; border: 2px dashed #064e3b; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 8.5px; font-weight: 800; color: #064e3b; transform: rotate(-8deg); opacity: 0.85;">
            বিদ্যালয়<br/>অফিসিয়াল<br/>সিলমোহর
          </div>

          <div style="text-align: center; width: 170px;">
            <div style="border-bottom: 1px dashed #64748b; height: 35px; margin-bottom: 4px;"></div>
            <span style="font-size: 11px; font-weight: bold; color: #334155;">আবেদনকারী শিক্ষার্থীর স্বাক্ষর</span>
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <span style="font-size: 10px; color: #64748b;">শ্রেণি শিক্ষকের মন্তব্য ও স্বাক্ষর: .......................................</span>
          </div>
          <div style="text-align: center; width: 160px;">
            <div style="border-bottom: 1px solid #334155; margin-bottom: 4px;"></div>
            <div style="font-weight: 800; font-size: 12px; color: #064e3b;">প্রধান শিক্ষক</div>
            <div style="font-size: 10px; color: #64748b;">${schoolNameBn}</div>
          </div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Downloads Editable MS Word Document (.docx / .doc)
 * - If user uploaded a .docx / .doc from device, triggers real file download directly.
 * - Otherwise, generates a fully formatted editable Microsoft Word XML/HTML document.
 */
export const downloadEditableForm = (
  form: DownloadableForm,
  siteSettings?: Partial<SiteSettings>
): void => {
  const safeTitle = (form.title || 'Form').replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');

  // If user uploaded a real file (e.g. .docx / .doc), download that directly!
  if (form.fileUrl) {
    const ext = form.fileName?.split('.').pop() || (form.fileType === 'PDF' ? 'pdf' : 'docx');
    const targetName = form.fileName || `${safeTitle}.${ext}`;
    triggerFileDownload(form.fileUrl, targetName);
    return;
  }

  // Otherwise, construct a rich editable Word document (.doc)
  const schoolNameBn = siteSettings?.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়';
  const schoolNameEn = siteSettings?.schoolNameEnglish || 'Dadra High School';
  const address = siteSettings?.address || 'দাদরা, জয়পুরহাট সদর, জয়পুরহাট';
  const phone = siteSettings?.phone1 || '০১৭১২-৩৪৫৬৭৮';
  const email = siteSettings?.email || 'info@dadrahs.edu.bd';
  const estd = siteSettings?.establishedYear || '১৯৮২';

  const wordDocumentHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${form.title}</title>
      <style>
        body {
          font-family: 'Calibri', 'Hind Siliguri', 'SolaimanLipi', Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #000000;
          margin: 20mm;
        }
        h1 { font-size: 18pt; color: #064e3b; margin: 0; text-align: center; }
        h2 { font-size: 13pt; color: #334155; margin: 2pt 0; text-align: center; }
        .meta-p { font-size: 9pt; color: #666666; margin: 3pt 0 10pt 0; text-align: center; }
        .title-box {
          background-color: #064e3b;
          color: #ffffff;
          padding: 6pt 16pt;
          text-align: center;
          font-size: 13pt;
          font-weight: bold;
          margin: 12pt auto;
          display: block;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10pt;
          margin-bottom: 12pt;
        }
        th, td {
          border: 1px solid #777777;
          padding: 6pt 8pt;
          font-size: 10.5pt;
        }
        .header-cell {
          background-color: #f1f5f9;
          font-weight: bold;
          width: 32%;
        }
      </style>
    </head>
    <body>
      <h1>${schoolNameBn}</h1>
      <h2>${schoolNameEn}</h2>
      <p class="meta-p">${address} • স্থাপিত: ${estd} • EIIN: ১২৩৪৫৬ • ফোন: ${phone} • ইমেইল: ${email}</p>
      <hr style="border: 1px solid #064e3b;" />

      <div class="title-box">${form.title}</div>

      <p><strong>ক্যাটাগরি:</strong> ${form.category} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>আপডেট তারিখ:</strong> ${form.updatedDate || '২০২৬'}</p>
      ${form.description ? `<p><strong>নির্দেশনা:</strong> ${form.description}</p>` : ''}

      <p style="margin-top: 14pt;"><strong>বরাবর,</strong><br/>প্রধান শিক্ষক<br/>${schoolNameBn}, জয়পুরহাট।</p>
      <p><strong>বিষয়:</strong> ${form.title} এর জন্য আবেদন।</p>

      <p>মহোদয়,<br/>বিনীত নিবেদন এই যে, আমি আপনার বিদ্যালয়ের একজন নিয়মিত শিক্ষার্থী। আমার প্রয়োজনীয় তথ্যাবলী নিচে দেওয়া হলো:</p>

      <table>
        <tr>
          <td class="header-cell">শিক্ষার্থীর পূর্ণ নাম:</td>
          <td>&nbsp;</td>
        </tr>
        <tr>
          <td class="header-cell">শ্রেণি, শাখা ও রোল:</td>
          <td>শ্রেণি: ____________&nbsp;&nbsp;&nbsp;&nbsp;শাখা: ____________&nbsp;&nbsp;&nbsp;&nbsp;রোল: ____________</td>
        </tr>
        <tr>
          <td class="header-cell">পিতার নাম:</td>
          <td>&nbsp;</td>
        </tr>
        <tr>
          <td class="header-cell">মাতার নাম:</td>
          <td>&nbsp;</td>
        </tr>
        <tr>
          <td class="header-cell">বর্তমান ও স্থায়ী ঠিকানা:</td>
          <td>&nbsp;</td>
        </tr>
        <tr>
          <td class="header-cell">যোগাযোগের মোবাইল:</td>
          <td>&nbsp;</td>
        </tr>
        <tr>
          <td class="header-cell">আবেদনের কারণ ও বিবরণ:</td>
          <td style="height: 60pt;">&nbsp;</td>
        </tr>
      </table>

      <p>অতএব, মহোদয়ের নিকট প্রার্থনা, অনুগ্রহপূর্বক আমার আবেদনটি মঞ্জুর করতে মর্জি হয়।</p>

      <br/><br/>
      <table style="border: none; margin-top: 25pt;">
        <tr style="border: none;">
          <td style="border: none; text-align: left; width: 50%;">
            ____________________________<br/>
            <strong>অভিভাবকের স্বাক্ষর ও তারিখ</strong>
          </td>
          <td style="border: none; text-align: right; width: 50%;">
            ____________________________<br/>
            <strong>শিক্ষার্থীর স্বাক্ষর ও তারিখ</strong>
          </td>
        </tr>
        <tr style="border: none;">
          <td colspan="2" style="border: none; text-align: center; padding-top: 35pt;">
            <p style="text-align: right;">
              ____________________________<br/>
              <strong>প্রধান শিক্ষক</strong><br/>
              ${schoolNameBn}
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordDocumentHtml], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeTitle}_Editable.doc`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (document.body.contains(a)) document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 2000);
};

/**
 * Robust Print for School Forms
 * Uses isolated iframe for 100% Portrait A4 printing
 */
export const printForm = (
  form: DownloadableForm,
  siteSettings?: Partial<SiteSettings>
): void => {
  try {
    const formHtml = buildFormHtml(form, siteSettings);

    const oldFrame = document.getElementById('form-print-frame');
    if (oldFrame && oldFrame.parentElement) {
      oldFrame.parentElement.removeChild(oldFrame);
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'form-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '794px';
    iframe.style.height = '1123px';
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
          <title>${form.title}</title>
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
          ${formHtml}
        </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (err) {
          console.warn('Iframe print failed, falling back to window print', err);
          window.print();
        }
      }, 350);

      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 60000);
      return;
    }
  } catch (err) {
    console.error('Print form error:', err);
    window.print();
  }
};

/**
 * Generates and downloads official A4 Portrait PDF for the Form
 */
export const downloadFormPdf = async (
  form: DownloadableForm,
  siteSettings?: Partial<SiteSettings>
): Promise<boolean> => {
  // If user uploaded a real PDF, download that directly!
  if (form.fileUrl && (form.fileType === 'PDF' || form.fileName?.endsWith('.pdf'))) {
    triggerFileDownload(form.fileUrl, form.fileName || `${form.title}.pdf`);
    return true;
  }

  let createdTempContainer: HTMLElement | null = null;
  try {
    const cleanTitle = (form.title || 'Form').replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '_');
    const fileName = `${cleanTitle}.pdf`;

    createdTempContainer = document.createElement('div');
    createdTempContainer.style.position = 'fixed';
    createdTempContainer.style.left = '0';
    createdTempContainer.style.top = '0';
    createdTempContainer.style.width = '794px';
    createdTempContainer.style.minHeight = '1123px';
    createdTempContainer.style.zIndex = '-99999';
    createdTempContainer.style.background = '#ffffff';
    createdTempContainer.style.opacity = '1';
    createdTempContainer.style.pointerEvents = 'none';

    createdTempContainer.innerHTML = buildFormHtml(form, siteSettings);
    document.body.appendChild(createdTempContainer);

    try {
      if (document.fonts) await document.fonts.ready;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));

    const captureWidth = 794;
    const captureHeight = Math.max(createdTempContainer.scrollHeight || 0, 1123);

    let canvas: HTMLCanvasElement;
    try {
      canvas = await html2canvas(createdTempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: captureWidth,
        height: captureHeight,
      });
    } catch {
      const dataUrl = await toPng(createdTempContainer, {
        width: captureWidth,
        height: captureHeight,
        canvasWidth: captureWidth * 2,
        canvasHeight: captureHeight * 2,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        skipFonts: true,
      });
      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((res) => {
        img.onload = () => res();
      });
      canvas = document.createElement('canvas');
      canvas.width = captureWidth * 2;
      canvas.height = captureHeight * 2;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
    }

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    try {
      const blob = pdf.output('blob');
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      }, 2000);
    } catch {
      pdf.save(fileName);
    }
    return true;
  } catch (err) {
    console.error('downloadFormPdf error:', err);
    printForm(form, siteSettings);
    return false;
  } finally {
    if (createdTempContainer && document.body.contains(createdTempContainer)) {
      document.body.removeChild(createdTempContainer);
    }
  }
};
