import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { BookOpen, GraduationCap, Atom, Compass, TrendingUp, ArrowRight, X } from 'lucide-react';
import { AcademicProgram } from '../../types';

export const AcademicPrograms: React.FC = () => {
  const { academicPrograms, setIsAdmissionModalOpen } = useSchool();
  const [selectedProgram, setSelectedProgram] = useState<AcademicProgram | null>(null);

  const getProgramIcon = (title: string) => {
    if (title.includes('বিজ্ঞান')) return Atom;
    if (title.includes('মানবিক')) return Compass;
    if (title.includes('ব্যবসায়')) return TrendingUp;
    if (title.includes('মাধ্যমিক')) return GraduationCap;
    return BookOpen;
  };

  return (
    <section id="programs" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto bg-gray-50/50 rounded-3xl">
      {/* Section Header */}
      <div className="text-center mb-10">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full">
          একাডেমিক
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          একাডেমিক প্রোগ্রাম
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          শ্রেণিভিত্তিক ও বিষয়ভিত্তিক মানসম্মত পাঠ্য-পাঠন
        </p>
      </div>

      {/* Grid of Programs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {academicPrograms.map((prog) => {
          const Icon = getProgramIcon(prog.title);
          return (
            <div
              key={prog.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900 group-hover:text-emerald-800 transition">
                      {prog.title}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {prog.level}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                  {prog.description}
                </p>

                {/* Subject Badges */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {prog.subjects.map((subj, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-md font-medium"
                    >
                      {subj}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedProgram(prog)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                >
                  <span>বিস্তারিত জানুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsAdmissionModalOpen(true)}
                  className="text-xs text-gray-500 hover:text-emerald-700 font-medium cursor-pointer"
                >
                  ভর্তি আবেদন →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Program Detail Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setSelectedProgram(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {selectedProgram.level}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {selectedProgram.title}
            </h3>

            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {selectedProgram.description}
            </p>

            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              প্রধান বিষয়সমূহ:
            </h4>
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedProgram.subjects.map((sub, i) => (
                <span
                  key={i}
                  className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-lg"
                >
                  {sub}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedProgram(null)}
                className="px-4 py-2 text-xs text-gray-600 font-semibold hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => {
                  setSelectedProgram(null);
                  setIsAdmissionModalOpen(true);
                }}
                className="px-4 py-2 bg-[#15803d] text-white text-xs font-semibold rounded-lg hover:bg-[#166534] transition cursor-pointer"
              >
                ভর্তি আবেদন করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
