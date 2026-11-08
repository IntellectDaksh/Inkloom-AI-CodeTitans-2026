"use client";

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";

export interface CommandItem {
  id: string;
  title: string;
  category: "Actions" | "Navigation" | "Knowledge Base" | "Brands";
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

  const handleClose = () => {
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
    setQuery("");
    setSelectedIndex(0);
  };

  const handleOpen = () => {
    if (isControlled && controlledOnClose) {
      // Parent controlled
    } else {
      setInternalIsOpen(true);
    }
  };

  // Global Keyboard listener for Ctrl+K / Cmd+K and custom trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          handleClose();
        } else {
          if (isControlled && controlledOnClose) {
            // Can't toggle if only onClose is provided, but window event will handle
          } else {
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
  }, [isOpen, isControlled, controlledOnClose]);

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

  // Clamp selectedIndex when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

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
  const categories: ("Actions" | "Navigation" | "Knowledge Base" | "Brands")[] = [
    "Actions",
    "Navigation",
    "Knowledge Base",
    "Brands",
  ];

  let cumulativeIndex = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-100"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl bg-[#0F1117] border border-[#1C202F] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#1C202F] gap-3 bg-[#141722]">
          <Search className="w-4 h-4 text-[#94A3B8] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command or jump to brand, claim, or submission..."
            className="flex-1 bg-transparent text-sm text-[#F4F6F9] placeholder-[#64748B] focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="text-[#64748B] hover:text-[#F4F6F9] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="text-[10px] text-[#94A3B8] bg-[#0F1117] px-1.5 py-0.5 rounded border border-[#2B3248]">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#64748B]">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = filteredCommands.filter((c) => c.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
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
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#141722] text-[#F4F6F9] border border-[#2B3248]"
                            : "text-[#94A3B8] hover:text-[#F4F6F9] border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isSelected ? "text-violet-400" : "text-[#64748B]"
                            }`}
                          />
                          <div className="truncate">
                            <div className="font-medium truncate text-[#F4F6F9]">
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="text-[11px] text-[#64748B] truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-3">
                          {item.shortcut ? (
                            <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-[#090A10] border border-[#2B3248] text-[#94A3B8]">
                              {item.shortcut}
                            </kbd>
                          ) : isSelected ? (
                            <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
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
        <div className="px-4 py-2 bg-[#0C0E14] border-t border-[#1C202F] flex items-center justify-between text-[11px] text-[#64748B]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="text-[9px] px-1 py-0.2 rounded bg-[#141722] border border-[#2B3248]">↑</kbd>
              <kbd className="text-[9px] px-1 py-0.2 rounded bg-[#141722] border border-[#2B3248]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="text-[9px] px-1.5 py-0.2 rounded bg-[#141722] border border-[#2B3248]">↵</kbd>
              <span>to select</span>
            </span>
          </div>

          <span className="flex items-center gap-1">
            <kbd className="text-[9px] px-1.5 py-0.2 rounded bg-[#141722] border border-[#2B3248]">ESC</kbd>
            <span>to close</span>
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
