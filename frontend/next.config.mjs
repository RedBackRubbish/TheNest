/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Silence Turbopack error by acknowledging we have webpack config for dev
  turbopack: {},
  // Exclude Python backend files from the build (Webpack only)
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['**/src/**', '**/protocol/**', '**/.venv/**', '**/venv/**'],
    };
    return config;
  },
};

export default nextConfig;
