interface Props {
  onDismiss: () => void;
}

/**
 * Shown once, before the first profile/session ever exists. A stranger
 * lands on this app with zero context — no README, no explanation from
 * whoever sent them the link. This is the only place that context lives.
 */
export function Welcome({ onDismiss }: Props) {
  return (
    <div className="welcome">
      <div className="welcome__card">
        <p className="masthead__eyebrow">Strength &middot; Athleticism &middot; Aesthetics</p>
        <h1 className="welcome__title">The Log</h1>
        <p className="welcome__lede">
          A strength log that prescribes today&rsquo;s load from your own numbers &mdash;
          not a fixed program you follow blindly.
        </p>

        <ol className="welcome__steps">
          <li>
            <strong>Set your bodyweight</strong> on the next screen &mdash; it drives
            pull-up estimates and the benchmark table.
          </li>
          <li>
            <strong>Log one hard set</strong> on each exercise. Every card starts
            empty; a target appears once there&rsquo;s a number to prescribe from.
          </li>
          <li>
            <strong>Come back and beat it.</strong> Your estimated 1RM moves with
            every set, and next session&rsquo;s target moves with it.
          </li>
        </ol>

        <p className="welcome__privacy">
          Everything stays on this device &mdash; no account, no syncing, nobody
          else can see it. Use <strong>Export backup</strong> in Settings if you
          want a copy off this phone.
        </p>

        <button type="button" className="welcome__start" onClick={onDismiss}>
          Get started
        </button>
      </div>
    </div>
  );
}
