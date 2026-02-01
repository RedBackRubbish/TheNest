/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude Python backend files from the build
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['**/src/**', '**/protocol/**', '**/.venv/**', '**/venv/**'],
    };
    return config;
  },
};

export default nextConfig;
