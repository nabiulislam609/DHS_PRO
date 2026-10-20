import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { DedicatedHeader } from './DedicatedHeader';
import {
  ArrowLeft,
  Search,
  BookOpen,
  Phone,
  Mail,
  GraduationCap,
  Users,
  Printer,
  ChevronRight,
  Sparkles,
  X,
  Camera,
  Eye,
  School,
  MapPin,
} from 'lucide-react';
import { Footer } from './Footer';
import { Teacher } from '../../types';

export const DedicatedTeachersPage: React.FC = () => {
  const { siteSettings, teachers, setCurrentFrontendPage } = useSchool();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('সব');
  const [selectedTeacherModal, setSelectedTeacherModal] = useState<Teacher | null>(null);
  const [bigPhotoUrl, setBigPhotoUrl] = useState<{ url: string; name: string } | null>(null);

  const handleGoHome = () => {
    setCurrentFrontendPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col font-sans">
      {/* Top Institutional Header matching Home Page logo & unified EIIN */}
      <DedicatedHeader
        portalTitle="শিক্ষক মণ্ডলী পোর্টাল"
        extraActions={
          <>
            <button
              onClick={handleGoToStaff}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold transition cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>কর্মকর্তা ও কর্মচারী</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold transition cursor-pointer"
              title="তালিকা প্রিন্ট করুন"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span>প্রিন্ট</span>
            </button>
          </>
        }
      />

      {/* Modern Top Dark Emerald Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8 w-full print:hidden">
        <div className="bg-gradient-to-br from-[#063326] via-[#094132] to-[#042018] rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40 relative overflow-hidden text-center sm:text-left">
          {/* Subtle decorative glowing background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-1.5 bg-[#0f4d3a]/80 text-[#34d399] border border-[#16654a] px-3.5 py-1 rounded-full text-xs font-semibold">
                <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                <span>সম্মানিত শিক্ষক মণ্ডলী</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                আমাদের সম্মানিত শিক্ষক মণ্ডলী
              </h2>
              <p className="text-emerald-100/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
                অভিজ্ঞ, নিবেদিত ও দক্ষ শিক্ষক দ্বারা শিক্ষার্থীদের আধুনিক শিক্ষা, নৈতিক মূল্যবোধ ও সঠিক দিকনির্দেশনা প্রদান করা হয়।
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 justify-center sm:justify-start">
              <div className="bg-emerald-900/60 border border-emerald-600/40 rounded-2xl px-5 py-3 text-center backdrop-blur-xs">
                <span className="block text-2xl font-black text-white">{teachers.length}</span>
                <span className="text-[11px] font-semibold text-emerald-200">মোট শিক্ষক</span>
              </div>
              <button
                onClick={handleGoToStaff}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-xs font-bold transition cursor-pointer backdrop-blur-xs"
              >
                <Users className="w-4 h-4 text-emerald-300" />
                <span>কর্মচারী তালিকা →</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex-1 w-full space-y-6">
        {/* Search & Subject Filters */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="শিক্ষকের নাম, বিষয় বা পদবি দিয়ে খুঁজুন..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  ক্লিয়ার
                </button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="text-xs text-gray-500 flex items-center gap-1.5 self-end sm:self-center">
              <span>প্রদর্শিত হচ্ছে:</span>
              <strong className="text-emerald-800 font-bold">{filteredTeachers.length}</strong>
              <span>জন শিক্ষক</span>
            </div>
          </div>

          {/* Subject Filter Pills */}
          {allSubjects.length > 1 && (
            <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-gray-400 font-medium whitespace-nowrap mr-1">বিষয়:</span>
              {allSubjects.map((sub) => {
                const isActive = selectedSubject === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-2xs font-semibold'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Teachers Grid */}
        {filteredTeachers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-3">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-700">কোনো শিক্ষক পাওয়া যায়নি</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              আপনার অনুসন্ধানের সাথে মিল রেখে কোনো শিক্ষক পাওয়া যায়নি। সার্চ ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('সব');
              }}
              className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              সব ফিল্টার রিসেট করুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                onClick={() => setSelectedTeacherModal(teacher)}
                className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs hover:shadow-md transition text-center flex flex-col items-center justify-between group hover:border-emerald-300 cursor-pointer"
              >
                <div className="flex flex-col items-center w-full">
                  {/* Photo / Avatar (144px Desktop, 120px Mobile) */}
                  {teacher.image ? (
                    <div className="w-[120px] h-[120px] sm:w-[144px] sm:h-[144px] aspect-square rounded-full overflow-hidden border-4 border-emerald-500 shadow-md mb-4 shrink-0 group-hover:scale-105 group-hover:border-emerald-600 transition duration-300 relative">
                      <img
                        src={teacher.image}
                        alt={teacher.name}
                        className="w-full h-full object-cover object-[center_top] aspect-square"
                      />
                    </div>
                  ) : (
                    <div className="w-[120px] h-[120px] sm:w-[144px] sm:h-[144px] aspect-square rounded-full bg-emerald-50 border-4 border-emerald-200 text-emerald-800 font-bold text-4xl sm:text-5xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition duration-300 shrink-0 shadow-md">
                      {teacher.initial || teacher.name.charAt(0)}
                    </div>
                  )}

                  {/* Name & Designation */}
                  <h3 className="font-bold text-base text-gray-900 group-hover:text-emerald-800 transition inline-flex items-center gap-1">
                    <span>{teacher.name}</span>
                    <Eye className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition" />
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                    {teacher.designation}
                  </p>

                  {/* Subject Tag */}
                  {teacher.subject && (
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-700 bg-gray-100 px-3 py-0.5 rounded-full mt-2.5">
                      <BookOpen className="w-3 h-3 text-emerald-600" />
                      <span>{teacher.subject}</span>
                    </div>
                  )}
                </div>

                {/* Contact info & View Profile button */}
                <div className="w-full pt-4 mt-4 border-t border-gray-100 space-y-2 text-left text-xs text-gray-500">
                  {teacher.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{teacher.email}</span>
                    </div>
                  )}
                  {teacher.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{teacher.phone}</span>
                    </div>
                  )}

                  <div className="pt-1 text-center">
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
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition cursor-pointer z-20"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Hero Banner with Big Photo */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-5 border border-emerald-800/40">
              {/* Big Photo Box */}
              <div className="relative group shrink-0">
                <div className="w-32 h-40 sm:w-36 sm:h-44 rounded-2xl overflow-hidden bg-emerald-950/90 border-4 border-white/90 shadow-2xl flex items-center justify-center relative">
                  {selectedTeacherModal.image ? (
                    <img
                      src={selectedTeacherModal.image}
                      alt={selectedTeacherModal.name}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
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
                      onClick={() => setBigPhotoUrl({ url: selectedTeacherModal.image!, name: selectedTeacherModal.name })}
                      className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 text-white cursor-pointer backdrop-blur-xs"
                      title="বড় ছবি দেখতে ক্লিক করুন"
                    >
                      <Sparkles className="w-5 h-5 text-emerald-300" />
                      <span className="text-[10px] font-bold bg-black/60 px-2 py-0.5 rounded-full">
                        বড় করে দেখুন
                      </span>
                    </button>
                  )}
                </div>

                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-emerald-900 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full shadow-md border border-emerald-100 flex items-center gap-1 shrink-0 whitespace-nowrap">
                  <Camera className="w-3 h-3 text-emerald-600" />
                  <span>শিক্ষকের ছবি</span>
                </div>
              </div>

              {/* Info Details */}
              <div className="space-y-2.5 flex-1 text-center sm:text-left z-10 w-full">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {selectedTeacherModal.name}
                </h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-white shadow-xs">
                    {selectedTeacherModal.designation}
                  </span>
                  {selectedTeacherModal.subject && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/15 text-emerald-200 border border-white/20">
                      বিষয়: {selectedTeacherModal.subject}
                    </span>
                  )}
                </div>

                <div className="pt-2 text-xs text-emerald-100/90 space-y-1">
                  <p className="flex items-center justify-center sm:justify-start gap-2">
                    <School className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{siteSettings?.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'}</span>
                  </p>
                  <p className="flex items-center justify-center sm:justify-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{siteSettings?.address || 'দাদরা, বগুড়া'}</span>
                  </p>
                </div>

                {selectedTeacherModal.image && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setBigPhotoUrl({ url: selectedTeacherModal.image!, name: selectedTeacherModal.name })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                      <span>বড় সাইজের পূর্ণাঙ্গ ছবি দেখুন</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Information Grid */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2.5 text-xs">
              <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-1.5 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>যোগাযোগ ও দাপ্তরিক বিবরণ</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">পদবী:</span>
                    <span className="font-bold text-gray-800">{selectedTeacherModal.designation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">মূল বিষয়:</span>
                    <span className="font-bold text-emerald-800">{selectedTeacherModal.subject || 'সাধারণ'}</span>
                  </div>
                  {selectedTeacherModal.initial && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">ইনিশিয়াল:</span>
                      <span className="font-mono font-bold text-gray-800">{selectedTeacherModal.initial}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 sm:pl-3 pt-2 sm:pt-0">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">মোবাইল নম্বর:</span>
                    {selectedTeacherModal.phone ? (
                      <a
                        href={`tel:${selectedTeacherModal.phone}`}
                        className="font-mono font-bold text-emerald-700 hover:underline"
                      >
                        {selectedTeacherModal.phone}
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
                  <div className="flex justify-between">
                    <span className="text-gray-500">EIIN নম্বর:</span>
                    <span className="font-mono text-gray-700">{siteSettings?.eiin || '121820'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedTeacherModal(null)}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
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
                className="p-1.5 bg-white/10 hover:bg-rose-500 text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] flex items-center justify-center rounded-2xl overflow-hidden bg-black/60 p-2 border border-emerald-500/40">
              <img
                src={bigPhotoUrl.url}
                alt={bigPhotoUrl.name}
                className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-2xl"
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
