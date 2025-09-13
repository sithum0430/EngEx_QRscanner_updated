import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Enforce HTTPS in production for camera permissions
if (typeof window !== "undefined") {
  const { protocol, hostname, host, pathname, search, hash } = window.location;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  if (protocol === "http:" && !isLocal) {
    window.location.replace(`https://${host}${pathname}${search}${hash}`);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
