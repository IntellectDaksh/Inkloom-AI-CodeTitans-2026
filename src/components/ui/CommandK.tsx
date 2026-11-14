"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NAV } from "../guide/nav";
import {
  Search,
  BookOpen,
  CheckCircle2,
  PlusCircle,
  ShieldCheck,
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
  { id: "a-check", title: "Check an ad", category: "Actions", description: "Paste copy or drop a file to find risky claims", href: "/submissions/new", icon: PlusCircle },
  { id: "a-claim", title: "Add a claim", category: "Actions", description: "Save a statement your brand may make, with its proof", href: "/knowledge-base/claims", icon: ShieldCheck },
  { id: "a-rule", title: "Add a brand rule", category: "Actions", description: "Write a tone, wording or legal guideline", href: "/knowledge-base/guidelines", icon: BookOpen },
  { id: "a-approvals", title: "Go to approvals", category: "Actions", description: "Sign off ads waiting on a person", href: "/approvals", icon: CheckCircle2 },
  { id: "a-tour", title: "Replay the welcome tour", category: "Actions", description: "Pick brand and role again", href: "/onboarding", icon: Info },
  ...NAV.flatMap((g) =>
    g.items.map((i) => ({
      id: `nav-${i.href}`,
      title: i.name,
      category: (g.label === "Library" ? "Knowledge Base" : "Navigation") as CommandItem["category"],
      description: i.help[0],
      href: i.href,
      icon: i.icon,
    }))
  ),
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
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-ink/25 backdrop-blur-sm transition-opacity animate-in fade-in duration-120"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="w-full max-w-xl glass-strong overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-120"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar (Recessed Milled Well) */}
        <div className="p-3 border-b border-border-subtle">
          <div className="flex items-center px-3.5 py-2 rounded-lg glass-inset gap-3">
            <Search className="w-4 h-4 text-text-secondary shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Try “check an ad” or “approvals”…"
              aria-label="Search actions and pages"
              className="flex-1 bg-transparent text-base sm:text-sm text-text-primary placeholder-text-muted focus:outline-none font-medium"
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-text-muted hover:text-text-primary transition-colors p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="text-xs text-text-secondary bg-panel px-1.5 py-0.5 rounded border border-border-subtle font-mono">
                ESC
              </kbd>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-sm text-text-muted">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = filteredCommands.filter((c) => c.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="space-y-1">
                  <div className="px-3 py-1 text-xs font-medium text-text-muted">
                    {cat === "Knowledge Base" ? "Library" : cat === "Navigation" ? "Go to" : cat}
                  </div>
                  {catItems.map((item) => {
                    const thisIndex = cumulativeIndex++;
                    const isSelected = thisIndex === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.id}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleExecute(item)}
                        onMouseEnter={() => setSelectedIndex(thisIndex)}
                        className={`flex items-center justify-between px-3 py-2 rounded text-xs cursor-pointer transition-all duration-100 ${
                          isSelected
                            ? "bg-panel text-text-primary border border-border-subtle shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                            : "text-text-primary hover:text-text-primary hover:bg-panel border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div
                            className={`w-7 h-7 rounded flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? "bg-panel border-border-default text-text-primary"
                                : "bg-canvas border-border-subtle text-text-muted"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <div className="font-semibold truncate text-text-primary">
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="text-xs text-text-secondary truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-3">
                          {item.shortcut ? (
                            <kbd className="text-xs px-1.5 py-0.5 rounded bg-canvas border border-border-subtle text-text-secondary font-mono">
                              {item.shortcut}
                            </kbd>
                          ) : isSelected ? (
                            <ArrowRight className="w-3.5 h-3.5 text-text-primary" />
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
        <div className="px-4 py-2 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="text-xs px-1.5 py-0.5 rounded bg-panel border border-border-subtle text-text-primary">
                ↑
              </kbd>
              <kbd className="text-xs px-1.5 py-0.5 rounded bg-panel border border-border-subtle text-text-primary">
                ↓
              </kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="text-xs px-1.5 py-0.5 rounded bg-panel border border-border-subtle text-text-primary">
                ↵
              </kbd>
              <span>select</span>
            </span>
          </div>

          <span className="flex items-center gap-1">
            <kbd className="text-xs px-1.5 py-0.5 rounded bg-panel border border-border-subtle text-text-primary">
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
