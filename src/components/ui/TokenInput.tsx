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
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(
    (opt) =>
      !selected.includes(opt) &&
      (!query || opt.toLowerCase().includes(query.trim().toLowerCase()))
  );

  const exactMatch = options.some(
    (opt) => opt.toLowerCase() === query.trim().toLowerCase()
  );

  const canAddCustom =
    query.trim() &&
    !exactMatch &&
    !selected.some((s) => s.toLowerCase() === query.trim().toLowerCase());

  const addToken = (token: string) => {
    const trimmed = token.trim();
    if (!trimmed) return;
    if (maxItems && selected.length >= maxItems) return;
    if (!selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setQuery("");
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
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;
      if (filteredOptions.length > 0) {
        addToken(filteredOptions[0]);
      } else {
        addToken(trimmed);
      }
    } else if (e.key === "Backspace" && !query && selected.length > 0) {
      removeToken(selected.length - 1);
    } else if (e.key === "Escape") {
      setIsOpen(false);
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
        />

        {isOpen && (
          <div className="tk-menu on">
            {filteredOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                className="tk-opt"
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
                className="tk-opt add"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addToken(query.trim());
                }}
              >
                Add &ldquo;{query.trim()}&rdquo;{" "}
                <span className="g">not in list</span>
              </button>
            )}

            {filteredOptions.length === 0 && !canAddCustom && (
              <div className="tk-empty">No matches. Type to add your own.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
