import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

const htmlEntries = [
  "index.html",
  "how-to-play-ngau.html",
  "zh-hant/how-to-play-ngau.html",
  "zh-hans/how-to-play-ngau.html",
  "ngau-rules-explained.html",
  "zh-hant/ngau-rules-explained.html",
  "zh-hans/ngau-rules-explained.html",
  "ngau-3-6-explained.html",
  "zh-hant/ngau-3-6-explained.html",
  "zh-hans/ngau-3-6-explained.html",
  "ngau-example-rounds.html",
  "zh-hant/ngau-example-rounds.html",
  "zh-hans/ngau-example-rounds.html",
  "ngau-faq.html",
  "zh-hant/ngau-faq.html",
  "zh-hans/ngau-faq.html"
];

const rollupInput = Object.fromEntries(htmlEntries.map((file) => [file.replace(".html", ""), resolve(rootDir, file)]));

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    rollupOptions: {
      input: rollupInput
    }
  }
});
