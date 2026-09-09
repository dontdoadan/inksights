import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [tailwindcss(), tsconfigPaths(), tanstackStart(), nitro(), viteReact()],
  server: {
    host: true,
    // Allow the v0 preview proxy (and any other host) to reach the dev server.
    // Without this, Vite returns a 403 "Blocked request" for non-localhost hosts.
    allowedHosts: true,
  },
});
