// Shapes of knowledge-base list records. Built-in records come from the server (src/lib/db/seed.ts builtInKb).

export interface GuidelineRule {
  id: string;
  category: string;
  title: string;
  description: string;
  dos: string[];
  donts: string[];
  source?: string;
  /** Prose rule for built-ins that have no do/don't split. */
  rule?: string;
  severity?: string;
  builtIn?: boolean;
}

export type Severity = "critical" | "high" | "medium";
export interface Term { term: string; kind: "blocked" | "preferred"; note: string; replacement: string; severity: Severity; builtIn?: boolean }
