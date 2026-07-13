"use client";

import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";

interface ScenarioFieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  onChange: (v: number) => void;
}

export function ScenarioField({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  prefix,
  onChange,
}: ScenarioFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const displayValue = draft !== null ? draft : String(value);

  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;

  const clamp = useCallback(
    (n: number) => Math.min(max, Math.max(min, n)),
    [min, max],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "" || raw === "-") {
        setDraft(raw);
        return;
      }
      const num = Number(raw);
      if (!Number.isNaN(num)) {
        setDraft(raw);
        onChange(clamp(num));
      }
    },
    [clamp, onChange],
  );

  const handleBlur = useCallback(() => {
    if (draft === null) return;
    const num = Number(draft);
    if (Number.isNaN(num) || draft === "") {
      onChange(min);
    } else {
      onChange(clamp(num));
    }
    setDraft(null);
  }, [draft, clamp, min, onChange]);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDraft(null);
      onChange(Number(e.target.value));
    },
    [onChange],
  );

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3 font-semibold text-sm">
        <label htmlFor={id}>{label}</label>
        <div className="flex items-center gap-1">
          {prefix && <span className="text-muted-foreground">{prefix}</span>}
          <Input
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            step={step}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-24 h-8 text-right text-primary font-bold"
            aria-label={label}
          />
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSliderChange}
        className="w-full"
        style={{ "--slider-pct": `${pct}%` } as React.CSSProperties}
      />
    </div>
  );
}
