import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Outputs a static build to the /out folder
  images: {
    unoptimized: true, // Required for static exports
  },
};

export default nextConfig;