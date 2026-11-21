import { useId } from "react";

// Hand-drawn style village illustrations as inline SVG: no image downloads, crisp on any screen,
// and they load instantly on slow village internet.

// Pass label="" when the scene is purely decorative.
export function VillageScene({ className = "", label = "Gaon ka drishya: ghar, khet, aur cycle pe sample lene aata collector" }) {
  const uid = useId().replace(/:/g, "");
  const sky = `sky-${uid}`;
  const field = `field-${uid}`;
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  return (
    <svg className={`village-scene ${className}`} viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice" {...a11y}>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe2b8" />
          <stop offset="1" stopColor="#fff6e8" />
        </linearGradient>
        <linearGradient id={field} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9ccc7c" />
          <stop offset="1" stopColor="#6fae5c" />
        </linearGradient>
      </defs>
      <rect width="360" height="200" fill={`url(#${sky})`} />
      {/* sun and birds */}
      <circle cx="292" cy="46" r="30" fill="#ffd27a" opacity="0.5" />
      <circle cx="292" cy="46" r="22" fill="#f6a935" />
      <path d="M70 40 q6 -6 12 0 q6 -6 12 0" stroke="#7a5a3a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M104 28 q4 -4 8 0 q4 -4 8 0" stroke="#7a5a3a" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* hills */}
      <path d="M0 120 Q60 80 120 112 T240 104 T360 96 V140 H0 Z" fill="#c4e0b0" />
      <path d="M0 132 Q90 104 180 126 T360 118 V150 H0 Z" fill="#a9d08f" />
      {/* field with crop rows */}
      <rect y="138" width="360" height="62" fill={`url(#${field})`} />
      {[150, 162, 174, 186].map((y) => (
        <path key={y} d={`M0 ${y} Q180 ${y - 6} 360 ${y}`} stroke="#5d9a4c" strokeWidth="1.5" fill="none" opacity="0.6" />
      ))}
      {/* dirt road */}
      <path d="M150 200 C170 170 210 156 260 148 L290 148 C250 160 222 176 214 200 Z" fill="#e8cf9e" />
      {/* tree */}
      <rect x="18" y="100" width="7" height="42" rx="2" fill="#7a4e2a" />
      <circle cx="21" cy="96" r="18" fill="#4e9450" />
      <circle cx="8" cy="106" r="11" fill="#5aa35a" />
      <circle cx="34" cy="106" r="12" fill="#5aa35a" />
      {/* hut 1 */}
      <rect x="46" y="112" width="54" height="34" fill="#efcf9a" stroke="#9a6a35" strokeWidth="1.5" />
      <path d="M38 114 L73 88 L108 114 Z" fill="#c08a3e" stroke="#8a5a26" strokeWidth="1.5" />
      <path d="M48 106 L73 92 M58 112 L78 96 M90 108 L73 94" stroke="#a5722f" strokeWidth="1" />
      <rect x="66" y="124" width="14" height="22" rx="1" fill="#7a4a24" />
      <rect x="88" y="120" width="8" height="8" fill="#7a4a24" />
      {/* hut 2 */}
      <rect x="112" y="122" width="36" height="24" fill="#f3d9aa" stroke="#9a6a35" strokeWidth="1.5" />
      <path d="M106 124 L130 106 L154 124 Z" fill="#b97f35" stroke="#8a5a26" strokeWidth="1.5" />
      <rect x="125" y="131" width="10" height="15" fill="#7a4a24" />
      {/* lab / clinic */}
      <rect x="236" y="98" width="70" height="48" rx="3" fill="#ffffff" stroke="#0f766e" strokeWidth="2" />
      <path d="M230 100 L271 80 L312 100 Z" fill="#0f766e" />
      <rect x="262" y="120" width="18" height="26" fill="#cfe9e4" stroke="#0f766e" strokeWidth="1.5" />
      <rect x="244" y="108" width="12" height="10" fill="#cfe9e4" stroke="#0f766e" strokeWidth="1" />
      <rect x="286" y="108" width="12" height="10" fill="#cfe9e4" stroke="#0f766e" strokeWidth="1" />
      <rect x="262" y="86" width="18" height="12" rx="2" fill="#fff" />
      <path d="M271 88 v8 M267 92 h8" stroke="#d93a3a" strokeWidth="2.5" strokeLinecap="round" />
      {/* collector on bicycle */}
      <g transform="translate(176 150)">
        <circle cx="0" cy="22" r="11" fill="none" stroke="#2d3a45" strokeWidth="2.5" />
        <circle cx="34" cy="22" r="11" fill="none" stroke="#2d3a45" strokeWidth="2.5" />
        <path d="M0 22 L14 6 L30 6 L34 22 M14 6 L20 22 L0 22 M30 6 L28 0" stroke="#2d3a45" strokeWidth="2.2" fill="none" strokeLinejoin="round" />
        <path d="M17 -14 L20 4" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" />
        <circle cx="16" cy="-21" r="6" fill="#8d5a3b" />
        <path d="M10 -24 q6 -6 12 0" fill="#2d3a45" />
        <path d="M19 -10 L30 -2" stroke="#8d5a3b" strokeWidth="3" strokeLinecap="round" />
        <rect x="2" y="-8" width="12" height="10" rx="2" fill="#fff" stroke="#d93a3a" strokeWidth="1.5" />
        <path d="M8 -6 v6 M5 -3 h6" stroke="#d93a3a" strokeWidth="1.8" />
      </g>
    </svg>
  );
}

// Small spot illustrations for the big action buttons
export function TestIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="spot">
      <circle cx="32" cy="32" r="30" fill="#ffe3e3" />
      <path d="M24 14 h16 M28 14 v28 a6 6 0 0 0 12 0 V14" fill="#fff" stroke="#b42318" strokeWidth="3" strokeLinejoin="round" />
      <path d="M28 32 h12 v10 a6 6 0 0 1 -12 0 Z" fill="#e5484d" />
      <path d="M18 30 c0 -6 5 -10 5 -14 c0 4 5 8 5 14 a5 5 0 0 1 -10 0 Z" fill="#e5484d" />
    </svg>
  );
}

export function DoctorIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="spot">
      <circle cx="32" cy="32" r="30" fill="#e6e4fb" />
      <path d="M20 16 v12 a10 10 0 0 0 20 0 V16" fill="none" stroke="#4338ca" strokeWidth="3" strokeLinecap="round" />
      <path d="M30 38 v4 a8 8 0 0 0 16 0 v-6" fill="none" stroke="#4338ca" strokeWidth="3" strokeLinecap="round" />
      <circle cx="46" cy="32" r="5" fill="#fff" stroke="#4338ca" strokeWidth="3" />
      <circle cx="20" cy="15" r="2.5" fill="#4338ca" />
      <circle cx="40" cy="15" r="2.5" fill="#4338ca" />
    </svg>
  );
}

export function ReportIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="spot">
      <circle cx="32" cy="32" r="30" fill="#fdefd3" />
      <path d="M20 12 h18 l8 8 v32 H20 Z" fill="#fff" stroke="#8a5a00" strokeWidth="3" strokeLinejoin="round" />
      <path d="M38 12 v8 h8" fill="none" stroke="#8a5a00" strokeWidth="3" strokeLinejoin="round" />
      <path d="M26 30 h14 M26 37 h14 M26 44 h8" stroke="#c98a12" strokeWidth="3" strokeLinecap="round" />
      <circle cx="44" cy="46" r="8" fill="#157f3c" />
      <path d="M40 46 l3 3 l5 -6" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
