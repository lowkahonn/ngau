import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGithubActions = Boolean(process.env.GITHUB_ACTIONS);

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH ?? (isGithubActions && repository ? `/${repository}/` : "/")
});
