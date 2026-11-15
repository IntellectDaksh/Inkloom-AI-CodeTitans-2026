import { kbRoute } from "@/lib/files/kbRoute";

const route = kbRoute("document", (d) => String(d.id ?? ""));
export const GET = route.GET;
export const PUT = route.PUT;
