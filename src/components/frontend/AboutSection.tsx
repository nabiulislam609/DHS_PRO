import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { CheckCircle, Bookmark, Compass, Target, Clock, ArrowRight } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { siteSettings, setIsAdmissionModalOpen } = useSchool();

  const introText =
    siteSettings.aboutIntro ||
    '১৯৮২ সালে প্রতিষ্ঠিত দাদরা উচ্চ বিদ্যালয় জয়পুরহাট জেলার অন্যতম প্রাচীন ও স্বনামধন্য শিক্ষা প্রতিষ্ঠান। গত ছয় দশকে এই প্রতিষ্ঠান শত শত কৃতি শিক্ষার্থী তৈরি করেছে যারা দেশে-বিদেশে নিজ নিজ ক্ষেত্রে সুনাম অর্জন করেছেন। আমাদের লক্ষ্য শুধু পাস করানো নয় — আমরা গড়ি সৎ, সুশিক্ষিত, দায়িত্বশীল নাগরিক।';

  const objectivesText =
    siteSettings.objectives ||
    '১. মানসম্মত পাঠদান নিশ্চিত করা\n২. নৈতিক মূল্যবোধ ও দেশপ্রেম জাগ্রত করা\n৩. বিজ্ঞান ও প্রযুক্তিতে দক্ষতা অর্জন\n৪. সহশিক্ষা কার্যক্রমের মাধ্যমে মেধা ও মনন বিকাশ\n৫. দরিদ্র ও মেধাবী শিক্ষার্থীদের জন্য শিক্ষা বৃত্তি প্রদান\n৬. আধুনিক ল্যাব ও লাইব্রেরি সুবিধা নিশ্চিত করা';

  const missionText =
    siteSettings.mission ||
    'মানসম্মত, নৈতিক ও আধুনিক শিক্ষার মাধ্যমে শিক্ষার্থীদের দক্ষ, মূল্যবোধসম্পন্ন ও দেশপ্রেমিক নাগরিক হিসেবে গড়ে তোলা। বিজ্ঞান ও প্রযুক্তিতে দক্ষ, সংস্কারে উন্নত এবং মানবিক মূল্যবোধে ঋদ্ধ একটি প্রজন্ম তৈরিতে নিরলসভাবে কাজ করা।';

  const visionText =
    siteSettings.vision ||
    'একটি আধুনিক, প্রতিযোগিতামূলক ও মানবিক শিক্ষা ব্যবস্থা গড়ে তোলা, যেখানে শিক্ষার্থীরা নিজেদের সম্ভাবনার পূর্ণ বিকাশ ঘটাতে পারবে এবং দেশ ও জাতির জন্য দায়িত্বশীল নেতৃত্ব দিতে প্রস্তুত হবে।';

  const whyUsLines = siteSettings.whyUs
    ? siteSettings.whyUs.split('\n').filter((l) => l.trim().length > 0)
    : [
        'অভিজ্ঞ ও সম্মানিত শিক্ষক মণ্ডলী',
        'আধুনিক বিজ্ঞান ল্যাব ও কম্পিউটার ল্যাব',
        'সুবিশাল গ্রন্থাগার — ৮,০০০+ বই',
        'বিশুদ্ধ পাঠদান পরিবেশ',
        'নিয়মিত ক্রীড়া ও সাংস্কৃতিক কার্যক্রম',
        'ডিজিটাল ক্লাসরুম ও মাল্টিমিডিয়া',
        'বিনামূল্যে সহপাঠ ও পরামর্শ',
        'মেধাবী শিক্ষার্থীদের জন্য বৃত্তি',
      ];

  return (
    <section id="about" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-12">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full">
          পরিচিতি
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          বিদ্যালয় পরিচিতি
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {siteSettings.tagline || 'ঐতিহ্য, মানসম্মত শিক্ষা ও আধুনিক সুযোগ-সুবিধা'}
        </p>
      </div>

      {/* Grid: 2 cols on left (Introduction, Mission, Vision, Objective) + 1 column on right (Why Choose Us) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 cols: 4 Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: ভূমিকা */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
                <Bookmark className="w-4 h-4" />
                <h3 className="text-base text-gray-900">ভূমিকা</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {introText}
              </p>
            </div>
          </div>

          {/* Card 2: উদ্দেশ্য */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
                <Target className="w-4 h-4" />
                <h3 className="text-base text-gray-900">উদ্দেশ্য</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line font-medium">
                {objectivesText}
              </p>
            </div>
          </div>

          {/* Card 3: লক্ষ্য */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
                <Compass className="w-4 h-4" />
                <h3 className="text-base text-gray-900">লক্ষ্য (Mission)</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {missionText}
              </p>
            </div>
          </div>

          {/* Card 4: দৃষ্টি */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
                <Bookmark className="w-4 h-4" />
                <h3 className="text-base text-gray-900">দৃষ্টি (Vision)</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {visionText}
              </p>
            </div>
          </div>
        </div>

        {/* Right 4 cols: Why Choose Us (Dark Green Banner) */}
        <div className="lg:col-span-4 bg-[#0f5338] text-white p-6 sm:p-7 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-300 font-bold text-xs uppercase tracking-wider">সুবিধা</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-4">
              কেন আমাদের বেছে নিবেন
            </h3>

            <ul className="space-y-2.5 text-xs text-emerald-100">
              {whyUsLines.map((line, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick CTA inside banner */}
          <div className="pt-6 border-t border-emerald-800/80 mt-6">
            <button
              onClick={() => setIsAdmissionModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md"
            >
              <span>অনলাইনে ভর্তি আবেদন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
