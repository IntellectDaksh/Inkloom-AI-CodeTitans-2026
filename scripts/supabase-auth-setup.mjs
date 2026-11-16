/**
 * Builds AdSnitch's branded auth emails into supabase/templates/ and, with --push, applies them plus
 * the site URL / redirect allow-list (and optional custom SMTP) to the hosted project through the
 * Supabase Management API.
 *
 *   node scripts/supabase-auth-setup.mjs                 # write HTML files only
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/supabase-auth-setup.mjs --push
 *
 * Optional env: SITE_URL (default https://adsnitch.cv), SUPABASE_PROJECT_REF,
 * SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_SENDER for a custom sender (e.g. Resend).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REF = process.env.SUPABASE_PROJECT_REF || "zcymcbojjilmrpamaakd";
const SITE = (process.env.SITE_URL || "https://adsnitch.cv").replace(/\/$/, "");
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "supabase", "templates");

const NAVY = "#0b1620", CORAL = "#e5535d", MUTED = "#536474", LINE = "#e3eaef", BG = "#f3f7fa";

// Table layout + inline styles: the only thing Gmail, Outlook and Apple Mail all render the same.
function layout({ preheader, title, body }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${title}</title></head>
<body style="margin:0;padding:0;background:${BG};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;color:${BG};">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
  <tr><td style="padding:0 4px 18px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="width:26px;vertical-align:middle;">
        <div style="width:22px;height:16px;border:2px solid ${NAVY};border-radius:4px;">
          <div style="margin:3px 0 0 3px;width:9px;height:2px;background:${NAVY};border-radius:1px;"></div>
          <div style="margin:2px 0 0 3px;width:21px;height:4px;background:${CORAL};border-radius:1px;"></div>
        </div>
      </td>
      <td style="padding-left:8px;font:700 19px/1 Arial,Helvetica,sans-serif;letter-spacing:-0.4px;color:${NAVY};">AdSnitch</td>
    </tr></table>
  </td></tr>
  <tr><td style="background:#ffffff;border:1px solid ${LINE};border-radius:14px;padding:32px 28px;font:15px/1.6 Arial,Helvetica,sans-serif;color:${NAVY};">
    <h1 style="margin:0 0 12px;font:700 22px/1.3 Arial,Helvetica,sans-serif;letter-spacing:-0.3px;color:${NAVY};">${title}</h1>
    ${body}
  </td></tr>
  <tr><td style="padding:18px 4px 0;font:12px/1.6 Arial,Helvetica,sans-serif;color:${MUTED};">
    AdSnitch checks ad claims against your proof before they go live.<br>
    You got this email because of activity on an AdSnitch account for {{ .Email }}. If that wasn&rsquo;t you, ignore it; nothing changes.<br>
    <a href="${SITE}" style="color:${MUTED};">adsnitch.cv</a> &middot; <a href="${SITE}/privacy" style="color:${MUTED};">Privacy</a>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

const p = (t) => `<p style="margin:0 0 16px;">${t}</p>`;
const small = (t) => `<p style="margin:16px 0 0;font-size:13px;color:${MUTED};">${t}</p>`;
const button = (label, href = "{{ .ConfirmationURL }}") =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;"><tr><td style="background:${NAVY};border-radius:999px;">
  <a href="${href}" style="display:inline-block;padding:13px 24px;font:700 14px/1 Arial,Helvetica,sans-serif;color:#ffffff;text-decoration:none;">${label}</a></td></tr></table>`;
const code = () =>
  `<div style="margin:8px 0 20px;padding:16px;border:1px dashed ${LINE};border-radius:10px;background:${BG};text-align:center;font:700 30px/1 'Courier New',monospace;letter-spacing:8px;color:${NAVY};">{{ .Token }}</div>`;
const fallback = () =>
  small(`Button not working? Paste this link into your browser:<br><span style="word-break:break-all;">{{ .ConfirmationURL }}</span>`);

export const TEMPLATES = {
  confirmation: {
    subject: "Confirm your AdSnitch account",
    html: layout({
      preheader: "One click and you can check your first ad.",
      title: "Confirm your email",
      body: p("Welcome to AdSnitch. Confirm this address and you can check your first ad in under a minute.") + button("Confirm email") + fallback(),
    }),
  },
  invite: {
    subject: "You've been invited to AdSnitch",
    html: layout({
      preheader: "Your team uses AdSnitch to check ad claims before they go live.",
      title: "Join your team on AdSnitch",
      body:
        p("Your team uses AdSnitch to check every ad claim against approved proof before it goes live. Accept the invite to set your password and join their workspace.") +
        button("Accept invite") +
        small("The invite works once. If it has expired, ask your admin to send a new one.") +
        fallback(),
    }),
  },
  magic_link: {
    subject: "Your AdSnitch sign-in link",
    html: layout({
      preheader: "Sign in without a password.",
      title: "Sign in to AdSnitch",
      body: p("Use this button to sign in. It works once and expires in an hour.") + button("Sign in") + p("Or enter this code:") + code() + fallback(),
    }),
  },
  recovery: {
    subject: "Your AdSnitch password reset code",
    html: layout({
      preheader: "Enter this code to set a new password.",
      title: "Reset your password",
      body:
        p("Enter this 6-digit code on the reset screen to choose a new password. It expires in an hour.") +
        code() +
        small("Didn&rsquo;t ask for this? Ignore this email; your password stays the same."),
    }),
  },
  email_change: {
    subject: "Confirm your new email for AdSnitch",
    html: layout({
      preheader: "Confirm the change to your sign-in email.",
      title: "Confirm your new email",
      body:
        p("You asked to change your AdSnitch sign-in email from {{ .Email }} to <b>{{ .NewEmail }}</b>. Confirm to finish.") +
        button("Confirm new email") +
        small("Didn&rsquo;t ask for this? Change your password now; someone may have access to your account.") +
        fallback(),
    }),
  },
  reauthentication: {
    subject: "Your AdSnitch verification code",
    html: layout({
      preheader: "Confirm it is you.",
      title: "Confirm it&rsquo;s you",
      body: p("Enter this code to confirm a sensitive change on your account.") + code() + small("Expires in an hour. Never share it; AdSnitch will never ask for it."),
    }),
  },
};

fs.mkdirSync(OUT, { recursive: true });
for (const [name, t] of Object.entries(TEMPLATES)) fs.writeFileSync(path.join(OUT, `${name}.html`), t.html);
console.log(`wrote ${Object.keys(TEMPLATES).length} templates to ${OUT}`);

if (process.argv.includes("--push")) {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error("Set SUPABASE_ACCESS_TOKEN (supabase.com/dashboard/account/tokens).");
  const body = {
    site_url: SITE,
    uri_allow_list: [`${SITE}/**`, "https://www.adsnitch.cv/**", "https://inkloom-ai-tau.vercel.app/**", "http://localhost:3000/**"].join(","),
    mailer_otp_length: 6,
  };
  for (const [name, t] of Object.entries(TEMPLATES)) {
    body[`mailer_subjects_${name}`] = t.subject;
    body[`mailer_templates_${name}_content`] = t.html;
  }
  if (process.env.SMTP_HOST) {
    Object.assign(body, {
      smtp_host: process.env.SMTP_HOST,
      smtp_port: process.env.SMTP_PORT || "465",
      smtp_user: process.env.SMTP_USER,
      smtp_pass: process.env.SMTP_PASS,
      smtp_admin_email: process.env.SMTP_SENDER || "hello@adsnitch.cv",
      smtp_sender_name: "AdSnitch",
      rate_limit_email_sent: 100,
    });
  }
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Supabase API ${r.status}: ${await r.text()}`);
  console.log(`pushed templates, site_url=${SITE}${process.env.SMTP_HOST ? ", custom SMTP" : ""}`);
}
