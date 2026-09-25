import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export const HeroSlider: React.FC = () => {
  const { heroSlides, setIsAdmissionModalOpen, siteSettings, sectionVisibility } = useSchool();

  const activeSlides = heroSlides.filter((s) => s.active);
  const slides = activeSlides.length > 0 ? activeSlides : heroSlides;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [headerHeight, setHeaderHeight] = useState<number>(140);

  // Dynamically calculate and track the exact height of the top header area (Navbar, TopBar, Ticker)
  useEffect(() => {
    const measureHeader = () => {
      const topArea = document.getElementById('top-header-area');
      if (topArea) {
        const height = topArea.getBoundingClientRect().height;
        if (height > 0) {
          const rounded = Math.round(height);
          setHeaderHeight(rounded);
          document.documentElement.style.setProperty('--site-header-height', `${rounded}px`);
          return;
        }
      }

      // Accurate Fallback calculation from siteSettings & sectionVisibility
      let calcH = 0;
      if (siteSettings.showTopBar !== false) {
        const padY =
          siteSettings.topBarPaddingY !== undefined
            ? siteSettings.topBarPaddingY
            : siteSettings.topBarHeight === 'compact'
            ? 3
            : siteSettings.topBarHeight === 'spacious'
            ? 12
            : 6;
        calcH += 24 + padY * 2;
      }

      const navPadY =
        siteSettings.navbarPaddingY !== undefined
          ? siteSettings.navbarPaddingY
          : siteSettings.navbarHeight === 'compact'
          ? 6
          : siteSettings.navbarHeight === 'spacious'
          ? 18
          : 10;
      calcH += 50 + navPadY * 2;

      if (sectionVisibility.ticker && siteSettings.showNoticeTicker !== false) {
        const tickPadY =
          siteSettings.noticeTickerPaddingY !== undefined
            ? siteSettings.noticeTickerPaddingY
            : siteSettings.noticeTickerHeight === 'compact'
            ? 4
            : siteSettings.noticeTickerHeight === 'spacious'
            ? 14
            : 8;
        calcH += 32 + tickPadY * 2;
      }

      const finalH = calcH || 140;
      setHeaderHeight(finalH);
      document.documentElement.style.setProperty('--site-header-height', `${finalH}px`);
    };

    measureHeader();

    const rafId = requestAnimationFrame(measureHeader);
    const timer = setTimeout(measureHeader, 80);

    // Instant observation of any resize/change inside top-header-area
    const topArea = document.getElementById('top-header-area');
    let observer: ResizeObserver | null = null;
    if (topArea && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        measureHeader();
      });
      observer.observe(topArea);
    }

    window.addEventListener('resize', measureHeader);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
      observer?.disconnect();
      window.removeEventListener('resize', measureHeader);
    };
  }, [
    siteSettings.showTopBar,
    siteSettings.topBarHeight,
    siteSettings.topBarPaddingY,
    siteSettings.navbarHeight,
    siteSettings.navbarPaddingY,
    siteSettings.showNoticeTicker,
    siteSettings.noticeTickerHeight,
    siteSettings.noticeTickerPaddingY,
    sectionVisibility.ticker,
  ]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Safeguard index if slide count changes
  useEffect(() => {
    if (currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  if (!slides || slides.length === 0) return null;

  const slide = slides[currentSlide];

  const handleButtonClick = (link?: string) => {
    if (!link || link === '#admission' || link === 'admission') {
      setIsAdmissionModalOpen(true);
    } else if (link.startsWith('#')) {
      const element = document.getElementById(link.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = link;
    }
  };

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-gray-900 scroll-mt-20 flex flex-col justify-center transition-all duration-200"
      style={{
        height: `calc(100dvh - ${headerHeight}px)`,
        minHeight: `calc(100dvh - ${headerHeight}px)`,
      }}
    >
      {/* Background Image with Dark Greenish Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
        style={{
          backgroundImage: `url(${slide.imageUrl})`,
        }}
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-black/80 to-emerald-950/75" />

      {/* Hero Content */}
      <div className="relative max-w-7xl mx-auto w-full h-full px-4 sm:px-8 flex flex-col justify-center items-start text-left">
        <div className="w-full max-w-3xl text-white space-y-5 text-left flex flex-col items-start">
          {/* Badge */}
          {slide.badgeText && (
            <div className="inline-flex items-center text-left bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full backdrop-blur-xs shadow-xs">
              {slide.badgeText}
            </div>
          )}

          {/* Headline */}
          <h2 className="text-left text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
            {slide.title}
          </h2>

          {/* Subtitle */}
          {slide.subtitle && (
            <p className="text-left text-base sm:text-lg lg:text-xl text-gray-200 font-light leading-relaxed max-w-2xl drop-shadow-xs">
              {slide.subtitle}
            </p>
          )}

          {/* CTA Button */}
          {slide.buttonText && (
            <div className="pt-3 flex justify-start w-full">
              <button
                onClick={() => handleButtonClick(slide.buttonLink)}
                className="inline-flex items-center gap-2.5 bg-[#15803d] hover:bg-[#166534] text-white font-semibold text-sm sm:text-base px-7 py-3 rounded-xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{slide.buttonText}</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Prev / Next Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentSlide ? 'w-8 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
