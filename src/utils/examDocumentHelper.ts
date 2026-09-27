import { ActiveExam, SiteSettings, Student } from '../types';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';

export interface ExamRoutineItem {
  sl: number;
  date: string;
  day: string;
  time: string;
  subject: string;
  subjectCode: string;
  classes: string;
}

export const getEligibleClassesText = (exam: ActiveExam): string => {
  if (!exam.eligibleClasses || exam.eligibleClasses.length === 0 || exam.eligibleClasses.includes('all')) {
    return 'সকল শ্রেণি (৬ষ্ঠ থেকে ১০ম)';
  }
  return exam.eligibleClasses.join(', ');
};

export const getEnrolledStudentCount = (exam: ActiveExam, students: Student[]): number => {
  if (!exam.eligibleClasses || exam.eligibleClasses.length === 0 || exam.eligibleClasses.includes('all')) {
    return students.length;
  }
  const normalize = (c: string) => {
    const s = String(c || '').toLowerCase();
    if (s.includes('১০') || s.includes('10')) return '10';
    if (s.includes('৯') || s.includes('9')) return '9';
    if (s.includes('৮') || s.includes('8')) return '8';
    if (s.includes('৭') || s.includes('7')) return '7';
    if (s.includes('৬') || s.includes('6')) return '6';
    return s.trim();
  };

  const allowedNorms = new Set(exam.eligibleClasses.map(normalize));
  return students.filter((st) => {
    const stNorm = normalize(st.class || st.studentClass || '');
    return allowedNorms.has(stNorm);
  }).length;
};

/**
 * Generate standard routine items for the exam
 */
export const getExamRoutineSchedule = (exam: ActiveExam): ExamRoutineItem[] => {
  const classesText = getEligibleClassesText(exam);

  return [
    {
      sl: 1,
      date: exam.examStartDate || '২০ অক্টোবর ২০২৬',
      day: 'মঙ্গলবার',
      time: 'সকাল ১০:০০ - দুপুর ১:০০',
      subject: 'বাংলা ১ম পত্র (Bangla 1st Paper)',
      subjectCode: '১০১',
      classes: classesText,
    },
    {
      sl: 2,
      date: '২২ অক্টোবর ২০২৬',
      day: 'বৃহস্পতিবার',
      time: 'সকাল ১০:০০ - দুপুর ১:০০',
      subject: 'বাংলা ২য় পত্র (Bangla 2nd Paper)',
      subjectCode: '১০২',
      classes: classesText,
    },
    {
      sl: 3,
      date: '২৫ অক্টোবর ২০২৬',
      day: 'রবিবার',
      time: 'সকাল ১০:০০ - দুপুর ১:০০',
      subject: 'ইংরেজি ১ম পত্র (English 1st Paper)',
      subjectCode: '১০৭',
      classes: classesText,
    },
    {
      sl: 4,
      date: '২৭ অক্টোবর ২০২৬',
      day: 'মঙ্গলবার',
      time: 'সকাল ১০:০০ - দুপুর ১:০০',
      subject: 'ইংরেজি ২য় পত্র (English 2nd Paper)',
      subjectCode: '১০৮',
      classes: classesText,
    },
    {
      sl: 5,
      date: '২৯ অক্টোবর ২০২৬',
      day: 'বৃহস্পতিবার',
      time: 'সকাল ১০:০০ - দুপুর ১:০০',
      subject: 'গণিত (Mathematics)',
      subjectCode: '১০৯',
      classes: classesText,
    },
    {
      sl: 6,
      date: '০১ নভেম্বর ২০২৬',
      day: 'রবিবার',
      time: 'সকাল ১০:০০ - দুপুর ১:০০',
      subject: 'ধর্ম ও নৈতিক শিক্ষা (Islam / Moral Edu.)',
      subjectCode: '১১১',
      classes: classesText,
    },
    {
      sl: 7,
      date: '০৩ নভেম্বর ২০২৬',
      day: 'মঙ্গলবার',
      time: 'সকাল ১০:০০ - দুপুর ১:০০',
      subject: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
      subjectCode: '১৫৪',
      classes: classesText,
    },
    {
      sl: 8,
      date: '০৫ নভেম্বর ২০২৬',
      day: 'বৃহস্পতিবার',
      time: 'সকাল ১০:০০ - দুপুর ১:০০',
      subject: 'বিজ্ঞান / পদার্থবিজ্ঞান / হিসাববিজ্ঞান',
      subjectCode: '১২৭ / ১৩৬ / ১৪৬',
      classes: classesText,
    },
    {
      sl: 9,
      date: '০৮ নভেম্বর ২০২৬',
      day: 'রবিবার',
      time: 'সকাল ১০:০০ - দুপুর ১:০০',
      subject: 'বাংলাদেশ ও বিশ্বপরিচয় / রসায়ন / পৌরনীতি',
      subjectCode: '১৫০ / ১৩৭ / ১৪০',
      classes: classesText,
    },
    {
      sl: 10,
      date: '১০ নভেম্বর ২০২৬',
      day: 'মঙ্গলবার',
      time: 'সকাল ১০:০০ - দুপুর ১:০০',
      subject: 'উচ্চতর গণিত / জীববিজ্ঞান / কৃষি / গার্হস্থ্য',
      subjectCode: '১৩৮ / ১৩৪ / ১৩২',
      classes: classesText,
    },
  ];
};

