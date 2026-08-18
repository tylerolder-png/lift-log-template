import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";
import { NIGHT } from "./pwa-theme";

// The generator's defaults pad maskable/apple icons with white. This app is
// dark-themed end to end, so pad with --night instead — a white margin would
// show as a bright ring when Android crops the maskable icon to a circle.

export default defineConfig({
  headLinkOptions: {
    preset: "2023",
  },
  preset: {
    ...minimal2023Preset,
    maskable: {
      ...minimal2023Preset.maskable,
      resizeOptions: { fit: "contain", background: NIGHT },
    },
    apple: {
      ...minimal2023Preset.apple,
      resizeOptions: { fit: "contain", background: NIGHT },
    },
  },
  images: ["public/icon-master.svg"],
});
