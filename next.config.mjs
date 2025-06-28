/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['picsum.photos'],
        unoptimized: true, // Disable Next.js image optimization
    },
};

export default nextConfig;
