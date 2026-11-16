import { readPrefs } from "../guide/workspace";

// Date/time display driven by the Appearance prefs. Reads prefs at call time; callers re-render via usePrefs.
const pad = (n: number) => String(n).padStart(2, "0");

export function fmtDate(input: string | number | Date): string {
  const d = new Date(input);
  if (isNaN(d.getTime())) return typeof input === "string" ? input : "";
  const f = readPrefs().dateFormat;
  if (f === "iso") return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (f === "dmy") return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  if (f === "mdy") return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(d);
}

export function fmtTime(input: string | number | Date): string {
  const d = new Date(input);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", hour12: readPrefs().clock === "12" }).format(d);
}

export const fmtDateTime = (input: string | number | Date) => {
  const d = fmtDate(input);
  const t = fmtTime(input);
  return t ? `${d}, ${t}` : d;
};
