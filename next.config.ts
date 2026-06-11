import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  turbopack: {
    root: projectRoot,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
