/** @type {import('next').NextConfig} */
const nextConfig = {
    // Output configuration for standalone deployment
    output: 'standalone',

    // Compress static assets
    compress: true,

    // Enable experimental features for better performance
    experimental: {
        // Enable optimized CSS loading (critters dependency now installed)
        optimizeCss: true,
    },

    // Image optimization
    images: {
        // Enable image optimization
        unoptimized: false,
        // Add your image domains if loading external images
        domains: [],
        // Image formats for optimization
        formats: ['image/webp', 'image/avif'],
    },

    // Headers for security and performance
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
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
                ],
            },
        ];
    },

    // Environment variables
    env: {
        PORT: process.env.PORT || '3001',
    },

    // Production optimizations
    ...(process.env.NODE_ENV === 'production' && {
        // Disable development features in production
        reactStrictMode: true,
        swcMinify: true,
    }),
};

export default nextConfig;
