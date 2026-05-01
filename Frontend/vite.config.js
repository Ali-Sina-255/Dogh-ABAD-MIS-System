import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";



export default {
  server: {
    watch: {
      usePolling: true
    }
  }
}