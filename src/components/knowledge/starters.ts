// Starter lists shown for the Apex Nutrition workspace until it saves its own version.

export interface GuidelineRule {
  id: string;
  category: string;
  title: string;
  description: string;
  dos: string[];
  donts: string[];
  source?: string;
}

export type Severity = "critical" | "high" | "medium";
export interface Term { term: string; kind: "blocked" | "preferred"; note: string; replacement: string; severity: Severity }

const GUIDELINES: GuidelineRule[] = [
  {
    id: "g1", category: "Voice and tone", title: "Confident, science-backed, never hyped",
    description: "Speak with grounded confidence. Educate rather than pressure. No buzzwords or sensational promises.",
    dos: [
      "Use active, encouraging language, e.g. \"Fuel your training\"",
      "Point speed or absorption claims to the approved study in the claims library",
      "Write for everyday gym-goers as well as competitive athletes",
    ],
    donts: [
      "\"Miracle\", \"magic bullet\", \"cheat code\" or any cure-style phrasing",
      "Promising results in a fixed time without approved proof, e.g. \"build muscle in 14 days\"",
      "Fear-based or bro-science messaging",
    ],
  },
  {
    id: "g2", category: "Messaging standards", title: "Clear sourcing and ingredient transparency",
    description: "Ingredient claims must match a lab-tested, approved claim. Mention sustainability only when it is documented.",
    dos: ["Name the protein source and amino acid profile", "Mention non-GMO or recyclable packaging where documented"],
    donts: ["\"100% absorption\" without the approved lab report", "Knocking competitor categories without independent data"],
  },
];

const TERMS: Term[] = [
  { term: "magic bullet", kind: "blocked", severity: "critical", replacement: "effective, evidence-based formula", note: "Sensational and cannot be substantiated." },
  { term: "miracle", kind: "blocked", severity: "critical", replacement: "clinically evaluated formula", note: "Reads as a disease or cure claim." },
  { term: "cure", kind: "blocked", severity: "critical", replacement: "supports natural recovery", note: "Supplements cannot claim to treat or cure any condition." },
  { term: "cheat code", kind: "blocked", severity: "high", replacement: "carefully calibrated nutrition", note: "Off-brand slang that undermines trust." },
  { term: "instant fix", kind: "blocked", severity: "high", replacement: "fast-absorbing", note: "Promises a timeframe we have no data for." },
  { term: "guaranteed overnight", kind: "blocked", severity: "high", replacement: "consistent results over 8 weeks", note: "Guarantee language is high risk with regulators." },
  { term: "effortless", kind: "blocked", severity: "medium", replacement: "convenient", note: "Ignores the training and diet the result depends on." },
  { term: "bio-available", kind: "preferred", severity: "medium", replacement: "", note: "Use when citing the approved amino acid uptake study." },
  { term: "clean sport certified", kind: "preferred", severity: "medium", replacement: "", note: "Use only with the current batch-testing certificate." },
  { term: "supports protein synthesis", kind: "preferred", severity: "medium", replacement: "", note: "Matches approved claim CLM-APX-001 wording." },
];

export const GUIDELINE_STARTER: Record<string, GuidelineRule[]> = { "Apex Nutrition": GUIDELINES };
export const TERM_STARTER: Record<string, Term[]> = { "Apex Nutrition": TERMS };
