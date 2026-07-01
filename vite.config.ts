import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

// Library-mode build: emits ESM + CJS bundles, bundled CSS, and .d.ts types.
// `npm run dev` still serves the playground in src/dev via index.html.
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      exclude: ["src/dev", "src/app"],
      rollupTypes: true,
      tsconfigPath: "./tsconfig.build.json",
    }),
  ],
  resolve: {
    // Lets the app (src/app) import the design system by its package name.
    // Harmless for the library build, whose entry is src/index.ts directly.
    alias: {
      "js-simulator": resolve(__dirname, "src/index.ts"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "JsSimulator",
      fileName: (format) => `js-simulator.${format === "es" ? "js" : "cjs"}`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
