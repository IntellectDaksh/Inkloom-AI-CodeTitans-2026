import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy · AdSnitch" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>This explains what AdSnitch collects, why, and what you can do about it.</p>

      <h2>What we collect</h2>
      <ul>
        <li><b>Account details:</b> name, email, company name, role, profile photo and bio if you add them.</li>
        <li><b>Workspace content:</b> ad copy and files you check, claims, evidence, guidelines, comments and approval decisions.</li>
        <li><b>Usage and security data:</b> sign-in events, IP address for rate limiting, and an audit log of actions in your workspace.</li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To run checks, store your workspace and show it only to people in your organisation.</li>
        <li>To keep the service secure, prevent abuse and enforce usage limits.</li>
        <li>To email you about your account, such as sign-in codes, invites and password resets.</li>
      </ul>
      <p>We don&rsquo;t sell your data, show ads, or use your content to train AI models.</p>

      <h2>Who processes it</h2>
      <ul>
        <li><b>Supabase</b> (database, sign-in and file storage, hosted in Mumbai, India).</li>
        <li><b>Vercel</b> (hosting).</li>
        <li><b>Google Gemini API</b> (reads uploaded files and analyses copy when you run a check).</li>
      </ul>

      <h2>Who can see your data</h2>
      <p>
        Only signed-in members of your organisation. Other AdSnitch customers can&rsquo;t see your people, ads or claims.
        Anonymous checks on the home page are not saved.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Workspace data stays until your organisation deletes it or closes its account. Rate-limit records are deleted within two days.
        Deleting your account removes your profile; content you created inside a shared workspace stays with that organisation.
      </p>

      <h2>Your rights</h2>
      <p>
        You can see and edit your profile, delete content in your workspace, and delete your account. To ask for a copy
        of your data or its deletion, or to raise a privacy concern, email us at the address below. This covers rights under
        India&rsquo;s Digital Personal Data Protection Act, 2023 and, where it applies, the GDPR.
      </p>
    </LegalPage>
  );
}
