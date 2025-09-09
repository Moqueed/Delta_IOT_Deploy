import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Minimal config just to enable React support
export default defineConfig({
  plugins: [react()],
});
