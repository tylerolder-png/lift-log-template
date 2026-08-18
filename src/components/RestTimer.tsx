import { useEffect, useState } from "react";

interface Props {
  /** Epoch ms when the rest period ends. */
  endAt: number;
  onDismiss: () => void;
}

/**
 * A countdown between sets. Deliberately plain mono digits, not
 * FlipNumber — that flip motif is the app's one signature element,
 * reserved for the week counter and the prescribed load; reusing it
 * on a number that changes every second would dilute it into noise.
 */
export function RestTimer({ endAt, onDismiss }: Props) {
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.round((endAt - Date.now()) / 1000)));
  const [done, setDone] = useState(false);

  useEffect(() => {
    const tick = () => {
      const r = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      setRemaining(r);
      if (r === 0) setDone(true);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endAt]);

  useEffect(() => {
    if (!done) return;
    if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
    const timer = window.setTimeout(onDismiss, 2200);
    return () => window.clearTimeout(timer);
  }, [done, onDismiss]);

  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className={`rest ${done ? "is-done" : ""}`} role="timer" aria-live="polite">
      <span className="rest__label">{done ? "Rest done" : "Resting"}</span>
      {!done && (
        <span className="rest__num">
          {mm}:{ss}
        </span>
      )}
      <button type="button" className="rest__skip" onClick={onDismiss} aria-label="Skip rest">
        {done ? "Dismiss" : "Skip"}
      </button>
    </div>
  );
}
