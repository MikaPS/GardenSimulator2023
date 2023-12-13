import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";

export default defineConfig({
  publicDir: "public",
  base: process.env.REPO_NAME || "",
  plugins: [
    VitePWA({
      manifest: {
        icons: [
          {
            src: "../assets/tiny_turnip_512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/assets/favicon.ico", // Adjust the path based on your project structure
            sizes: "512x512",
            type: "image/x-icon", // Favicon is typically of type 'image/x-icon'
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => {
              return url.pathname.startsWith("");
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
    // rollupOptions: {
    //   external: ["assets/scenario.yaml"],
    // },
  },
});
