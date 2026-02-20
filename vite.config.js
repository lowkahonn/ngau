import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGithubActions = Boolean(process.env.GITHUB_ACTIONS);
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
  base: process.env.VITE_BASE_PATH ?? (isGithubActions && repository ? `/${repository}/` : "/"),
  build: {
    rollupOptions: {
      input: rollupInput
    }
  }
});
