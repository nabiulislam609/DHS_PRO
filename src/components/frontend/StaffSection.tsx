import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Mail, Phone, Briefcase, UserCheck } from 'lucide-react';

export const StaffSection: React.FC = () => {
  const { staff } = useSchool();

  return (
    <section id="staff" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 rounded-full">
          <UserCheck className="w-3.5 h-3.5" />
          <span>কর্মকর্তা ও কর্মচারী</span>
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          আমাদের কর্মকর্তা ও কর্মচারী
        </h2>
        <p className="text-sm text-gray-500 mt-1 max-w-2xl mx-auto">
          বিদ্যালয়ের প্রশাসনিক, হিসাব, গ্রন্থাগার ও সার্বিক দাপ্তরিক সেবায় নিয়োজিত দায়িত্বশীল কর্মী ও কর্মকর্তাবৃন্দ
        </p>
      </div>

      {/* Staff Grid (4 cols on lg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {staff.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition text-center flex flex-col items-center justify-between group hover:border-emerald-200"
          >
            <div className="flex flex-col items-center w-full">
              {/* Avatar / Photo Circle */}
              {member.image ? (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 shadow-2xs mb-4 shrink-0">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-100 text-emerald-800 font-bold text-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition duration-300 shrink-0 shadow-2xs">
                  {member.initial || member.name.charAt(0)}
                </div>
              )}

              {/* Name & Designation */}
              <h4 className="font-bold text-base text-gray-900 group-hover:text-emerald-800 transition">
                {member.name}
              </h4>
              <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                {member.designation}
              </p>

              {member.department && (
                <div className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full mt-2">
                  <Briefcase className="w-3 h-3 text-emerald-600" />
                  <span>{member.department}</span>
                </div>
              )}
            </div>

            {/* Contact Details */}
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
    </section>
  );
};
