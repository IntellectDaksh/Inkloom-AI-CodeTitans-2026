// Option lists shared by the settings page and the places that read those prefs.
export const LANDING = [
  { value: "/dashboard", label: "Dashboard" },
  { value: "/submissions/new", label: "New check" },
  { value: "/approvals", label: "Approvals" },
  { value: "/submissions", label: "Reviews" },
];
export const LANDING_PAGES = LANDING.map((l) => l.value);

export const NOTIF_TYPES = [
  { value: "review_assigned", label: "Review assigned to me" },
  { value: "changes_requested", label: "Changes requested" },
  { value: "approval_granted", label: "Approved" },
  { value: "analysis_completed", label: "Check finished" },
  { value: "claim_expiring", label: "Claim expiring" },
  { value: "finding_disputed", label: "Issue disputed" },
  { value: "finding_overridden", label: "Issue overridden" },
  { value: "cascade_re_review", label: "Needs re-review" },
];
