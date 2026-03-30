import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = import.meta.env.BASE_URL + 'sw.js';
    navigator.serviceWorker.register(swPath)
      .then((r) => console.log('SW registered:', r))
      .catch((e) => console.log('SW registration failed:', e));
  });
}

const root = document.getElementById("root")!;
createRoot(root).render(<App />);
