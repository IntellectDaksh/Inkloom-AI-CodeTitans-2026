"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import "./landing.css";

type IconName =
  | "shield"
  | "arrow"
  | "check"
  | "alert"
  | "scan"
  | "database"
  | "file"
  | "users"
  | "lock"
  | "branch"
  | "spark"
  | "menu"
  | "close"
  | "clock"
  | "scale"
  | "code"
  | "layers"
  | "chart"
  | "globe";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    shield: (
      <>
        <path d="M12 3 5 6v5.5c0 4.2 2.8 7.8 7 9.5 4.2-1.7 7-5.3 7-9.5V6l-7-3Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m14 7 5 5-5 5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    alert: (
      <>
        <path d="M12 3 2.8 20h18.4L12 3Z" />
        <path d="M12 9v4.5M12 17h.01" />
      </>
    ),
    scan: (
      <>
        <path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" />
        <path d="M8 12h8" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
        <path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
      </>
    ),
    file: (
      <>
        <path d="M7 3h7l4 4v14H7V3Z" />
        <path d="M14 3v5h4M10 13h5M10 17h5" />
      </>
    ),
    users: (
      <>
        <path d="M16 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="9.5" cy="7" r="3" />
        <path d="M17 11a3 3 0 1 0 0-6M21 20v-2a4 4 0 0 0-2.5-3.7" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
    branch: (
      <>
        <circle cx="6" cy="5" r="2" />
        <circle cx="18" cy="7" r="2" />
        <circle cx="6" cy="19" r="2" />
        <path d="M6 7v10M8 7h4a6 6 0 0 1 6 6V9" />
      </>
    ),
    spark: (
      <path d="m12 2 1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2ZM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    scale: (
      <>
        <path d="M12 3v18M5 7h14M6 7l-3 6h6L6 7ZM18 7l-3 6h6l-3-6ZM8 21h8" />
      </>
    ),
    code: <path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" />,
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const scenarios = [
  {
    short: "Clinical nutrition",
    brand: "Apex Nutrition",
    score: 18,
    copy: "Our proprietary formula gives you 2x faster muscle recovery and builds lean mass in just 14 days without dietary changes.",
    flags: [
      [
        "2x faster",
        "Unverified multiplier metric",
        "Critical",
        "Quantitative performance claims require competent, reliable substantiation.",
        "FTC Act §5 / 16 CFR §255.2",
      ],
      [
        "just 14 days",
        "Ungrounded time-bound outcome",
        "High",
        "The draft states a guaranteed biological result within a fixed period.",
        "FDA 21 CFR §101.93(g)",
      ],
      [
        "without dietary changes",
        "Effortless-result implication",
        "High",
        "The surrounding language removes the conditions needed to support the outcome.",
        "FDA DSHEA §403(r)(6)",
      ],
    ],
    replacement:
      "Our tested formula supports muscle protein synthesis and lean mass development when paired with consistent resistance training.",
    evidence: {
      claimCode: "CLM-APX-001",
      source: "Clinical study report / muscle protein synthesis biomarkers",
      reference: "Internal evidence record · validation pending",
      scope: "Apex Nutrition workspace only",
    },
  },
  {
    short: "Enterprise SaaS",
    brand: "Zenith Cloud",
    score: 31,
    copy: "Guaranteed 100% zero-downtime SLA with military-grade unhackable encryption verified by ISO-27001.",
    flags: [
      [
        "Guaranteed 100%",
        "Absolute performance promise",
        "Critical",
        "The promise exceeds the measurable availability terms in the draft SLA.",
        "Contract evidence / SLA schedule",
      ],
      [
        "unhackable",
        "Unverifiable security superlative",
        "Critical",
        "Absolute security language cannot be substantiated as a durable state.",
        "FTC truth-in-advertising principles",
      ],
      [
        "verified by ISO-27001",
        "Certification language requires proof",
        "High",
        "The named scope, certificate holder and current validity must match the claim.",
        "ISO/IEC 27001 certificate scope",
      ],
    ],
    replacement:
      "Contractual 99.99% multi-region uptime SLA with documented encryption controls and independently reviewed security practices.",
    evidence: {
      claimCode: "CLM-ZEN-014",
      source: "Enterprise SLA and security assurance package",
      reference: "Contract schedule · certificate scope required",
      scope: "Zenith Cloud workspace only",
    },
  },
  {
    short: "Skincare",
    brand: "Lumina Labs",
    score: 24,
    copy: "Our miracle serum permanently reverses wrinkles and repairs skin at the cellular level in 48 hours.",
    flags: [
      [
        "miracle",
        "Deceptive superlative",
        "Critical",
        "The term implies an extraordinary outcome without an objective basis.",
        "FTC advertising substantiation",
      ],
      [
        "permanently reverses",
        "Drug-like anatomical claim",
        "Critical",
        "Permanent structural-change language can move cosmetic copy into drug-claim territory.",
        "FD&C Act §201(g)",
      ],
      [
        "in 48 hours",
        "Unsupported time-bound result",
        "High",
        "A fixed visible-result window requires matching instrumental or clinical evidence.",
        "MoCRA / substantiation record",
      ],
    ],
    replacement:
      "Our serum is formulated to improve the appearance of fine lines and support smoother-looking skin with continued use.",
    evidence: {
      claimCode: "CLM-LUM-008",
      source: "Instrumental skin assessment and approved cosmetic claims",
      reference: "Evidence record · no permanent-effect study found",
      scope: "Lumina Labs workspace only",
    },
  },
];

const comparisonRows = [
  {
    dimension: "Claim ground truth",
    generic: "Can invent or misstate citations",
    writer: "Optimises language, not proof",
    scheduler: "Distributes whatever it receives",
    adsnitch: "Checks claims against scoped evidence",
  },
  {
    dimension: "Evidence provenance",
    generic: "Links may be incomplete or unverifiable",
    writer: "No assay or source validation",
    scheduler: "No source-chain capability",
    adsnitch: "Keeps references attached to findings",
  },
  {
    dimension: "Change precision",
    generic: "Typically rewrites full passages",
    writer: "Replaces sentences or sections",
    scheduler: "No copy-level correction",
    adsnitch: "Exact token-level surgical diff",
  },
  {
    dimension: "Expiry & re-review",
    generic: "No memory across governed documents",
    writer: "No dependent-content indexing",
    scheduler: "No claim dependency model",
    adsnitch: "Can cascade review when evidence expires",
  },
  {
    dimension: "Human authority",
    generic: "Prompt-level acceptance",
    writer: "Comments and approvals vary",
    scheduler: "Publish permissions, not legal sign-off",
    adsnitch: "Explicit reviewer gate and override record",
  },
  {
    dimension: "Channel disclosures",
    generic: "Broad warnings without channel context",
    writer: "Static disclaimer templates",
    scheduler: "Character counts and scheduling rules",
    adsnitch: "Channel-aware disclosure requirements",
  },
];

const pipeline = [
  [
    "01",
    "Ingest",
    "Break content into atomic claims and quantitative spans.",
    "file",
    "Atomic claim map",
  ],
  [
    "02",
    "Preflight",
    "Trap absolutes and risky superlatives before model analysis.",
    "scan",
    "Deterministic rule hits",
  ],
  [
    "03",
    "Retrieve",
    "Search only the evidence and rules scoped to your workspace.",
    "database",
    "Brand-scoped evidence set",
  ],
  [
    "04",
    "Analyse",
    "Evaluate statutory nuance, claim meaning and brand context.",
    "spark",
    "Contextual risk model",
  ],
  [
    "05",
    "Ground",
    "Connect findings to source records and reference chains.",
    "branch",
    "Linked provenance chain",
  ],
  [
    "06",
    "Diff",
    "Compile precise replacements while preserving approved copy.",
    "code",
    "Token-level redline",
  ],
  [
    "07",
    "Approve",
    "Route every decision through accountable human review.",
    "users",
    "Signed human decision",
  ],
  [
    "08",
    "Record",
    "Preserve the decision trail and cascade future re-reviews.",
    "lock",
    "Audit event + dependencies",
  ],
];

function Logo() {
  return (
    <a className="brand" href="#top" aria-label="AdSnitch home">
      <span className="brand-mark">
        <Icon name="shield" size={19} />
      </span>
      <span>AdSnitch</span>
    </a>
  );
}

function ArrowLink({
  children,
  href = "#sandbox",
  light = false,
}: {
  children: ReactNode;
  href?: string;
  light?: boolean;
}) {
  return (
    <a className={`arrow-link ${light ? "arrow-link-light" : ""}`} href={href}>
      <span>{children}</span>
      <i>
        <Icon name="arrow" size={16} />
      </i>
    </a>
  );
}

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <span className={`eyebrow ${light ? "eyebrow-light" : ""}`}>
      <i />
      {children}
    </span>
  );
}

