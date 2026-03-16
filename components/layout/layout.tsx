import { Layout as ALayout } from "antd"
import type { PropsWithChildren } from "react"
import HeaderBar from "./header-component"

const Layout = ({ children }: PropsWithChildren) => {
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
