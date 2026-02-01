import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // Ensure consistency with Django's trailing slash requirement
  trailingSlash: true,

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Append slash to destination to prevent Django 301 Redirects when proxying
        destination: 'http://localhost:8000/api/:path*/',
      },
    ]
  },
};

export default nextConfig;
