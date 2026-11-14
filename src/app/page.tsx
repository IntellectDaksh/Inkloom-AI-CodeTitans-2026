"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import "./landing.css";
import { FloatingLayer } from "@/components/layout/FloatingLayer";

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

const REPO = "https://github.com/IntellectDaksh/Inkloom-AI-CodeTitans-2026";
const FTC_255 = "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255";
const FDA_DS = "https://www.fda.gov/food/dietary-supplements";
const EVIDENCE_GATE = 4; // "Ground" gate shows the evidence packet

// Links only where the URL is certain; otherwise outlet + date.
const incidents: { category: string; title: string; impact: string; what: string; why: string; source: string; url?: string }[] = [
  {
    category: "Health claims + endorsements",
    title: "FTC v. Teami (2020)",
    impact: "$15.2M judgment",
    what: "The FTC said Teami marketed teas with unsupported health claims (weight loss, cancer, clogged arteries) and paid Instagram influencers who did not clearly disclose it.",
    why: "Health claims need proof and paid endorsements need disclosure. AdSnitch flags both before release.",
    source: "FTC press release, March 2020 (Endorsement Guides: 16 CFR Part 255)",
    url: "https://www.ftc.gov/news-events/news/press-releases/2020/03/tea-marketer-misled-consumers-didnt-adequately-disclose-payments-well-known-influencers-ftc-alleges",
  },
  {
    category: "Context",
    title: "Adidas Boston Marathon email (2017)",
    impact: "Public apology",
    what: "A post-race email to runners used the subject line “Congrats, you survived the Boston Marathon!”, four years after the 2013 bombing.",
    why: "A line can be accurate and still harmful in context. A human reviewer sees flagged wording before send.",
    source: "NPR, April 19, 2017",
    url: "https://www.npr.org/sections/thetwo-way/2017/04/19/524692534/adidas-apologizes-for-congratulating-2017-boston-marathon-survivors",
  },
  {
    category: "AI-written content",
    title: "CNET AI finance articles (2023)",
    impact: "41 of 77 corrected",
    what: "CNET quietly published finance explainers written with AI. After errors were found, it reviewed all 77 and corrected 41.",
    why: "Fluent text is not checked text. AdSnitch ties each claim to a source and keeps a person accountable.",
    source: "The Register, January 2023 (corrections on 41 of 77 AI-written stories)",
    url: "https://www.theregister.com/2023/01/19/cnet_reviewing_ai_authored_stories/",
  },
  {
    category: "Brand approval",
    title: "Gap logo redesign (2010)",
    impact: "Withdrawn in ~6 days",
    what: "Gap swapped its blue-box logo online without warning. After public backlash it returned to the original within a week.",
    why: "Brand changes need sign-off and a record. AdSnitch keeps the approval trail.",
    source: "Bloomberg, October 12, 2010",
    url: "https://www.bloomberg.com/news/articles/2010-10-12/gap-scraps-new-logo-after-online-backlash-will-return-to-blue-box-design",
  },
];

