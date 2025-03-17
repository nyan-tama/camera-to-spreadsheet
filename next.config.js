/** @type {import('next').NextConfig} */
const nextConfig = {
    // App Routerを有効化
    experimental: {
        appDir: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
}

module.exports = nextConfig 