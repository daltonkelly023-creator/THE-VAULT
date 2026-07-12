"use client";

import AnimatedSection from "./AnimatedSection";

const logos = [
  { name: "Vogue", abbr: "VG" },
  { name: "Harper's Bazaar", abbr: "HB" },
  { name: "Tatler", abbr: "TL" },
  { name: "The Telegraph", abbr: "TT" },
  { name: "Wallpaper*", abbr: "WP" },
];

export default function PressLogos() {
  return (
    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
      {logos.map((logo, i) => (
        <AnimatedSection key={logo.name} delay={i * 0.1}>
          <div className="group cursor-default">
            <span className="text-2xl font-light tracking-[0.2em] text-gray-700 group-hover:text-gray-500 transition-colors duration-500">
              {logo.abbr}
            </span>
            <span className="block text-[8px] text-gray-800 tracking-widest uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {logo.name}
            </span>
          </div>
        </AnimatedSection>
      ))}
    </div>
  );
}