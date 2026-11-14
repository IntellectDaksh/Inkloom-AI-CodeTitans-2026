import {
  LayoutDashboard, FilePlus2, FileText, CheckCircle2, ShieldCheck, BookOpen, Tag, FolderOpen,
  BarChart3, FlaskConical, Building2, Users, Settings, ScrollText, type LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: "approvals" | "reviews";
  help: [string, string, string];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Single source for sidebar groups, header titles/breadcrumbs and the "?" help panel.
export const NAV: NavGroup[] = [
  {
    label: "Work",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, help: [
        "Your starting point: what is waiting on you and what changed recently.",
        "Follow the Start here checklist if this is a new workspace.",
        "Click any number to open the matching list.",
      ] },
      { name: "Check an ad", href: "/submissions/new", icon: FilePlus2, help: [
        "Paste ad copy or drop a file. AdSnitch reads it for you.",
        "Each issue explains why it was flagged, cites your own rules and suggests a fix.",
        "When you are happy, send it for approval.",
      ] },
      { name: "Reviews", href: "/submissions", icon: FileText, badge: "reviews", help: [
        "Every ad that has been checked, newest first.",
        "Status shows where it is: in review, needs changes or approved.",
        "Open one to see its issues and suggested fixes.",
      ] },
      { name: "Approvals", href: "/approvals", icon: CheckCircle2, badge: "approvals", help: [
        "Ads waiting for a person to sign off.",
        "Approve, or request changes with a short note the author will see.",
        "Keyboard: J and K move, A approves, R requests changes.",
      ] },
    ],
  },
  {
    label: "Library",
    items: [
      { name: "Claims", href: "/knowledge-base/claims", icon: ShieldCheck, help: [
        "Statements your brand is allowed to make, each with its proof.",
        "Ads are checked against this list, so keep it current.",
        "Expired proof makes a claim unusable until renewed.",
      ] },
      { name: "Guidelines", href: "/knowledge-base/guidelines", icon: BookOpen, help: [
        "Tone, wording and legal rules for this brand.",
        "Write them in plain sentences; the checker reads them as written.",
        "Changes apply to the next ad you check.",
      ] },
      { name: "Terminology", href: "/knowledge-base/terminology", icon: Tag, help: [
        "Words to avoid and what to say instead.",
        "Flagged words in an ad link back here.",
        "Add a reason so writers understand the swap.",
      ] },
      { name: "Assets", href: "/knowledge-base/assets", icon: FolderOpen, help: [
        "Approved logos, images and product sheets.",
        "Use these as the reference for what may appear in ads.",
        "Upload new versions instead of duplicates.",
      ] },
    ],
  },
  {
    label: "Insights",
    items: [
      { name: "Analytics", href: "/analytics", icon: BarChart3, help: [
        "Trends across checked ads: pass rate and most common issues.",
        "Use it to spot rules that writers keep missing.",
        "Numbers update as ads are checked and approved.",
      ] },
      { name: "Evaluations", href: "/evaluations", icon: FlaskConical, help: [
        "How well the checker performs on known test ads.",
        "Useful before trusting it with a new brand.",
        "Results here are tests, not live ads.",
      ] },
      { name: "Audit log", href: "/audit", icon: ScrollText, help: [
        "Every check, edit, decision and override, with who did it and when.",
        "Each event is sealed with a SHA-256 hash of the one before it.",
        "Verify chain recomputes every hash on the server and shows where it breaks, if anywhere.",
      ] },
    ],
  },
  {
    label: "Workspace",
    items: [
      { name: "Brands", href: "/brands", icon: Building2, help: [
        "Each brand has its own claims, rules and reviewers.",
        "Switch brand from the header at any time.",
        "Add a brand to start a separate rule set.",
      ] },
      { name: "Team", href: "/team", icon: Users, help: [
        "Who can check ads and who can approve them.",
        "Invite reviewers so approvals are not stuck on one person.",
        "Roles control what each person can change.",
      ] },
      { name: "Settings", href: "/settings", icon: Settings, help: [
        "Workspace preferences and connections.",
        "Most teams never need to change these.",
        "Ask your admin before editing shared settings.",
      ] },
    ],
  },
];

const ALL = NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label })));

export function isActive(href: string, path: string) {
  if (href === "/submissions") return path === "/submissions" || /^\/submissions\/(?!new)/.test(path);
  return path === href || path.startsWith(href + "/");
}

export function findPage(path: string) {
  return ALL.find((i) => isActive(i.href, path));
}
