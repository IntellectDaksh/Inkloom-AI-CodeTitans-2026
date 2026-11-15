import { kbRoute } from "@/lib/files/kbRoute";

const route = kbRoute("term", (d) => String(d.term ?? "").trim().toLowerCase());
export const GET = route.GET;
export const PUT = route.PUT;