function RiskPill({ level }: { level: string }) {
  return (
    <span className={`risk-pill risk-${level.toLowerCase()}`}>
      <i />
      {level}
    </span>
  );
}

function HighlightedClaim({ index }: { index: number }) {
  const claims = [
    <>
      Our proprietary formula gives you <mark>2x faster</mark> muscle recovery and builds lean mass
      in <mark>just 14 days</mark> <mark>without dietary changes</mark>.
    </>,
    <>
      <mark>Guaranteed 100%</mark> zero-downtime SLA with military-grade <mark>unhackable</mark>{" "}
      encryption <mark>verified by ISO-27001</mark>.
    </>,
    <>
      Our <mark>miracle</mark> serum <mark>permanently reverses</mark> wrinkles and repairs skin at
      the cellular level <mark>in 48 hours</mark>.
    </>,
  ];

  return claims[index];
}

function Contours() {
  return (
    <svg className="contours" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true">
      {Array.from({ length: 13 }, (_, i) => (
        <path
          key={i}
          d={`M-120 ${110 + i * 22} C 130 ${10 + i * 21}, 270 ${250 + i * 12}, 500 ${130 + i * 15} S 850 ${25 + i * 24}, 1320 ${150 + i * 18}`}
        />
      ))}
    </svg>
  );
}

