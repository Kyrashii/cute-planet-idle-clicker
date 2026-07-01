import { cx } from "../../lib/cx";

/** A labelled horizontal bar — life, shield, pressure. */
export function Meter({
  value,
  max,
  fillClass,
  trackClass,
  className,
  rounded = "rounded-full",
}: {
  value: number;
  max: number;
  fillClass: string;
  trackClass?: string;
  className?: string;
  rounded?: string;
}) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
  return (
    <div
      className={cx(
        "h-2.5 w-full overflow-hidden",
        rounded,
        trackClass ?? "bg-black/35",
        className,
      )}
    >
      <div
        className={cx("h-full transition-[width] duration-500 ease-out", rounded, fillClass)}
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  );
}
