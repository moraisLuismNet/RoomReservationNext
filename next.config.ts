import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  /* config options here */

  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imgur.com",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },

  // Enable compression
  compress: true,

  // Optimize webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Optimize for development speed
    if (dev) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
      };
    }

    // Exclude heavy dependencies from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Add external dependencies that shouldn't be bundled
    config.externals.push({
      "react-native-sqlite-storage": "react-native-sqlite-storage",
      mysql: "mysql",
      "@sap/hana-client/extension/Stream": "@sap/hana-client/extension/Stream",
    });

    return config;
  },

  // External packages for server components
  serverExternalPackages: ["typeorm"],

  // Headers for better caching
  async headers() {
    return [
      {
        source: "/api/rooms",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=120",
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
