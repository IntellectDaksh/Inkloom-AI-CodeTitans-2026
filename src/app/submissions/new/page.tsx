"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, ClipboardPaste, FileUp, Play } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Stepper, PipelineProgress, PIPELINE_STAGES } from "@/components/submission/Stepper";
import { ChoiceCards } from "@/components/submission/ChoiceCards";
import { putFile } from "@/lib/files/store";
import { FileDropZone, UploadCard, UploadItem, extractFile } from "@/components/submission/FileUpload";
import { BRANDS, CHANNELS, brandName } from "@/components/submission/shared";

const STEPS = ["Add your ad", "Brand and channel", "Review and check"];

const SAMPLES = [
  {
    label: "Protein reel",
    title: "Q4 Campaign – Clinical Protein Reel Script",
    content:
      "Our proprietary formula gives you 2x faster results and helps build muscle in just 14 days without dietary changes. Guaranteed 100% recovery with all-natural miracle bio-peptides.",
    brandId: "brand_apex",
    channel: "Instagram Reel",
    campaign: "Q4 Peak Athletic Season",
  },
  {
    label: "Cloud SLA post",
    title: "Enterprise Cloud SLA Announcement — Winter 2026",
    content:
      "Zenith Cloud guarantees 100% unhackable infrastructure with absolutely zero downtime under all disaster scenarios. Eliminate all compliance liabilities permanently with our autonomous kernel.",
    brandId: "brand_zenith",
    channel: "LinkedIn",
    campaign: "Enterprise Cloud Infrastructure SLA",
  },
  {
    label: "Skincare page",
    title: "Lumina Advanced Cellular Rejuvenation Serum Copy",
    content:
      "Lumina reverses cellular skin aging in just 7 days with medical-grade botanicals. Permanently erases deep wrinkles and repairs damaged DNA without dermatological procedures.",
    brandId: "brand_lumina",
    channel: "Web DTC",
    campaign: "Anti-Aging Derm Launch",
  },
];

type SourceFile = { fileName: string; mime: string; method?: string; fileId?: string; size?: number; pages?: number };
type Draft = { title: string; content: string; sourceFile?: SourceFile };
const src = (u: UploadItem): SourceFile => ({
  fileName: u.file.name,
  mime: u.file.type || "application/octet-stream",
  method: u.method,
  fileId: u.fileId,
  size: u.file.size,
  pages: u.pages,
});

const stripExt = (n: string) => n.replace(/\.[^.]+$/, "");

