import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { DedicatedHeader, MobileHeaderAction } from './DedicatedHeader';
import { PageHero } from './PageHero';
import { SITE_CONFIG } from '../../config/siteConfig';
import { toBengaliDigits } from '../../utils/bengaliFormatters';
import {
  Search,
  BookOpen,
  Phone,
  Mail,
  GraduationCap,
  Users,
  Printer,
  ChevronRight,
  X,
  Camera,
  Eye,
  School,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Footer } from './Footer';
import { Teacher } from '../../types';

export const DedicatedTeachersPage: React.FC = () => {
  const { siteSettings, teachers, setCurrentFrontendPage } = useSchool();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('সব');
  const [selectedTeacherModal, setSelectedTeacherModal] = useState<Teacher | null>(null);
  const [bigPhotoUrl, setBigPhotoUrl] = useState<{ url: string; name: string } | null>(null);

  const handleGoToStaff = () => {
    setCurrentFrontendPage('staff');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Collect all unique subjects
  const allSubjects = useMemo(() => {
    const subs = new Set<string>();
    teachers.forEach((t) => {
      if (t.subject && t.subject.trim()) {
        subs.add(t.subject.trim());
      }
    });
    return ['সব', ...Array.from(subs)];
  }, [teachers]);

  // Filter teachers by query and subject
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSubject =
        selectedSubject === 'সব' ||
        (teacher.subject && teacher.subject.trim().toLowerCase() === selectedSubject.trim().toLowerCase());

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        teacher.name.toLowerCase().includes(q) ||
        (teacher.designation && teacher.designation.toLowerCase().includes(q)) ||
        (teacher.subject && teacher.subject.toLowerCase().includes(q)) ||
        (teacher.email && teacher.email.toLowerCase().includes(q)) ||
        (teacher.phone && teacher.phone.includes(q));

      return matchesSubject && matchesQuery;
    });
  }, [teachers, searchQuery, selectedSubject]);

  const mobileActions: MobileHeaderAction[] = [
    {
      label: 'কর্মকর্তা ও কর্মচারী',
      icon: <Users className="w-4 h-4 text-emerald-700" />,
      onClick: handleGoToStaff,
    },
    {
      label: 'তালিকা প্রিন্ট করুন',
      icon: <Printer className="w-4 h-4 text-gray-600" />,
      onClick: () => window.print(),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F7F5] text-[#14211B] flex flex-col font-sans subpage-fade-in">
      {/* Top Institutional Header */}
      <DedicatedHeader
        pageName="শিক্ষক মণ্ডলী"
        mobileActions={mobileActions}
        extraActions={
          <>
            <button
              onClick={handleGoToStaff}
              className="inline-flex items-center gap-1.5 h-11 px-3.5 rounded-xl border border-[#0B7A55]/40 text-[#064E3B] hover:bg-[#E8F5EE] text-xs font-semibold transition cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>কর্মকর্তা ও কর্মচারী</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 h-11 px-3.5 rounded-xl border border-[#E2E8E4] text-[#5B6B63] hover:bg-gray-100 text-xs font-semibold transition cursor-pointer"
              title="তালিকা প্রিন্ট করুন"
              aria-label="তালিকা প্রিন্ট করুন"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span>প্রিন্ট</span>
            </button>
          </>
        }
      />

      {/* Unified PageHero Banner */}
      <PageHero
        title="আমাদের সম্মানিত শিক্ষক মণ্ডলী"
        description="অভিজ্ঞ, নিবেদিত ও দক্ষ শিক্ষক দ্বারা আধুনিক শিক্ষা, নৈতিক মূল্যবোধ ও সঠিক দিকনির্দেশনা প্রদান করা হয়।"
        badgeText="অভিজ্ঞ শিক্ষকবৃন্দ"
        badgeIcon={<GraduationCap className="w-3.5 h-3.5 text-amber-300" />}
        breadcrumbs={[{ label: 'শিক্ষক মণ্ডলী' }]}
        stats={
          <div className="bg-emerald-900/60 border border-emerald-600/40 rounded-xl px-4 py-2 text-center backdrop-blur-xs">
            <span className="block text-xl sm:text-2xl font-black text-white">
              {toBengaliDigits(teachers.length)}
            </span>
            <span className="text-[11px] font-semibold text-emerald-200">মোট শিক্ষক</span>
          </div>
        }
      />

      {/* Main Content Area - Overlapping Hero Banner with -mt-16 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 space-y-6 -mt-16 relative z-20 pb-16 flex-1 w-full">
        {/* Search & Subject Filters Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8E4] shadow-md space-y-3.5 print:hidden">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="শিক্ষকের নাম, বিষয় বা পদবি দিয়ে খুঁজুন..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 p-1"
                  aria-label="সার্চ ক্লিয়ার করুন"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Count Info */}
            <div className="text-xs text-gray-600 flex items-center gap-1.5 self-end sm:self-center">
              <span>প্রদর্শিত হচ্ছে:</span>
              <strong className="text-emerald-800 font-bold font-mono">
                {toBengaliDigits(filteredTeachers.length)}
              </strong>
              <span>জন শিক্ষক</span>
            </div>
          </div>

          {/* Subject Filter Pills - Horizontally Scrollable on Mobile */}
          {allSubjects.length > 1 && (
            <div className="pt-2 border-t border-gray-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-gray-400 font-medium whitespace-nowrap mr-1">বিষয়:</span>
              {allSubjects.map((sub) => {
                const isActive = selectedSubject === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubject(sub)}
                    className={`px-3.5 py-1.5 rounded-full whitespace-nowrap font-medium transition cursor-pointer min-h-[36px] flex items-center ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Teachers Responsive Grid: Desktop 4 col, Tablet 2-3, Mobile 1-2 */}
        {filteredTeachers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-8 sm:p-12 text-center space-y-3 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              কোনো শিক্ষকের তথ্য পাওয়া যায়নি
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              আপনার অনুসন্ধানের সাথে মিল রেখে কোনো ফলাফল নেই। অনুসন্ধান কি-ওয়ার্ড বা বিষয়ের ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('সব');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              সব শিক্ষক প্রদর্শন করুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                onClick={() => setSelectedTeacherModal(teacher)}
                className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 text-center flex flex-col items-center justify-between group hover:border-emerald-300 cursor-pointer"
              >
                <div className="flex flex-col items-center w-full">
                  {/* Photo / Avatar (144px Desktop, 120px Mobile) with subtle shadow */}
                  {teacher.image ? (
                    <div className="w-[120px] h-[120px] sm:w-[144px] sm:h-[144px] aspect-square rounded-full overflow-hidden border-4 border-emerald-500 shadow-md mb-3.5 shrink-0 group-hover:scale-105 group-hover:border-emerald-600 transition duration-300 relative bg-gray-50">
                      <img
                        src={teacher.image}
                        alt={teacher.name}
                        className="w-full h-full object-cover object-[center_top] aspect-square"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-[120px] h-[120px] sm:w-[144px] sm:h-[144px] aspect-square rounded-full bg-gradient-to-br from-emerald-700 to-teal-800 border-4 border-emerald-200 text-white font-bold text-4xl sm:text-5xl flex items-center justify-center mb-3.5 group-hover:scale-105 transition duration-300 shrink-0 shadow-md">
                      {teacher.initial || teacher.name.charAt(0)}
                    </div>
                  )}

                  {/* Name & Designation */}
                  <h3 className="font-bold text-base text-gray-900 group-hover:text-emerald-800 transition inline-flex items-center gap-1 line-clamp-1">
                    <span>{teacher.name}</span>
                    <Eye className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition shrink-0" />
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5 line-clamp-1">
                    {teacher.designation}
                  </p>

                  {/* Subject Tag */}
                  {teacher.subject && (
                    <div className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full mt-2">
                      <BookOpen className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{teacher.subject}</span>
                    </div>
                  )}
                </div>

                {/* Contact info with working mailto & tel links */}
                <div className="w-full pt-3.5 mt-3.5 border-t border-gray-100 space-y-1.5 text-left text-xs text-gray-500">
                  {teacher.email && (
                    <a
                      href={`mailto:${teacher.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 truncate hover:text-emerald-700 hover:underline py-0.5"
                      title={teacher.email}
                    >
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate font-sans">{teacher.email}</span>
                    </a>
                  )}
                  {teacher.phone && (
                    <a
                      href={`tel:${teacher.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 hover:text-emerald-700 hover:underline py-0.5"
                      title={teacher.phone}
                    >
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-mono">{toBengaliDigits(teacher.phone)}</span>
                    </a>
                  )}

                  <div className="pt-1.5 text-center">
                    <span className="text-[11px] font-bold text-emerald-700 group-hover:underline inline-flex items-center gap-1">
                      <span>পূর্ণাঙ্গ প্রোফাইল ও বড় ছবি দেখুন</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Public Teacher Details Profile Modal */}
      {selectedTeacherModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setSelectedTeacherModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative border border-gray-100 max-h-[92vh] overflow-y-auto space-y-5 text-xs text-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedTeacherModal(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition cursor-pointer z-20 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="বন্ধ করুন"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Hero Banner with Big Photo */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-5 border border-emerald-800/40">
              {/* Big Photo Box */}
              <div className="relative group shrink-0">
                <div className="w-32 h-40 sm:w-36 sm:h-44 rounded-2xl overflow-hidden bg-emerald-950/90 border-4 border-white/90 shadow-2xl flex items-center justify-center relative">
                  {selectedTeacherModal.image ? (
                    <img
                      src={selectedTeacherModal.image}
                      alt={selectedTeacherModal.name}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-800/60 text-emerald-100 p-4 text-center">
                      <GraduationCap className="w-14 h-14 text-emerald-300/80 mb-1" />
                      <span className="text-xl font-bold">{selectedTeacherModal.initial || selectedTeacherModal.name.charAt(0)}</span>
                    </div>
                  )}

                  {selectedTeacherModal.image && (
                    <button
                      type="button"
                      onClick={() =>
                        setBigPhotoUrl({
                          url: selectedTeacherModal.image!,
                          name: selectedTeacherModal.name,
                        })
                      }
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white transition duration-200 cursor-pointer text-xs font-semibold"
                    >
                      <Camera className="w-5 h-5" />
                      <span>বড় ছবি দেখুন</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Key details */}
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-full text-[11px] font-semibold">
                  <School className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{SITE_CONFIG.schoolNameBangla}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {selectedTeacherModal.name}
                </h3>
                <p className="text-sm font-semibold text-emerald-200">
                  {selectedTeacherModal.designation}
                </p>
                {selectedTeacherModal.subject && (
                  <p className="text-xs text-gray-300">
                    পাঠদানের বিষয়: <strong className="text-white">{selectedTeacherModal.subject}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* Profile Information List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2.5">
                <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-1 text-xs">
                  একাডেমিক ও প্রাতিষ্ঠানিক তথ্য
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">পদবি:</span>
                    <span className="font-semibold text-gray-800">{selectedTeacherModal.designation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">বিষয়:</span>
                    <span className="font-semibold text-gray-800">{selectedTeacherModal.subject || 'সাধারণ'}</span>
                  </div>
                  {selectedTeacherModal.qualification && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">শিক্ষাগত যোগ্যতা:</span>
                      <span className="font-semibold text-gray-800">{selectedTeacherModal.qualification}</span>
                    </div>
                  )}
                  {selectedTeacherModal.joinDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">যোগদানের তারিখ:</span>
                      <span className="font-semibold text-gray-800">{toBengaliDigits(selectedTeacherModal.joinDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2.5">
                <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-1 text-xs">
                  যোগাযোগ ও পরিচিতি
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">মোবাইল:</span>
                    {selectedTeacherModal.phone ? (
                      <a
                        href={`tel:${selectedTeacherModal.phone}`}
                        className="font-mono font-semibold text-emerald-700 hover:underline"
                      >
                        {toBengaliDigits(selectedTeacherModal.phone)}
                      </a>
                    ) : (
                      <span className="text-gray-400">তথ্য দেওয়া নেই</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">ইমেইল:</span>
                    {selectedTeacherModal.email ? (
                      <a
                        href={`mailto:${selectedTeacherModal.email}`}
                        className="font-medium text-emerald-700 hover:underline truncate max-w-[170px]"
                      >
                        {selectedTeacherModal.email}
                      </a>
                    ) : (
                      <span className="text-gray-400">তথ্য দেওয়া নেই</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedTeacherModal(null)}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition cursor-pointer min-h-[44px]"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Big Photo Lightbox */}
      {bigPhotoUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setBigPhotoUrl(null)}
        >
          <div
            className="relative max-w-xl w-full bg-slate-900 border border-white/20 rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">{bigPhotoUrl.name} - পূর্ণাঙ্গ ছবি</h3>
              <button
                type="button"
                onClick={() => setBigPhotoUrl(null)}
                className="p-2 bg-white/10 hover:bg-rose-500 text-white rounded-xl transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black">
              <img
                src={bigPhotoUrl.url}
                alt={bigPhotoUrl.name}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Institutional Website Footer */}
      <Footer />
    </div>
  );
};
