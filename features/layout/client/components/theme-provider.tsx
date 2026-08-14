"use client"

import { AntdRegistry } from "@ant-design/nextjs-registry"
import { ConfigProvider } from "antd"
import type { PropsWithChildren } from "react"

const ThemeProvider = ({ children }: PropsWithChildren) => (
  <AntdRegistry>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#4f46e5",
          colorLink: "#4f46e5",
          borderRadius: 10,
          fontFamily: "var(--font-inter), sans-serif"
        }
      }}>
      {children}
    </ConfigProvider>
  </AntdRegistry>
)

export default ThemeProvider
