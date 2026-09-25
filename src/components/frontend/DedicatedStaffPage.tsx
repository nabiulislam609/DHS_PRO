import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  ArrowLeft,
  Search,
  Briefcase,
  Phone,
  Mail,
  Users,
  GraduationCap,
  Printer,
  ChevronRight,
  Building,
} from 'lucide-react';

export const DedicatedStaffPage: React.FC = () => {
  const { siteSettings, staff, setCurrentFrontendPage } = useSchool();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('সব');

  const handleGoHome = () => {
    setCurrentFrontendPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToTeachers = () => {
    setCurrentFrontendPage('teachers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Collect all unique departments
  const allDepartments = useMemo(() => {
    const depts = new Set<string>();
    staff.forEach((s) => {
      if (s.department && s.department.trim()) {
        depts.add(s.department.trim());
      }
    });
    return ['সব', ...Array.from(depts)];
  }, [staff]);

  // Filter staff by query and department
  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const matchesDept =
        selectedDepartment === 'সব' ||
        (member.department && member.department.trim().toLowerCase() === selectedDepartment.trim().toLowerCase());

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        member.name.toLowerCase().includes(q) ||
        (member.designation && member.designation.toLowerCase().includes(q)) ||
        (member.department && member.department.toLowerCase().includes(q)) ||
        (member.email && member.email.toLowerCase().includes(q)) ||
        (member.phone && member.phone.includes(q));

      return matchesDept && matchesQuery;
    });
  }, [staff, searchQuery, selectedDepartment]);

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col font-sans">
      {/* Top Sticky Institutional Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Logo & School Branding */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={handleGoHome}>
            {siteSettings.logoUrl ? (
              <img
                src={siteSettings.logoUrl}
                alt={siteSettings.schoolNameBangla}
                className="w-11 h-11 rounded-2xl object-cover border border-emerald-600/30 shadow-xs"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-amber-300 font-extrabold text-xl shadow-md border border-emerald-600/30">
                দ
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                  {siteSettings.schoolNameBangla}
                </h1>
                <span className="hidden sm:inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  EIIN: ১২৩৪৫৬
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                {siteSettings.schoolNameEnglish} • কর্মকর্তা ও কর্মচারী পোর্টাল
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleGoToTeachers}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold transition cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>শিক্ষক মণ্ডলী</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold transition cursor-pointer"
              title="তালিকা প্রিন্ট করুন"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span>প্রিন্ট</span>
            </button>

            <button
              onClick={handleGoHome}
              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>মূল ওয়েবসাইটে ফিরুন</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-emerald-900 via-emerald-850 to-emerald-800 text-white py-10 sm:py-14 px-4 sm:px-8 border-b border-emerald-950/20">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-emerald-700/60 border border-emerald-500/40 text-emerald-100 text-xs font-semibold px-3.5 py-1 rounded-full backdrop-blur-xs">
            <Users className="w-3.5 h-3.5 text-amber-300" />
            <span>প্রশাসনিক ও দাপ্তরিক কর্মী</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            আমাদের কর্মকর্তা ও কর্মচারী
          </h2>
          <p className="text-emerald-100/90 text-sm max-w-2xl mx-auto font-light leading-relaxed">
            বিদ্যালয়ের প্রশাসনিক, হিসাব, গ্রন্থাগার ও সার্বিক দাপ্তরিক সেবায় নিরলস দায়িত্বশীল কর্মী ও কর্মকর্তাবৃন্দ।
          </p>

          <div className="pt-2 flex items-center justify-center gap-4 text-xs text-emerald-200">
            <span className="bg-emerald-800/80 px-3 py-1 rounded-md border border-emerald-700">
              মোট কর্মী: <strong className="text-white font-bold text-sm ml-1">{staff.length}</strong> জন
            </span>
            <button
              onClick={handleGoToTeachers}
              className="text-amber-300 hover:text-white underline underline-offset-4 font-medium transition cursor-pointer md:hidden"
            >
              শিক্ষক মণ্ডলী দেখুন →
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex-1 w-full space-y-6">
        {/* Search & Department Filters */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="কর্মকর্তা বা কর্মচারীর নাম, পদবি বা শাখা দিয়ে খুঁজুন..."
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
              <strong className="text-emerald-800 font-bold">{filteredStaff.length}</strong>
              <span>জন কর্মী</span>
            </div>
          </div>

          {/* Department Filter Pills */}
          {allDepartments.length > 1 && (
            <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-gray-400 font-medium whitespace-nowrap mr-1">শাখা/বিভাগ:</span>
              {allDepartments.map((dept) => {
                const isActive = selectedDepartment === dept;
                return (
                  <button
                    key={dept}
                    onClick={() => setSelectedDepartment(dept)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-2xs font-semibold'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {dept}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Staff Grid */}
        {filteredStaff.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-3">
            <Users className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-700">কোনো কর্মকর্তা বা কর্মচারী পাওয়া যায়নি</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              আপনার অনুসন্ধানের সাথে মিল রেখে কোনো রেকর্ড পাওয়া যায়নি। সার্চ ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDepartment('সব');
              }}
              className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              সব ফিল্টার রিসেট করুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredStaff.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs hover:shadow-md transition text-center flex flex-col items-center justify-between group hover:border-emerald-300"
              >
                <div className="flex flex-col items-center w-full">
                  {/* Photo / Avatar */}
                  {member.image ? (
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500 shadow-2xs mb-4 shrink-0">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-800 font-bold text-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition duration-300 shrink-0 shadow-2xs">
                      {member.name.charAt(0)}
                    </div>
                  )}

                  {/* Name & Designation */}
                  <h3 className="font-bold text-base text-gray-900 group-hover:text-emerald-800 transition">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                    {member.designation}
                  </p>

                  {/* Department Tag */}
                  {member.department && (
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-700 bg-gray-100 px-3 py-0.5 rounded-full mt-2.5">
                      <Briefcase className="w-3 h-3 text-emerald-600" />
                      <span>{member.department}</span>
                    </div>
                  )}
                </div>

                {/* Contact info */}
                <div className="w-full pt-4 mt-4 border-t border-gray-100 space-y-1.5 text-left text-xs text-gray-500">
                  {member.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <a
                        href={`mailto:${member.email}`}
                        className="truncate hover:text-emerald-700 transition"
                      >
                        {member.email}
                      </a>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <a
                        href={`tel:${member.phone}`}
                        className="hover:text-emerald-700 transition"
                      >
                        {member.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 px-4 text-center text-xs text-gray-500 print:hidden">
        <p>
          {siteSettings.copyrightText || `© 2026 ${siteSettings.schoolNameBangla}। সর্বস্বত্ব সংরক্ষিত।`}
        </p>
      </footer>
    </div>
  );
};
