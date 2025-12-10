import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["openai"],

  experimental: {
    serverActions: {
      bodySizeLimit: 4 * 1024 * 1024,
      allowedOrigins: [],
    },
  },

  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  },

  // webpack 周りの buffer ポリフィルは不要なので削除
  webpack(config) {
    return config;
  },
};

export default nextConfig;