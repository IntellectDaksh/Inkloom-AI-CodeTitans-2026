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

function computeWordDiff(original: string, replacement: string) {
  const origWords = original.trim().split(/\s+/).filter(Boolean);
  const replWords = replacement.trim().split(/\s+/).filter(Boolean);

  let prefixCount = 0;
  while (
    prefixCount < origWords.length &&
    prefixCount < replWords.length &&
    origWords[prefixCount].toLowerCase() === replWords[prefixCount].toLowerCase()
  ) {
    prefixCount++;
  }

  let suffixCount = 0;
  while (
    suffixCount < origWords.length - prefixCount &&
    suffixCount < replWords.length - prefixCount &&
    origWords[origWords.length - 1 - suffixCount].toLowerCase() ===
      replWords[replWords.length - 1 - suffixCount].toLowerCase()
  ) {
    suffixCount++;
  }

  const commonPrefix = origWords.slice(0, prefixCount).join(" ");
  const removed = origWords
    .slice(prefixCount, origWords.length - suffixCount)
    .join(" ");
  const added = replWords
    .slice(prefixCount, replWords.length - suffixCount)
    .join(" ");
  const commonSuffix =
    suffixCount > 0
      ? origWords.slice(origWords.length - suffixCount).join(" ")
      : "";

  return { commonPrefix, removed, added, commonSuffix };
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

  const wordDiff = computeWordDiff(flaggedPhrase, suggestedReplacement);

  // Render clean readable word-level inline diff
  const renderInlineDiff = () => {
    const textToSearch = fullSentence || originalText || flaggedPhrase;
    if (!textToSearch.includes(flaggedPhrase)) {
      return (
        <div className="flex flex-col gap-2.5 text-[15px] leading-relaxed">
          <div className="line-through text-[#F87171] bg-[#1C1214] px-4 py-3 rounded-lg border border-[#7F1D1D]/50 font-medium">
            {flaggedPhrase}
          </div>
          <div className="text-[#4ADE80] bg-[#0C1A14] px-4 py-3 rounded-lg border border-[#166534]/50 font-medium">
            {suggestedReplacement}
          </div>
        </div>
      );
    }

    const parts = textToSearch.split(flaggedPhrase);
    return (
      <div className="text-[15px] text-[#B5B5B5] leading-relaxed p-5 rounded-lg bg-[#0A0A0A] border border-[#303030]">
        <span>{parts[0]}</span>
        <del className="bg-[#241013] text-[#EF4444] font-medium line-through decoration-[#EF4444] px-2 py-0.5 rounded-md border border-[#7F1D1D]/60 mx-1 inline-block">
          {flaggedPhrase}
        </del>
        <ins className="bg-[#0C241B] text-[#10B981] font-medium no-underline px-2 py-0.5 rounded-md border border-[#166534]/60 mx-1 inline-block">
          {suggestedReplacement}
        </ins>
        <span>{parts.slice(1).join(flaggedPhrase)}</span>
      </div>
    );
  };

  return (
    <div
      className={`rounded-xl bg-[#141414] border border-[#303030] overflow-hidden shadow-sm transition-all ${className}`}
    >
      {/* Diff Header */}
      <div className="px-5 py-3.5 bg-[#141414] border-b border-[#303030] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge variant={severity as BadgeVariant} dot size="xs">
            {severity.toUpperCase()}
          </Badge>
          {ruleName && (
            <span className="text-sm font-semibold text-white truncate max-w-sm tracking-tight">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#858585] hover:text-white bg-[#191919] hover:bg-[#222222] border border-[#303030] transition-colors cursor-pointer"
            title={`Switch to ${viewMode === "split" ? "Inline" : "Split"} view`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span className="capitalize">{viewMode} View</span>
          </button>

          {/* Copy Replacement */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#858585] hover:text-white bg-[#191919] hover:bg-[#222222] border border-[#303030] transition-colors cursor-pointer"
            title="Copy suggestion"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[#10B981] font-medium">Copied</span>
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
      <div className="p-5 space-y-4 bg-[#0A0A0A]">
        {reason && (
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#141414] border border-[#303030] text-sm text-[#B5B5B5] leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
            <p>{reason}</p>
          </div>
        )}

        {viewMode === "split" ? (
          <div className="space-y-3 text-[15px] leading-relaxed">
            {/* Redline Strike-through Original Row with Word-Level Highlighting */}
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#180E10] border border-[#4C1D24]">
              <span className="text-[#EF4444] font-bold shrink-0 select-none text-base leading-none mt-0.5">
                -
              </span>
              <div className="flex-1 text-[#EF4444] break-words font-normal">
                {wordDiff.commonPrefix && (
                  <span className="text-[#858585] mr-1.5">
                    {wordDiff.commonPrefix}
                  </span>
                )}
                <span className="line-through decoration-[#EF4444] font-medium bg-[#2E1418] px-1.5 py-0.5 rounded">
                  {wordDiff.removed || flaggedPhrase}
                </span>
                {wordDiff.commonSuffix && (
                  <span className="text-[#858585] ml-1.5">
                    {wordDiff.commonSuffix}
                  </span>
                )}
              </div>
            </div>

            {/* Green Highlight Suggested Replacement Row */}
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#0C1A14] border border-[#166534]">
              <span className="text-[#10B981] font-bold shrink-0 select-none text-base leading-none mt-0.5">
                +
              </span>
              <div className="flex-1 text-[#10B981] break-words font-medium">
                {wordDiff.commonPrefix && (
                  <span className="text-[#858585] mr-1.5 font-normal">
                    {wordDiff.commonPrefix}
                  </span>
                )}
                <span className="bg-[#122A1E] px-1.5 py-0.5 rounded">
                  {wordDiff.added || suggestedReplacement}
                </span>
                {wordDiff.commonSuffix && (
                  <span className="text-[#858585] ml-1.5 font-normal">
                    {wordDiff.commonSuffix}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          renderInlineDiff()
        )}
      </div>

      {/* Diff Footer / Action bar */}
      <div className="px-5 py-3.5 bg-[#141414] border-t border-[#303030] flex items-center justify-between">
        <span className="text-xs text-[#858585] flex items-center gap-2 font-medium">
          <GitCompare className="w-4 h-4 text-[#858585]" />
          <span>Remediation Diff</span>
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
                <Check className="w-4 h-4 text-[#10B981]" />
              ) : (
                <ArrowRight className="w-4 h-4" />
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
