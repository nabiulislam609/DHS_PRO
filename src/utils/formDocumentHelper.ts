import { DownloadableForm, SiteSettings } from '../types';
import { triggerFileDownload } from './fileDownloader';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';

type FormKind =
  | 'admission'
  | 'leave'
  | 'tc'
  | 'fee_waiver'
  | 'character_cert'
  | 'subject_change'
  | 'general';

/**
 * Detect the exact kind of form based on title and category
 */
export const getFormKind = (title: string, category?: string): FormKind => {
  const t = (title || '').toLowerCase();
  const c = (category || '').toLowerCase();

  if (t.includes('ভর্তি') || c.includes('ভর্তি') || t.includes('admission')) {
    return 'admission';
  }
  if (t.includes('ছুটি') || c.includes('ছুটি') || t.includes('leave')) {
    return 'leave';
  }
  if (
    t.includes('টিসি') ||
    t.includes('ছাড়পত্র') ||
    t.includes('প্রশংসাপত্র') ||
    c.includes('প্রশংসাপত্র') ||
    t.includes('transfer')
  ) {
    return 'tc';
  }
  if (
    t.includes('বেতন') ||
    t.includes('মওকুফ') ||
    t.includes('উপবৃত্তি') ||
    t.includes('waiver') ||
    t.includes('stipend')
  ) {
    return 'fee_waiver';
  }
  if (
    t.includes('প্রত্যয়ন') ||
    t.includes('character') ||
    t.includes('clearance') ||
    t.includes('চারিত্রিক')
  ) {
    return 'character_cert';
  }
  if (
    t.includes('বিষয়') ||
    t.includes('বিভাগ') ||
    t.includes('পরিবর্তন') ||
    t.includes('subject')
  ) {
    return 'subject_change';
  }
  return 'general';
};

/**
 * Visual styling theme configuration for each form kind
 */
export const getFormTheme = (kind: FormKind) => {
  switch (kind) {
    case 'admission':
      return {
        primaryColor: '#064e3b', // Deep Emerald
        secondaryColor: '#047857',
        accentBg: '#ecfdf5',
        borderColor: '#a7f3d0',
        badgeBg: '#d1fae5',
        badgeText: '#065f46',
        bannerGradient: 'from-emerald-900 via-teal-900 to-emerald-950',
        label: 'ভর্তি ফরম',
      };
    case 'leave':
      return {
        primaryColor: '#0f766e', // Deep Teal
        secondaryColor: '#0d9488',
        accentBg: '#f0fdfa',
        borderColor: '#99f6e4',
        badgeBg: '#ccfbf1',
        badgeText: '#115e59',
        bannerGradient: 'from-teal-900 via-cyan-900 to-teal-950',
        label: 'ছুটির আবেদন',
      };
    case 'tc':
      return {
        primaryColor: '#1e3a8a', // Royal Navy Blue
        secondaryColor: '#2563eb',
        accentBg: '#eff6ff',
        borderColor: '#bfdbfe',
        badgeBg: '#dbeafe',
        badgeText: '#1e40af',
        bannerGradient: 'from-blue-950 via-indigo-900 to-blue-900',
        label: 'ছাড়পত্র ও প্রশংসাপত্র',
      };
    case 'fee_waiver':
      return {
        primaryColor: '#854d0e', // Warm Amber / Olive
        secondaryColor: '#b45309',
        accentBg: '#fefce8',
        borderColor: '#fef08a',
        badgeBg: '#fef3c7',
        badgeText: '#92400e',
        bannerGradient: 'from-amber-950 via-yellow-950 to-amber-900',
        label: 'বেতন মওকুফ ও উপবৃত্তি',
      };
    case 'character_cert':
      return {
        primaryColor: '#0e7490', // Ocean Cyan
        secondaryColor: '#0284c7',
        accentBg: '#ecfeff',
        borderColor: '#a5f3fc',
        badgeBg: '#cffafe',
        badgeText: '#155e75',
        bannerGradient: 'from-cyan-950 via-sky-900 to-cyan-900',
        label: 'প্রত্যয়নপত্র ফরম',
      };
    case 'subject_change':
      return {
        primaryColor: '#881337', // Crimson Maroon
        secondaryColor: '#be123c',
        accentBg: '#fff1f2',
        borderColor: '#fecdd3',
        badgeBg: '#ffe4e6',
        badgeText: '#9f1239',
        bannerGradient: 'from-rose-950 via-rose-900 to-pink-950',
        label: 'বিষয়/বিভাগ পরিবর্তন',
      };
    default:
      return {
        primaryColor: '#1e293b', // Slate
        secondaryColor: '#334155',
        accentBg: '#f8fafc',
        borderColor: '#cbd5e1',
        badgeBg: '#f1f5f9',
        badgeText: '#334155',
        bannerGradient: 'from-slate-900 via-slate-800 to-slate-950',
        label: 'প্রাতিষ্ঠানিক ফরম',
      };
  }
};

/**
 * Builds custom specific official form HTML with unique design per form type
 */
