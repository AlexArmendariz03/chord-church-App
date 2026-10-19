import path from "path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(process.cwd(), "styles")]
  },
  reactStrictMode: true,
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
