import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // 1. Added this to force the static /out folder generation
  trailingSlash: true, // Turned off trailing slash to prevent chunk 404s
  
  images: {          // 2. Kept your avatar remote patterns intact
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;