export const buildFormHtml = (
  form: DownloadableForm,
  siteSettings?: Partial<SiteSettings>
): string => {
  const kind = getFormKind(form.title, form.category);
  const theme = getFormTheme(kind);

  const schoolNameBn = siteSettings?.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়';
  const schoolNameEn = siteSettings?.schoolNameEnglish || 'Dadra High School';
  const address = siteSettings?.address || 'দাদরা, জয়পুরহাট সদর, জয়পুরহাট';
  const phone = siteSettings?.phone1 || siteSettings?.emergencyPhone || '০১৭১২-৩৪৫৬৭৮';
  const email = siteSettings?.email || 'info@dadrahs.edu.bd';
  const estd = siteSettings?.establishedYear || '১৯৮২';
  const logo = siteSettings?.logoUrl || '';

  // Common Header Template
  const renderHeader = () => `
    <div style="text-align: center; border-bottom: 2.5px solid ${theme.primaryColor}; padding-bottom: 12px; margin-bottom: 12px; position: relative;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 4px;">
        ${
          logo
            ? `<img src="${logo}" alt="Logo" style="width: 52px; height: 52px; object-fit: contain; border-radius: 8px;" crossOrigin="anonymous" />`
            : `<div style="width: 50px; height: 50px; border-radius: 50%; background: ${theme.primaryColor}; color: #fde047; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 24px; border: 2px solid ${theme.secondaryColor}; text-align: center; line-height: 50px;">দ</div>`
        }
        <div style="text-align: center;">
          <h1 style="font-size: 22px; font-weight: 900; color: ${theme.primaryColor}; margin: 0; line-height: 1.2;">${schoolNameBn}</h1>
          <p style="font-size: 11px; font-weight: 700; color: #475569; margin: 2px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px;">${schoolNameEn}</p>
        </div>
      </div>
      <p style="font-size: 10.5px; color: #64748b; margin: 2px 0 0 0;">
        ${address} • স্থাপিত: ${estd} • EIIN: ১২৩৪৫৬ • ফোন: ${phone} • ইমেইল: ${email}
      </p>
    </div>
  `;

  // Render specific unique body for each form type
  let specificBodyHtml = '';

  if (kind === 'admission') {
    // 1. ভর্তি আবেদন ফরম
    specificBodyHtml = `
      <!-- Top Bar: Memo & Photo Box -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <div style="font-size: 11px; line-height: 1.6; color: #334155;">
          <p style="margin: 0;"><strong>আবেদন ফরম নং:</strong> DHS-ADM-২০২৬/..............</p>
          <p style="margin: 0;"><strong>ভর্তি ইচ্ছুক শ্রেণি:</strong> .................... শাখা: ............</p>
          <p style="margin: 0;"><strong>শিক্ষাবর্ষ:</strong> ২০২৬-২০২৭</p>
        </div>

        <div style="text-align: center;">
          <span style="background: ${theme.primaryColor}; color: #ffffff; padding: 5px 22px; border-radius: 4px; font-size: 13.5px; font-weight: 800; display: inline-block;">
            ভর্তি আবেদন ফরম (শিক্ষাবর্ষ ২০২৬)
          </span>
          <p style="font-size: 10px; color: #64748b; margin: 3px 0 0 0;">(সকল তথ্য সুস্পষ্ট অক্ষরে পূরণ করতে হবে)</p>
        </div>

        <!-- Photo Box -->
        <div style="width: 95px; height: 115px; border: 2px dashed ${theme.primaryColor}; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 9px; color: #64748b; background: #f8fafc; padding: 4px; box-sizing: border-box;">
          পাসপোর্ট সাইজ<br/>রঙিন ছবি<br/>(আঠা দিয়ে লাগান)
        </div>
      </div>

      <!-- 1. Student Info Table -->
      <div style="background: ${theme.accentBg}; border-left: 4px solid ${theme.primaryColor}; padding: 4px 8px; font-weight: bold; font-size: 11px; color: ${theme.primaryColor}; margin-bottom: 6px;">
        ১. শিক্ষার্থীর ব্যক্তিগত তথ্যাবলী:
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; border: 1px solid #94a3b8;">
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 28%; background: #f8fafc; font-weight: bold;">শিক্ষার্থীর নাম (বাংলায়):</td>
          <td colspan="3" style="padding: 5px 8px; border: 1px solid #cbd5e1;">................................................................................................................................</td>
        </tr>
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">Full Name (In Block Letter):</td>
          <td colspan="3" style="padding: 5px 8px; border: 1px solid #cbd5e1;">................................................................................................................................</td>
        </tr>
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">জন্ম নিবন্ধন নম্বর (১৭ ডিজিট):</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 32%;">............................................</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 18%; background: #f8fafc; font-weight: bold;">জন্ম তারিখ:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 22%;">...... / ...... / ............</td>
        </tr>
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">ধর্ম ও লিঙ্গ:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">ধর্ম: ................ লিঙ্গ: ছাত্র [ ] ছাত্রী [ ]</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">রক্তের গ্রুপ:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">[ ] A+ [ ] B+ [ ] O+ [ ] AB+ [ ] অন্যান্য</td>
        </tr>
      </table>

      <!-- 2. Parents Info Table -->
      <div style="background: ${theme.accentBg}; border-left: 4px solid ${theme.primaryColor}; padding: 4px 8px; font-weight: bold; font-size: 11px; color: ${theme.primaryColor}; margin-bottom: 6px;">
        ২. পিতা, মাতা ও অভিভাবকের তথ্যাবলী:
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; border: 1px solid #94a3b8;">
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 28%; background: #f8fafc; font-weight: bold;">পিতার নাম ও পেশা:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 37%;">নাম: ....................................... পেশা: ................</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 15%; background: #f8fafc; font-weight: bold;">পিতার NID:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 20%;">....................................</td>
        </tr>
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">মাতার নাম ও পেশা:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">নাম: ....................................... পেশা: ................</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">মাতার NID:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">....................................</td>
        </tr>
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">অভিভাবকের মোবাইল:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">১) ................................ ২) ................................</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">মাসিক আয়:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">টাকা: ............................</td>
        </tr>
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">বর্তমান ও স্থায়ী ঠিকানা:</td>
          <td colspan="3" style="padding: 5px 8px; border: 1px solid #cbd5e1;">গ্রাম: ............................. ডাকঘর: ............................. উপজেলা: ............................. জেলা: .............................</td>
        </tr>
      </table>

      <!-- 3. Previous Academic Records -->
      <div style="background: ${theme.accentBg}; border-left: 4px solid ${theme.primaryColor}; padding: 4px 8px; font-weight: bold; font-size: 11px; color: ${theme.primaryColor}; margin-bottom: 6px;">
        ৩. পূর্ববর্তী বিদ্যালয়ের বিবরণ (যদি থাকে):
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; border: 1px solid #94a3b8;">
        <tr style="background: #f8fafc; font-weight: bold; text-align: center;">
          <td style="padding: 5px; border: 1px solid #cbd5e1;">বিদ্যালয়ের নাম</td>
          <td style="padding: 5px; border: 1px solid #cbd5e1; width: 18%;">উত্তীর্ণ শ্রেণি</td>
          <td style="padding: 5px; border: 1px solid #cbd5e1; width: 14%;">রোল নং</td>
          <td style="padding: 5px; border: 1px solid #cbd5e1; width: 18%;">জিপিএ / গ্রেড</td>
          <td style="padding: 5px; border: 1px solid #cbd5e1; width: 16%;">পাশের বছর</td>
        </tr>
        <tr>
          <td style="padding: 5px; border: 1px solid #cbd5e1;">............................................................</td>
          <td style="padding: 5px; border: 1px solid #cbd5e1; text-align: center;">............</td>
          <td style="padding: 5px; border: 1px solid #cbd5e1; text-align: center;">............</td>
          <td style="padding: 5px; border: 1px solid #cbd5e1; text-align: center;">............</td>
          <td style="padding: 5px; border: 1px solid #cbd5e1; text-align: center;">২০২৫</td>
        </tr>
      </table>

      <!-- Declaration -->
      <p style="font-size: 10px; color: #475569; margin: 4px 0 8px 0; line-height: 1.4;">
        <strong>অঙ্গীকারনামা:</strong> আমি অঙ্গীকার করছি যে, উপরে বর্ণিত তথ্যাবলী সত্য ও নির্ভুল। বিদ্যালয়ের নিয়ম-শৃঙ্খলা ও পাঠ্যক্রম মেনে চলতে বাধ্য থাকব।
      </p>

      <!-- Office Section -->
      <div style="border: 1px dashed ${theme.primaryColor}; background: #fafafa; padding: 6px 10px; margin-bottom: 12px; font-size: 10.5px;">
        <strong style="color: ${theme.primaryColor};">অফিস কর্তৃক পূরণীয় অংশ:</strong><br/>
        ভর্তি কমিটির সিদ্ধান্ত: [ ] অনুমোদিত [ ] অপেক্ষমাণ [ ] বাতিল &nbsp;|&nbsp;
        নির্ধারিত শ্রেণি: .......... শাখা: .......... রোল: .......... &nbsp;|&nbsp;
        রসিদ নং: .................... তারিখ: ....../....../২০২৬
      </div>
    `;
  } else if (kind === 'leave') {
    // 2. শিক্ষার্থীর ছুটির আবেদন ফরম
    specificBodyHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <span style="font-size: 11px; color: #64748b;">স্মারক নং: DHS/LV/২০২৬/...........</span>
        <span style="background: ${theme.primaryColor}; color: #ffffff; padding: 5px 24px; border-radius: 4px; font-size: 14px; font-weight: 800;">
          শিক্ষার্থীর ছুটির আবেদন ফরম
        </span>
        <span style="font-size: 11px; color: #64748b;">তারিখ: ....../....../২০২৬</span>
      </div>

      <div style="font-size: 12px; color: #1e293b; line-height: 1.6; margin-bottom: 12px;">
        <p style="margin: 0;"><strong>বরাবর,</strong></p>
        <p style="margin: 0;">প্রধান শিক্ষক,</p>
        <p style="margin: 0;">${schoolNameBn}, জয়পুরহাট।</p>
        <p style="margin: 6px 0 10px 0; font-weight: bold; color: ${theme.primaryColor};">
          বিষয়: অসুস্থতা / পারিবারিক জরুরি প্রয়োজনে অনুপস্থিতির জন্য ছুটির আবেদন।
        </p>
        <p style="margin: 0;">
          মহোদয়,<br/>
          বিনীত নিবেদন এই যে, আমি আপনার বিদ্যালয়ের নিম্নবর্ণিত শিক্ষার্থীর অভিভাবক / শিক্ষার্থী। বিশেষ কারণে বিদ্যালয়ে উপস্থিত থাকা সম্ভব হচ্ছে না বিধায় ছুটির জন্য আবেদন করছি।
        </p>
      </div>

      <!-- Student & Leave Details Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11.5px; border: 1px solid #94a3b8;">
        <tr>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; width: 28%; background: ${theme.accentBg}; font-weight: bold;">শিক্ষার্থীর পূর্ণ নাম:</td>
          <td colspan="3" style="padding: 7px 10px; border: 1px solid #cbd5e1;">................................................................................................................</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">শ্রেণি, শাখা ও রোল:</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; width: 32%;">শ্রেণি: ............ শাখা: ........ রোল: ........</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; width: 18%; background: ${theme.accentBg}; font-weight: bold;">শিফট ও বিভাগ:</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; width: 22%;">প্রভাতি/দিবা | ................</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">ছুটির ধরণ:</td>
          <td colspan="3" style="padding: 7px 10px; border: 1px solid #cbd5e1;">
            [ ] অসুস্থতাজনিত ছুটি &nbsp;&nbsp;&nbsp; [ ] পারিবারিক জরুরি কাজ &nbsp;&nbsp;&nbsp; [ ] অন্যান্য বিশেষ কারণ
          </td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">ছুটির মেয়াদ ও দিনসংখ্যা:</td>
          <td colspan="3" style="padding: 7px 10px; border: 1px solid #cbd5e1;">
            তারিখ: ....../....../২০২৬ হতে ....../....../২০২৬ পর্যন্ত, মোট: ............ দিন।
          </td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">ছুটির সুনির্দিষ্ট কারণ:</td>
          <td colspan="3" style="padding: 7px 10px; border: 1px solid #cbd5e1; height: 50px; vertical-align: top;">
            ................................................................................................................................................................<br/>
            ................................................................................................................................................................
          </td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">সংযুক্তি (যদি থাকে):</td>
          <td colspan="3" style="padding: 7px 10px; border: 1px solid #cbd5e1;">
            [ ] চিকিৎসকের ব্যবস্থাপত্র / প্রেসক্রিপশন &nbsp;&nbsp;&nbsp; [ ] অভিভাবকের চিঠি &nbsp;&nbsp;&nbsp; [ ] অন্যান্য
          </td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">জরুরি যোগাযোগের মোবাইল:</td>
          <td colspan="3" style="padding: 7px 10px; border: 1px solid #cbd5e1;">
            ১) .................................................... ২) ....................................................
          </td>
        </tr>
      </table>

      <p style="font-size: 11.5px; color: #1e293b; margin: 8px 0 16px 0;">
        অতএব, মহোদয়ের নিকট বিনীত প্রার্থনা, উক্ত দিনগুলোর ছুটি মঞ্জুর করে বাধিত করবেন।
      </p>

      <!-- Teacher Recommendation Box -->
      <div style="border: 1px solid ${theme.borderColor}; background: #f8fafc; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px; font-size: 11px;">
        <strong style="color: ${theme.primaryColor};">শ্রেণি শিক্ষকের মতামত ও উপস্থিতি প্রতিবেদন:</strong><br/>
        শিক্ষার্থীর আচরণ সন্তোষজনক। বিগত মাসে মোট উপস্থিতি: ........ দিন। ছুটি মঞ্জুর করা যেতে পারে / পারে না।<br/>
        শ্রেণি শিক্ষকের স্বাক্ষর ও তারিখ: .................................................................
      </div>
    `;
  } else if (kind === 'tc') {
    // 3. প্রশংসাপত্র ও ছাড়পত্র (TC) আবেদন ফরম
    specificBodyHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 11px; color: #64748b;">আবেদন আইডি: DHS/TC/২০২৬/..........</span>
        <span style="background: ${theme.primaryColor}; color: #ffffff; padding: 5px 22px; border-radius: 4px; font-size: 13.5px; font-weight: 800;">
          প্রশংসাপত্র ও ছাড়পত্র (TC) আবেদন ফরম
        </span>
        <span style="font-size: 11px; color: #64748b;">ফি রসিদ নং: ....................</span>
      </div>

      <div style="font-size: 11.5px; color: #1e293b; line-height: 1.5; margin-bottom: 10px;">
        <p style="margin: 0;"><strong>বরাবর,</strong></p>
        <p style="margin: 0;">প্রধান শিক্ষক,</p>
        <p style="margin: 0;">${schoolNameBn}, জয়পুরহাট।</p>
        <p style="margin: 4px 0 8px 0; font-weight: bold; color: ${theme.primaryColor};">
          বিষয়: বিদ্যালয় ত্যাগের ছাড়পত্র (Transfer Certificate) ও চারিত্রিক প্রশংসাপত্র প্রদানের আবেদন।
        </p>
        <p style="margin: 0;">
          মহোদয়, বিনীত নিবেদন এই যে, আমি আপনার বিদ্যালয়ের নিম্নবর্ণিত শিক্ষার্থী। আমার অভিভাবকের বিশেষ কারণে অন্যত্র স্থানান্তরিত হতে হচ্ছে বিধায় ছাড়পত্র ও প্রশংসাপত্র গ্রহণ আবশ্যক।
        </p>
      </div>

      <!-- Student Record -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; border: 1px solid #94a3b8;">
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 28%; background: ${theme.accentBg}; font-weight: bold;">শিক্ষার্থীর পূর্ণ নাম:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 38%;">...........................................................</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 14%; background: ${theme.accentBg}; font-weight: bold;">বর্তমান শ্রেণি:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 20%;">শ্রেণি: ...... শাখা: ......</td>
        </tr>
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">পিতা ও মাতার নাম:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">পিতা: ..................... মাতা: .....................</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">রোল ও রেজিনং:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">রোল: ...... রেজি: ............</td>
        </tr>
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">ভর্তির তারিখ ও শ্রেণি:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">তারিখ: ....../....../২০...... শ্রেণি: ............</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">সর্বশেষ ফল:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">জিপিএ: ........................</td>
        </tr>
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">ছাড়পত্র চাওয়ার কারণ:</td>
          <td colspan="3" style="padding: 5px 8px; border: 1px solid #cbd5e1;">
            [ ] অভিভাবকের চাকরি বদলি &nbsp;&nbsp; [ ] স্থায়ী বাসস্থান পরিবর্তন &nbsp;&nbsp; [ ] উচ্চশিক্ষার জন্য &nbsp;&nbsp; [ ] অন্যান্য
          </td>
        </tr>
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">ভর্তি হতে ইচ্ছুক স্কুল:</td>
          <td colspan="3" style="padding: 5px 8px; border: 1px solid #cbd5e1;">................................................................................................................................</td>
        </tr>
      </table>

      <!-- 4-Branch No-Dues Clearance Table -->
      <div style="background: ${theme.accentBg}; border-left: 4px solid ${theme.primaryColor}; padding: 3px 8px; font-weight: bold; font-size: 11px; color: ${theme.primaryColor}; margin-bottom: 6px;">
        বিদ্যালয়ের সকল শাখার বকেয়া ক্লিয়ারেন্স সনদ (No Dues Clearance Certificate):
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10.5px; border: 1px solid #94a3b8; text-align: center;">
        <tr style="background: #f8fafc; font-weight: bold;">
          <td style="padding: 6px; border: 1px solid #cbd5e1; width: 25%;">১. হিসাব ও ফি শাখা</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; width: 25%;">২. কেন্দ্রীয় লাইব্রেরি</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; width: 25%;">৩. বিজ্ঞান ল্যাবরেটরি</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; width: 25%;">৪. ক্রীড়া ও রেড ক্রিসেন্ট</td>
        </tr>
        <tr>
          <td style="padding: 6px; border: 1px solid #cbd5e1; font-size: 10px; color: #475569;">
            সকল বেতন ও ফি পরিশোধিত<br/>স্বাক্ষর: .....................
          </td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; font-size: 10px; color: #475569;">
            কোনো বই বকেয়া নেই<br/>স্বাক্ষর: .....................
          </td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; font-size: 10px; color: #475569;">
            যাবতীয় সরঞ্জাম অক্ষত<br/>স্বাক্ষর: .....................
          </td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; font-size: 10px; color: #475569;">
            ক্রীড়া সামগ্রী ফেরতপ্রাপ্ত<br/>স্বাক্ষর: .....................
          </td>
        </tr>
      </table>

      <!-- Office Approval Box -->
      <div style="border: 1px dashed ${theme.primaryColor}; background: #fafafa; padding: 6px 10px; margin-bottom: 8px; font-size: 10.5px;">
        <strong>অফিস আদেশ:</strong> শিক্ষার্থীর ছাড়পত্র ও প্রশংসাপত্র প্রস্তুত ও প্রদান করা যেতে পারে।<br/>
        প্রস্তুতকারীর স্বাক্ষর: ....................................... &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; টিসি ইস্যুর তারিখ: ....../....../২০২৬
      </div>
    `;
  } else if (kind === 'fee_waiver') {
    // 4. বেতন মওকুফ ও উপবৃত্তি আবেদন ফরম
    specificBodyHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 11px; color: #64748b;">ডায়েরি নং: DHS/STP/২০২৬/........</span>
        <span style="background: ${theme.primaryColor}; color: #ffffff; padding: 5px 22px; border-radius: 4px; font-size: 13.5px; font-weight: 800;">
          বেতন মওকুফ ও উপবৃত্তি আবেদন ফরম
        </span>
        <span style="font-size: 11px; color: #64748b;">শিক্ষাবর্ষ: ২০২৬-২০২৭</span>
      </div>

      <div style="font-size: 11.5px; color: #1e293b; line-height: 1.5; margin-bottom: 10px;">
        <p style="margin: 0;"><strong>বরাবর,</strong></p>
        <p style="margin: 0;">সভাপতি / প্রধান শিক্ষক,</p>
        <p style="margin: 0;">বেতন মওকুফ ও উপবৃত্তি কমিটি, ${schoolNameBn}।</p>
        <p style="margin: 4px 0 8px 0; font-weight: bold; color: ${theme.primaryColor};">
          বিষয়: আর্থিক অস্বচ্ছলতা ও মেধার ভিত্তিতে মাসিক বেতন মওকুফ ও উপবৃত্তি পাওয়ার আবেদন।
        </p>
        <p style="margin: 0;">
          মহোদয়, বিনীত নিবেদন এই যে, আমি আপনার বিদ্যালয়ের একজন নিয়মিত ও মেধাবী শিক্ষার্থী। আমার পরিবারের আর্থিক সীমাবদ্ধতার কারণে লেখাপড়ার ব্যয় নির্বাহ কষ্টসাধ্য হয়ে পড়েছে।
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; border: 1px solid #94a3b8;">
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 28%; background: ${theme.accentBg}; font-weight: bold;">শিক্ষার্থীর নাম ও রোল:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 40%;">নাম: ....................................... রোল: ........</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 14%; background: ${theme.accentBg}; font-weight: bold;">শ্রেণি ও শাখা:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 18%;">শ্রেণি: ...... শাখা: ......</td>
        </tr>
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">বিগত পরীক্ষার ফলাফল:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">মোট প্রাপ্ত নম্বর: ............ জিপিএ: ............</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">মেধাক্রম:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">শাখা স্থান: ............</td>
        </tr>
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">পিতার নাম ও পেশা:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">পিতা: ................................. পেশা: ................</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">মাসিক আয়:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">টাকা: ................</td>
        </tr>
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">পরিবারের সদস্য সংখ্যা:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">মোট সদস্য: ........ জন (ভাইবোন: ........ জন)</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">অধ্যয়নরত:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">........ জন শিক্ষার্থী</td>
        </tr>
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">জমি ও বসতভিটার বিবরণ:</td>
          <td colspan="3" style="padding: 5px 8px; border: 1px solid #cbd5e1;">
            বসতভিটা: [ ] নিজস্ব [ ] ভাড়া | আবাদি জমির পরিমাণ: ................ শতাংশ
          </td>
        </tr>
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">অন্যান্য সরকারি উপবৃত্তি:</td>
          <td colspan="3" style="padding: 5px 8px; border: 1px solid #cbd5e1;">
            অন্য কোনো সরকারি/বেসরকারি উপবৃত্তি পাওয়া হয় কি না: [ ] হ্যাঁ [ ] না (হলে বিবরণ: ....................)
          </td>
        </tr>
      </table>

      <!-- Local Representative Attestation -->
      <div style="border: 1px solid ${theme.borderColor}; background: #fefce8; padding: 8px 12px; margin-bottom: 10px; font-size: 10.5px;">
        <strong style="color: ${theme.primaryColor};">ইউপি চেয়ারম্যান / ওয়ার্ড কাউন্সিলরের প্রত্যয়ন:</strong><br/>
        আমি প্রত্যয়ন করছি যে, বর্ণিত শিক্ষার্থী ও তাহার পরিবারের আর্থিক অবস্থা অস্বচ্ছল। তার মাসিক পারিবারিক আয় সর্বোচ্চ .................... টাকা।<br/>
        চেয়ারম্যান/কাউন্সিলরের স্বাক্ষর ও সিল: .................................................... তারিখ: ....../....../২০২৬
      </div>

      <!-- Committee Recommendation -->
      <div style="border: 1px dashed ${theme.primaryColor}; background: #fafafa; padding: 6px 10px; margin-bottom: 8px; font-size: 10.5px;">
        <strong>উপবৃত্তি ও বেতন মওকুফ কমিটির সুপারিশ:</strong><br/>
        [ ] পূর্ণ বেতন মওকুফ (Full Free) &nbsp;&nbsp;&nbsp; [ ] অর্ধ বেতন মওকুফ (Half Free) &nbsp;&nbsp;&nbsp; [ ] এককালীন অনুদান<br/>
        আহ্বায়ক ও কমিটির সদস্যদের স্বাক্ষর: .................................................................
      </div>
    `;
  } else if (kind === 'character_cert') {
    // 5. প্রত্যয়নপত্র আবেদন ফরম
    specificBodyHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <span style="font-size: 11px; color: #64748b;">স্মারক নং: DHS/CERT/২০২৬/........</span>
        <span style="background: ${theme.primaryColor}; color: #ffffff; padding: 5px 22px; border-radius: 4px; font-size: 13.5px; font-weight: 800;">
          প্রত্যয়নপত্র (Clearance/Character) আবেদন ফরম
        </span>
        <span style="font-size: 11px; color: #64748b;">তারিখ: ....../....../২০২৬</span>
      </div>

      <div style="font-size: 11.5px; color: #1e293b; line-height: 1.6; margin-bottom: 12px;">
        <p style="margin: 0;"><strong>বরাবর,</strong></p>
        <p style="margin: 0;">প্রধান শিক্ষক,</p>
        <p style="margin: 0;">${schoolNameBn}, জয়পুরহাট।</p>
        <p style="margin: 6px 0 10px 0; font-weight: bold; color: ${theme.primaryColor};">
          বিষয়: চারিত্রিক ও অধ্যয়নরত প্রত্যয়নপত্র (Character / Student Certificate) প্রাপ্তির আবেদন।
        </p>
        <p style="margin: 0;">
          মহোদয়, বিনীত নিবেদন এই যে, আমি আপনার বিদ্যালয়ের একজন নিয়মিত ছাত্র/ছাত্রী। আমার নিম্নবর্ণিত জরুরি প্রয়োজনে প্রাতিষ্ঠানিক প্রত্যয়নপত্র প্রয়োজন হচ্ছে।
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11.5px; border: 1px solid #94a3b8;">
        <tr>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; width: 28%; background: ${theme.accentBg}; font-weight: bold;">শিক্ষার্থীর পূর্ণ নাম:</td>
          <td colspan="3" style="padding: 7px 10px; border: 1px solid #cbd5e1;">................................................................................................................</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">পিতা ও মাতার নাম:</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; width: 38%;">পিতা: ..................... মাতা: .....................</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; width: 14%; background: ${theme.accentBg}; font-weight: bold;">জন্ম তারিখ:</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; width: 20%;">...... / ...... / ............</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">বর্তমান শ্রেণি ও শাখা:</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1;">শ্রেণি: ............ শাখা: ........ রোল: ........</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">রেজিস্ট্রেশন নং:</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1;">................................</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">প্রত্যয়নের উদ্দেশ্য / ব্যবহার:</td>
          <td colspan="3" style="padding: 7px 10px; border: 1px solid #cbd5e1;">
            [ ] পাসপোর্ট তৈরি &nbsp;&nbsp;&nbsp; [ ] জাতীয় পরিচয়পত্র (NID) &nbsp;&nbsp;&nbsp; [ ] ব্যাংক একাউন্ট খোলা &nbsp;&nbsp;&nbsp; [ ] স্কলারশিপ / বৃত্তি
          </td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">চারিত্রিক স্বভাব ও আচরণ:</td>
          <td colspan="3" style="padding: 7px 10px; border: 1px solid #cbd5e1;">
            আমার জানা মতে শিক্ষার্থী রাষ্ট্রবিরোধী বা শৃঙ্খলা পরিপন্থী কোনো কাজের সহিত জড়িত নয়। তাহার স্বভাব চরিত্র অত্যন্ত উত্তম।
          </td>
        </tr>
      </table>

      <p style="font-size: 11.5px; color: #1e293b; margin: 8px 0 16px 0;">
        অতএব, মহোদয়ের নিকট প্রার্থনা, আমাকে উক্ত প্রত্যয়নপত্রটি প্রদান করে বাধিত করবেন।
      </p>

      <div style="border: 1px solid ${theme.borderColor}; background: #f0fdf4; padding: 10px 14px; border-radius: 6px; margin-bottom: 14px; font-size: 11px;">
        <strong style="color: ${theme.primaryColor};">শ্রেণি শিক্ষকের মন্তব্য:</strong><br/>
        শিক্ষার্থীর নাম, পিতার নাম ও জন্ম তারিখ বিদ্যালয়ের ভর্তি রেজিস্টারের সাথে যাচাই করা হলো। প্রত্যয়নপত্র প্রদান সমীচীন।<br/>
        শ্রেণি শিক্ষকের স্বাক্ষর ও তারিখ: .................................................................
      </div>
    `;
  } else if (kind === 'subject_change') {
    // 6. বিষয় ও বিভাগ পরিবর্তন আবেদন ফরম (৯ম শ্রেণি)
    specificBodyHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 11px; color: #64748b;">বোর্ড রেজি সেশন: ২০২৬-২০২৭</span>
        <span style="background: ${theme.primaryColor}; color: #ffffff; padding: 5px 22px; border-radius: 4px; font-size: 13.5px; font-weight: 800;">
          বিষয় ও বিভাগ পরিবর্তন আবেদন ফরম (৯ম শ্রেণি)
        </span>
        <span style="font-size: 11px; color: #64748b;">তারিখ: ....../....../২০২৬</span>
      </div>

      <div style="font-size: 11.5px; color: #1e293b; line-height: 1.5; margin-bottom: 10px;">
        <p style="margin: 0;"><strong>বরাবর,</strong></p>
        <p style="margin: 0;">প্রধান শিক্ষক,</p>
        <p style="margin: 0;">${schoolNameBn}, জয়পুরহাট।</p>
        <p style="margin: 4px 0 8px 0; font-weight: bold; color: ${theme.primaryColor};">
          বিষয়: ৯ম শ্রেণিতে বিভাগ (Science/Humanities/Business) অথবা ৪র্থ বিষয় পরিবর্তনের জন্য আবেদন।
        </p>
        <p style="margin: 0;">
          মহোদয়, বিনীত নিবেদন এই যে, আমি আপনার বিদ্যালয়ের ৯ম শ্রেণির একজন শিক্ষার্থী। আমার বর্তমান বিষয়ের পরিবর্তে কাঙ্ক্ষিত নতুন বিষয় অধ্যয়নের লক্ষ্যে নিম্নরূপ পরিবর্তন প্রার্থনা করছি।
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; border: 1px solid #94a3b8;">
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 28%; background: ${theme.accentBg}; font-weight: bold;">শিক্ষার্থীর পূর্ণ নাম:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 38%;">...........................................................</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 14%; background: ${theme.accentBg}; font-weight: bold;">শাখা ও রোল:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 20%;">শাখা: ...... রোল: ......</td>
        </tr>
        <tr>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">৮ম শ্রেণির বার্ষিক ফল:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">মোট জিপিএ: ............ গণিত: ...... বিজ্ঞান: ......</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">রেজিস্ট্রেশন নং:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">................................</td>
        </tr>
      </table>

      <!-- Change Mapping Table -->
      <div style="background: ${theme.accentBg}; border-left: 4px solid ${theme.primaryColor}; padding: 3px 8px; font-weight: bold; font-size: 11px; color: ${theme.primaryColor}; margin-bottom: 6px;">
        বিষয় ও বিভাগ পরিবর্তনের সুনির্দিষ্ট বিবরণ ছক:
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; border: 1px solid #94a3b8; text-align: center;">
        <tr style="background: #f8fafc; font-weight: bold;">
          <td style="padding: 6px; border: 1px solid #cbd5e1; width: 30%;">বিবরণ</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; width: 35%;">বর্তমান নির্ধারিত বিষয়/বিভাগ</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; width: 35%;">কাঙ্ক্ষিত নতুন বিষয়/বিভাগ</td>
        </tr>
        <tr>
          <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; text-align: left; background: #fafafa;">মূল বিভাগ (Group):</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1;">[ ] বিজ্ঞান &nbsp; [ ] মানবিক &nbsp; [ ] ব্যবসায় শিক্ষা</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; color: ${theme.primaryColor}; font-weight: bold;">[ ] বিজ্ঞান &nbsp; [ ] মানবিক &nbsp; [ ] ব্যবসায় শিক্ষা</td>
        </tr>
        <tr>
          <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; text-align: left; background: #fafafa;">ঐচ্ছিক / ৪র্থ বিষয় (4th Subject):</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1;">............................................................</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; color: ${theme.primaryColor}; font-weight: bold;">............................................................</td>
        </tr>
        <tr>
          <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; text-align: left; background: #fafafa;">পরিবর্তনের যৌক্তিক কারণ:</td>
          <td colspan="2" style="padding: 6px; border: 1px solid #cbd5e1; text-align: left;">
            ........................................................................................................................................................
          </td>
        </tr>
      </table>

      <!-- Guardian Consent Box -->
      <div style="border: 1px solid ${theme.borderColor}; background: #fff1f2; padding: 6px 12px; margin-bottom: 8px; font-size: 10.5px;">
        <strong style="color: ${theme.primaryColor};">অভিভাবকের লিখিত সম্মতি:</strong><br/>
        আমি স্বেচ্ছায় ও স্বজ্ঞানে আমার সন্তানের বিষয়/বিভাগ পরিবর্তনের অনুমতি প্রদান করছি। ইহাতে কোনো ক্ষতি হইলে প্রতিষ্ঠান দায়ী থাকবে না।<br/>
        অভিভাবকের স্বাক্ষর ও তারিখ: .................................................... মোবাইল: ....................................................
      </div>

      <!-- Teachers Consent -->
      <div style="border: 1px dashed ${theme.primaryColor}; background: #fafafa; padding: 6px 10px; margin-bottom: 8px; font-size: 10.5px;">
        <strong>সংশ্লিষ্ট বিষয় শিক্ষকের মতামত:</strong> শিক্ষার্থীর প্রস্তুতি অনুযায়ী পরিবর্তন মঞ্জুর করা যুক্তিযুক্ত।<br/>
        বিষয় শিক্ষকের স্বাক্ষর: ....................................... &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; শ্রেণি শিক্ষকের স্বাক্ষর: .......................................
      </div>
    `;
  } else {
    // 7. সাধারণ / প্রাতিষ্ঠানিক ফরম (General Form)
    specificBodyHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 11px; color: #64748b;">স্মারক নং: DHS/DOC/২০২৬/........</span>
        <span style="background: ${theme.primaryColor}; color: #ffffff; padding: 5px 22px; border-radius: 4px; font-size: 13.5px; font-weight: 800;">
          ${form.title}
        </span>
        <span style="font-size: 11px; color: #64748b;">আপডেট: ${form.updatedDate || '২০২৬'}</span>
      </div>

      <div style="font-size: 11.5px; color: #1e293b; line-height: 1.6; margin-bottom: 10px;">
        <p style="margin: 0;"><strong>বরাবর,</strong></p>
        <p style="margin: 0;">প্রধান শিক্ষক,</p>
        <p style="margin: 0;">${schoolNameBn}, জয়পুরহাট।</p>
        <p style="margin: 4px 0 8px 0; font-weight: bold; color: ${theme.primaryColor};">
          বিষয়: ${form.title} প্রসঙ্গে আবেদন।
        </p>
        <p style="margin: 0;">
          মহোদয়, বিনীত নিবেদন এই যে, আমি আপনার বিদ্যালয়ের একজন শিক্ষার্থী/অভিভাবক। প্রাতিষ্ঠানিক প্রয়োজনীয় তথ্যাবলী নিচে লিপিবদ্ধ করা হলো:
        </p>
      </div>

      ${
        form.description
          ? `<div style="background: ${theme.accentBg}; border-left: 4px solid ${theme.primaryColor}; padding: 8px 12px; margin-bottom: 10px; font-size: 11.5px; color: #334155;">
              <strong>ফরম সংক্রান্ত নির্দেশনা:</strong> ${form.description}
            </div>`
          : ''
      }

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11.5px; border: 1px solid #94a3b8;">
        <tr>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; width: 30%; background: ${theme.accentBg}; font-weight: bold;">শিক্ষার্থী / আবেদনকারীর নাম:</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1;">................................................................................................</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">শ্রেণি, শাখা ও রোল:</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1;">শ্রেণি: .................... শাখা: .................... রোল: ....................</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">পিতা ও মাতার নাম:</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1;">পিতা: ....................................... মাতা: .......................................</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">বর্তমান ও স্থায়ী ঠিকানা:</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1;">................................................................................................</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">যোগাযোগের মোবাইল:</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1;">................................................................................................</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; background: ${theme.accentBg}; font-weight: bold;">আবেদনের কারণ ও বিস্তারিত বিবরণ:</td>
          <td style="padding: 7px 10px; border: 1px solid #cbd5e1; height: 60px; vertical-align: top;">
            ................................................................................................................................<br/>
            ................................................................................................................................
          </td>
        </tr>
      </table>

      <p style="font-size: 11.5px; color: #1e293b; margin: 8px 0 16px 0;">
        অতএব, মহোদয়ের নিকট প্রার্থনা, অনুগ্রহপূর্বক আমার উক্ত আবেদনটি অনুমোদন করতে মর্জি হয়।
      </p>
    `;
  }

  // Common Signature & Official Seal Footer
  const renderSignatures = () => `
    <div style="flex-shrink: 0; margin-top: 18px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px;">
        <div style="text-align: center; width: 160px;">
          <div style="border-bottom: 1px dashed #64748b; height: 32px; margin-bottom: 3px;"></div>
          <span style="font-size: 10.5px; font-weight: bold; color: #334155;">অভিভাবকের স্বাক্ষর ও তারিখ</span>
        </div>

        <div style="width: 72px; height: 72px; border: 2px dashed ${theme.primaryColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 8px; font-weight: 800; color: ${theme.primaryColor}; transform: rotate(-7deg); opacity: 0.85;">
          বিদ্যালয়<br/>অফিসিয়াল<br/>সিলমোহর
        </div>

        <div style="text-align: center; width: 160px;">
          <div style="border-bottom: 1px dashed #64748b; height: 32px; margin-bottom: 3px;"></div>
          <span style="font-size: 10.5px; font-weight: bold; color: #334155;">আবেদনকারীর স্বাক্ষর ও তারিখ</span>
        </div>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <span style="font-size: 10px; color: #64748b;">শ্রেণি শিক্ষকের মন্তব্য ও প্রতিস্বাক্ষর: .......................................</span>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 11.5px; font-weight: bold; color: ${theme.primaryColor};">প্রধান শিক্ষক</p>
          <p style="margin: 0; font-size: 10px; color: #64748b;">${schoolNameBn}</p>
        </div>
      </div>
    </div>
  `;

  return `
    <div class="official-form-sheet" style="font-family: 'Hind Siliguri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.5; width: 794px; max-width: 794px; min-height: 1123px; margin: 0 auto; background: #ffffff; padding: 34px 42px; box-sizing: border-box; text-align: left; display: flex; flex-direction: column; justify-content: space-between; border: 1.5px solid ${theme.borderColor}; position: relative;">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&display=swap');
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
          position: relative !important;
        }
        .official-form-sheet, .official-form-sheet * {
          font-family: 'Hind Siliguri', 'SolaimanLipi', 'Kalpurush', -apple-system, BlinkMacSystemFont, sans-serif !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      </style>

      <!-- Watermark Background -->
      <div style="position: absolute; left: 50%; top: 52%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 55px; font-weight: 900; color: rgba(15, 23, 42, 0.03); pointer-events: none; white-space: nowrap; z-index: 0; user-select: none;">
        ${schoolNameBn}
      </div>

      <!-- Main Form Wrapper -->
      <div style="flex: 1 0 auto; position: relative; z-index: 1;">
        ${renderHeader()}
        ${specificBodyHtml}
      </div>

      <!-- Signatures Footer -->
      <div style="position: relative; z-index: 1;">
        ${renderSignatures()}
      </div>
    </div>
  `;
};

