import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8080,
    // Force cache busting in development
    force: true,
    // Fix Windows/OneDrive file system issues
    hmr: {
      overlay: false, // Disable error overlay to prevent blocking
      port: 8081, // Use different port for HMR
    },
    watch: {
      // Use polling for better Windows compatibility
      usePolling: true,
      interval: 1000,
      // Ignore OneDrive sync files and backend directory
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/OneDrive/**",
        "**/backend/**",
        "**/supabase/**",
        "**/docs/**",
        "**/dist/**",
      ],
    },
    // Disable file watching for problematic directories
    fs: {
      strict: false,
      allow: [".."],
      deny: ["backend/**", "supabase/**", "docs/**"],
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize build output
    target: "esnext",
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          vendor: ["react", "react-dom"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-toast",
          ],
          stripe: ["@stripe/react-stripe-js", "@stripe/stripe-js"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
    // Enable source maps for production debugging
    sourcemap: mode === "development",
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@supabase/supabase-js",
      "@stripe/react-stripe-js",
      "@stripe/stripe-js",
    ],
    // Force dependency optimization to prevent file system issues
    force: true,
    // Exclude problematic directories from scanning
    exclude: ["backend/**", "supabase/**", "docs/**"],
  },
  // Additional Windows/OneDrive compatibility fixes
  define: {
    // Prevent some Node.js polyfills that can cause issues
    global: "globalThis",
  },
  // Clear cache on startup
  clearScreen: false,
  // Disable some problematic features on Windows
  esbuild: {
    target: "es2020",
  },
}));
