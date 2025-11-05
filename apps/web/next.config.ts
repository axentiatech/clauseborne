import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  serverExternalPackages: ["@shikijs/transformers", "shiki"],
};

export default nextConfig;
