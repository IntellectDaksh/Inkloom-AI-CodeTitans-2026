"use client";

import React, { useState } from "react";
import {
  Check,
  Copy,
  ArrowRight,
  GitCompare,
  SplitSquareVertical,
  ShieldAlert,
} from "lucide-react";
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
          <div className="line-through text-rose-300 bg-rose-950/30 px-3 py-2 rounded-md border border-rose-500/30 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
            {flaggedPhrase}
          </div>
          <div className="text-[#00F2FE] bg-[#00F2FE]/10 px-3 py-2 rounded-md border border-[#00F2FE]/30 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
            {suggestedReplacement}
          </div>
        </div>
      );
    }

    const parts = textToSearch.split(flaggedPhrase);
    return (
      <div className="text-xs sm:text-sm text-[#F8FAFC] leading-relaxed p-4 rounded-lg bg-[#080C16] border border-[#1E2E50] shadow-[inset_0_2px_5px_rgba(0,0,0,0.7)]">
        {parts[0]}
        <del className="bg-rose-950/60 text-rose-300 font-medium line-through decoration-rose-500/80 px-2 py-0.5 rounded border border-rose-500/40 mx-1 inline-block shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
          {flaggedPhrase}
        </del>
        <ins className="bg-[#00F2FE]/15 text-[#00F2FE] font-bold no-underline px-2 py-0.5 rounded border border-[#00F2FE]/40 mx-1 inline-block shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
          {suggestedReplacement}
        </ins>
        {parts.slice(1).join(flaggedPhrase)}
      </div>
    );
  };

  return (
    <div
      className={`rounded-xl bg-[#0D1527] border border-[#1E2E50] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all ${className}`}
    >
      {/* Diff Header */}
      <div className="px-4 py-3 bg-[#152038] border-b border-[#1E2E50] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Badge variant={severity as BadgeVariant} dot size="xs" mono>
            {severity.toUpperCase()}
          </Badge>
          {ruleName && (
            <span className="text-xs font-semibold text-[#F8FAFC] truncate max-w-xs tracking-tight">
              {ruleName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <button
            onClick={() =>
              setViewMode(viewMode === "split" ? "inline" : "split")
            }
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-[#94A3B8] hover:text-[#F8FAFC] bg-[#0D1527] hover:bg-[#1A2846] border border-[#1E2E50] hover:border-[#2A406E] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] cursor-pointer"
            title={`Switch to ${viewMode === "split" ? "Inline" : "Split"} view`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span className="capitalize">{viewMode}</span>
          </button>

          {/* Copy Replacement */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-[#94A3B8] hover:text-[#00F2FE] bg-[#0D1527] hover:bg-[#1A2846] border border-[#1E2E50] hover:border-[#2A406E] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] cursor-pointer"
            title="Copy suggestion"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#00F2FE]" />
                <span className="text-[#00F2FE] font-semibold">Copied</span>
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
      <div className="p-4 space-y-3.5 bg-[#0A1020]/50">
        {reason && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#080C16] border border-[#1E2E50]/70 text-xs text-[#CBD5E1] leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
            <p>{reason}</p>
          </div>
        )}

        {viewMode === "split" ? (
          <div className="space-y-2.5 font-mono text-xs">
            {/* Deleted / Flagged Row */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-950/20 border border-rose-500/25 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
              <span className="text-rose-400 font-bold shrink-0 select-none text-sm leading-none">
                -
              </span>
              <div className="flex-1 text-rose-300 line-through decoration-rose-500/60 break-words font-medium">
                {flaggedPhrase}
              </div>
            </div>

            {/* Added / Suggested Row */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#00F2FE]/5 border border-[#00F2FE]/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
              <span className="text-[#00F2FE] font-bold shrink-0 select-none text-sm leading-none">
                +
              </span>
              <div className="flex-1 text-[#00F2FE] font-semibold break-words">
                {suggestedReplacement}
              </div>
            </div>
          </div>
        ) : (
          renderInlineDiff()
        )}
      </div>

      {/* Diff Footer / Action bar */}
      <div className="px-4 py-3 bg-[#080C16] border-t border-[#1E2E50] flex items-center justify-between">
        <span className="text-[10px] text-[#64748B] flex items-center gap-2 font-mono uppercase tracking-wider font-semibold">
          <GitCompare className="w-3.5 h-3.5 text-[#00F2FE]" />
          SURGICAL DIFF AUDIT PASS
        </span>

        {onApply && (
          <Button
            size="sm"
            variant={applied ? "secondary" : "turquoise"}
            onClick={handleApply}
            loading={isApplying}
            disabled={applied}
            icon={
              applied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )
            }
          >
            {applied ? "Applied to Draft" : "Apply Surgical Fix"}
          </Button>
        )}
      </div>
    </div>
  );
}
