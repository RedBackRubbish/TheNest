/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Empty turbopack config to use Turbopack (Next.js 16 default)
  turbopack: {},
  // Exclude Python backend files from the build
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['**/src/**', '**/protocol/**', '**/.venv/**', '**/venv/**'],
    };
    return config;
  },
};

export default nextConfig;