/**
 * Builds authentic A4 printable HTML for the Exam Schedule Notice
 */
export const buildExamNoticeHtml = (
  exam: ActiveExam,
  siteSettings: SiteSettings,
  students: Student[]
): string => {
  const schoolNameBn = siteSettings.schoolNameBangla || 'দাড়িয়াপুর এইচ. এ. খান উচ্চ বিদ্যালয়';
  const schoolNameEn = siteSettings.schoolNameEnglish || 'Dariapur H. A. Khan High School';
  const address = siteSettings.address || 'ডাকঘর: দাড়িয়াপুর, উপজেলা: সখিপুর, জেলা: টাঙ্গাইল';
  const estYear = siteSettings.establishedYear || '১৯৮৬';
  const phone = siteSettings.phone1 || siteSettings.phone2 || '০১৭১২-৩৪৫৬৭৮';
  const email = siteSettings.email || 'info@dariapurhakhan.edu.bd';
  const eligibleText = getEligibleClassesText(exam);
  const enrolledCount = getEnrolledStudentCount(exam, students);
  const routine = getExamRoutineSchedule(exam);
  const memoNo = `স্মারক নং: দা.খা.উ.বি/পরীক্ষা/${exam.examYear || '২০২৬'}/${Math.floor(100 + Math.random() * 900)}`;
  const publishDate = exam.createdDate || new Date().toISOString().split('T')[0];

  return `
    <div style="width: 210mm; min-height: 297mm; padding: 14mm 16mm; background: #ffffff; color: #111827; font-family: 'Hind Siliguri', sans-serif; box-sizing: border-box; line-height: 1.45; font-size: 13px;">
      
      <!-- Top Header & Monogram -->
      <div style="border-bottom: 2.5px solid #047857; padding-bottom: 12px; margin-bottom: 14px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 80px; vertical-align: middle; text-align: left;">
              ${
                siteSettings.logoUrl
                  ? `<img src="${siteSettings.logoUrl}" alt="Logo" style="width: 74px; height: 74px; object-fit: contain; border-radius: 50%; border: 1.5px solid #d1fae5; padding: 2px;" />`
                  : `<div style="width: 70px; height: 70px; border-radius: 50%; background: #ecfdf5; border: 2px solid #047857; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #047857; font-size: 20px;">দা.উ.বি</div>`
              }
            </td>
            <td style="vertical-align: middle; text-align: center; padding: 0 10px;">
              <div style="font-size: 11px; font-weight: 700; color: #065f46; letter-spacing: 0.5px; text-transform: uppercase;">
                গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত ও শিক্ষা বোর্ড অধিভুক্ত
              </div>
              <h1 style="margin: 3px 0; font-size: 24px; font-weight: 800; color: #064e3b; letter-spacing: -0.5px;">
                ${schoolNameBn}
              </h1>
              <div style="font-size: 13px; font-weight: 700; color: #1e3a8a; letter-spacing: 0.2px;">
                ${schoolNameEn}
              </div>
              <div style="font-size: 11px; color: #4b5563; margin-top: 3px;">
                ${address} | স্থাপিত: ${estYear} খ্রি. | ফোন: ${phone} | ইমেইল: ${email}
              </div>
            </td>
            <td style="width: 80px; vertical-align: middle; text-align: right;">
              <div style="border: 1.5px dashed #047857; border-radius: 8px; padding: 5px; text-align: center; background: #f0fdf4;">
                <div style="font-size: 9px; font-weight: 700; color: #065f46;">অবস্থা</div>
                <div style="font-size: 11px; font-weight: 800; color: ${exam.isActive ? '#047857' : '#b91c1c'};">
                  ${exam.isActive ? '● সক্রিয়' : 'নিষ্ক্রিয়'}
                </div>
                <div style="font-size: 9px; color: #6b7280; margin-top: 2px;">বছর: ${exam.examYear || '২০২৬'}</div>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Memo & Date Row -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11.5px; color: #374151;">
        <tr>
          <td style="text-align: left; font-weight: 600;">
            ${memoNo}
          </td>
          <td style="text-align: right; font-weight: 600;">
            তারিখ: ${publishDate} খ্রি.
          </td>
        </tr>
      </table>

      <!-- Document Banner Title -->
      <div style="background: linear-gradient(135deg, #064e3b, #047857); color: #ffffff; padding: 8px 14px; border-radius: 8px; text-align: center; margin-bottom: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h2 style="margin: 0; font-size: 17px; font-weight: 800; letter-spacing: 0.3px;">
          ${exam.examTerm}
        </h2>
        <div style="font-size: 12px; font-weight: 600; opacity: 0.95; margin-top: 2px;">
          পরীক্ষার রুটিন, সময়সূচি ও গুরুত্বপূর্ণ প্রাতিষ্ঠানিক নোটিশ
        </div>
      </div>

      <!-- Overview Info Grid -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11.5px; border: 1px solid #d1fae5; background: #f9fafb; border-radius: 6px;">
        <tr>
          <td style="padding: 7px 10px; width: 25%; font-weight: 700; color: #065f46; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
            প্রযোজ্য শ্রেণি:
          </td>
          <td style="padding: 7px 10px; width: 25%; font-weight: 600; color: #111827; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
            ${eligibleText}
          </td>
          <td style="padding: 7px 10px; width: 25%; font-weight: 700; color: #065f46; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
            পরীক্ষা শুরুর তারিখ:
          </td>
          <td style="padding: 7px 10px; width: 25%; font-weight: 700; color: #b91c1c; border-bottom: 1px solid #e5e7eb;">
            ${exam.examStartDate || '২০ অক্টোবর ২০২৬'}
          </td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; font-weight: 700; color: #065f46; border-right: 1px solid #e5e7eb;">
            মোট পরীক্ষার্থী:
          </td>
          <td style="padding: 7px 10px; font-weight: 600; color: #111827; border-right: 1px solid #e5e7eb;">
            ${enrolledCount} জন (তালিকাভুক্ত)
          </td>
          <td style="padding: 7px 10px; font-weight: 700; color: #065f46; border-right: 1px solid #e5e7eb;">
            পরীক্ষার কেন্দ্র / স্থান:
          </td>
          <td style="padding: 7px 10px; font-weight: 600; color: #111827;">
            বিদ্যালয় মূল একাডেমিক ভবন
          </td>
        </tr>
      </table>

      <!-- Exam Routine Table -->
      <div style="margin-bottom: 14px;">
        <div style="font-size: 13px; font-weight: 800; color: #064e3b; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <span>📅 পরীক্ষার পূর্ণাঙ্গ সময়সূচি (Exam Schedule / Routine):</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left; border: 1px solid #9ca3af;">
          <thead>
            <tr style="background: #047857; color: #ffffff;">
              <th style="padding: 6px 8px; border: 1px solid #065f46; width: 35px; text-align: center;">ক্রম</th>
              <th style="padding: 6px 8px; border: 1px solid #065f46; width: 95px;">তারিখ</th>
              <th style="padding: 6px 8px; border: 1px solid #065f46; width: 75px;">বার</th>
              <th style="padding: 6px 8px; border: 1px solid #065f46;">বিষয় ও বিষয় কোড</th>
              <th style="padding: 6px 8px; border: 1px solid #065f46; width: 115px; text-align: center;">সময়</th>
              <th style="padding: 6px 8px; border: 1px solid #065f46; width: 110px;">প্রযোজ্য শ্রেণি</th>
            </tr>
          </thead>
          <tbody>
            ${routine
              .map(
                (item, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                <td style="padding: 5px 8px; border: 1px solid #d1d5db; text-align: center; font-weight: 600;">
                  ${item.sl}
                </td>
                <td style="padding: 5px 8px; border: 1px solid #d1d5db; font-weight: 600; color: #111827;">
                  ${item.date}
                </td>
                <td style="padding: 5px 8px; border: 1px solid #d1d5db; color: #4b5563;">
                  ${item.day}
                </td>
                <td style="padding: 5px 8px; border: 1px solid #d1d5db; font-weight: 600; color: #0f172a;">
                  ${item.subject} <span style="font-size: 10px; color: #6b7280; font-weight: 400;">(${item.subjectCode})</span>
                </td>
                <td style="padding: 5px 8px; border: 1px solid #d1d5db; text-align: center; color: #047857; font-weight: 600;">
                  ${item.time}
                </td>
                <td style="padding: 5px 8px; border: 1px solid #d1d5db; font-size: 10px; color: #4b5563;">
                  ${item.classes}
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <!-- Rules and Guidelines -->
      <div style="background: #fdfaf3; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 12px; margin-bottom: 24px; font-size: 10.5px; color: #78350f;">
        <div style="font-weight: 800; font-size: 11.5px; color: #92400e; margin-bottom: 4px;">
          ★ পরীক্ষার্থীদের জন্য অবশ্য পালনীয় বিশেষ নির্দেশাবলী:
        </div>
        <ol style="margin: 0; padding-left: 18px; line-height: 1.45;">
          <li>পরীক্ষা শুরুর কমপক্ষে ২০ মিনিট পূর্বে প্রত্যেক পরীক্ষার্থীকে নির্ধারিত কক্ষে নিজ আসনে প্রবেশ করতে হবে।</li>
          <li>ওয়েবসাইট থেকে ডাউনলোডকৃত অফিশিয়াল <strong>প্রবেশপত্র (Admit Card)</strong> ব্যতীত কোনো শিক্ষার্থী পরীক্ষায় বসতে পারবে না।</li>
          <li>পরীক্ষা কেন্দ্রে মোবাইল ফোন, স্মার্টওয়াচ বা যেকোনো প্রকার ডিজিটাল ডিভাইস বহন সম্পূর্ণ নিষিদ্ধ।</li>
          <li>উত্তরপত্রের কভার পৃষ্ঠায় রোল নম্বর ও অন্যান্য প্রয়োজনীয় তথ্য নির্ভুলভাবে লিখতে হবে; কোনো অবস্থাতেই ঘষামাজা গ্রহণযোগ্য নয়।</li>
          <li>পরীক্ষা সুষ্ঠু ও সুশৃঙ্খলভাবে সম্পন্ন করতে সকল শিক্ষক, অভিভাবক ও পরীক্ষার্থীদের সর্বাত্মক সহযোগিতা কামনা করা হচ্ছে।</li>
        </ol>
      </div>

      <!-- Signature Section -->
      <div style="margin-top: 36px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 33%; text-align: center; vertical-align: bottom;">
              <div style="width: 140px; margin: 0 auto; border-top: 1.5px solid #6b7280; padding-top: 4px;">
                <div style="font-weight: 700; font-size: 11.5px; color: #111827;">পরীক্ষা নিয়ন্ত্রক / আহ্বায়ক</div>
                <div style="font-size: 10px; color: #6b7280;">পরীক্ষা পরিচালনা কমিটি</div>
                <div style="font-size: 9.5px; color: #9ca3af;">${schoolNameBn}</div>
              </div>
            </td>
            <td style="width: 34%; text-align: center; vertical-align: middle;">
              <div style="width: 75px; height: 75px; border-radius: 50%; border: 1.5px dashed #047857; margin: 0 auto; display: flex; align-items: center; justify-content: center; background: #f0fdf4;">
                <span style="font-size: 9.5px; font-weight: 700; color: #047857; text-align: center;">
                  বিদ্যালয়ের<br/>প্রাতিষ্ঠানিক সিল
                </span>
              </div>
            </td>
            <td style="width: 33%; text-align: center; vertical-align: bottom;">
              <div style="width: 140px; margin: 0 auto; border-top: 1.5px solid #6b7280; padding-top: 4px;">
                <div style="font-weight: 700; font-size: 11.5px; color: #111827;">প্রধান শিক্ষক / অধ্যক্ষ</div>
                <div style="font-size: 10px; color: #6b7280;">${schoolNameBn}</div>
                <div style="font-size: 9.5px; color: #9ca3af;">সখিপুর, টাঙ্গাইল</div>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Footer Note -->
      <div style="margin-top: 25px; border-top: 1px solid #e5e7eb; padding-top: 6px; text-align: center; font-size: 9px; color: #9ca3af;">
        এটি বিদ্যালয়ের ডিজিটাল স্কুল ম্যানেজমেন্ট পোর্টাল কর্তৃক সংরক্ষিত ও স্বয়ংক্রিয়ভাবে প্রস্তুতকৃত অফিশিয়াল পরীক্ষা বিবরণী নথি।
      </div>
    </div>
  `;
};

