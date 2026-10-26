/**
 * Google Analytics 4 (GA4) Custom Event Tracking Utilities
 * Automatically dispatches events to window.gtag if active.
 */

// Declare global window gtag
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Generic custom event dispatcher for Google Analytics
 */
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, {
        timestamp: new Date().toISOString(),
        ...params,
      });
      // Debug in development mode
      if (import.meta.env.DEV) {
        console.log(`[GA4 Event] ${eventName}:`, params);
      }
    } catch (err) {
      console.warn(`[GA4 Error] Failed to track ${eventName}:`, err);
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
};

/**
 * 4. Track Online Admission Form Submissions
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
};

export const trackAdmissionModalOpen = () => {
  trackEvent('admission_modal_open', {
    event_category: 'Admissions',
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
};

/**
 * 8. Track Social Media Link Clicks
 */
export const trackSocialClick = (platform: 'facebook' | 'youtube' | 'instagram' | 'whatsapp' | 'linkedin') => {
  trackEvent('social_click', {
    event_category: 'Social Media',
    platform_name: platform,
  });
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
