import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.REPO_NAME || "",
  publicDir: process.env.REPO_NAME || "public",

  plugins: [
    VitePWA({
      manifest: {
        icons: [
          {
            src: "assets/tiny_turnip_512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "favicon.ico",
            sizes: "512x512",
            type: "image/x-icon",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => {
              return url.pathname.startsWith("/");
            },
            handler: "CacheFirst" as const,
            options: {
              cacheName: "api-cache",
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: "../wwwroot/",
    emptyOutDir: true,
  },
});
