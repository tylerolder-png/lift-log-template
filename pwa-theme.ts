// Single source of truth for the app's ground color across build-time
// config that can't read CSS custom properties directly (Node config
// files, not the browser). Must match --night in src/index.css.
export const NIGHT = "#120c10";
