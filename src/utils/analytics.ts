/**
 * Unified Analytics & Pixel Dispatcher
 * Dispatches to:
 * 1. Google Tag Manager (window.dataLayer)
 * 2. Meta / Facebook Pixel (window.fbq)
 * 3. Google Analytics 4 (window.gtag)
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

/**
 * Generic custom event dispatcher for GTM, Facebook Pixel & GA4
 */
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...params,
  };

  if (typeof window !== 'undefined') {
    // 1. Google Tag Manager dataLayer push
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);

    // 2. Google Analytics 4 direct gtag dispatch
    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', eventName, payload);
      } catch (err) {
        console.warn(`[GA4 Error] Failed to track ${eventName}:`, err);
      }
    }

    // 3. Meta / Facebook Pixel custom event dispatch
    if (typeof window.fbq === 'function') {
      try {
        window.fbq('trackCustom', eventName, payload);
      } catch (err) {
        console.warn(`[Facebook Pixel Error] Failed to track ${eventName}:`, err);
      }
    }

    // Debug in development mode
    if (import.meta.env.DEV) {
      console.log(`[Unified Analytics Event] ${eventName}:`, payload);
    }
  }
};

/**
 * Dispatch Meta / Facebook standard event (e.g. Lead, Search, Contact, ViewContent)
 */
export const trackFacebookStandard = (standardEvent: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', standardEvent, params);
      if (import.meta.env.DEV) {
        console.log(`[Facebook Pixel Standard] ${standardEvent}:`, params);
      }
    } catch (err) {
      console.warn(`[Facebook Pixel Standard Error] Failed to track ${standardEvent}:`, err);
    }
  }
};

/**
 * 0. Per-Page Custom Event Tracker for both Facebook & Tag Manager
 */
export const trackPageVisit = (pageKey: string, pageTitle?: string) => {
  const normalizedKey = (pageKey || 'home').replace(/[^a-zA-Z0-9_]/g, '_');
  const title = pageTitle || document.title || normalizedKey;

  // 1. GTM & GA4 Page Specific Event
  trackEvent(`page_view_${normalizedKey}`, {
    page_key: pageKey,
    page_title: title,
    page_location: typeof window !== 'undefined' ? window.location.href : '',
  });

  // 2. GTM Virtual Page View
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'virtual_page_view',
      page_section: pageKey,
      page_title: title,
    });
  }

  // 3. Facebook Pixel PageView & Custom Page Event
  trackFacebookStandard('PageView');
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('trackCustom', `View_Page_${normalizedKey}`, {
        page_section: pageKey,
        page_title: title,
      });
    } catch (e) {
      // ignore
    }
  }
};

/**
 * 1. Track Academic Result Search
 */
export const trackResultSearch = (details: {
  roll: string;
  studentClass: string;
  examTerm: string;
  found?: boolean;
}) => {
  trackEvent('result_search', {
    event_category: 'Academic Results',
    student_class: details.studentClass,
    exam_term: details.examTerm,
    roll_number: details.roll,
    result_found: details.found ? 'yes' : 'no',
  });

  // Facebook Standard Search Event
  trackFacebookStandard('Search', {
    search_string: `Class ${details.studentClass} Roll ${details.roll}`,
    content_category: 'Academic Results',
  });
};

/**
 * 2. Track Result / Marksheet PDF Download
 */
export const trackResultDownload = (details: {
  studentName?: string;
  roll: string;
  studentClass: string;
  gpa?: string | number;
}) => {
  trackEvent('result_download', {
    event_category: 'Academic Results',
    student_class: details.studentClass,
    roll_number: details.roll,
    student_name: details.studentName || 'Student',
    gpa: details.gpa || 'N/A',
  });

  trackFacebookStandard('ViewContent', {
    content_name: `Marksheet - ${details.studentName || 'Student'}`,
    content_category: details.studentClass,
  });
};

/**
 * 3. Track Admit Card Search & Download
 */
