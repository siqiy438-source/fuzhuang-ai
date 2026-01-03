import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // 改为 0.0.0.0 以支持更好的移动端访问
    port: 8080,
    strictPort: false,
    cors: true, // 启用 CORS
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // 优化构建配置 - 使用兼容性更好的目标
    target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: mode === "production",
      },
    },
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 React 相关库打包到一起
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          // 将 UI 组件库打包到一起
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
          ],
          // 将查询库单独打包
          "query-vendor": ["@tanstack/react-query"],
          // 将 Supabase 单独打包
          "supabase-vendor": ["@supabase/supabase-js"],
        },
      },
    },
    // 代码分割大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
  },
  // 性能优化
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "@supabase/supabase-js",
    ],
  },
}));
