import { initTelegram } from './telegram';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

initTelegram(); // ← Add this BEFORE createRoot()

createRoot(document.getElementById("root")!).render(<App />);
