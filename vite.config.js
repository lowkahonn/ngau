import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

const htmlEntries = [
  "index.html",
  "how-to-play-ngau.html",
  "how-to-play-ngau-zh-hant.html",
  "how-to-play-ngau-zh-hans.html",
  "ngau-rules-explained.html",
  "ngau-rules-explained-zh-hant.html",
  "ngau-rules-explained-zh-hans.html",
  "ngau-3-6-explained.html",
  "ngau-3-6-explained-zh-hant.html",
  "ngau-3-6-explained-zh-hans.html",
  "ngau-example-rounds.html",
  "ngau-example-rounds-zh-hant.html",
  "ngau-example-rounds-zh-hans.html",
  "ngau-faq.html",
  "ngau-faq-zh-hant.html",
  "ngau-faq-zh-hans.html"
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
