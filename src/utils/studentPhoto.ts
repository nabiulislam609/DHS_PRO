import { Student, ExamResult } from '../types';

/**
 * High-quality portraits for school students
 */
const STUDENT_PORTRAITS: Record<string, string> = {
  sadia: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&h=300&fit=crop&crop=faces&q=80',
  tanvir: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=faces&q=80',
  nusrat: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=faces&q=80',
  rafsan: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces&q=80',
  sumaiya: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=faces&q=80',
  faria: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces&q=80',
  sakib: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces&q=80',
  bayazid: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=faces&q=80',
  mithila: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&crop=faces&q=80',
};

const FALLBACK_STUDENT_PORTRAITS: string[] = [
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&h=300&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&crop=faces&q=80',
];

/**
 * Returns a student's portrait photo URL with intelligent fallbacks
 */
export const getStudentPhoto = (student?: Partial<Student> | null): string => {
  if (!student) return FALLBACK_STUDENT_PORTRAITS[0];
  if (student.image && student.image.trim()) return student.image;

  const name = (student.name || '').toLowerCase();
  if (name.includes('sadia') || name.includes('সাদিয়া') || name.includes('সাদিয়া')) {
    return STUDENT_PORTRAITS.sadia;
  }
  if (name.includes('tanvir') || name.includes('তানভীর')) {
    return STUDENT_PORTRAITS.tanvir;
  }
  if (name.includes('mithila') || name.includes('মিথিলা')) {
    return STUDENT_PORTRAITS.mithila;
  }
  if (name.includes('nusrat') || name.includes('নুসরাত')) {
    return STUDENT_PORTRAITS.nusrat;
  }
  if (name.includes('rafsan') || name.includes('রাফসান')) {
    return STUDENT_PORTRAITS.rafsan;
  }
  if (name.includes('sumaiya') || name.includes('সুমাইয়া') || name.includes('সুমাইয়া')) {
    return STUDENT_PORTRAITS.sumaiya;
  }
  if (name.includes('faria') || name.includes('ফারিয়া') || name.includes('ফারিয়া')) {
    return STUDENT_PORTRAITS.faria;
  }
  if (name.includes('sakib') || name.includes('সাকিব')) {
    return STUDENT_PORTRAITS.sakib;
  }
  if (name.includes('bayazid') || name.includes('বায়োজিদ')) {
    return STUDENT_PORTRAITS.bayazid;
  }

  // Deterministic fallback based on name characters and roll
  const seed = (name.charCodeAt(0) || 0) + (parseInt(student.roll || '0', 10) || 0);
  return FALLBACK_STUDENT_PORTRAITS[Math.abs(seed) % FALLBACK_STUDENT_PORTRAITS.length];
};

/**
 * Returns a result record's student photo URL with lookup against student roster and fallbacks
 */
export const getStudentResultImage = (
  result: { studentImage?: string; studentName?: string; studentId?: string; roll?: string },
  studentsList?: Student[]
): string => {
  if (result.studentImage && result.studentImage.trim()) {
    return result.studentImage;
  }

  if (studentsList && studentsList.length > 0) {
    const matched = studentsList.find(
      (s) =>
        (result.studentId && s.id === result.studentId) ||
        (result.studentName && s.name.toLowerCase() === result.studentName.toLowerCase()) ||
        (result.roll && s.roll === result.roll)
    );
    if (matched && matched.image && matched.image.trim()) {
      return matched.image;
    }
    if (matched) {
      return getStudentPhoto(matched);
    }
  }

  return getStudentPhoto({
    name: result.studentName,
    roll: result.roll,
    id: result.studentId,
  });
};