/**
 * Downloads Editable MS Word Document (.docx / .doc)
 * - If user uploaded a .docx / .doc from device, triggers real file download directly.
 * - Otherwise, generates a fully formatted editable Microsoft Word document matching the specific form structure.
 */
export const downloadEditableForm = (
  form: DownloadableForm,
  siteSettings?: Partial<SiteSettings>
): void => {
  const safeTitle = (form.title || 'Form').replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');

  // If user uploaded a real file (e.g. .docx / .doc), download that directly!
  if (form.fileUrl) {
    const ext = form.fileName?.split('.').pop() || (form.fileType?.toLowerCase() === 'pdf' ? 'pdf' : 'docx');
    const targetName = form.fileName || `${safeTitle}.${ext}`;
    triggerFileDownload(form.fileUrl, targetName);
    return;
  }

  // Otherwise, construct a rich editable Word document (.docx / .doc) matching the form
  const schoolNameBn = siteSettings?.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়';
  const schoolNameEn = siteSettings?.schoolNameEnglish || 'Dadra High School';
  const address = siteSettings?.address || 'দাদরা, জয়পুরহাট সদর, জয়পুরহাট';
  const phone = siteSettings?.phone1 || '০১৭১২-৩৪৫৬৭৮';
  const email = siteSettings?.email || 'info@dadrahs.edu.bd';
  const estd = siteSettings?.establishedYear || '১৯৮২';
  const kind = getFormKind(form.title, form.category);
  const theme = getFormTheme(kind);

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
        h1 { font-size: 18pt; color: ${theme.primaryColor}; margin: 0; text-align: center; }
        h2 { font-size: 12pt; color: #475569; margin: 2pt 0; text-align: center; text-transform: uppercase; }
        .meta-p { font-size: 9pt; color: #64748b; margin: 3pt 0 8pt 0; text-align: center; }
        .title-box {
          background-color: ${theme.primaryColor};
          color: #ffffff;
          padding: 6pt 16pt;
          text-align: center;
          font-size: 13pt;
          font-weight: bold;
          margin: 10pt auto;
          display: block;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8pt;
          margin-bottom: 10pt;
        }
        th, td {
          border: 1px solid #777777;
          padding: 6pt 8pt;
          font-size: 10pt;
        }
        .header-cell {
          background-color: ${theme.accentBg};
          font-weight: bold;
          width: 30%;
        }
      </style>
    </head>
    <body>
      <h1>${schoolNameBn}</h1>
      <h2>${schoolNameEn}</h2>
      <p class="meta-p">${address} • স্থাপিত: ${estd} • EIIN: ১২৩৪৫৬ • ফোন: ${phone} • ইমেইল: ${email}</p>
      <hr style="border: 1.5px solid ${theme.primaryColor};" />

      <div class="title-box">${form.title}</div>

      <p><strong>ক্যাটাগরি:</strong> ${form.category} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>আপডেট:</strong> ${form.updatedDate || '২০২৬'}</p>
      ${form.description ? `<p><strong>নির্দেশনা:</strong> ${form.description}</p>` : ''}

      <p style="margin-top: 14pt;"><strong>বরাবর,</strong><br/>প্রধান শিক্ষক<br/>${schoolNameBn}, জয়পুরহাট।</p>
      <p><strong>বিষয়:</strong> ${form.title} প্রসঙ্গে আবেদন।</p>

      <p>মহোদয়,<br/>বিনীত নিবেদন এই যে, আমি আপনার বিদ্যালয়ের একজন শিক্ষার্থী/অভিভাবক। আমার প্রয়োজনীয় তথ্যাবলী নিচে দেওয়া হলো:</p>

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
          <td class="header-cell">পিতার নাম ও মোবাইল:</td>
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
          <td class="header-cell">আবেদনের কারণ ও বিবরণ:</td>
          <td style="height: 50pt;">&nbsp;</td>
        </tr>
      </table>

      <p>অতএব, মহোদয়ের নিকট প্রার্থনা, অনুগ্রহপূর্বক আমার উক্ত আবেদনটি মঞ্জুর করতে মর্জি হয়।</p>

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
          <td colspan="2" style="border: none; text-align: right; padding-top: 35pt;">
            <p>
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
    type: 'application/vnd.ms-word;charset=utf-8',
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
 * Robust Native Print for School Forms (100% Crisp A4 Portrait)
 */
export const printForm = (
  form: DownloadableForm,
  siteSettings?: Partial<SiteSettings>
): void => {
  try {
    const formHtml = buildFormHtml(form, siteSettings);

    // Remove existing print container if present
    const existingPrintContainer = document.getElementById('printable-school-form');
    if (existingPrintContainer && existingPrintContainer.parentElement) {
      existingPrintContainer.parentElement.removeChild(existingPrintContainer);
    }

    // Create printable container directly in body
    const printDiv = document.createElement('div');
    printDiv.id = 'printable-school-form';
    printDiv.innerHTML = formHtml;
    document.body.appendChild(printDiv);

    // Activate print class on body
    document.body.classList.add('printing-active-form');

    const cleanUp = () => {
      document.body.classList.remove('printing-active-form');
      if (document.body.contains(printDiv)) {
        document.body.removeChild(printDiv);
      }
      window.removeEventListener('afterprint', cleanUp);
    };

    window.addEventListener('afterprint', cleanUp);

    // Try iframe print first for smoother preview, with fallback to window.print
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
          <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
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
          setTimeout(cleanUp, 1500);
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

    window.print();
  } catch (err) {
    console.error('Print form error:', err);
    window.print();
  }
};

/**
 * Generates and downloads official A4 Portrait PDF with 100% Bengali Unicode Support
 */
export const downloadFormPdf = async (
  form: DownloadableForm,
  siteSettings?: Partial<SiteSettings>
): Promise<boolean> => {
  // If user uploaded a real PDF from device, download that directly!
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

    // Ensure Unicode Bengali fonts are loaded
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
        skipFonts: false,
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