function AuditPreview({ scenario = scenarios[0] }: { scenario?: (typeof scenarios)[number] }) {
  return (
    <div className="audit-preview">
      <div className="preview-bar">
        <div>
          <span className="mini-logo">
            <Icon name="shield" size={12} />
          </span>
          <b>Claim review</b>
          <small>/ {scenario.brand}</small>
        </div>
        <div className="preview-status">
          <i />
          Governance engine active
        </div>
      </div>
      <div className="preview-body">
        <aside className="preview-rail">
          <span className="active">
            <Icon name="scan" size={16} />
          </span>
          <span>
            <Icon name="database" size={16} />
          </span>
          <span>
            <Icon name="branch" size={16} />
          </span>
          <span>
            <Icon name="users" size={16} />
          </span>
        </aside>
        <div className="preview-document">
          <div className="ui-label">
            <span>Campaign draft</span>
            <span>CLM–0842</span>
          </div>
          <p className="preview-copy">
            Our proprietary formula gives you <mark>2x faster</mark> muscle recovery and builds lean
            mass in <mark>just 14 days</mark> <mark>without dietary changes</mark>.
          </p>
          <div className="token-legend">
            <span>
              <i /> 3 unsupported spans
            </span>
            <span>31 tokens analysed</span>
          </div>
          <div className="surgical-strip">
            <div>
              <span className="diff-sign">−</span>
              <p>
                gives you <del>2x faster</del> muscle recovery
              </p>
            </div>
            <div>
              <span className="diff-sign">+</span>
              <p>
                <ins>supports</ins> muscle recovery
              </p>
            </div>
          </div>
        </div>
        <div className="preview-findings">
          <div className="findings-title">
            <span>Findings</span>
            <b>3</b>
          </div>
          <div className="score-orbit">
            <div>
              <strong>{scenario.score}</strong>
              <span>/100</span>
            </div>
            <small>Publication score</small>
          </div>
          {scenario.flags.map(([phrase, reason, level]) => (
            <div className="finding" key={phrase}>
              <RiskPill level={level} />
              <b>“{phrase}”</b>
              <span>{reason}</span>
            </div>
          ))}
          <div className="human-gate">
            <span>
              <Icon name="users" size={16} />
            </span>
            <div>
              <b>Human sign-off required</b>
              <small>Legal & Regulatory</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState(0);
  const [showFix, setShowFix] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  const scenario = scenarios[activeScenario];

  const selectScenario = (index: number) => {
    setActiveScenario(index);
    setShowFix(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")),
      { threshold: 0.13 },
    );
    // Cards and rows also fade up as they enter, staggered within each group.
    document
      .querySelectorAll(
        ".ev-card, .lab-copy, .lab-report, .pipeline-list button, .sectors-section article, .comparison-section article, .incident-section article, .security-section article, .prototype-facts span, .ev-guarantees li",
      )
      .forEach((node, i) => {
        node.classList.add("reveal");
        (node as HTMLElement).style.transitionDelay = `${(i % 5) * 70}ms`;
      });
    document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="site" id="top">
      <div className="global-atmosphere" aria-hidden="true">
        <i className="atmosphere-one" />
        <i className="atmosphere-two" />
        <i className="atmosphere-three" />
      </div>
      <header className="top-nav">
        <nav className="nav-inner" aria-label="Primary navigation">
          <Logo />
          <div className="nav-center">
            <a href="#sandbox">Workbench</a>
            <a href="#pipeline">Architecture</a>
            <a href="#sectors">Sectors</a>
            <a href="/evaluations">Evaluations &amp; Benchmarks</a>
            <a href="/knowledge-base/claims">Claims Library</a>
          </div>
          <div className="nav-end">
            <a className="nav-signin" href="/auth/login">
              Sign In
            </a>
            <a className="nav-launch" href="/dashboard">
              Launch App <Icon name="arrow" size={14} />
            </a>
          </div>
          <button
            className="nav-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <Icon name={menuOpen ? "close" : "menu"} size={20} />
          </button>
        </nav>
        {menuOpen && (
          <div className="mobile-nav">
            {[
              ["Workbench", "#sandbox"],
              ["Architecture", "#pipeline"],
              ["Sectors", "#sectors"],
              ["Evaluations & Benchmarks", "/evaluations"],
              ["Claims Library", "/knowledge-base/claims"],
              ["Sign In", "/auth/login"],
              ["Launch App", "/dashboard"],
            ].map(([label, href]) => (
              <a key={label} href={href} onClick={() => setMenuOpen(false)}>
                {label} <Icon name="arrow" size={15} />
              </a>
            ))}
          </div>
        )}
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-aurora" />
          <Contours />
          <div className="hero-content">
            <div className="rename-note">
              <span>Inkloom AI</span>
              <Icon name="arrow" size={12} />
              <b>is becoming AdSnitch</b>
            </div>
            <div className="hero-kicker">
              <span>
                <Icon name="shield" size={13} />
              </span>
              CodeTitans India 2026 · Working governance prototype
            </div>
            <h1 className="hero-doc-title">
              Check the claim.
              <br />
              Show the source.
              <br />
              <span>Keep people in control.</span>
            </h1>
            <div className="hero-subrow">
              <p>
                AdSnitch reads your ad copy before it goes live. It checks every claim against
                approved evidence and brand rules, shows the exact source, suggests a safe rewrite,
                and sends risky lines to a person to sign off. Fewer fines, fewer takedowns, no
                invented proof.
              </p>
              <div className="hero-actions">
                <ArrowLink href="#sandbox">Try a live check</ArrowLink>
                <div className="hero-secondary">
                  <a href="/dashboard">Open the app</a>
                  <a href="/evaluations">See benchmarks</a>
                </div>
              </div>
            </div>
            <div className="prototype-facts">
              <span>
                <i>01</i> Full check in under 400 ms
              </span>
              <span>
                <i>02</i> FTC and FDA disclosure rules built in
              </span>
              <span>
                <i>03</i> 58 of 58 automated tests passing
              </span>
            </div>
          </div>

          <div className="hero-editorial reveal visible">
            <svg className="hero-illo" viewBox="0 0 1180 590" role="img" aria-label="An ad draft's claim is checked against three evidence sources and routed to a reviewer decision">
              <defs>
                <linearGradient id="hiCard" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#163447" />
                  <stop offset="1" stopColor="#0c2232" />
                </linearGradient>
                <pattern id="hiGrid" width="28" height="28" patternUnits="userSpaceOnUse">
                  <path d="M28 0H0V28" fill="none" stroke="rgba(124,221,255,.06)" />
                </pattern>
              </defs>
              <rect width="1180" height="590" fill="url(#hiGrid)" />
              <circle cx="900" cy="120" r="220" fill="rgba(124,221,255,.06)" />
              {/* draft card */}
              <g transform="translate(70 70)">
                <rect width="330" height="300" rx="20" fill="url(#hiCard)" stroke="rgba(200,241,255,.18)" />
                <circle cx="26" cy="26" r="5" fill="#ff7a82" /><circle cx="44" cy="26" r="5" fill="#ffc76b" /><circle cx="62" cy="26" r="5" fill="#73e0ba" />
                <text x="26" y="72" className="hi-label">AD DRAFT · LANDING PAGE</text>
                <rect x="26" y="92" width="250" height="10" rx="5" fill="rgba(220,228,236,.28)" />
                <rect x="26" y="114" width="200" height="10" rx="5" fill="rgba(220,228,236,.2)" />
                <rect x="26" y="142" width="74" height="10" rx="5" fill="rgba(220,228,236,.2)" />
                <rect x="108" y="134" width="112" height="26" rx="7" fill="rgba(255,122,130,.16)" stroke="#ff7a82" />
                <text x="164" y="152" textAnchor="middle" className="hi-mark">2x faster</text>
                <rect x="228" y="142" width="70" height="10" rx="5" fill="rgba(220,228,236,.2)" />
                <rect x="26" y="176" width="230" height="10" rx="5" fill="rgba(220,228,236,.16)" />
                <rect x="26" y="198" width="160" height="10" rx="5" fill="rgba(220,228,236,.12)" />
                <rect x="26" y="240" width="120" height="34" rx="10" fill="rgba(124,221,255,.12)" />
                <text x="86" y="262" textAnchor="middle" className="hi-chip">Score 62 / 100</text>
              </g>
              {/* connectors */}
              <g fill="none" strokeWidth="2" className="hi-flow">
                <path d="M400 217 C470 217 470 110 540 110" stroke="#7cddff" />
                <path d="M400 217 L540 217" stroke="#7cddff" />
                <path d="M400 217 C470 217 470 324 540 324" stroke="#7cddff" />
                <path d="M800 110 C860 110 860 217 900 217" stroke="rgba(200,241,255,.35)" />
                <path d="M800 217 L900 217" stroke="rgba(200,241,255,.35)" />
                <path d="M800 324 C860 324 860 217 900 217" stroke="rgba(200,241,255,.35)" />
              </g>
              {/* sources */}
              {[
                [80, "Clinical trial registry", "No matching outcome", "#ff7a82", "✕"],
                [187, "Published research", "Insufficient support", "#ffc76b", "~"],
                [294, "Brand guidelines", "Rule matched", "#73e0ba", "✓"],
              ].map(([y, t, d, c, g]) => (
                <g key={t as string} transform={`translate(540 ${y})`}>
                  <rect width="260" height="60" rx="14" fill="url(#hiCard)" stroke="rgba(200,241,255,.16)" />
                  <circle cx="30" cy="30" r="14" fill="none" stroke={c as string} strokeWidth="2" />
                  <text x="30" y="35" textAnchor="middle" fill={c as string} className="hi-glyph">{g}</text>
                  <text x="56" y="26" className="hi-title">{t}</text>
                  <text x="56" y="44" className="hi-sub">{d}</text>
                </g>
              ))}
              {/* decision */}
              <g transform="translate(900 132)">
                <rect width="210" height="170" rx="20" fill="#f7f9ff" />
                <path d="M105 26 l30 11 v22 c0 20 -13 33 -30 40 c-17 -7 -30 -20 -30 -40 v-22z" fill="rgba(75,199,244,.16)" stroke="#2697bd" strokeWidth="2" />
                <path d="M93 58 l9 9 17 -18" fill="none" stroke="#2697bd" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <text x="105" y="128" textAnchor="middle" className="hi-dec">Revise claim</text>
                <text x="105" y="148" textAnchor="middle" className="hi-dec-sub">Routed to legal review</text>
              </g>
            </svg>
            <div className="editorial-caption">
              <span className="caption-mark">
                <Icon name="shield" size={19} />
              </span>
              <div>
                <small>AdSnitch governance principle</small>
                <b>Every consequential sentence should carry its proof and its owner.</b>
              </div>
            </div>
            <div className="editorial-signal">
              <i />
              Evidence stays attached through review
            </div>
          </div>
        </section>

        <section className="signal-rail" aria-label="Platform capabilities">
          <div className="signal-marquee">
            {[0, 1].map((set) => (
              <div key={set}>
                <span>Clinical claims</span>
                <i>✦</i>
                <span>Trademark risk</span>
                <i>✦</i>
                <span>SEC disclosures</span>
                <i>✦</i>
                <span>Brand voice</span>
                <i>✦</i>
                <span>ISO standards</span>
                <i>✦</i>
                <span>Human approval</span>
                <i>✦</i>
                <span>CodeTitans 2026</span>
                <i>✦</i>
              </div>
            ))}
          </div>
        </section>

        <section className="intro-section">
          <div className="intro-index reveal">01 / THE CONTROL GAP</div>
          <div className="intro-statement reveal">
            <p className="intro-lead">
              Marketing tools help teams <span>publish faster.</span>
            </p>
            <p>
              AdSnitch helps them know whether they <em>should.</em>
            </p>
          </div>
          <div className="intro-aside reveal">
            <p>
              The initial use case is a digital marketing agency reviewing captions, ads and
              campaign drafts across multiple client brands. An account manager needs to find the
              current approved claim, verify its permitted use, resolve disclosures and route
              high-risk copy without searching across PDFs, spreadsheets and informal sign-offs.
            </p>
            <div className="control-list">
              <span>
                <Icon name="check" size={13} /> Claim-level, not document-level
              </span>
              <span>
                <Icon name="check" size={13} /> Grounded, not generated
              </span>
              <span>
                <Icon name="check" size={13} /> Human-controlled, never auto-published
              </span>
            </div>
          </div>
        </section>

        <section className="comparison-section" id="benchmarks">
          <div className="comparison-heading reveal">
            <div>
              <Eyebrow>The missing control layer</Eyebrow>
              <h2>
                Content moves fast.
                <br />
                Proof should move
                <br />
                <span>with it.</span>
              </h2>
            </div>
            <p>
              Creation and scheduling tools move content toward publication. AdSnitch creates a
              deliberate boundary before release—where claims meet evidence, rules and accountable
              human judgment.
            </p>
          </div>
          <div className="proof-composition reveal">
            <div className="proof-image">
              <span className="proof-image-index">THE CLAIM REGISTER / 01</span>
              <div
                className="register-art"
                role="img"
                aria-label="Abstract stack of versioned claim records with approved language, source, scope, owner and review date"
              >
                <span className="register-axis axis-source">Source</span>
                <span className="register-axis axis-scope">Scope</span>
                <span className="register-axis axis-owner">Owner</span>
                <span className="register-axis axis-expiry">Review</span>
                <div className="register-sheet register-sheet-back" />
                <div className="register-sheet register-sheet-mid" />
                <div className="register-sheet register-sheet-front">
                  <div className="register-sheet-head">
                    <span>CLM–APX–001</span>
                    <b>Approved</b>
                  </div>
                  <small>Permitted language / Website and paid social</small>
                  <p>Supports muscle recovery when paired with consistent resistance training.</p>
                  <div className="register-sheet-meta">
                    <span>
                      <small>Source</small>
                      Trial record v3
                    </span>
                    <span>
                      <small>Owner</small>
                      Regulatory
                    </span>
                    <span>
                      <small>Review</small>
                      18 Jun 2026
                    </span>
                  </div>
                </div>
                <i className="register-thread" />
              </div>
              <blockquote>
                Not a slogan library.
                <strong>A living register of what your brand can actually say.</strong>
              </blockquote>
            </div>
            <div className="proof-principles">
              {[
                [
                  "01",
                  "Structured claims",
                  "Approved wording, source evidence, permitted use, owner and review date live in one record.",
                ],
                [
                  "02",
                  "Correct brand. Current proof.",
                  "Retrieval stays inside the selected brand and rejects expired or mismatched evidence.",
                ],
                [
                  "03",
                  "Fix only what failed",
                  "Risky tokens are replaced precisely, preserving the campaign voice around them.",
                ],
                [
                  "04",
                  "Re-review by design",
                  "When evidence changes or expires, dependent content can return to the review queue.",
                ],
              ].map(([number, title, copy]) => (
                <article key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="telemetry-band reveal">
            <div className="telemetry-intro">
              <span>Curated evaluation snapshot</span>
              <p>Project-reported results from the labelled benchmark set.</p>
            </div>
            {[
              ["97.9%", "Precision", "47 true positives"],
              ["100%", "Statutory recall", "0 critical misses"],
              ["420ms", "P95 pipeline", "Regex + Gemini path"],
              ["58/58", "Test assertions", "Passing in submission"],
            ].map(([value, label, note]) => (
              <div className="telemetry-stat" key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
                <small>{note}</small>
              </div>
            ))}
            <p className="telemetry-disclosure">
              Dataset: 47 TP, 30 TN, 1 FP, 0 FN. These prototype results demonstrate the submitted
              architecture on a curated benchmark; they are not legal certification or a guarantee
              of regulatory compliance.
            </p>
          </div>
        </section>

        <section className="lab" id="sandbox">
          <div className="lab-wrap reveal">
            <header className="lab-head">
              <Eyebrow>Live check</Eyebrow>
              <h2>Watch it catch a risky ad before a regulator does.</h2>
              <p>
                Pick a real-world style example. AdSnitch marks the exact words that could get you
                fined, explains why in plain language, and writes a version you can publish.
              </p>
            </header>

            <div className="lab-tabs" role="tablist" aria-label="Example ads">
              {scenarios.map((item, index) => (
                <button
                  key={item.short}
                  role="tab"
                  aria-selected={activeScenario === index}
                  className={activeScenario === index ? "active" : ""}
                  onClick={() => selectScenario(index)}
                >
                  {item.short}
                </button>
              ))}
            </div>

            <div className="lab-board">
              <div className="lab-copy">
                <div className="lab-copy-top">
                  <span className="lab-brand">{scenario.brand}</span>
                  <div className="lab-toggle" role="group" aria-label="Show version">
                    <button className={!showFix ? "active" : ""} onClick={() => setShowFix(false)}>
                      Original
                    </button>
                    <button className={showFix ? "active" : ""} onClick={() => setShowFix(true)}>
                      Safe rewrite
                    </button>
                  </div>
                </div>
                <blockquote className={showFix ? "lab-quote lab-quote-fixed" : "lab-quote"}>
                  {showFix ? scenario.replacement : <HighlightedClaim index={activeScenario} />}
                </blockquote>
                <p className="lab-hint">
                  {showFix
                    ? "Every claim in this version is backed by an approved evidence record."
                    : `${scenario.flags.length} phrases need proof before this can go live.`}
                </p>
                {!showFix && (
                  <button className="lab-cta" onClick={() => setShowFix(true)}>
                    Show the safe rewrite <Icon name="arrow" size={15} />
                  </button>
                )}
              </div>

              <aside className="lab-report" aria-live="polite">
                <div className="lab-score">
                  <div
                    className="lab-ring"
                    style={
                      {
                        "--p": showFix ? 96 : scenario.score,
                        "--ring": showFix ? "#2fb487" : "#e5535d",
                      } as CSSProperties
                    }
                  >
                    <strong>{showFix ? 96 : scenario.score}</strong>
                  </div>
                  <div>
                    <b>{showFix ? "Ready for sign-off" : "Not safe to publish"}</b>
                    <small>Compliance score out of 100</small>
                  </div>
                </div>

                <h3>What we found</h3>
                <ul className="lab-findings">
                  {scenario.flags.map(([phrase, reason, level, , statute]) => (
                    <li key={phrase} className={showFix ? "resolved" : ""}>
                      <div className="lab-finding-top">
                        <span className="lab-phrase">“{phrase}”</span>
                        {showFix ? (
                          <span className="risk-pill lab-fixed">Fixed</span>
                        ) : (
                          <RiskPill level={level} />
                        )}
                      </div>
                      <p>{reason}</p>
                      <small>{statute}</small>
                    </li>
                  ))}
                </ul>

                <div className="lab-next">
                  <Icon name="users" size={16} />
                  <span>
                    Next: a reviewer signs off. Evidence <b>{scenario.evidence.claimCode}</b> stays
                    attached. AdSnitch never publishes on its own.
                  </span>
                </div>
              </aside>
            </div>
            <p className="ev-note">Demonstration data from seeded brand workspaces.</p>
          </div>
        </section>

        <section className="incident-section">
          <div className="incident-head reveal">
            <div>
              <Eyebrow>Why this exists</Eyebrow>
              <h2>Public mistakes begin as private sentences.</h2>
            </div>
            <p>
              A claim can become a regulatory event, a brand crisis or a costly rollback in a single
              publish action. Governance belongs before that action—not in the post-mortem.
            </p>
          </div>
          <div className="incident-ledger reveal">
            {[
              [
                "01",
                "Health endorsements",
                "FTC v. Teami Lifestyle",
                "Promotional health claims and influencer disclosures can create exposure when substantiation and review are missing.",
                "FTC Act §5 / endorsement guidance",
                "Block therapeutic superlatives, require the evidence record and route disclosure checks before release.",
                "$15.2M FTC order",
              ],
              [
                "02",
                "Context sensitivity",
                "Adidas / Boston Marathon",
                "Scheduled language can become harmful when it ignores the emotional and historical context around an event.",
                "Brand tone / crisis-context guidance",
                "Evaluate emotional valence, timing and event context before scheduled dissemination.",
                "Public apology",
              ],
              [
                "03",
                "Generated misinformation",
                "CNET financial AI",
                "Fluent financial content can still contain elementary factual or calculation errors when no grounded review exists.",
                "Financial content review / source validation",
                "Require source-linked findings, deterministic checks and accountable human approval.",
                "77 articles corrected",
              ],
              [
                "04",
                "Brand-system break",
                "Gap rebrand rollback",
                "A public identity change can fail operationally when distribution moves ahead of cross-functional brand approval.",
                "Asset governance / brand approval policy",
                "Attach approved brand assets, reviewer ownership and decision history to every release.",
                "6-day rollback",
              ],
            ].map(([number, category, title, copy, rule, remedy, impact]) => (
              <article key={number}>
                <span className="incident-number">{number}</span>
                <div className="incident-tags">
                  <span className="incident-category">{category}</span>
                  <span className="incident-impact">{impact}</span>
                </div>
                <div className="incident-detail">
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
                <div className="incident-control">
                  <span>{rule}</span>
                  <p>
                    <b>Governance response:</b> {remedy}
                  </p>
                </div>
                <i>
                  <Icon name="arrow" size={16} />
                </i>
              </article>
            ))}
          </div>
          <p className="case-note">
            Cases shown as public examples of governance failure modes, not as AdSnitch customers or
            prevented incidents.
          </p>
        </section>

        <section className="pipeline-section" id="pipeline">
          <div className="pipeline-sticky">
            <Eyebrow>Deterministic governance pipeline</Eyebrow>
            <h2>Eight gates. One accountable decision.</h2>
            <p>
              The original six analytical stages are shown here as the full eight-stage lifecycle:
              ingestion begins the flow, and the audit ledger with cascade re-review closes it.
              Nothing is silently rewritten, and the final authority belongs to a person.
            </p>
            <div className="pipeline-engine">
              <div className="engine-rings">
                <i />
                <i />
                <i />
                <span>
                  <Icon name={pipeline[activeStage][3] as IconName} size={27} />
                </span>
              </div>
              <div className="engine-stage">
                <span>Active gate / {pipeline[activeStage][0]}</span>
                <h3>{pipeline[activeStage][1]}</h3>
                <p>{pipeline[activeStage][2]}</p>
              </div>
              <div className="engine-output">
                <span>Stage output</span>
                <b>{pipeline[activeStage][4]}</b>
                <small>
                  <i /> Ready for gate {String(Math.min(activeStage + 2, 8)).padStart(2, "0")}
                </small>
              </div>
              <div className="pipeline-progress">
                <span style={{ width: `${((activeStage + 1) / 8) * 100}%` }} />
              </div>
              <div className="engine-scale">
                <span>Draft</span>
                <span>Evidence-linked decision</span>
              </div>
            </div>
            <div className="pipeline-trust">
              <span>
                <Icon name="clock" size={15} /> Sub-5ms deterministic preflight
              </span>
              <span>
                <Icon name="users" size={15} /> Human approval remains final
              </span>
            </div>
          </div>
          <div className="pipeline-list">
            {pipeline.map(([number, title, copy, icon, output], index) => (
              <button
                key={number}
                className={activeStage === index ? "active" : ""}
                onMouseEnter={() => setActiveStage(index)}
                onFocus={() => setActiveStage(index)}
                onClick={() => setActiveStage(index)}
              >
                <span className="pipeline-number">{number}</span>
                <span className="pipeline-icon">
                  <Icon name={icon as IconName} size={20} />
                </span>
                <span className="pipeline-copy">
                  <b>{title}</b>
                  <small>{copy}</small>
                </span>
                <span className="pipeline-output">
                  <small>Output</small>
                  <b>{output}</b>
                </span>
                <Icon name="arrow" size={17} />
              </button>
            ))}
          </div>
        </section>

        <section className="ev" id="evidence">
          <div className="ev-wrap reveal">
            <header className="ev-head">
              <Eyebrow>Evidence intelligence</Eyebrow>
              <h2>Evidence changes the review, not just the score.</h2>
              <p>
                AdSnitch pulls records from the selected brand workspace, checks they are current
                and permitted for the claim, then hands the reviewer one traceable packet.
              </p>
            </header>

            <ol className="ev-board">
              <li className="ev-card">
                <span className="ev-step">01 · Claim</span>
                <h3>The exact sentence</h3>
                <blockquote>
                  “Our proprietary formula gives you <mark>2x faster</mark> muscle recovery.”
                </blockquote>
                <dl className="ev-scope">
                  <div><dt>Workspace</dt><dd>Apex Nutrition</dd></div>
                  <div><dt>Channel</dt><dd>Landing page</dd></div>
                  <div><dt>Type</dt><dd>Quantified efficacy</dd></div>
                </dl>
              </li>

              <li className="ev-card">
                <span className="ev-step">02 · Evidence</span>
                <h3>What the sources say</h3>
                <ul className="ev-sources">
                  {[
                    ["Clinical trial registry", "No matching 2x outcome", "No match", "bad"],
                    ["Published research", "Related recovery studies", "Insufficient", "warn"],
                    ["Approved claims register", "Support language only", "Partial", "warn"],
                    ["Brand guidelines", "Absolute claims prohibited", "Matched", "ok"],
                  ].map(([title, detail, status, tone]) => (
                    <li key={title}>
                      <i className={`ev-dot ev-${tone}`} />
                      <div>
                        <b>{title}</b>
                        <small>{detail}</small>
                      </div>
                      <em className={`ev-${tone}`}>{status}</em>
                    </li>
                  ))}
                </ul>
              </li>

              <li className="ev-card ev-card-dark">
                <span className="ev-step">03 · Decision</span>
                <h3>Revise claim or attach counter-evidence</h3>
                <p>
                  Quantified performance claims need competent substantiation. No current record
                  supports the stated multiplier.
                </p>
                <div className="ev-owner">
                  <span>SL</span>
                  <div>
                    <b>Legal review</b>
                    <small>Signed decision required</small>
                  </div>
                </div>
              </li>
            </ol>

            <ul className="ev-guarantees">
              <li><Icon name="lock" size={15} /> Correct workspace only</li>
              <li><Icon name="branch" size={15} /> Source and version attached</li>
              <li><Icon name="clock" size={15} /> Expiry-aware re-review</li>
              <li><Icon name="users" size={15} /> Human decision recorded</li>
            </ul>
            <p className="ev-note">Seeded prototype record. No fictional source is shown as independently verified.</p>
          </div>
        </section>

        <section className="sectors-section" id="sectors">
          <div className="sectors-head reveal">
            <div>
              <Eyebrow>Regulated sector playbooks</Eyebrow>
              <h2>
                One firewall.
                <br />
                Different rules of proof.
              </h2>
            </div>
            <p>
              <strong>Rules change by market.</strong>
              Each workspace adapts evidence requirements, prohibited language and reviewer routing
              to the market it serves.
            </p>
          </div>
          <div className="sector-bands reveal">
            {[
              [
                "Health, supplements & nutrition",
                "Clinical outcomes · Structure/function language · Required disclaimers",
                "FDA / FTC",
                "01",
              ],
              [
                "Enterprise cloud & FinTech",
                "SLA promises · Security language · Financial disclosures",
                "SEC / SOC",
                "02",
              ],
              [
                "Cosmetics & personal care",
                "Anatomical claims · Instrumental testing · Before/after evidence",
                "FD&C / MoCRA",
                "03",
              ],
              [
                "Direct-to-consumer commerce",
                "Testimonials · Price comparisons · Material connections",
                "Truth in Ads",
                "04",
              ],
            ].map(([title, copy, meta, number]) => (
              <article key={number}>
                <span>{number}</span>
                <div className="sector-copy">
                  <h3>{title}</h3>
                  <small>Review controls</small>
                  <p>{copy}</p>
                </div>
                <div className="sector-meta">
                  <small>Regulatory frame</small>
                  <b>{meta}</b>
                </div>
                <i>
                  <Icon name="arrow" size={18} />
                </i>
              </article>
            ))}
          </div>
        </section>

        <section className="security-section" id="security">
          <div className="security-heading reveal">
            <div className="security-symbol">
              <Icon name="lock" size={25} />
              <span className="radar-line" />
            </div>
            <Eyebrow light>Responsible AI safeguards</Eyebrow>
            <h2>
              Built to govern the system,
              <br />
              not ask you to trust it.
            </h2>
            <p>
              Controls are visible, decisions are attributable and publication remains outside the
              machine’s authority.
            </p>
          </div>
          <div className="security-grid reveal">
            {[
              [
                "Zero public training",
                "Customer drafts and evidence stay outside public model training.",
                "lock",
              ],
              [
                "Tenant-scoped retrieval",
                "Brand knowledge is isolated to the workspace requesting the review.",
                "database",
              ],
              [
                "Strict anti-auto-publishing",
                "Every publication decision requires an explicit human action.",
                "users",
              ],
              [
                "Offline heuristic resilience",
                "Deterministic preflight rules continue when model endpoints do not.",
                "code",
              ],
              [
                "Decision audit trails",
                "Reviewers, overrides, sources and changes remain inspectable.",
                "branch",
              ],
              [
                "Cascade re-review",
                "Expired evidence can trigger a new review of affected content.",
                "layers",
              ],
            ].map(([title, copy, icon], index) => (
              <article key={title}>
                <div>
                  <span>0{index + 1}</span>
                  <Icon name={icon as IconName} size={19} />
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <div className="prototype-status reveal" id="status">
            <div className="status-heading">
              <Eyebrow light>Hackathon build status</Eyebrow>
              <h3>
                A complete core workflow.
                <br />
                Clear prototype boundaries.
              </h3>
              <p>
                The submission prioritises a dependable text-first review journey over a wide set of
                partially implemented integrations.
              </p>
            </div>
            <div className="status-columns">
              <div>
                <span className="status-column-label">
                  <Icon name="check" size={13} /> Demonstrated in the build
                </span>
                <ul>
                  <li>Claims registry with source and expiry metadata</li>
                  <li>Deterministic preflight and AI-assisted review</li>
                  <li>Word-level diff, disputes and reviewer overrides</li>
                  <li>Multi-brand isolation and role-based access</li>
                  <li>Audit history and expiry-triggered cascade review</li>
                </ul>
              </div>
              <div>
                <span className="status-column-label deferred">
                  <Icon name="clock" size={13} /> Deliberately deferred
                </span>
                <ul>
                  <li>Production SAML / enterprise SSO</li>
                  <li>Raw scanned-document OCR</li>
                  <li>Multimodal video and visual-identity review</li>
                  <li>Native CMS and collaboration integrations</li>
                  <li>Direct auto-publishing—excluded by design</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="final-section">
          <div className="final-aurora" />
          <Contours />
          <div className="final-content reveal">
            <span className="final-overline">From Inkloom AI to AdSnitch</span>
            <h2>
              Built to ask:
              <br />
              what supports this?
            </h2>
            <p>
              Explore the CodeTitans prototype and follow a draft from risky claim to
              evidence-linked, human-controlled decision.
            </p>
            <div>
              <ArrowLink href="#sandbox">Launch the seeded sandbox</ArrowLink>
              <a href="#status">Review project scope</a>
            </div>
          </div>
          <div className="final-stamp">
            <span>
              <Icon name="shield" size={30} />
            </span>
            <b>
              Human
              <br />
              approval
              <br />
              required
            </b>
          </div>
        </section>
      </main>

      <footer id="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p>Pre-publication marketing claim and brand governance.</p>
            <span>Formerly Inkloom AI</span>
          </div>
          {[
            ["Product", "Workbench", "Approvals", "Audit log", "Benchmarks"],
            ["Knowledge", "Claims library", "Brand guidelines", "Terminology", "Evidence assets"],
            ["Governance", "Rule engine", "Sector playbooks", "Analytics", "Security"],
            ["Company", "About", "Contact", "Privacy", "Legal"],
          ].map(([title, ...links]) => (
            <div className="footer-column" key={title}>
              <b>{title}</b>
              {links.map((link) => (
                <a href="#" key={link}>
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>AdSnitch · CodeTitans India 2026 · Formerly Inkloom AI</span>
          <span className="footer-system">
            <i /> Seeded prototype operational
          </span>
          <span>Check the claim. Show the source. Keep people in control.</span>
        </div>
      </footer>
    </div>
  );
}

