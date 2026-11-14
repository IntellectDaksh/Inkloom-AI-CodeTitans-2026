// Decorative: a marketer perched on a cloud, puzzling over a claim until the source turns up.
const INK = "#1b2a38";
const SKIN = "#e8b08a";
const SKIN_SH = "#cf9470";
const ICE = "#bcdcf0";
const ICE_SH = "#93bedb";
const CORAL = "#f0644f";
const CLOUD = "#f8f6f2";
const CLOUD_SH = "#d9e4ee";

export function HeroCharacter() {
  return (
    <div className="hero-char" aria-hidden="true">
      <svg viewBox="0 0 360 400" width="100%" role="presentation">
        <defs>
          <filter id="hcShadow" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#1f4466" floodOpacity=".22" />
          </filter>
        </defs>

        {/* speech bubble: the marketer's real question, answered once AdSnitch has checked the ad */}
        <g className="hc-bubble" filter="url(#hcShadow)">
          <path d="M150 22h170a20 20 0 0 1 20 20v26a20 20 0 0 1-20 20h-112l-18 18 2-18h-42a20 20 0 0 1-20-20V42a20 20 0 0 1 20-20Z" fill="#fbfdff" />
          <g className="hc-q-state">
            <text x="166" y="62" fill={INK} fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="19">Can I post this?</text>
            <path d="M166 71h150" stroke={CORAL} strokeWidth="3" strokeLinecap="round" strokeDasharray="2 6" />
          </g>
          <g className="hc-ok-state">
            <circle cx="180" cy="55" r="12" fill="#2f9e6a" />
            <path d="m174 55 4.5 4.5 8-9" fill="none" stroke="#fbfdff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <text x="200" y="62" fill={INK} fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="19">Safe to post</text>
          </g>
        </g>

        {/* floating question marks */}
        <g fill={INK} fontFamily="Space Grotesk, sans-serif" fontWeight="700">
          <text className="hc-q hc-q1" x="58" y="118" fontSize="34" opacity=".85">?</text>
          <text className="hc-q hc-q2" x="92" y="78" fontSize="22" opacity=".55">?</text>
          <text className="hc-q hc-q3" x="290" y="150" fontSize="26" opacity=".65">?</text>
        </g>

        {/* cloud seat */}
        <g filter="url(#hcShadow)">
          <ellipse cx="180" cy="330" rx="140" ry="40" fill={CLOUD} />
          <ellipse cx="110" cy="312" rx="62" ry="40" fill={CLOUD} />
          <ellipse cx="250" cy="314" rx="58" ry="36" fill={CLOUD} />
          <path d="M44 336c40 26 230 30 272 0-20 26-90 34-136 34s-112-8-136-34Z" fill={CLOUD_SH} />
        </g>
        <g className="hc-figure">
          {/* body + legs */}
          <g className="hc-body">
            {/* far leg */}
            <path d="M150 286c18 4 44 6 62 2l8 46-16 4-10-34c-16 2-34 0-48-6Z" fill="#2a3d4f" />
            <path d="M200 334h24a8 8 0 0 1 0 16h-28Z" fill={INK} />
            {/* torso (hoodie) */}
            <path d="M128 200c10-14 46-18 64-6 14 10 18 50 16 92-26 8-60 8-86-2-4-34-4-70 6-84Z" fill={ICE} />
            <path d="M188 196c14 10 18 50 16 90-8 3-16 4-24 5 6-34 6-70 8-95Z" fill={ICE_SH} />
            <path d="M146 196c6 10 22 12 32 2" fill="none" stroke={ICE_SH} strokeWidth="5" strokeLinecap="round" />
            {/* near leg */}
            <path d="M126 282c22 8 58 10 86 4 10 0 14 8 10 16l-4 40-18-2 0-30c-26 4-56 2-76-8Z" fill={INK} />
            <path d="M206 340h26a9 9 0 0 1 0 18h-30Z" fill="#0f1b26" />
            {/* arm holding phone */}
            <path d="M184 214c16 12 30 26 34 40l-14 8c-8-12-18-22-30-30Z" fill={ICE} />
            <circle cx="214" cy="258" r="9" fill={SKIN} />
            <g transform="rotate(-14 236 238)">
              <rect x="218" y="200" width="44" height="76" rx="8" fill={INK} />
              <rect x="222" y="208" width="36" height="60" rx="4" fill="#eaf4fb" />
              <rect x="226" y="214" width="28" height="16" rx="2" fill={ICE} />
              <path d="M226 238h22M226 246h28M226 254h16" stroke="#9fb4c6" strokeWidth="3" strokeLinecap="round" />
              <path d="M226 246h20" stroke={CORAL} strokeWidth="3" strokeLinecap="round" />
            </g>
            <path d="M208 252c4-4 10-4 12 0" fill="none" stroke={SKIN_SH} strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* head + scratching arm */}
          <g className="hc-head">
            <path d="M152 176h18v22h-18Z" fill={SKIN_SH} />
            <ellipse cx="162" cy="146" rx="31" ry="34" fill={SKIN} />
            <path d="M176 120c10 8 16 22 16 36-6-14-14-22-24-26Z" fill={SKIN_SH} opacity=".5" />
            <path d="M130 146c-4-30 18-48 40-46 22 2 30 18 26 34-10-10-24-14-40-12-8 6-14 14-16 26Z" fill={INK} />
            <ellipse cx="132" cy="152" rx="6" ry="8" fill={SKIN_SH} />
            {/* puzzled face: one brow up, eyes glancing at bubble */}
            <path d="M156 136l12-4M178 134l10 2" stroke={INK} strokeWidth="3" strokeLinecap="round" />
            <circle cx="164" cy="148" r="3.2" fill={INK} />
            <circle cx="184" cy="148" r="3.2" fill={INK} />
            <path d="M170 166c4-2 10-1 13 2" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
          </g>
          <path d="M130 212c-14 -16 -18 -40 -8 -60l14 2c-6 18-2 34 8 48Z" fill={ICE_SH} />
          <circle cx="128" cy="146" r="9" fill={SKIN} />
        </g>

      </svg>
    </div>
  );
}
