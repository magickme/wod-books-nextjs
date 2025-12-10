/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Compiler (React 19)
  experimental: {
    reactCompiler: false, // Not stable yet in React 19
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Enable compression
  compress: true,

  // Production optimizations
  swcMinify: true,

  // Disable source maps in production for smaller bundles
  productionBrowserSourceMaps: false,
};

export default nextConfig;
