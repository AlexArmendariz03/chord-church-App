import path from "path"
import type { NextConfig } from "next"
import { version } from "./package.json"

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(process.cwd(), "styles")]
  },
  reactStrictMode: true,
  // Shown next to the brand, to check which version is deployed
  env: {
    NEXT_PUBLIC_APP_VERSION: version.replace(/\.0$/, "")
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // The app can't be framed by other sites (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }
        ]
      }
    ]
  },
  async redirects() {
    return [
      { source: "/uploadPage", has: [{ type: "query", key: "id" }], destination: "/alabanzas/editar", permanent: true },
      { source: "/uploadPage", destination: "/alabanzas/nueva", permanent: true }
    ]
  },
  transpilePackages: [
    "antd",
    "rc-util",
    "@babel/runtime",
    "@ant-design/icons",
    "@ant-design/icons-svg",
    "rc-pagination",
    "rc-picker",
    "rc-tree",
    "rc-table"
  ]
}

export default nextConfig
