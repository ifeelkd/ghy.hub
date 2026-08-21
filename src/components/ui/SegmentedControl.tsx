import React from "react";

interface SegmentedControlProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SegmentedControl({
  options,
  value,
  onChange,
  className = "",
}: SegmentedControlProps) {
  return (
    <div className={`seg ${className}`} role="radiogroup">
      {options.map((opt) => {
        const isSelected = opt.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={isSelected ? "sel" : ""}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