/**
 * Print the Exam Notice and Schedule directly using an isolated iframe
 */
export const printExamSchedule = (
  exam: ActiveExam,
  siteSettings: SiteSettings,
  students: Student[]
): void => {
  try {
    const htmlContent = buildExamNoticeHtml(exam, siteSettings, students);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
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
          <title>${exam.examTerm} - রুটিন ও পরীক্ষার বিজ্ঞপ্তি</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-family: 'Hind Siliguri', sans-serif !important;
            }
            html, body {
              width: 210mm !important;
              max-width: 210mm !important;
              margin: 0 auto !important;
              padding: 0 !important;
              background: #ffffff !important;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1500);
        } catch {
          window.print();
        }
      }, 400);
      return;
    }
    window.print();
  } catch (err) {
    console.error('Print exam error:', err);
    window.print();
  }
};

/**
 * Download high-resolution Unicode PDF of the Exam Schedule
 */
export const downloadExamSchedulePdf = async (
  exam: ActiveExam,
  siteSettings: SiteSettings,
  students: Student[]
): Promise<boolean> => {
  let tempDiv: HTMLElement | null = null;
  try {
    const cleanTitle = (exam.examTerm || 'Exam_Routine')
      .replace(/[/\\?%*:|"<>]/g, '_')
      .replace(/\s+/g, '_');
    const fileName = `${cleanTitle}_Routine.pdf`;

    tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '0';
    tempDiv.style.top = '0';
    tempDiv.style.width = '794px';
    tempDiv.style.minHeight = '1123px';
    tempDiv.style.zIndex = '-99999';
    tempDiv.style.background = '#ffffff';
    tempDiv.style.opacity = '1';
    tempDiv.style.pointerEvents = 'none';

    tempDiv.innerHTML = buildExamNoticeHtml(exam, siteSettings, students);
    document.body.appendChild(tempDiv);

    try {
      if (document.fonts) await document.fonts.ready;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));

    const captureWidth = 794;
    const captureHeight = Math.max(tempDiv.scrollHeight || 0, 1123);

    let canvas: HTMLCanvasElement;
    try {
      canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: captureWidth,
        height: captureHeight,
      });
    } catch {
      const dataUrl = await toPng(tempDiv, {
        width: captureWidth,
        height: captureHeight,
        canvasWidth: captureWidth * 2,
        canvasHeight: captureHeight * 2,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
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
    console.error('Download exam schedule PDF error:', err);
    printExamSchedule(exam, siteSettings, students);
    return false;
  } finally {
    if (tempDiv && document.body.contains(tempDiv)) {
      document.body.removeChild(tempDiv);
    }
  }
};

/**
 * Export alias for routine download compatibility
 */
export const downloadExamRoutinePdf = downloadExamSchedulePdf;
