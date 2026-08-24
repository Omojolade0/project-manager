// A waving version of the Coeus brand mark (rounded dark square + periwinkle
// circle, same gradient language as public/coeus-favicon.svg) used to give
// the onboarding wizard a friendly, welcoming feel.
export function OnboardingMascot({ className = "w-28 h-28" }) {
  return (
    <svg
      viewBox="0 0 140 110"
      className={className}
      role="img"
      aria-label="Coeus"
    >
      <defs>
        <linearGradient id="mascot-block" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3A3B52" />
          <stop offset="0.5" stopColor="#1E1E2A" />
          <stop offset="1" stopColor="#0E0E14" />
        </linearGradient>
        <linearGradient id="mascot-disc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C0C2FF" />
          <stop offset="0.55" stopColor="#7C7FF0" />
          <stop offset="1" stopColor="#4A4DC8" />
        </linearGradient>
      </defs>

      {/* Soft shadow */}
      <ellipse cx="66" cy="101" rx="34" ry="5" fill="currentColor" className="text-foreground/10" />

      {/* Waving hand */}
      <path
        d="M18 68 L34 60 L36 71 Z"
        fill="currentColor"
        className="text-muted-foreground/40"
      />

      {/* Periwinkle disc, peeking out behind the block */}
      <circle cx="88" cy="46" r="27" fill="url(#mascot-disc)" />

      {/* Rounded block face */}
      <rect x="26" y="20" width="58" height="58" rx="18" fill="url(#mascot-block)" />
      <path
        d="M38 22.5 H70 A14 14 0 0 1 84 36.5"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.25"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Face */}
      <circle cx="46" cy="49" r="2.6" fill="#FFFFFF" />
      <circle cx="64" cy="49" r="2.6" fill="#FFFFFF" />
      <path
        d="M45 58 Q55 65 65 58"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
