"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  BookOpen,
  CheckCircle2,
  BarChart3,
  Settings,
  PlusCircle,
  ShieldCheck,
  Tag,
  Building2,
  FolderOpen,
  ArrowRight,
  X,
  Info,
} from "lucide-react";

export interface CommandItem {
  id: string;
  title: string;
  category: "Actions" | "Navigation" | "Knowledge Base" | "Brands" | "System";
  description?: string;
  href?: string;
  icon: React.ElementType;
  shortcut?: string;
  onSelect?: () => void;
}

const DEFAULT_COMMANDS: CommandItem[] = [
  // Quick Actions
  {
    id: "action-new-audit",
    title: "New Content Audit",
    category: "Actions",
    description: "Scan marketing text, social copy, or packaging against brand rules",
    href: "/submissions/new",
    icon: PlusCircle,
    shortcut: "N",
  },
  {
    id: "action-add-claim",
    title: "Add Verified Claim",
    category: "Actions",
    description: "Index an approved legal or efficacy claim in knowledge base",
    href: "/knowledge-base/claims",
    icon: ShieldCheck,
  },
  {
    id: "action-add-guideline",
    title: "Add Brand Guideline",
    category: "Actions",
    description: "Define a tone of voice, formatting, or compliance restriction",
    href: "/knowledge-base/guidelines",
    icon: BookOpen,
  },

  // Navigation
  {
    id: "nav-dashboard",
    title: "Dashboard Overview",
    category: "Navigation",
    description: "Metrics, high-risk flags, and active audit pipeline",
    href: "/dashboard",
    icon: BarChart3,
    shortcut: "G D",
  },
  {
    id: "nav-submissions",
    title: "Content Submissions",
    category: "Navigation",
    description: "View all audited drafts, revisions, and approval statuses",
    href: "/submissions",
    icon: FileText,
    shortcut: "G S",
  },
  {
    id: "nav-knowledge",
    title: "Knowledge Base Hub",
    category: "Navigation",
    description: "Single source of truth for brand claims and guidelines",
    href: "/knowledge-base",
    icon: BookOpen,
    shortcut: "G K",
  },
  {
    id: "nav-approvals",
    title: "Pending Approvals",
    category: "Navigation",
    description: "Multi-tier approval queue for compliance officers",
    href: "/approvals",
    icon: CheckCircle2,
    shortcut: "G A",
  },
  {
    id: "nav-analytics",
    title: "Governance Analytics",
    category: "Navigation",
    description: "Issue breakdown, pass rates, and compliance trends",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    id: "nav-settings",
    title: "Workspace Settings",
    category: "Navigation",
    description: "API keys, team roles, and automation preferences",
    href: "/settings",
    icon: Settings,
  },

  // System & Prototype Notice
  {
    id: "system-prototype-notice",
    title: "Prototype Environment Notice",
    category: "System",
    description: "CodeTitans 2026 sandbox preview notice & 1-click role bypasses",
    href: "/prototype-notice",
    icon: Info,
  },

  // Knowledge Base Quick Jump
  {
    id: "kb-claims",
    title: "Approved Claims Library",
    category: "Knowledge Base",
    description: "Search and verify substantiated claims",
    href: "/knowledge-base/claims",
    icon: ShieldCheck,
  },
  {
    id: "kb-guidelines",
    title: "Voice & Style Rules",
    category: "Knowledge Base",
    description: "Tone, capitalization, prohibited terms",
    href: "/knowledge-base/guidelines",
    icon: BookOpen,
  },
  {
    id: "kb-terminology",
    title: "Terminology & Glossary",
    category: "Knowledge Base",
    description: "Preferred keywords and banned phrase mappings",
    href: "/knowledge-base/terminology",
    icon: Tag,
  },
  {
    id: "kb-assets",
    title: "Brand Digital Assets",
    category: "Knowledge Base",
    description: "Approved imagery, logos, and product spec sheets",
    href: "/knowledge-base/assets",
    icon: FolderOpen,
  },

  // Brands
  {
    id: "brand-apex",
    title: "Apex Nutrition Workspace",
    category: "Brands",
    description: "Active Brand • Health & Wellness vertical",
    href: "/brands",
    icon: Building2,
  },
  {
    id: "brand-zenith",
    title: "Zenith Cloud SaaS Workspace",
    category: "Brands",
    description: "Enterprise Software & Cloud Security vertical",
    href: "/brands",
    icon: Building2,
  },
];

