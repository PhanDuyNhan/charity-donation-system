/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },

  // // ✅ Cấu hình proxy — cho phép FE gọi /api/... → BE thật
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination: "http://j2ee.oshi.id.vn:5555/api/:path*", // 🟢 backend thật
  //     },
  //   ]
  // },

  // ✅ Cho phép CORS đúng cách — phải nằm sau rewrites
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, PATCH, DELETE, OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept",
          },
        ],
      },
    ]
  },
}

export default nextConfig
