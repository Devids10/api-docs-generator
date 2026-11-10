import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/api-docs-generator',
  assetPrefix: '/api-docs-generator/',
};

export default nextConfig;