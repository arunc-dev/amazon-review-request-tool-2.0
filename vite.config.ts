import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import manifest from "./src/manifest";
import { createHtmlPlugin } from "vite-plugin-html";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  console.log(mode);
  return {
    build: {
      emptyOutDir: true,
      outDir: "build",
      rollupOptions: {
        output: {
          chunkFileNames: "assets/chunk-[hash].js",
        },
      },
    },
    plugins: [
      crx({ manifest }),
      react(),
      mode === "production" &&
        createHtmlPlugin({
          minify: true,
          pages: [
            {
              template: "./newtab.html",
              filename: "newtab.html",
            },
          ],
        }),
    ],
  };
});
