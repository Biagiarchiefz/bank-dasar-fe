import type { NextConfig } from "next";

// Backend origin. The browser never talks to it directly: it calls
// /api/v1/... on this Next.js origin and the rewrite below proxies the
// request. Same origin means the auth cookie just works and no CORS is needed.
const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