export interface CommandKProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CommandK({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}: CommandKProps = {}) {
  const router = useRouter();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleClose = useCallback(() => {
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
    setQuery("");
    setSelectedIndex(0);
  }, [isControlled, controlledOnClose]);

  // Global Keyboard listener for Ctrl+K / Cmd+K and custom trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          handleClose();
        } else {
          if (!isControlled) {
            setInternalIsOpen(true);
          }
        }
      }

      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        handleClose();
      }
    };

    const handleCustomTrigger = () => {
      if (!isControlled) {
        setInternalIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("inkloom:open-command-k", handleCustomTrigger);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("inkloom:open-command-k", handleCustomTrigger);
    };
  }, [isOpen, isControlled, controlledOnClose, handleClose]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Filter commands
  const filteredCommands = DEFAULT_COMMANDS.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.description && cmd.description.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  const handleExecute = (item: CommandItem) => {
    handleClose();
    if (item.onSelect) {
      item.onSelect();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  // Keyboard navigation within the list
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleExecute(filteredCommands[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  // Group items by category
  const categories: ("Actions" | "Navigation" | "Knowledge Base" | "Brands" | "System")[] = [
    "Actions",
    "Navigation",
    "System",
    "Knowledge Base",
    "Brands",
  ];

  let cumulativeIndex = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-120"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl bg-[#0C0C0C] border border-[#282828] rounded-lg shadow-[0_16px_48px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-120"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar (Recessed Milled Well) */}
        <div className="p-3 bg-[#080808] border-b border-[#222222]">
          <div className="flex items-center px-3.5 py-2 rounded bg-[#080808] border border-[#222222] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] gap-3">
            <Search className="w-4 h-4 text-[#A0A0A0] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Type a command, claim, or jump to section..."
              className="flex-1 bg-transparent text-sm text-white placeholder-[#737373] focus:outline-none font-medium"
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                className="text-[#737373] hover:text-white transition-colors p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="text-[9px] text-[#A0A0A0] bg-[#141414] px-1.5 py-0.5 rounded border border-[#282828] font-mono">
                ESC
              </kbd>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3 bg-[#0C0C0C]">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#737373] font-mono">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = filteredCommands.filter((c) => c.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#737373]">
                    {cat}
                  </div>
                  {catItems.map((item) => {
                    const thisIndex = cumulativeIndex++;
                    const isSelected = thisIndex === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleExecute(item)}
                        onMouseEnter={() => setSelectedIndex(thisIndex)}
                        className={`flex items-center justify-between px-3 py-2 rounded text-xs cursor-pointer transition-all duration-100 ${
                          isSelected
                            ? "bg-[#141414] text-white border border-[#282828] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                            : "text-[#EFEFEF] hover:text-white hover:bg-[#111111] border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div
                            className={`w-7 h-7 rounded flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? "bg-[#181818] border-[#333333] text-white"
                                : "bg-[#080808] border-[#222222] text-[#737373]"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <div className="font-semibold truncate text-white">
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="text-[11px] text-[#A0A0A0] truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-3">
                          {item.shortcut ? (
                            <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-[#080808] border border-[#222222] text-[#A0A0A0] font-mono">
                              {item.shortcut}
                            </kbd>
                          ) : isSelected ? (
                            <ArrowRight className="w-3.5 h-3.5 text-white" />
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Tactile Keycap Footer */}
        <div className="px-4 py-2 bg-[#080808] border-t border-[#222222] flex items-center justify-between text-[11px] text-[#737373]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-[#141414] border border-[#282828] text-[#EFEFEF]">
                ↑
              </kbd>
              <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-[#141414] border border-[#282828] text-[#EFEFEF]">
                ↓
              </kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-[#141414] border border-[#282828] text-[#EFEFEF]">
                ↵
              </kbd>
              <span>select</span>
            </span>
          </div>

          <span className="flex items-center gap-1">
            <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-[#141414] border border-[#282828] text-[#EFEFEF]">
              ESC
            </kbd>
            <span>close</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Trigger helper to open CommandK from anywhere in the app
 */
export function openCommandK() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("inkloom:open-command-k"));
  }
}
