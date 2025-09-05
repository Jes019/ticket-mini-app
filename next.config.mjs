/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove serverActions; typedRoutes is fine if you want it.
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;

