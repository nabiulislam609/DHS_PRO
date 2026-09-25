import React from 'react';
import { useSchool } from '../../context/SchoolContext';

export const ResultsTrend: React.FC = () => {
  const { performanceTrends } = useSchool();

  // Sort by year ascending
  const sortedTrends = [...performanceTrends].sort((a, b) =>
    a.year.localeCompare(b.year)
  );

  const maxAPlus = Math.max(50, ...sortedTrends.map((t) => t.aPlus || 0));

  // Compute SVG coordinates for the GPA Line Chart
  const total = sortedTrends.length;
  const points = sortedTrends.map((d, idx) => {
    const x = total <= 1 ? 250 : 60 + (idx / (total - 1)) * 390;
    // Map GPA 4.00 - 5.00 to y coordinate between 175 (bottom) and 30 (top)
    const normalizedGPA = Math.max(0, Math.min(1, ((d.gpa || 0) - 4.0) / 1.0));
    const y = 175 - normalizedGPA * 145;
    return { ...d, x, y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} 190 L ${points[0].x} 190 Z`
      : '';

  return (
    <section id="results-trend" className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          একাডেমিক পারফরম্যান্স
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          এসএসসি ফলাফলের ধারা
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          গত ৫ বছরের একাডেমিক পারফরম্যান্স এক নজরে
        </p>
      </div>

      {sortedTrends.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-400">
          কোনো ফলাফলের ধারা তথ্য পাওয়া যায়নি।
        </div>
      ) : (
        /* 2 Charts Grid matching screenshot */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Chart: পাশের হার ও A+ হার */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-base text-gray-900">পাশের হার ও A+ হার</h3>
                <p className="text-xs text-gray-500">গত ৫ বছরে পাশের হার ও জিপিএ ৫</p>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-3 h-3 rounded-xs bg-emerald-700 inline-block" />
                  পাশের হার (%)
                </span>
                <span className="flex items-center gap-1.5 text-amber-600">
                  <span className="w-3 h-3 rounded-xs bg-amber-400 inline-block" />
                  A+ (%)
                </span>
              </div>
            </div>

            {/* Bar Chart Container */}
            <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-2 px-4 border-b border-gray-100 relative">
              {/* Horizontal guide lines */}
              <div className="absolute inset-x-0 top-8 border-b border-dashed border-gray-100" />
              <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-gray-100" />

              {sortedTrends.map((d, i) => (
                <div key={d.id || i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="flex items-end gap-1.5 h-full w-full justify-center">
                    {/* Pass Rate Bar */}
                    <div
                      style={{ height: `${Math.min(100, Math.max(10, (d.passRate / 100) * 100))}%` }}
                      className="w-5 sm:w-7 bg-emerald-700 rounded-t-sm transition-all duration-300 group-hover:bg-emerald-600 relative flex justify-center cursor-pointer shadow-xs"
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-7 text-[10px] font-bold bg-gray-900 text-white px-2 py-0.5 rounded shadow-sm transition pointer-events-none whitespace-nowrap z-10">
                        {d.passRate}%
                      </span>
                    </div>

                    {/* A+ Bar */}
                    <div
                      style={{ height: `${Math.min(100, Math.max(8, (d.aPlus / maxAPlus) * 100))}%` }}
                      className="w-4 sm:w-6 bg-amber-400 rounded-t-sm transition-all duration-300 group-hover:bg-amber-500 relative flex justify-center cursor-pointer shadow-xs"
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-7 text-[10px] font-bold bg-gray-900 text-white px-2 py-0.5 rounded shadow-sm transition pointer-events-none whitespace-nowrap z-10">
                        {d.aPlus}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-600">{d.year}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Chart: গড় জিপিএ ধারা */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-base text-gray-900">গড় জিপিএ ধারা</h3>
                <p className="text-xs text-gray-500">গড় GPA — গত ৫ বছর</p>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-2 text-xs font-medium text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span>গড় জিপিএ</span>
              </div>
            </div>

            {/* Line Chart with SVG */}
            <div className="h-64 relative flex flex-col justify-between pt-4 pb-2 px-2">
              <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="gpaGradientDynamic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="30" y1="30" x2="480" y2="30" stroke="#f1f5f9" strokeDasharray="4 4" />
                <line x1="30" y1="75" x2="480" y2="75" stroke="#f1f5f9" strokeDasharray="4 4" />
                <line x1="30" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeDasharray="4 4" />
                <line x1="30" y1="165" x2="480" y2="165" stroke="#f1f5f9" strokeDasharray="4 4" />

                {/* Y Axis Labels */}
                <text x="5" y="34" fontSize="10" fill="#94a3b8">5.00</text>
                <text x="5" y="79" fontSize="10" fill="#94a3b8">4.75</text>
                <text x="5" y="124" fontSize="10" fill="#94a3b8">4.50</text>
                <text x="5" y="169" fontSize="10" fill="#94a3b8">4.25</text>

                {/* Area Under Curve */}
                {areaD && (
                  <path
                    d={areaD}
                    fill="url(#gpaGradientDynamic)"
                  />
                )}

                {/* Trend Line */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Points */}
                {points.map((pt, idx) => (
                  <g key={idx} className="cursor-pointer group">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="5"
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-transform group-hover:scale-125"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill="#1f2937"
                    >
                      {pt.gpa.toFixed(2)}
                    </text>
                    {/* X Axis Year Label */}
                    <text
                      x={pt.x}
                      y="205"
                      textAnchor="middle"
                      fontSize="11"
                      fill="#64748b"
                      fontWeight="500"
                    >
                      {pt.year}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
