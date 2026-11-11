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
          <div className="line-through text-[#FCA5A5] bg-[#1A0E10] px-3 py-2 rounded border border-[#4C1D24] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
            {flaggedPhrase}
          </div>
          <div className="text-[#86EFAC] bg-[#0C1A14] px-3 py-2 rounded border border-[#14422B] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
            {suggestedReplacement}
          </div>
        </div>
      );
    }

    const parts = textToSearch.split(flaggedPhrase);
    return (
      <div className="text-xs sm:text-sm text-[#F8F8F8] leading-relaxed p-4 rounded-lg bg-[#080808] border border-[#222222] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
        {parts[0]}
        <del className="bg-[#241013] text-[#FCA5A5] font-medium line-through decoration-[#EF4444]/80 px-2 py-0.5 rounded border border-[#7F1D1D]/70 mx-1 inline-block">
          {flaggedPhrase}
        </del>
        <ins className="bg-[#0C241B] text-[#86EFAC] font-semibold no-underline px-2 py-0.5 rounded border border-[#065F46]/70 mx-1 inline-block">
          {suggestedReplacement}
        </ins>
        {parts.slice(1).join(flaggedPhrase)}
      </div>
    );
  };

  return (
    <div
      className={`rounded-lg bg-[#111111] border border-[#282828] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] transition-all ${className}`}
    >
      {/* Diff Header */}
      <div className="px-4 py-3 bg-[#141414] border-b border-[#222222] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Badge variant={severity as BadgeVariant} dot size="xs" mono>
            {severity.toUpperCase()}
          </Badge>
          {ruleName && (
            <span className="text-xs font-semibold text-white truncate max-w-xs tracking-tight">
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
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium text-[#A0A0A0] hover:text-white bg-[#0C0C0C] hover:bg-[#181818] border border-[#222222] hover:border-[#333333] transition-all cursor-pointer"
            title={`Switch to ${viewMode === "split" ? "Inline" : "Split"} view`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span className="capitalize">{viewMode}</span>
          </button>

          {/* Copy Replacement */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium text-[#A0A0A0] hover:text-white bg-[#0C0C0C] hover:bg-[#181818] border border-[#222222] hover:border-[#333333] transition-all cursor-pointer"
            title="Copy suggestion"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[#10B981] font-semibold">Copied</span>
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
      <div className="p-4 space-y-3.5 bg-[#0C0C0C]">
        {reason && (
          <div className="flex items-start gap-2 p-2.5 rounded bg-[#080808] border border-[#222222] text-xs text-[#EFEFEF] leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
            <p>{reason}</p>
          </div>
        )}

        {viewMode === "split" ? (
          <div className="space-y-2.5 font-mono text-xs">
            {/* Surgical Red-Line Flagged Row */}
            <div className="flex items-start gap-2.5 p-3 rounded bg-[#1A0E10] border border-[#4C1D24] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
              <span className="text-[#EF4444] font-bold shrink-0 select-none text-sm leading-none">
                -
              </span>
              <div className="flex-1 text-[#FCA5A5] line-through decoration-[#EF4444]/70 break-words font-medium">
                {flaggedPhrase}
              </div>
            </div>

            {/* Surgical Green-Line Suggested Row */}
            <div className="flex items-start gap-2.5 p-3 rounded bg-[#0C1A14] border border-[#14422B] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
              <span className="text-[#10B981] font-bold shrink-0 select-none text-sm leading-none">
                +
              </span>
              <div className="flex-1 text-[#86EFAC] font-semibold break-words">
                {suggestedReplacement}
              </div>
            </div>
          </div>
        ) : (
          renderInlineDiff()
        )}
      </div>

      {/* Diff Footer / Action bar */}
      <div className="px-4 py-3 bg-[#080808] border-t border-[#222222] flex items-center justify-between">
        <span className="text-[10px] text-[#737373] flex items-center gap-2 font-mono uppercase tracking-[0.2em] font-semibold">
          <GitCompare className="w-3.5 h-3.5 text-[#06B6D4]" />
          SURGICAL DIFF AUDIT PASS
        </span>

        {onApply && (
          <Button
            size="sm"
            variant={applied ? "secondary" : "primary"}
            onClick={handleApply}
            loading={isApplying}
            disabled={applied}
            icon={
              applied ? (
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )
            }
          >
            {applied ? "Applied" : "Apply Surgical Fix"}
          </Button>
        )}
      </div>
    </div>
  );
}
