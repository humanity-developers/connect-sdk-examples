/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No basePath since app is always behind a proxy
  assetPrefix: '.',
  images: {
    remotePatterns: [
      { hostname: '*.newsapi.org' },
      { hostname: '*.gnews.io' },
      { hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;

