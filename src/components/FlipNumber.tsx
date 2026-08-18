import { useEffect, useRef, useState } from "react";

const FLIP_MS = 420; // matches --dur-flip in index.css

// Module-scoped so a save that updates several exercise cards' loads at
// once doesn't have every FlipNumber instance construct its own
// MediaQueryList in the same tick.
const reduceMotionQuery =
  typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

interface Props {
  value: number;
  className?: string;
}

/**
 * Renders `value` as text, exactly like `{value}` would — no forced
 * decimals, so fractional loads (2.5 lb rounding) still show as "42.5",
 * not "43" or "42.0". When the value changes, animates a scoreboard-style
 * digit flip. Skipped under prefers-reduced-motion rather than relying on
 * the app's global CSS kill-switch, since that switch removes `animation`
 * entirely and would otherwise leave the flip stuck mid-transition.
 */
export function FlipNumber({ value, className }: Props) {
  const formatted = String(value);
  const prevRef = useRef(formatted);
  const [from, setFrom] = useState<string | null>(null);

  useEffect(() => {
    if (formatted === prevRef.current) return;
    const previous = prevRef.current;
    prevRef.current = formatted;

    if (reduceMotionQuery?.matches) return;

    setFrom(previous);
    const timer = window.setTimeout(() => setFrom(null), FLIP_MS);
    return () => window.clearTimeout(timer);
  }, [formatted]);

  const rootClassName = className ? `flip-num ${className}` : "flip-num";

  // A digit-count change (9 -> 10, 97.5 -> 100) has no natural per-tile
  // alignment, so it renders as a plain swap rather than a flip. That
  // means a round-number PR or a week rollover — the exact moments this
  // is meant to highlight — won't animate. Accepted trade-off: real
  // positional alignment isn't worth the complexity for a cosmetic flourish.
  if (from === null || from.length !== formatted.length) {
    return <span className={rootClassName}>{formatted}</span>;
  }

  return (
    <span className={rootClassName}>
      {formatted.split("").map((char, i) => {
        const prevChar = from[i];
        if (prevChar === char) return <span key={i}>{char}</span>;
        return (
          <span key={i} className="flip-num__tile is-flipping">
            <span className="flip-num__flap flip-num__flap--front">{prevChar}</span>
            <span className="flip-num__flap flip-num__flap--back">{char}</span>
          </span>
        );
      })}
    </span>
  );
}
