/**
 * Bengali numbers and date formatting utilities
 */

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const BENGALI_MONTHS: Record<number, string> = {
  1: 'জানুয়ারি',
  2: 'ফেব্রুয়ারি',
  3: 'মার্চ',
  4: 'এপ্রিল',
  5: 'মে',
  6: 'জুন',
  7: 'জুলাই',
  8: 'আগস্ট',
  9: 'সেপ্টেম্বর',
  10: 'অক্টোবর',
  11: 'নভেম্বর',
  12: 'ডিসেম্বর',
};

const ENGLISH_MONTH_TO_NUM: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

/**
 * Convert any English digits in string or number to Bengali digits
 */
export function toBengaliDigits(input: number | string | undefined | null): string {
  if (input === undefined || input === null) return '';
  const str = String(input);
  return str.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[parseInt(digit, 10)]);
}

/**
 * Format any date string or Date object to pure Bengali: e.g. "১৫ অক্টোবর ২০২৬"
 */
export function formatBengaliDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '';

  let dateObj: Date | null = null;
  let day: number | null = null;
  let month: number | null = null;
  let year: number | null = null;

  if (dateInput instanceof Date) {
    dateObj = dateInput;
    day = dateObj.getDate();
    month = dateObj.getMonth() + 1;
    year = dateObj.getFullYear();
  } else {
    const raw = String(dateInput).trim();

    // Check if format is "DD Mon YYYY" like "15 Oct 2026" or "15 OCT 2026"
    const textMonthMatch = raw.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
    if (textMonthMatch) {
      day = parseInt(textMonthMatch[1], 10);
      const mName = textMonthMatch[2].toLowerCase();
      month = ENGLISH_MONTH_TO_NUM[mName] || 1;
      year = parseInt(textMonthMatch[3], 10);
    } else {
      // Check for YYYY-MM-DD
      const isoMatch = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (isoMatch) {
        year = parseInt(isoMatch[1], 10);
        month = parseInt(isoMatch[2], 10);
        day = parseInt(isoMatch[3], 10);
      } else {
        // Check for DD-MM-YYYY or DD/MM/YYYY
        const dmyMatch = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
        if (dmyMatch) {
          day = parseInt(dmyMatch[1], 10);
          month = parseInt(dmyMatch[2], 10);
          year = parseInt(dmyMatch[3], 10);
        } else {
          // Fallback parsing
          const parsed = new Date(raw);
          if (!isNaN(parsed.getTime())) {
            day = parsed.getDate();
            month = parsed.getMonth() + 1;
            year = parsed.getFullYear();
          }
        }
      }
    }
  }

  if (day && month && year && BENGALI_MONTHS[month]) {
    return `${toBengaliDigits(day)} ${BENGALI_MONTHS[month]} ${toBengaliDigits(year)}`;
  }

  // If already contains Bengali month name or unparseable, just replace any english digits
  return toBengaliDigits(String(dateInput));
}

/**
 * Breakdown for notice badge: day in Bengali and month name in Bengali
 */
export function getBengaliDateParts(dateInput: string | Date | undefined | null): {
  dayBangla: string;
  monthBangla: string;
  yearBangla: string;
  fullBangla: string;
} {
  if (!dateInput) {
    return { dayBangla: '', monthBangla: '', yearBangla: '', fullBangla: '' };
  }

  let day: number | null = null;
  let month: number | null = null;
  let year: number | null = null;

  if (dateInput instanceof Date) {
    day = dateInput.getDate();
    month = dateInput.getMonth() + 1;
    year = dateInput.getFullYear();
  } else {
    const raw = String(dateInput).trim();
    const textMonthMatch = raw.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
    if (textMonthMatch) {
      day = parseInt(textMonthMatch[1], 10);
      month = ENGLISH_MONTH_TO_NUM[textMonthMatch[2].toLowerCase()] || 1;
      year = parseInt(textMonthMatch[3], 10);
    } else {
      const isoMatch = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (isoMatch) {
        year = parseInt(isoMatch[1], 10);
        month = parseInt(isoMatch[2], 10);
        day = parseInt(isoMatch[3], 10);
      } else {
        const dmyMatch = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
        if (dmyMatch) {
          day = parseInt(dmyMatch[1], 10);
          month = parseInt(dmyMatch[2], 10);
          year = parseInt(dmyMatch[3], 10);
        } else {
          const parsed = new Date(raw);
          if (!isNaN(parsed.getTime())) {
            day = parsed.getDate();
            month = parsed.getMonth() + 1;
            year = parsed.getFullYear();
          }
        }
      }
    }
  }

  if (day && month && year && BENGALI_MONTHS[month]) {
    const dayBangla = toBengaliDigits(day);
    const monthBangla = BENGALI_MONTHS[month];
    const yearBangla = toBengaliDigits(year);
    return {
      dayBangla,
      monthBangla,
      yearBangla,
      fullBangla: `${dayBangla} ${monthBangla} ${yearBangla}`,
    };
  }

  const converted = toBengaliDigits(String(dateInput));
  return {
    dayBangla: converted,
    monthBangla: '',
    yearBangla: '',
    fullBangla: converted,
  };
}
