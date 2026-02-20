import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

const htmlEntries = [
  "index.html",
  "how-to-play-ngau.html",
  "ngau-rules-explained.html",
  "ngau-3-6-explained.html",
  "ngau-example-rounds.html",
  "ngau-faq.html"
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
