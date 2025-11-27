import type { NextConfig } from "next";
import packageJson from './package.json';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? '/KGVilla' : '',
  assetPrefix: isProd ? '/KGVilla' : '',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
    NEXT_PUBLIC_BASE_PATH: isProd ? '/KGVilla' : '',
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
