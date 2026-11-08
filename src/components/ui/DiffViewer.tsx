"use client";

import React, { useState } from "react";
import { Check, Copy, ArrowRight, GitCompare, AlertOctagon, SplitSquareVertical } from "lucide-react";
import { Badge, BadgeVariant } from "./Badge";
import { Button } from "./Button";

export interface DiffViewerProps {
  originalText?: string;
  flaggedPhrase: string;
  suggestedReplacement: string;
  fullSentence?: string;
  reason?: string;
  severity?: "critical" | "high" | "medium" | "low" | "info";
  ruleName?: string;
  onApply?: (replacement: string) => void;
  applied?: boolean;
  className?: string;
  defaultView?: "split" | "inline";
}

export function DiffViewer({
  originalText,
  flaggedPhrase,
  suggestedReplacement,
  fullSentence,
  reason,
  severity = "high",
  ruleName,
  onApply,
  applied = false,
  className = "",
  defaultView = "split",
}: DiffViewerProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "inline">(defaultView);
  const [isApplying, setIsApplying] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(suggestedReplacement);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = async () => {
    if (!onApply) return;
    setIsApplying(true);
    try {
      await onApply(suggestedReplacement);
    } finally {
      setIsApplying(false);
    }
  };

  // Build inline preview if a fullSentence is provided or reconstruct it
  const renderInlineDiff = () => {
    const textToSearch = fullSentence || originalText || flaggedPhrase;
    if (!textToSearch.includes(flaggedPhrase)) {
      return (
        <div className="flex flex-col gap-2 font-mono text-xs leading-relaxed">
          <div className="line-through text-rose-400 bg-rose-950/30 px-2 py-1 rounded border border-rose-500/30">
            {flaggedPhrase}
          </div>
          <div className="text-emerald-300 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-500/30">
            {suggestedReplacement}
          </div>
        </div>
      );
    }

    const parts = textToSearch.split(flaggedPhrase);
    return (
      <div className="text-xs sm:text-sm text-[#F4F6F9] leading-relaxed p-3.5 rounded-lg bg-[#0A0B11] border border-[#1C202F]">
        {parts[0]}
        <del className="bg-rose-950/50 text-rose-300 font-medium line-through decoration-rose-500/70 px-1.5 py-0.5 rounded border border-rose-500/30 mx-1 inline-block">
          {flaggedPhrase}
        </del>
        <ins className="bg-emerald-950/50 text-emerald-300 font-semibold no-underline px-1.5 py-0.5 rounded border border-emerald-500/40 mx-1 inline-block">
          {suggestedReplacement}
        </ins>
        {parts.slice(1).join(flaggedPhrase)}
      </div>
    );
  };

  return (
    <div
      className={`rounded-xl bg-[#0F1117] border border-[#1C202F] overflow-hidden transition-all ${className}`}
    >
      {/* Diff Header */}
      <div className="px-4 py-3 bg-[#141722] border-b border-[#1C202F] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={severity as BadgeVariant} dot size="xs" mono>
            {severity.toUpperCase()}
          </Badge>
          {ruleName && (
            <span className="text-xs font-medium text-[#F4F6F9] truncate max-w-xs">
              {ruleName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* View toggle */}
          <button
            onClick={() =>
              setViewMode(viewMode === "split" ? "inline" : "split")
            }
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-[#94A3B8] hover:text-[#F4F6F9] hover:bg-[#1C202F] transition-colors border border-transparent hover:border-[#2B3248]"
            title={`Switch to ${viewMode === "split" ? "Inline" : "Split"} view`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span className="capitalize">{viewMode}</span>
          </button>

          {/* Copy Replacement */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-[#94A3B8] hover:text-emerald-400 hover:bg-[#1C202F] transition-colors border border-transparent hover:border-[#2B3248]"
            title="Copy suggestion"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Diff Content Body */}
      <div className="p-4 space-y-3">
        {reason && (
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            {reason}
          </p>
        )}

        {viewMode === "split" ? (
          <div className="space-y-2 font-mono text-xs">
            {/* Deleted / Flagged Row */}
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20">
              <span className="text-rose-400 font-bold shrink-0 select-none">-</span>
              <div className="flex-1 text-rose-300 line-through decoration-rose-500/50 break-words">
                {flaggedPhrase}
              </div>
            </div>

            {/* Added / Suggested Row */}
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
              <span className="text-emerald-400 font-bold shrink-0 select-none">+</span>
              <div className="flex-1 text-emerald-300 font-medium break-words">
                {suggestedReplacement}
              </div>
            </div>
          </div>
        ) : (
          renderInlineDiff()
        )}
      </div>

      {/* Diff Footer / Action bar */}
      <div className="px-4 py-2.5 bg-[#0C0E14] border-t border-[#1C202F] flex items-center justify-between">
        <span className="text-[11px] text-[#64748B] flex items-center gap-1.5 font-mono">
          <GitCompare className="w-3.5 h-3.5 text-violet-400" /> Grounded Surgical Correction
        </span>

        {onApply && (
          <Button
            size="xs"
            variant={applied ? "secondary" : "success"}
            onClick={handleApply}
            loading={isApplying}
            disabled={applied}
            icon={applied ? <Check className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
          >
            {applied ? "Applied" : "Apply Fix"}
          </Button>
        )}
      </div>
    </div>
  );
}
