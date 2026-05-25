import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "export",
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
  basePath: "",
  assetPrefix: "",
  images: {
    unoptimized: true,
  },
};
export default nextConfig;