export const trackAdmitCardSearch = (details: {
  roll: string;
  studentClass: string;
  examTerm?: string;
  found?: boolean;
}) => {
  trackEvent('admit_card_search', {
    event_category: 'Admit Card',
    student_class: details.studentClass,
    roll_number: details.roll,
    exam_term: details.examTerm || 'Current Exam',
    found: details.found ? 'yes' : 'no',
  });

  trackFacebookStandard('Search', {
    search_string: `Admit Card ${details.studentClass} Roll ${details.roll}`,
    content_category: 'Admit Card',
  });
};

export const trackAdmitCardDownload = (details: {
  roll: string;
  studentClass: string;
  studentName?: string;
}) => {
  trackEvent('admit_card_download', {
    event_category: 'Admit Card',
    student_class: details.studentClass,
    roll_number: details.roll,
    student_name: details.studentName || 'Student',
  });

  trackFacebookStandard('ViewContent', {
    content_name: `Admit Card - ${details.studentName || 'Student'}`,
    content_category: details.studentClass,
  });
};

/**
 * 4. Track Online Admission Form Submissions & Modal Open
 */
export const trackAdmissionSubmit = (details: {
  applicantName: string;
  applyingClass: string;
  group?: string;
  phone?: string;
}) => {
  trackEvent('admission_form_submit', {
    event_category: 'Admissions',
    applicant_name: details.applicantName,
    applying_class: details.applyingClass,
    academic_group: details.group || 'General',
    value: 1,
  });

  // Facebook High-Value Standard Lead Event
  trackFacebookStandard('Lead', {
    content_name: 'Online Admission Application',
    content_category: details.applyingClass,
    value: 1,
    currency: 'BDT',
  });

  trackFacebookStandard('SubmitApplication', {
    content_name: details.applicantName,
    content_category: details.applyingClass,
  });
};

export const trackAdmissionModalOpen = () => {
  trackEvent('admission_modal_open', {
    event_category: 'Admissions',
  });

  trackFacebookStandard('InitiateCheckout', {
    content_name: 'Online Admission Modal Open',
    content_category: 'Admissions',
  });
};

/**
 * 5. Track Contact Form Message Submission
 */
export const trackContactSubmit = (details?: {
  name?: string;
  subject?: string;
}) => {
  trackEvent('contact_form_submit', {
    event_category: 'Contact',
    sender_name: details?.name || 'Visitor',
    message_subject: details?.subject || 'General Inquiry',
    value: 1,
  });

  // Facebook Standard Contact Event
  trackFacebookStandard('Contact', {
    content_name: details?.subject || 'General Inquiry',
  });
};

/**
 * 6. Track Download of Official Forms / PDFs
 */
export const trackFormDownload = (details: {
  formTitle: string;
  category?: string;
  fileType?: string;
}) => {
  trackEvent('file_download', {
    event_category: 'Downloads',
    form_title: details.formTitle,
    form_category: details.category || 'Forms',
    file_type: details.fileType || 'PDF',
  });

  trackFacebookStandard('ViewContent', {
    content_name: details.formTitle,
    content_category: details.category || 'Forms',
  });
};

/**
 * 7. Track Notice View / Notice Download
 */
export const trackNoticeView = (details: {
  noticeId: string;
  noticeTitle: string;
  category?: string;
}) => {
  trackEvent('notice_view', {
    event_category: 'Notices',
    notice_id: details.noticeId,
    notice_title: details.noticeTitle,
    notice_category: details.category || 'General',
  });

  trackFacebookStandard('ViewContent', {
    content_name: details.noticeTitle,
    content_category: 'Notices',
  });
};

/**
 * 8. Track Social Media Link Clicks
 */
export const trackSocialClick = (platform: 'facebook' | 'youtube' | 'instagram' | 'whatsapp' | 'linkedin') => {
  trackEvent('social_click', {
    event_category: 'Social Media',
    platform_name: platform,
  });

  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('trackCustom', 'Click_Social_Link', { platform });
  }
};

/**
 * 9. Track Direct Call & Email Clicks
 */
export const trackContactAction = (actionType: 'call' | 'email', destination: string) => {
  trackEvent('contact_direct_action', {
    event_category: 'Contact',
    action_type: actionType,
    destination: destination,
  });
};
