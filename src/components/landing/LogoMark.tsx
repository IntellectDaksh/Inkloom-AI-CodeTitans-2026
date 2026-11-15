// AdSnitch mark: a speech bubble whose risky line is redacted, and the redaction bar breaks out of the bubble.
// Body uses currentColor so it follows light/dark text; the bar keeps the brand coral.
export function LogoMark({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden="true" focusable="false">
      <path
        d="M6.5 5h19A3.5 3.5 0 0 1 29 8.5v10a3.5 3.5 0 0 1-3.5 3.5H14l-6 5v-5H6.5A3.5 3.5 0 0 1 3 18.5v-10A3.5 3.5 0 0 1 6.5 5Z"
        fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round"
      />
      <rect x="8" y="9.6" width="10" height="2.6" rx="1.3" fill="currentColor" />
      <rect x="8" y="14.4" width="23" height="4.2" rx="1" fill="#e5535d" />
    </svg>
  );
}
