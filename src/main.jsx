import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

function applyRuntimeSeoFallbacks() {
  const url = new URL(window.location.href);
  url.hash = "";
  url.search = "";

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical && !canonical.getAttribute("href")) {
    canonical.setAttribute("href", url.toString());
  }

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl && !ogUrl.getAttribute("content")) {
    ogUrl.setAttribute("content", url.toString());
  }

  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage && ogImage.getAttribute("content")?.startsWith("og-image")) {
    ogImage.setAttribute("content", `${url.origin}/og-image.svg`);
  }
}

function registerServiceWorker() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    const swUrl = new URL("./sw.js", window.location.href);
    navigator.serviceWorker.register(swUrl.href).catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}

applyRuntimeSeoFallbacks();
registerServiceWorker();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
