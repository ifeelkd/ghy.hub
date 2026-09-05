"use client";

import React, { useState, useRef, useEffect } from "react";

interface TokenInputProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  className?: string;
}

export default function TokenInput({
  options,
  selected,
  onChange,
  placeholder = "Select or type to add",
  maxItems,
  className = "",
}: TokenInputProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(
    (opt) =>
      !selected.includes(opt) &&
      (!query || opt.toLowerCase().includes(query.trim().toLowerCase()))
  );

  const MAX_VISIBLE = 50;
  const visibleOptions = filteredOptions.slice(0, MAX_VISIBLE);

  const exactMatch = options.some(
    (opt) => opt.toLowerCase() === query.trim().toLowerCase()
  );

  const canAddCustom =
    query.trim().length > 0 &&
    !exactMatch &&
    !selected.some((s) => s.toLowerCase() === query.trim().toLowerCase());

  const totalOptionsCount = visibleOptions.length + (canAddCustom ? 1 : 0);

  // Auto-highlight first item when query changes
  useEffect(() => {
    if (query.trim() && totalOptionsCount > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [query, totalOptionsCount]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && menuRef.current && highlightedIndex >= 0) {
      const items = menuRef.current.querySelectorAll<HTMLElement>(".tk-opt");
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const addToken = (token: string) => {
    const trimmed = token.trim();
    if (!trimmed) return;
    if (maxItems && selected.length >= maxItems) return;
    if (!selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setQuery("");
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const removeToken = (index: number) => {
    const updated = [...selected];
    updated.splice(index, 1);
    onChange(updated);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else if (totalOptionsCount > 0) {
        setHighlightedIndex((prev) =>
          prev < totalOptionsCount - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(totalOptionsCount - 1);
      } else if (totalOptionsCount > 0) {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : totalOptionsCount - 1
        );
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!isOpen && totalOptionsCount > 0) {
        setIsOpen(true);
        return;
      }
      if (highlightedIndex >= 0 && highlightedIndex < visibleOptions.length) {
        addToken(visibleOptions[highlightedIndex]);
      } else if (
        canAddCustom &&
        highlightedIndex === visibleOptions.length
      ) {
        addToken(query.trim());
      } else if (visibleOptions.length > 0) {
        addToken(visibleOptions[0]);
      } else if (query.trim()) {
        addToken(query.trim());
      }
    } else if (e.key === "Tab" && isOpen && highlightedIndex >= 0) {
      if (highlightedIndex < visibleOptions.length) {
        addToken(visibleOptions[highlightedIndex]);
      } else if (canAddCustom) {
        addToken(query.trim());
      }
    } else if (e.key === "Backspace" && !query && selected.length > 0) {
      removeToken(selected.length - 1);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`tk ${isOpen ? "focus" : ""} ${className}`}
    >
      <div className="tk-chips">
        {selected.map((item, index) => (
          <span key={item} className="tk-chip">
            {item}
            <button
              type="button"
              aria-label={`Remove ${item}`}
              onClick={(e) => {
                e.stopPropagation();
                removeToken(index);
              }}
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      <div className="tk-in">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? placeholder : ""}
          autoComplete="off"
          aria-autocomplete="list"
        />

        {isOpen && (
          <div ref={menuRef} className="tk-menu on">
            {visibleOptions.map((opt, idx) => (
              <button
                key={opt}
                type="button"
                className={`tk-opt ${highlightedIndex === idx ? "hi" : ""}`}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addToken(opt);
                }}
              >
                {opt}
              </button>
            ))}

            {canAddCustom && (
              <button
                type="button"
                className={`tk-opt add ${
                  highlightedIndex === visibleOptions.length ? "hi" : ""
                }`}
                onMouseEnter={() =>
                  setHighlightedIndex(visibleOptions.length)
                }
                onMouseDown={(e) => {
                  e.preventDefault();
                  addToken(query.trim());
                }}
              >
                Add &ldquo;{query.trim()}&rdquo;{" "}
                <span className="g">not in list</span>
              </button>
            )}

            {filteredOptions.length > MAX_VISIBLE && (
              <div className="tk-hint">
                Showing top {MAX_VISIBLE} of {filteredOptions.length} matches — type to narrow down
              </div>
            )}

            {filteredOptions.length === 0 && !canAddCustom && (
              <div className="tk-empty">No matches found. Press Enter to add.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
