import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Mail,
  Phone,
  Briefcase,
  UserCheck,
  Eye,
  Sparkles,
  Camera,
  X,
  School,
  MapPin,
  Download,
} from 'lucide-react';
import { Staff } from '../../types';

export const StaffSection: React.FC = () => {
  const { staff, siteSettings } = useSchool();
  const [viewingStaff, setViewingStaff] = useState<Staff | null>(null);
  const [bigPhotoUrl, setBigPhotoUrl] = useState<{ url: string; name: string } | null>(null);

  const badgeText = siteSettings.staffBadge || 'কর্মকর্তা ও কর্মচারী';
  const titleText = siteSettings.staffTitle || 'আমাদের কর্মকর্তা ও কর্মচারী';
  const subtitleText = siteSettings.staffSubtitle || 'বিদ্যালয়ের প্রশাসনিক, হিসাব, গ্রন্থাগার ও সার্বিক দাপ্তরিক সেবায় নিয়োজিত দায়িত্বশীল কর্মী ও কর্মকর্তাবৃন্দ';

  return (
    <section id="staff" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 rounded-full">
          <UserCheck className="w-3.5 h-3.5" />
          <span>{badgeText}</span>
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          {titleText}
        </h2>
        <p className="text-sm text-gray-500 mt-1 max-w-2xl mx-auto">
          {subtitleText}
        </p>
      </div>

      {/* Staff Grid or Empty State */}
      {staff.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-lg mx-auto shadow-xs space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-800">কর্মচারীদের তথ্য খালি রয়েছে</h3>
          <p className="text-xs text-gray-500">
            কর্মকর্তা ও কর্মচারীদের পরিচিতি তথ্য শীঘ্রই হালনাগাদ করা হবে।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {staff.map((member) => (
          <div
            key={member.id}
            onClick={() => setViewingStaff(member)}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs hover:shadow-md hover:border-emerald-300 transition text-center flex flex-col items-center justify-between group cursor-pointer"
            title={`${member.name}-এর বিস্তারিত প্রোফাইল ও বড় ছবি দেখুন`}
          >
            <div className="flex flex-col items-center w-full">
              {/* Avatar / Photo Circle (144px Desktop, 120px Mobile) */}
              {member.image ? (
                <div className="w-[120px] h-[120px] sm:w-[144px] sm:h-[144px] aspect-square rounded-full overflow-hidden border-4 border-emerald-500 shadow-md mb-4 shrink-0 group-hover:scale-105 group-hover:border-emerald-600 transition duration-300 relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-[center_top] aspect-square"
                  />
                </div>
              ) : (
                <div className="w-[120px] h-[120px] sm:w-[144px] sm:h-[144px] aspect-square rounded-full bg-emerald-50 border-4 border-emerald-200 text-emerald-800 font-bold text-4xl sm:text-5xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition duration-300 shrink-0 shadow-md">
                  {member.initial || member.name.charAt(0)}
                </div>
              )}

              {/* Name & Designation */}
              <h4 className="font-bold text-base text-gray-900 group-hover:text-emerald-800 transition inline-flex items-center gap-1.5">
                <span>{member.name}</span>
                <Eye className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition shrink-0" />
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

            {/* Contact Details & View Button */}
            <div className="w-full pt-4 mt-4 border-t border-gray-100 space-y-2 text-left text-xs text-gray-500">
              {member.email && (
                <div className="flex items-center gap-2 truncate hover:text-emerald-700">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
              {member.phone && (
                <div className="flex items-center gap-2 hover:text-emerald-700">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="font-mono">{member.phone}</span>
                </div>
              )}
              <div className="pt-1">
                <span className="w-full py-1.5 px-3 rounded-lg bg-emerald-50 group-hover:bg-emerald-600 text-emerald-800 group-hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition">
                  <Eye className="w-3.5 h-3.5" />
                  <span>পূর্ণাঙ্গ প্রোফাইল ও বড় ছবি দেখুন</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Staff Detailed Profile Modal */}
      {viewingStaff && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setViewingStaff(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Title Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    কর্মকর্তা/কর্মচারীর পূর্ণাঙ্গ পরিচিতি
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {siteSettings?.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingStaff(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Hero Header with Large Photo */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-5 border border-emerald-800/40">
              {/* Big Photo Box with Zoom Trigger */}
              <div className="relative group shrink-0">
                <div className="w-32 h-40 sm:w-36 sm:h-44 rounded-2xl overflow-hidden bg-emerald-950/90 border-4 border-white/90 shadow-2xl flex items-center justify-center relative">
                  {viewingStaff.image ? (
                    <img
                      src={viewingStaff.image}
                      alt={viewingStaff.name}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-800/60 text-emerald-100 p-4 text-center">
                      <Briefcase className="w-14 h-14 text-emerald-300/80 mb-1" />
                      <span className="text-xl font-bold">{viewingStaff.initial || viewingStaff.name.charAt(0)}</span>
                    </div>
                  )}

                  {viewingStaff.image && (
                    <button
                      type="button"
                      onClick={() => setBigPhotoUrl({ url: viewingStaff.image!, name: viewingStaff.name })}
                      className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 text-white cursor-pointer backdrop-blur-xs"
                      title="বড় ছবি দেখতে ক্লিক করুন"
                    >
                      <Sparkles className="w-5 h-5 text-emerald-300" />
                      <span className="text-[10px] font-bold bg-black/60 px-2.5 py-0.5 rounded-full">
                        বড় করে দেখুন
                      </span>
                    </button>
                  )}
                </div>

                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-white text-emerald-900 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full shadow-md border border-emerald-100 flex items-center gap-1 shrink-0 whitespace-nowrap">
                  <Camera className="w-3 h-3 text-emerald-600" />
                  <span>কর্মচারীর ছবি</span>
                </div>
              </div>

              {/* Basic Details in Hero */}
              <div className="space-y-2.5 flex-1 text-center sm:text-left z-10 w-full">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {viewingStaff.name}
                </h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-white shadow-xs">
                    {viewingStaff.designation || viewingStaff.role}
                  </span>
                  {viewingStaff.department && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/15 text-emerald-200 border border-white/20">
                      দপ্তর: {viewingStaff.department}
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

                {viewingStaff.image && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setBigPhotoUrl({ url: viewingStaff.image!, name: viewingStaff.name })}
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
            <div className="bg-gray-50 rounded-2xl p-4.5 border border-gray-200 space-y-3 text-xs">
              <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>যোগাযোগ ও দাপ্তরিক বিবরণ</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">কর্মচারীর নাম:</span>
                    <span className="font-bold text-gray-900">{viewingStaff.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">পদবী:</span>
                    <span className="font-bold text-emerald-800">{viewingStaff.designation || viewingStaff.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">শাখা / দপ্তর:</span>
                    <span className="font-semibold text-gray-800">{viewingStaff.department || 'সাধারণ প্রশাসন'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">মোবাইল নম্বর:</span>
                    {viewingStaff.phone ? (
                      <a
                        href={`tel:${viewingStaff.phone}`}
                        className="font-mono font-bold text-emerald-700 hover:underline"
                      >
                        {viewingStaff.phone}
                      </a>
                    ) : (
                      <span className="font-mono text-gray-400">দেওয়া নেই</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">ইমেইল ঠিকানা:</span>
                    {viewingStaff.email ? (
                      <a
                        href={`mailto:${viewingStaff.email}`}
                        className="text-emerald-700 hover:underline truncate max-w-[170px]"
                      >
                        {viewingStaff.email}
                      </a>
                    ) : (
                      <span className="text-gray-400">দেওয়া নেই</span>
                    )}
                  </div>
                  {viewingStaff.initial && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">ইনিশিয়াল:</span>
                      <span className="font-mono font-bold text-gray-800">{viewingStaff.initial}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Bottom Close */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingStaff(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Big Photo Fullscreen Lightbox Modal */}
      {bigPhotoUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setBigPhotoUrl(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-slate-900 border border-white/20 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center gap-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Name and Action Buttons */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-gray-100">{bigPhotoUrl.name} এর পূর্ণাঙ্গ ছবি</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={bigPhotoUrl.url}
                  download={`${bigPhotoUrl.name.replace(/\s+/g, '_')}_photo.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  title="ছবি ডাউনলোড করুন"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ডাউনলোড</span>
                </a>
                <button
                  type="button"
                  onClick={() => setBigPhotoUrl(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition cursor-pointer"
                  title="বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Photo Container */}
            <div className="w-full flex items-center justify-center max-h-[75vh] overflow-hidden rounded-2xl bg-black/50 border border-white/10 p-2">
              <img
                src={bigPhotoUrl.url}
                alt={bigPhotoUrl.name}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-2xl transition duration-200"
              />
            </div>

            <p className="text-[11px] text-gray-400 text-center">
              ছবির উপর ক্লিক করে জুম করতে পারেন অথবা ডাউনলোড বাটনে ক্লিক করে সংরক্ষণ করুন
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
