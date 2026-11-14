// Permission matrix, enforced server-side in /api/approvals and the findings route.
// The role is looked up from the seeded user profile for the acting userId, never trusted from the body.
//
//                      admin  brand_manager  reviewer  creator
//  approve / changes     y          y            y        -
//  reject                y          y            y        -
//  override decision     y          -            -        -
//  override finding      y          y            -        -
//  dismiss finding       y          y            y        -
//  dispute finding       y          y            -        y
//
// Nobody may approve/reject/override their own submission.
export type AppRole = "admin" | "brand_manager" | "reviewer" | "creator";
export type Permission = "decide" | "reject" | "override_decision" | "override_finding" | "dismiss" | "dispute";

export const PERMISSIONS: Record<Permission, AppRole[]> = {
  decide: ["admin", "brand_manager", "reviewer"],
  reject: ["admin", "brand_manager", "reviewer"],
  override_decision: ["admin"],
  override_finding: ["admin", "brand_manager"],
  dismiss: ["admin", "brand_manager", "reviewer"],
  dispute: ["admin", "brand_manager", "creator"],
};

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Admin",
  brand_manager: "Brand Manager",
  reviewer: "Compliance Reviewer",
  creator: "Content Creator",
};

export function can(role: AppRole | undefined | null, p: Permission): boolean {
  return !!role && PERMISSIONS[p].includes(role);
}

/** Readable denial or null. */
export function denyFor(role: AppRole | undefined | null, p: Permission): string | null {
  if (!role) return "Unknown user. Sign in with one of the demo accounts.";
  if (can(role, p)) return null;
  const who = PERMISSIONS[p].map((r) => ROLE_LABEL[r]).join(", ");
  return `${ROLE_LABEL[role]}s can't do this. Allowed: ${who}.`;
}
