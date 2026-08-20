import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { patchCssModules } from "vite-css-modules";

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    patchCssModules({
      generateSourceTypes: true,
      declarationMap: true,
    }),
    devtools(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  build: {
    target: "esnext",
  },
});
export default config;
