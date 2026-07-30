/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@workspace/ui", "@workspace/db"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.com https://*.clerk.accounts.dev; connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://generativelanguage.googleapis.com; img-src 'self' blob: data: https://img.clerk.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev; worker-src 'self' blob:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
