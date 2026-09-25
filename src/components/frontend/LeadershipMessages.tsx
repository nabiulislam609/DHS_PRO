import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Quote } from 'lucide-react';

export const LeadershipMessages: React.FC = () => {
  const { leadership } = useSchool();

  return (
    <section id="leadership" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto bg-gray-50/60 rounded-3xl my-8">
      {/* Section Header */}
      <div className="text-center mb-10">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full">
          নেতৃত্ব
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          নেতৃত্বের বার্তা
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          বিদ্যালয়ের প্রধান ও পরিচালনা পরিষদের বার্তা
        </p>
      </div>

      {/* Two Column Message Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {leadership.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs relative flex flex-col justify-between"
          >
            {/* Top quote icon */}
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <Quote className="w-5 h-5 fill-emerald-600" />
            </div>

            {/* Quote body */}
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed italic mb-6">
              "{item.message}"
            </p>

            {/* Author Info */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-600 shadow-2xs shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold text-lg flex items-center justify-center border border-emerald-200 shrink-0">
                  {item.initial || item.name.charAt(0)}
                </div>
              )}
              <div>
                <h4 className="text-base font-bold text-gray-900">{item.name}</h4>
                <p className="text-xs font-semibold text-emerald-700">{item.role}</p>
                <p className="text-[11px] text-gray-400">{item.credentials}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