type OwnResult = {
  submission: { id: string };
  report: { complianceScore: number; findings: { id: string; flaggedText: string; severity: string; explanation: string }[] };
};

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

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState(0);
  const [showFix, setShowFix] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  const isCustom = activeScenario === scenarios.length;
  const scenario = scenarios[isCustom ? 0 : activeScenario];
  const [ownText, setOwnText] = useState("");
  const [busy, setBusy] = useState<null | "extract" | "ocr" | "check">(null);
  const [ownError, setOwnError] = useState("");
  const [ownResult, setOwnResult] = useState<OwnResult | null>(null);

  const onFile = async (file?: File) => {
    if (!file) return;
    setOwnError("");
    setBusy(/\.(pdf|png|jpe?g|webp)$/i.test(file.name) ? "ocr" : "extract");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not read this file.");
      setOwnText(data.text);
    } catch (err) {
      setOwnError(err instanceof Error ? err.message : "Could not read this file.");
    } finally {
      setBusy(null);
    }
  };

  const runCheck = async () => {
    if (!ownText.trim()) {
      setOwnError("Paste some ad copy or upload a file first.");
      return;
    }
    setOwnError("");
    setBusy("check");
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Landing page check", text: ownText, runAnalysis: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.report) throw new Error(data.error || "The check failed. Try again.");
      setOwnResult(data);
    } catch (err) {
      setOwnResult(null);
      setOwnError(err instanceof Error ? err.message : "The check failed. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const selectScenario = (index: number) => {
    setActiveScenario(index);
    setShowFix(false);
  };

  useEffect(() => {
    const groups = ".lab-copy, .lab-report, .pipeline-list button, .incident-section article, .l-card, .l-faq details, .l-team li";
    document.querySelectorAll<HTMLElement>(groups).forEach((node) => {
      // Stagger within the parent group only, capped, so lower sections never beat upper ones.
      const idx = node.parentElement ? Array.from(node.parentElement.children).indexOf(node) : 0;
      node.classList.add("reveal");
      node.style.transitionDelay = `${Math.min(idx * 50, 150)}ms`;
    });
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const vh = window.innerHeight;
    // Anything already above or inside the viewport shows immediately.
    nodes.forEach((n) => n.getBoundingClientRect().top < vh && n.classList.add("visible"));
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );
    nodes.filter((n) => !n.classList.contains("visible")).forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="site" id="top">
      <FloatingLayer density="page" />
      <div className="global-atmosphere" aria-hidden="true">
        <i className="atmosphere-one" />
        <i className="atmosphere-two" />
        <i className="atmosphere-three" />
      </div>
      <header className="top-nav">
        <nav className="nav-inner" aria-label="Primary navigation">
          <Logo />
          <div className="nav-center">
            <a href="#problem">Problem</a>
            <a href="#sandbox">Live check</a>
            <a href="#pipeline">How it works</a>
            <a href="#proof">Proof</a>
            <a href="#faq">FAQ</a>
            <a href="/knowledge-base/claims">Claims Library</a>
          </div>
          <div className="nav-end">
            <a className="nav-signin" href="/auth/login">
              Sign In
            </a>
            <a className="nav-launch" href="/dashboard?workspace=pick">
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
              ["Problem", "#problem"],
              ["Live check", "#sandbox"],
              ["How it works", "#pipeline"],
              ["Proof", "#proof"],
              ["FAQ", "#faq"],
              ["Claims Library", "/knowledge-base/claims"],
              ["Sign In", "/auth/login"],
              ["Launch App", "/dashboard?workspace=pick"],
            ].map(([label, href]) => (
              <a key={label} href={href} onClick={() => setMenuOpen(false)}>
                {label} <Icon name="arrow" size={15} />
              </a>
            ))}
          </div>
        )}
      </header>

      <main>
        <section className="hero-section sky-hero">
          <div className="sky-canvas">
            <svg className="sky-art" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <defs>
                <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#123a63" />
                  <stop offset=".45" stopColor="#3f7fb3" />
                  <stop offset=".8" stopColor="#a9d2ea" />
                  <stop offset="1" stopColor="#e3f1f8" />
                </linearGradient>
                <radialGradient id="sunG" cx=".82" cy=".18" r=".55">
                  <stop offset="0" stopColor="#ffe2b3" stopOpacity=".55" />
                  <stop offset="1" stopColor="#ffe2b3" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="cloudBody" cx=".55" cy=".3" r=".75">
                  <stop offset="0" stopColor="#fff8ec" />
                  <stop offset=".45" stopColor="#f3f1ee" />
                  <stop offset="1" stopColor="#9fb7cc" />
                </radialGradient>
                <filter id="paint" x="-20%" y="-20%" width="140%" height="140%">
                  <feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="4" seed="7" />
                  <feDisplacementMap in="SourceGraphic" scale="70" />
                  <feGaussianBlur stdDeviation="3" />
                </filter>
                <filter id="paintSoft" x="-20%" y="-20%" width="140%" height="140%">
                  <feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="3" seed="3" />
                  <feDisplacementMap in="SourceGraphic" scale="45" />
                  <feGaussianBlur stdDeviation="6" />
                </filter>
                <filter id="grainF">
                  <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch" />
                  <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .09 0" />
                </filter>
              </defs>
              <rect width="1600" height="900" fill="url(#skyG)" />
              <rect width="1600" height="900" fill="url(#sunG)" />
              <g className="cloud-drift cloud-slow" filter="url(#paintSoft)" opacity=".55">
                <ellipse cx="260" cy="200" rx="260" ry="60" fill="#e9f2f8" />
                <ellipse cx="1150" cy="140" rx="300" ry="50" fill="#f6efe4" />
              </g>
              <g className="cloud-drift" filter="url(#paint)">
                <ellipse cx="1180" cy="560" rx="360" ry="170" fill="url(#cloudBody)" />
                <ellipse cx="1000" cy="470" rx="190" ry="150" fill="url(#cloudBody)" />
                <ellipse cx="1290" cy="400" rx="210" ry="180" fill="url(#cloudBody)" />
                <ellipse cx="1470" cy="520" rx="200" ry="140" fill="url(#cloudBody)" />
                <ellipse cx="1300" cy="330" rx="120" ry="80" fill="#fff4df" opacity=".9" />
                <ellipse cx="1040" cy="400" rx="90" ry="50" fill="#ffeacb" opacity=".8" />
              </g>
              <g className="cloud-drift cloud-alt" filter="url(#paint)" opacity=".92">
                <ellipse cx="300" cy="760" rx="420" ry="150" fill="url(#cloudBody)" />
                <ellipse cx="140" cy="660" rx="190" ry="130" fill="url(#cloudBody)" />
                <ellipse cx="420" cy="650" rx="160" ry="120" fill="url(#cloudBody)" />
                <ellipse cx="400" cy="590" rx="90" ry="50" fill="#fff1d8" opacity=".85" />
              </g>
              <g filter="url(#paint)">
                <ellipse cx="800" cy="930" rx="900" ry="140" fill="#eef4f8" />
              </g>
              <rect width="1600" height="900" filter="url(#grainF)" />
            </svg>

            <div className="sky-copy">
              <h1 className="sky-h1">Every ad claim, checked against proof.</h1>
              <p className="sky-sub">
                Risky lines flagged, explained and fixed, then signed off by a person before anything ships.
              </p>
              <div className="l-actions">
                <ArrowLink href="#sandbox">Try a live check</ArrowLink>
                <a className="l-textlink sky-link" href="/dashboard?workspace=pick">
                  Open the app
                </a>
              </div>
            </div>

            <div className="sky-cards">
              <div className="glass-card glass-stat">
                <b>26 / 30</b>
                <p>labelled issues caught</p>
                <a href="/evaluations">Measured on our evaluation set</a>
              </div>
              <div className="glass-card glass-finding">
                <small>Live finding</small>
                <p className="gf-quote">
                  &ldquo;<u>2x faster</u> recovery&rdquo;
                </p>
                <p className="gf-out">
                  <Icon name="arrow" size={14} /> Requires substantiation &middot; FTC 16 CFR 255
                </p>
              </div>
            </div>
          </div>
        </section>

        <ul className="l-tags" aria-label="What AdSnitch checks">
          {["Health claims", "Endorsement disclosures", "Superlatives", "Security & SLA promises", "Brand voice", "Human sign-off"].map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        <section className="incident-section" id="problem">
          <div className="incident-head reveal">
            <div>
              <Eyebrow>The problem</Eyebrow>
              <h2>One unchecked sentence can cost a brand.</h2>
            </div>
            <p>
              These are real, publicly reported cases. Each one started as a line of copy, a claim or
              a release that nobody checked against proof or context before it shipped.
            </p>
          </div>
          <div className="incident-ledger reveal">
            {incidents.map((item, i) => (
              <article key={item.title}>
                <span className="incident-number">{String(i + 1).padStart(2, "0")}</span>
                <div className="incident-tags">
                  <span className="incident-category">{item.category}</span>
                  <span className="incident-impact">{item.impact}</span>
                </div>
                <div className="incident-detail">
                  <h3>{item.title}</h3>
                  <p>{item.what}</p>
                </div>
                <div className="incident-control">
                  <span>Why it matters</span>
                  <p>{item.why}</p>
                  <small className="l-source">
                    Source:{" "}
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noreferrer">
                        {item.source}
                      </a>
                    ) : (
                      item.source
                    )}
                  </small>
                </div>
              </article>
            ))}
          </div>
          <p className="case-note">
            Public examples of the failure modes AdSnitch targets. None of these companies are
            AdSnitch customers.
          </p>
        </section>

        <section className="lab" id="sandbox">
          <div className="lab-wrap reveal">
            <header className="lab-head">
              <Eyebrow>Live check</Eyebrow>
              <h2>Watch it catch a risky ad before a regulator does.</h2>
              <p>
                Pick an example. AdSnitch marks the exact words that could get you fined, explains
                why in plain language, and writes a version you can publish.
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
              <button
                role="tab"
                aria-selected={isCustom}
                className={isCustom ? "active" : ""}
                onClick={() => selectScenario(scenarios.length)}
              >
                Try your own ad
              </button>
            </div>

            {isCustom ? (
              <div className="lab-board">
                <div className="lab-copy">
                  <div className="lab-copy-top">
                    <span className="lab-brand">Your draft · Apex Nutrition demo workspace</span>
                  </div>
                  <label className="l-label" htmlFor="own-ad">
                    Paste ad copy, or upload a file
                  </label>
                  <textarea
                    id="own-ad"
                    className="l-textarea"
                    rows={6}
                    value={ownText}
                    onChange={(e) => setOwnText(e.target.value)}
                    placeholder="e.g. Clinically proven to double your energy in 7 days…"
                  />
                  <div className="l-file-row">
                    <input
                      type="file"
                      aria-label="Upload a file to extract text from"
                      accept=".txt,.md,.html,.json,.rtf,.docx,.pdf,.png,.jpg,.jpeg,.webp"
                      onChange={(e) => onFile(e.target.files?.[0])}
                      disabled={busy !== null}
                    />
                    <button
                      className="lab-cta"
                      onClick={runCheck}
                      disabled={busy !== null}
                    >
                      {busy === "check" ? "Checking…" : "Check it"} <Icon name="arrow" size={15} />
                    </button>
                  </div>
                  <p className="lab-hint" role="status">
                    {busy === "ocr"
                      ? "Scanning with OCR…"
                      : busy === "extract"
                        ? "Reading file…"
                        : ownError || "Text is checked against the demo brand's rules and evidence."}
                  </p>
                </div>
                <aside className="lab-report" aria-live="polite">
                  {ownResult ? (
                    <>
                      <div className="lab-score">
                        <div
                          className="lab-ring"
                          style={
                            {
                              "--p": ownResult.report.complianceScore,
                              "--ring": ownResult.report.complianceScore >= 70 ? "#2fb487" : "#e5535d",
                            } as CSSProperties
                          }
                        >
                          <strong>{ownResult.report.complianceScore}</strong>
                        </div>
                        <div>
                          <b>
                            {ownResult.report.findings.length === 0
                              ? "No issues found"
                              : `${ownResult.report.findings.length} issue${ownResult.report.findings.length > 1 ? "s" : ""} found`}
                          </b>
                          <small>Compliance score out of 100</small>
                        </div>
                      </div>
                      <h3>What we found</h3>
                      <ul className="lab-findings">
                        {ownResult.report.findings.slice(0, 5).map((f) => (
                          <li key={f.id}>
                            <div className="lab-finding-top">
                              <span className="lab-phrase">“{f.flaggedText}”</span>
                              <RiskPill level={f.severity} />
                            </div>
                            <p>{f.explanation}</p>
                          </li>
                        ))}
                      </ul>
                      <div className="lab-next">
                        <Icon name="file" size={16} />
                        <span>
                          <a href={`/submissions/${ownResult.submission.id}`}>Open full review</a>{" "}
                          for sources, fixes and sign-off.
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="lab-next">
                      <Icon name="scan" size={16} />
                      <span>Your score and findings appear here. Nothing is published.</span>
                    </div>
                  )}
                </aside>
              </div>
            ) : (
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
            )}
            <p className="ev-note">
              Demo data from seeded brand workspaces. Rule references:{" "}
              <a href={FTC_255} target="_blank" rel="noreferrer">
                FTC 16 CFR Part 255
              </a>{" "}
              ·{" "}
              <a href={FDA_DS} target="_blank" rel="noreferrer">
                FDA dietary supplements (DSHEA)
              </a>
            </p>
          </div>
        </section>

        <section className="pipeline-section" id="pipeline">
          <div className="pipeline-sticky">
            <Eyebrow>How it works</Eyebrow>
            <h2>Eight gates. One accountable decision.</h2>
            <p>
              Every draft passes the same eight checks. Nothing is silently rewritten, and a person
              makes the final call. Select a gate to see what it produces.
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
              </div>
              {activeStage === EVIDENCE_GATE && (
                <div className="l-evidence">
                  <span className="ev-step">Evidence packet · demo record</span>
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
                </div>
              )}
              <div className="pipeline-progress">
                <span style={{ width: `${((activeStage + 1) / 8) * 100}%` }} />
              </div>
              <div className="engine-scale">
                <span>Draft</span>
                <span>Evidence-linked decision</span>
              </div>
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

        <section className="l-section" id="proof">
          <div className="l-head reveal">
            <Eyebrow>Proof</Eyebrow>
            <h2>Measured, not promised.</h2>
          </div>
          <div className="l-grid l-grid-2">
            <a className="l-card l-stat" href="/evaluations">
              <strong>26 / 30</strong>
              <span>Labelled issues caught in rule-only mode</span>
              <small>See the evaluation →</small>
            </a>
            <a className="l-card l-stat" href={`${REPO}/tree/main/tests`} target="_blank" rel="noreferrer">
              <strong>58</strong>
              <span>Automated tests: end-to-end, review features, AI pipeline</span>
              <small>View tests on GitHub →</small>
            </a>
          </div>
          <div className="l-table-wrap reveal">
            <table className="l-table">
              <thead>
                <tr>
                  <th scope="col" />
                  <th scope="col">ChatGPT alone</th>
                  <th scope="col">Manual review</th>
                  <th scope="col">AdSnitch</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Checks claims against your own proof", "No, may invent sources", "Yes, slowly", "Yes, brand-scoped"],
                  ["Shows the source for each finding", "Not reliably", "If someone writes it down", "Always attached"],
                  ["Edits only the risky words", "Rewrites whole passages", "Depends on reviewer", "Word-level diff"],
                  ["Records who approved what", "No", "Email threads", "Audit log"],
                ].map(([row, a, b, c]) => (
                  <tr key={row}>
                    <th scope="row">{row}</th>
                    <td>{a}</td>
                    <td>{b}</td>
                    <td>{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="case-note">
            Limitations: results come from a small labelled set, not a legal certification. AI mode
            needs a Gemini API key; video and image-brand review are not built yet.
          </p>
        </section>

        <section className="l-section" id="who">
          <div className="l-head reveal">
            <Eyebrow>Who it&rsquo;s for</Eyebrow>
            <h2>Anyone who signs off on what a brand says.</h2>
          </div>
          <div className="l-grid l-grid-3">
            {[
              ["Content creator", "Paste a caption or script, see which lines need proof or a disclosure before you post.", "spark"],
              ["Agency account manager", "Review copy across client brands, each with its own approved claims and rules.", "users"],
              ["Legal / compliance reviewer", "Get one packet per claim: finding, source, suggested fix, and a place to sign.", "scale"],
            ].map(([title, copy, icon]) => (
              <article className="l-card" key={title}>
                <Icon name={icon as IconName} size={20} />
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <ul className="l-strip reveal" aria-label="Sectors">
            {[
              ["Health & supplements", "FDA / FTC"],
              ["Cloud & FinTech", "SLA, security, SEC"],
              ["Cosmetics", "FD&C / MoCRA"],
              ["D2C commerce", "Testimonials, pricing"],
            ].map(([sector, frame]) => (
              <li key={sector}>
                <b>{sector}</b>
                <small>{frame}</small>
              </li>
            ))}
          </ul>
        </section>

        <section className="l-section" id="trust">
          <div className="l-head reveal">
            <Eyebrow>Trust &amp; team</Eyebrow>
            <h2>The machine flags. People decide.</h2>
          </div>
          <div className="l-grid l-grid-4">
            {[
              ["Never auto-publishes", "AdSnitch has no publish button. Output goes back to you.", "shield"],
              ["Human sign-off", "Every risky claim needs a named reviewer to approve or override.", "users"],
              ["Tamper-evident audit log", "Decisions, overrides and sources are recorded in order.", "branch"],
              ["Brand data isolated", "Each workspace only searches its own evidence and rules.", "lock"],
            ].map(([title, copy, icon]) => (
              <article className="l-card" key={title}>
                <Icon name={icon as IconName} size={20} />
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <ul className="l-team reveal" aria-label="Team">
            <li>
              <span aria-hidden="true">DA</span>
              <div>
                <b>Built by Daksh Agrawal</b>
                <small>Product, design and engineering</small>
              </div>
            </li>
          </ul>
        </section>

        <section className="l-section" id="faq">
          <div className="l-head reveal">
            <Eyebrow>FAQ</Eyebrow>
            <h2>Straight answers.</h2>
          </div>
          <div className="l-faq reveal">
            {[
              ["Does AdSnitch publish anything?", "No. It reviews and suggests. Publishing stays with you, after a person signs off."],
              ["Where does my data go?", "Your workspace data lives in the app's database. For AI analysis and OCR, the relevant text or file is sent to Google's Gemini API."],
              ["Which AI does it use?", "Google Gemini for analysis and OCR, plus deterministic rules that run first and still work without the API (rule-only mode)."],
              ["Is the evidence on this page real?", "The brands and evidence records shown here are demo data and labelled as such. The regulations and incidents are real and linked to their sources."],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="final-section">
          <div className="final-aurora" />
          <Contours />
          <div className="final-content reveal">
            <span className="final-overline">From Inkloom AI to AdSnitch</span>
            <h2>
              Before it goes live,
              <br />
              ask: what supports this?
            </h2>
            <p>Paste a draft and see every claim matched to proof, with a fix and a sign-off step.</p>
            <div>
              <ArrowLink href="/submissions/new">Check your own ad</ArrowLink>
              <a href="#sandbox">Try the live demo</a>
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
          {(
            [
              ["Product", [["Live check", "#sandbox"], ["How it works", "#pipeline"], ["Proof", "#proof"], ["FAQ", "#faq"]]],
              ["Knowledge", [["Claims library", "/knowledge-base/claims"], ["Brand guidelines", "/knowledge-base/guidelines"], ["Terminology", "/knowledge-base/terminology"], ["Evidence documents", "/knowledge-base/assets"]]],
              ["Governance", [["The problem", "#problem"], ["Who it's for", "#who"], ["Analytics", "/analytics"], ["Trust & team", "#trust"]]],
              ["Project", [["Open the app", "/dashboard?workspace=pick"], ["Evaluation report", "/evaluations"], ["Source code", "https://github.com/IntellectDaksh/Inkloom-AI-CodeTitans-2026"], ["Report an issue", "https://github.com/IntellectDaksh/Inkloom-AI-CodeTitans-2026/issues"]]],
            ] as [string, [string, string][]][]
          ).map(([title, links]) => (
            <div className="footer-column" key={title}>
              <b>{title}</b>
              {links.map(([label, href]) =>
                href.startsWith("http") ? (
                  <a href={href} key={label} target="_blank" rel="noreferrer">
                    {label}
                  </a>
                ) : (
                  <a href={href} key={label}>
                    {label}
                  </a>
                ),
              )}
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

