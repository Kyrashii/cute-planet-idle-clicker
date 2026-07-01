import React, { useRef } from "react";
import { cx } from "../../lib/cx";

export interface TabItem<T extends string = string> {
  id: T;
  label: React.ReactNode;
}

export interface TabsProps<T extends string = string> {
  items: ReadonlyArray<TabItem<T>>;
  value: T;
  onChange: (id: T) => void;
  className?: string;
  "aria-label"?: string;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
  ...rest
}: TabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);

  const focusTab = (index: number) => {
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[index]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowLeft" ? -1 : 1;
    const next = (index + delta + items.length) % items.length;
    onChange(items[next].id);
    focusTab(next);
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      className={cx(
        "flex w-full items-center gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-black/25 p-1",
        className,
      )}
      {...rest}
    >
      {items.map((item, index) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cx(
              "min-h-10 flex-1 shrink-0 whitespace-nowrap rounded-xl border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] transition",
              selected
                ? "border-cosmic-accent/40 bg-cosmic-accent/20 text-cosmic-text"
                : "border-transparent text-cosmic-text-muted hover:bg-white/6 hover:text-cosmic-text active:bg-white/10",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
