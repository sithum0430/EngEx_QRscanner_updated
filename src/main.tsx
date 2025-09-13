import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Enforce HTTPS for production, but allow local/private networks during development
if (typeof window !== "undefined") {
  const { protocol, hostname, pathname, search, hash } = window.location;
  const isLoopback = ["localhost", "127.0.0.1", "::1"].includes(hostname);
  const isPrivateIPv4 =
    /^10\.\d+\.\d+\.\d+$/.test(hostname) ||
    /^192\.168\.\d+\.\d+$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(hostname);
  const isDev = import.meta.env.MODE !== "production";
  const shouldRedirect = protocol === "http:" && !isLoopback && !isPrivateIPv4 && !isDev;
  if (shouldRedirect) {
    window.location.replace(`https://${hostname}${pathname}${search}${hash}`);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
