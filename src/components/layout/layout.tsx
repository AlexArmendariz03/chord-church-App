import { Layout as ALayout } from "antd"
import { ReactNode } from "react"
import HeaderBar from "./header-component"

interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <ALayout className="layout">
      <HeaderBar />
      <ALayout>
        <ALayout>
          <div>{children}</div>
        </ALayout>
      </ALayout>
    </ALayout>
  )
}

export default Layout
