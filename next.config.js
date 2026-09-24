/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ["@chakra-ui/react"],
        serverActions: true,
      },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8081",
      },
      {
        protocol: "https",
        hostname: "*.backblazeb2.com",
      },
    ],
  },
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
};

module.exports = nextConfig;
