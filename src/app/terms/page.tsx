import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Terms of Service · AdSnitch" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>These terms cover your use of AdSnitch, operated by Uideas from Mumbai, India. By creating an account you agree to them.</p>

      <h2>What AdSnitch is, and is not</h2>
      <p>
        AdSnitch is a review aid. It reads your marketing copy, compares it with the claims, evidence and rules you store in
        your workspace, and points out lines that look risky. <b>It is not legal, medical or regulatory advice</b>, and an
        &ldquo;approved&rdquo; status or a high score does not mean an ad is lawful or safe to publish.
      </p>
      <ul>
        <li>Automated checks, including AI models, can miss problems and can flag things that are fine.</li>
        <li>Results are only as good as the claims and evidence your team adds. AdSnitch does not verify that evidence is true.</li>
        <li>You and your organisation stay responsible for what you publish. Get qualified legal review where the law requires it.</li>
      </ul>

      <h2>Your account and workspace</h2>
      <ul>
        <li>Each organisation&rsquo;s data is kept separate. Admins in your organisation can invite people and change their roles.</li>
        <li>Keep your password safe. You are responsible for activity under your account.</li>
        <li>You must be allowed to upload the content you check, and must not upload anything unlawful or malware.</li>
      </ul>

      <h2>Fair use</h2>
      <p>
        Checks and file reading have hourly limits to keep the service fast and costs under control. Don&rsquo;t scrape,
        reverse-engineer or overload the service, or use it to build a competing dataset.
      </p>

      <h2>Your content</h2>
      <p>
        You own what you upload. You give us permission to store and process it only to run the service for you, including
        sending text to our AI provider (Google Gemini) for analysis. We don&rsquo;t sell it or use it to train models.
      </p>

      <h2>Availability and changes</h2>
      <p>
        The service is provided as is. We aim to keep it running but don&rsquo;t promise it will be uninterrupted or error-free.
        We may change features or these terms; we&rsquo;ll update the date above and tell account holders about significant changes.
      </p>

      <h2>Liability</h2>
      <p>
        To the extent the law allows, we are not liable for indirect or consequential losses, including fines, penalties or
        lost revenue from published ads. Our total liability is limited to the amount you paid us in the 12 months before the claim.
      </p>

      <h2>Ending your account</h2>
      <p>You can delete your account from your profile at any time. We may suspend accounts that break these terms.</p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India, with courts in Mumbai having jurisdiction.</p>
    </LegalPage>
  );
}
