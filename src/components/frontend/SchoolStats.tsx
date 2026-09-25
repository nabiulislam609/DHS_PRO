import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Users, GraduationCap, TrendingUp, Award, Building, Trophy, BarChart3 } from 'lucide-react';

export const SchoolStats: React.FC = () => {
  const { siteSettings } = useSchool();

  const customStatsItems = (siteSettings.customStats || []).map((cs) => ({
    label: cs.label,
    value: cs.value,
    icon: BarChart3,
  }));

  const stats = [
    {
      label: 'মোট শিক্ষার্থী',
      value: siteSettings.totalStudents,
      icon: Users,
    },
    {
      label: 'শিক্ষক মণ্ডলী',
      value: siteSettings.totalTeachers,
      icon: GraduationCap,
    },
    {
      label: 'সর্বমোট পাশের হার',
      value: siteSettings.passRate,
      icon: TrendingUp,
    },
    {
      label: 'জিপিএ-৫ (এ বছর)',
      value: siteSettings.gpa5Count,
      icon: Award,
    },
    {
      label: 'ক্লাসরুম ও ল্যাব',
      value: siteSettings.totalClassrooms,
      icon: Building,
    },
    {
      label: 'অর্জিত পুরস্কার',
      value: siteSettings.totalAwards,
      icon: Trophy,
    },
    ...customStatsItems,
  ];

  return (
    <section id="stats" className="w-full bg-[#0f5338] text-white py-14 px-4 sm:px-8 my-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-amber-300 tracking-wider uppercase bg-white/10 px-3 py-1 rounded-full">
            পরিসংখ্যান
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
            বিদ্যালয় এক নজরে
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            একটি সফল যাত্রায় ঐতিহ্য ও সাফল্যের কথা
          </p>
        </div>

        {/* Counter items */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/10"
              >
                <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {item.value}
                </span>
                <span className="text-xs text-emerald-100 mt-1 font-medium">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
