import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  Share2,
  ExternalLink,
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { siteSettings, submitContactMessage } = useSchool();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  // Extract or generate a reliable, working Google Maps embed URL
  const getMapEmbedUrl = () => {
    const rawUrl = siteSettings.googleMapEmbedUrl?.trim();
    if (rawUrl) {
      if (rawUrl.includes('<iframe')) {
        const match = rawUrl.match(/src=["'](.*?)["']/);
        if (match && match[1]) return match[1];
      }
      // If user provided a custom embed or http map url and not the dead placeholder pb URL
      if (
        rawUrl.startsWith('http') &&
        !rawUrl.includes('pb=!1m18!1m12!1m3!1d3648.5!2d89.08!3d25.08!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDA0JzQ4LjAiTiA4OcKwMDQnNDguMCJF')
      ) {
        return rawUrl;
      }
    }
    // High-reliability live Google Maps search embed by school address:
    const query = encodeURIComponent(
      `${siteSettings.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'}, ${siteSettings.address || 'জয়পুরহাট সদর, রাজশাহী, বাংলাদেশ'}`
    );
    return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const directMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${siteSettings.schoolNameBangla || 'দাদরা উচ্চ বিদ্যালয়'}, ${siteSettings.address || 'জয়পুরহাট সদর, বাংলাদেশ'}`
  )}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    submitContactMessage({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject || 'সাধারণ অনুসন্ধান',
      message: formData.message,
    });

    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });

    setTimeout(() => {
      setSubmitted(false);
    }, 6000);
  };

  return (
    <section id="contact" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full">
          যোগাযোগ
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          আমাদের সাথে যোগাযোগ
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          প্রশ্ন, পরামর্শ বা তথ্যের জন্য সরাসরি যোগাযোগ করুন
        </p>
      </div>

      {/* Two Column Grid with Equal Height (items-stretch) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left 5 cols: Contact info & Map mockup */}
        <div className="lg:col-span-5 flex flex-col gap-6 h-full">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">ঠিকানা</h4>
                <p className="text-sm font-medium text-gray-800">{siteSettings.address}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">ফোন</h4>
                <p className="text-sm font-medium text-gray-800">{siteSettings.phone1}</p>
                <p className="text-xs text-gray-500">{siteSettings.phone2}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">ইমেইল</h4>
                <p className="text-sm font-medium text-gray-800">{siteSettings.email}</p>
              </div>
            </div>

            {/* Office Hours */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">অফিস সময়</h4>
                <p className="text-sm font-medium text-gray-800">{siteSettings.officeHours}</p>
              </div>
            </div>

            {/* Social Share */}
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                সামাজিক যোগাযোগ
              </h4>
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-800">
                <span className="px-2.5 py-1 bg-gray-100 rounded-lg hover:bg-emerald-100 transition cursor-pointer">Facebook</span>
                <span className="px-2.5 py-1 bg-gray-100 rounded-lg hover:bg-emerald-100 transition cursor-pointer">YouTube</span>
                <span className="px-2.5 py-1 bg-gray-100 rounded-lg hover:bg-emerald-100 transition cursor-pointer">Twitter</span>
              </div>
            </div>
          </div>

          {/* Real Interactive Google Map - stretches naturally to align with right card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex-1 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold text-gray-800">বিদ্যালয়ের অবস্থান (গুগল ম্যাপ)</h4>
              </div>
              <a
                href={directMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
              >
                <span>বড় ম্যাপে দেখুন</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="w-full flex-1 min-h-[170px] sm:min-h-[190px] rounded-xl overflow-hidden border border-gray-200/80 shadow-2xs relative bg-gray-100">
              <iframe
                title="Google Map Location"
                src={getMapEmbedUrl()}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <p className="text-[11px] text-gray-500 text-center font-medium">
              📍 {siteSettings.address || 'দাদরা, জয়পুরহাট সদর, রাজশাহী, বাংলাদেশ'}
            </p>
          </div>
        </div>

        {/* Right 7 cols: "বার্তা পাঠান" Form - full height with equal stretch */}
        <div className="lg:col-span-7 h-full flex flex-col">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-1">বার্তা পাঠান</h3>
            <p className="text-xs text-gray-500 mb-6">নিচের ফর্ম পূরণ করে আমাদের বার্তা পাঠান</p>

            {submitted && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs sm:text-sm font-medium animate-fadeIn">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে! অ্যাডমিন প্যানেল থেকে দ্রুত উত্তর দেওয়া হবে।</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="আপনার নাম"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ইমেইল</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ফোন *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+880..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">বিষয়</label>
                  <input
                    type="text"
                    placeholder="বার্তার বিষয়"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block text-xs font-bold text-gray-700 mb-1">বার্তা *</label>
                <textarea
                  required
                  placeholder="আপনার বার্তা লিখুন..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full flex-1 min-h-[140px] px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white text-sm font-semibold px-6 py-2.5 rounded-lg shadow-xs hover:shadow transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>বার্তা পাঠান</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