export default function NewSubmissionPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [combine, setCombine] = useState<"separate" | "merge">("separate");
  const [brandId, setBrandId] = useState<string>(BRANDS[0].id);
  const [channel, setChannel] = useState<string>(CHANNELS[0].id);
  const [campaign, setCampaign] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(0);
  const [runLabel, setRunLabel] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => headingRef.current?.focus(), [step]);

  // File dropped on the dashboard: rebuild it and run it through the normal extract flow once.
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem("adsnitch:pending-upload");
      sessionStorage.removeItem("adsnitch:pending-upload");
    } catch {}
    if (!raw) return;
    (async () => {
      try {
        const p = JSON.parse(raw) as { name: string; type: string; dataUrl: string };
        const blob = await (await fetch(p.dataUrl)).blob();
        setMode("upload");
        addFiles([new File([blob], p.name, { type: p.type || blob.type })]);
      } catch {
        setMode("upload");
        setError("We couldn't pick up the file from the dashboard. Drop it here again.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- uploads ----
  const runExtract = async (key: string, file: File) => {
    try {
      const r = await extractFile(file);
      setUploads((u) => u.map((x) => (x.key === key ? { ...x, ...r, status: "done" } : x)));
    } catch (e) {
      setUploads((u) => u.map((x) => (x.key === key ? { ...x, status: "error", error: (e as Error).message } : x)));
    }
  };
  const addFiles = (files: File[]) => {
    setError(null);
    const items: UploadItem[] = files.map((file) => ({
      key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      status: "reading",
      text: "",
      warnings: [],
    }));
    setUploads((u) => [...u, ...items]);
    items.forEach((it) => runExtract(it.key, it.file));
    // Keep the original on this device so it stays openable after processing.
    items.forEach((it) =>
      putFile(it.file).then((fileId) => fileId && setUploads((u) => u.map((x) => (x.key === it.key ? { ...x, fileId } : x))))
    );
  };
  const readyUploads = uploads.filter((u) => u.status === "done" && u.text.trim());
  const stillReading = uploads.some((u) => u.status === "reading");

  const drafts = (): Draft[] => {
    if (mode === "paste") return [{ title: title.trim() || "Untitled ad", content }];
    if (combine === "merge" || readyUploads.length === 1)
      return [
        {
          title: title.trim() || stripExt(readyUploads[0]?.file.name || "Uploaded ad"),
          content: readyUploads.map((u) => u.text.trim()).join("\n\n"),
          sourceFile: { ...src(readyUploads[0]), fileName: readyUploads.map((u) => u.file.name).join(", ") },
        },
      ];
    return readyUploads.map((u) => ({ title: stripExt(u.file.name), content: u.text, sourceFile: src(u) }));
  };

  const step1Problem =
    mode === "paste"
      ? !content.trim()
        ? "Paste your ad copy to continue."
        : null
      : stillReading
      ? "Wait for your files to finish reading."
      : readyUploads.length === 0
      ? "Add at least one file we can read."
      : null;

  const next = () => {
    if (step === 0 && step1Problem) return setError(step1Problem);
    setError(null);
    setStep((s) => s + 1);
  };

  const loadSample = (s: (typeof SAMPLES)[number]) => {
    setMode("paste");
    setTitle(s.title);
    setContent(s.content);
    setBrandId(s.brandId);
    setChannel(s.channel);
    setCampaign(s.campaign);
    setError(null);
  };

  // ---- run ----
  const check = async () => {
    const list = drafts();
    setRunning(true);
    setError(null);
    const channelMeta = CHANNELS.find((c) => c.id === channel);
    const created: string[] = [];
    try {
      for (let i = 0; i < list.length; i++) {
        const d = list[i];
        setRunLabel(list.length > 1 ? `Checking ${i + 1} of ${list.length}: ${d.title}` : `Checking “${d.title}”`);
        setStage(0);
        // The API runs every stage in one request; advance the list on a timer and finish when it returns.
        const timer = setInterval(() => setStage((s) => Math.min(s + 1, PIPELINE_STAGES.length - 1)), 900);
        try {
          const res = await fetch("/api/submissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: d.title,
              content: d.content,
              sourceFile: d.sourceFile,
              brandId,
              channel,
              submissionType: channelMeta?.type,
              campaign,
              runAnalysis: true,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.success || !data.submission?.id)
            throw new Error(data.error || `The check could not finish (error ${res.status}).`);
          created.push(data.submission.id);
        } finally {
          clearInterval(timer);
        }
        setStage(PIPELINE_STAGES.length);
      }
      router.push(created.length === 1 ? `/submissions/${created[0]}` : `/submissions?created=${created.length}`);
    } catch (e) {
      setRunning(false);
      setError(
        `${(e as Error).message}${created.length ? ` ${created.length} of ${list.length} ads were checked and saved.` : ""}`
      );
    }
  };

  const list = step === 2 ? drafts() : [];

  return (
    <AppLayout title="New review" subtitle="Check an ad against your brand's rules and approved claims before it goes live.">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/submissions"
          className="inline-flex items-center gap-2 rounded text-sm text-text-muted hover:text-text-primary focus-visible:outline-2 focus-visible:outline-blue"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> All reviews
        </Link>

        <div className="space-y-2">
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight text-text-primary focus:outline-none sm:text-[28px]">
            {STEPS[step]}
          </h1>
          <p className="text-sm text-text-secondary">
            {step === 0 && "Paste your ad copy or upload the file. We read PDFs, Word files and screenshots."}
            {step === 1 && "Pick whose rules apply and where the ad will run. Each choice changes what we check."}
            {step === 2 && "Look over the details, then run the check. It takes a few seconds."}
          </p>
        </div>

        <Stepper steps={STEPS} current={step} onGo={(i) => !running && setStep(i)} />

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-status-critical/30 bg-status-critical/10 p-4 text-sm text-status-critical">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1">{error}</span>
            {step === 2 && !running && (
              <button type="button" onClick={check} className="font-semibold underline underline-offset-2 cursor-pointer">
                Try again
              </button>
            )}
          </div>
        )}

        {/* STEP 1 */}
        {step === 0 && (
          <div className="space-y-6">
            <div role="tablist" aria-label="How to add your ad" className="inline-flex rounded-xl border border-border-default bg-panel p-1">
              {(
                [
                  ["paste", "Paste text", ClipboardPaste],
                  ["upload", "Upload file", FileUp],
                ] as const
              ).map(([m, label, Icon]) => (
                <button
                  key={m}
                  role="tab"
                  type="button"
                  aria-selected={mode === m}
                  onClick={() => {
                    setMode(m);
                    setError(null);
                  }}
                  className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue cursor-pointer ${
                    mode === m ? "bg-ink text-ghost" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden /> {label}
                </button>
              ))}
            </div>

            {mode === "paste" ? (
              <div className="glass space-y-4 rounded-2xl p-6">
                <div className="space-y-2">
                  <label htmlFor="ad-title" className="text-sm font-medium text-text-primary">
                    Name this ad <span className="font-normal text-text-muted">(optional)</span>
                  </label>
                  <input
                    id="ad-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Q4 protein reel, version 2"
                    autoComplete="off"
                    className="h-11 w-full rounded-lg glass-inset px-3 font-sans text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue/50"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="ad-copy" className="text-sm font-medium text-text-primary">
                      Ad copy
                    </label>
                    <span className="text-xs tabular-nums text-text-muted">{content.length.toLocaleString()} characters</span>
                  </div>
                  <textarea
                    id="ad-copy"
                    rows={9}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste the script, caption, or page copy exactly as it will appear…"
                    className="w-full resize-y rounded-lg glass-inset p-4 font-sans text-[15px] leading-relaxed text-text-primary focus:outline-none focus:ring-2 focus:ring-blue/50"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-border-subtle pt-4">
                  <span className="text-[13px] text-text-muted">No ad handy? Try a sample:</span>
                  {SAMPLES.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => loadSample(s)}
                      className="h-9 rounded-lg border border-border-default bg-panel px-3 text-[13px] font-medium text-text-secondary hover:border-border-strong hover:text-text-primary focus-visible:outline-2 focus-visible:outline-blue cursor-pointer"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <FileDropZone onFiles={addFiles} />
                {uploads.map((u) => (
                  <UploadCard
                    key={u.key}
                    item={u}
                    onText={(t) => setUploads((all) => all.map((x) => (x.key === u.key ? { ...x, text: t } : x)))}
                    onRemove={() => setUploads((all) => all.filter((x) => x.key !== u.key))}
                    onRetry={() => {
                      setUploads((all) => all.map((x) => (x.key === u.key ? { ...x, status: "reading", error: undefined } : x)));
                      runExtract(u.key, u.file);
                    }}
                  />
                ))}
                {uploads.length > 1 && (
                  <fieldset className="glass space-y-3 rounded-xl p-4">
                    <legend className="sr-only">How to check multiple files</legend>
                    <p className="text-sm font-semibold text-text-primary">You added {uploads.length} files</p>
                    {(
                      [
                        ["separate", "Check each file as its own ad", "One review per file. Best for different ads."],
                        ["merge", "Combine into one ad", "Joins the text in order. Best for pages of the same ad."],
                      ] as const
                    ).map(([v, label, hint]) => (
                      <label key={v} className="flex cursor-pointer items-start gap-3 text-sm">
                        <input
                          type="radio"
                          name="combine"
                          checked={combine === v}
                          onChange={() => setCombine(v)}
                          className="mt-1 h-4 w-4 accent-[var(--color-ink)]"
                        />
                        <span>
                          <span className="font-medium text-text-primary">{label}</span>
                          <span className="block text-[13px] text-text-muted">{hint}</span>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 2 */}
        {step === 1 && (
          <div className="glass space-y-8 rounded-2xl p-6">
            <ChoiceCards
              name="brand"
              legend="Which brand is this for?"
              value={brandId}
              onChange={setBrandId}
              options={BRANDS.map((b) => ({ id: b.id, title: b.name, meta: b.industry, description: b.rules }))}
            />
            <ChoiceCards
              name="channel"
              legend="Where will it run?"
              value={channel}
              onChange={setChannel}
              options={CHANNELS.map((c) => ({ id: c.id, title: c.id, description: c.rules }))}
            />
            <div className="space-y-2">
              <label htmlFor="campaign" className="text-sm font-medium text-text-primary">
                Campaign <span className="font-normal text-text-muted">(optional)</span>
              </label>
              <input
                id="campaign"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                placeholder="e.g. Black Friday 2026"
                autoComplete="off"
                className="h-11 w-full rounded-lg glass-inset px-3 font-sans text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue/50"
              />
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 2 && (
          <div className="glass space-y-6 rounded-2xl p-6">
            {running ? (
              <PipelineProgress stage={stage} label={runLabel} />
            ) : (
              <>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    ["Brand", brandName(brandId) || brandId],
                    ["Channel", channel],
                    ["Campaign", campaign || "None"],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-border-default bg-panel p-4">
                      <dt className="text-xs text-text-muted">{k}</dt>
                      <dd className="mt-1 text-sm font-medium text-text-primary">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-text-primary">
                    {list.length === 1 ? "Ad to check" : `${list.length} ads to check`}
                  </h2>
                  {list.map((d, i) => (
                    <div key={i} className="rounded-xl border border-border-default bg-panel p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-text-primary">{d.title}</p>
                        <span className="text-xs tabular-nums text-text-muted">
                          {d.sourceFile ? `${d.sourceFile.fileName} · ` : ""}
                          {d.content.length.toLocaleString()} characters
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-text-secondary">{d.content}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer nav */}
        {!running && (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {step > 0 ? (
              <Button variant="secondary" size="md" onClick={() => setStep((s) => s - 1)} icon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </Button>
            ) : (
              <span />
            )}
            {step < 2 ? (
              <Button size="md" onClick={next} iconRight={<ArrowRight className="h-4 w-4" />}>
                Continue
              </Button>
            ) : (
              <Button size="md" onClick={check} icon={<Play className="h-4 w-4 fill-current" />}>
                Check my ad{list.length > 1 ? "s" : ""}
              </Button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
