"use client"

import { AntdRegistry } from "@ant-design/nextjs-registry"
import { ConfigProvider } from "antd"
import esES from "antd/locale/es_ES"
import dayjs from "dayjs"
import "dayjs/locale/es"
import type { PropsWithChildren } from "react"

dayjs.locale("es")

const ThemeProvider = ({ children }: PropsWithChildren) => (
  <AntdRegistry>
    <ConfigProvider
      locale={esES}
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
