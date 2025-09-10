/** @type {import('next').NextConfig} */
const nextConfig = {
    // Output configuration for standalone deployment
    output: 'standalone',

    // Disable compression to prevent caching
    compress: false,

    // Disable experimental features that might cache
    experimental: {
        // Disable optimized CSS loading to prevent caching
        optimizeCss: false,
    },

    // Disable image optimization completely
    images: {
        unoptimized: true,
        domains: [],
        // Disable all image optimization
        formats: [],
    },

    // Disable static optimization
    trailingSlash: false,

    // Disable ISR (Incremental Static Regeneration)
    generateEtags: false,

    // Headers to disable all caching
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    // Security headers
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    // Complete cache disabling headers
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate, max-age=0',
                    },
                    {
                        key: 'Pragma',
                        value: 'no-cache',
                    },
                    {
                        key: 'Expires',
                        value: '0',
                    },
                    {
                        key: 'Last-Modified',
                        value: new Date().toUTCString(),
                    },
                    {
                        key: 'ETag',
                        value: `"${Date.now()}"`,
                    },
                ],
            },
            // Specific headers for API routes
            {
                source: '/api/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate, max-age=0',
                    },
                    {
                        key: 'Pragma',
                        value: 'no-cache',
                    },
                    {
                        key: 'Expires',
                        value: '0',
                    },
                ],
            },
            // Headers for static assets
            {
                source: '/_next/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate, max-age=0',
                    },
                ],
            },
        ];
    },

    // Environment variables
    env: {
        PORT: process.env.PORT || '3001',
    },

    // Disable all optimizations that might cache
    ...(process.env.NODE_ENV === 'production' && {
        reactStrictMode: true,
        swcMinify: false, // Disable minification to prevent caching
    }),
};

export default nextConfig;
