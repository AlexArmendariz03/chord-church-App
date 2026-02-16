import { Layout as ALayout } from "antd"
import React from "react"
import HeaderBar from "./header-component"

export const Layout = ({ children }) => {

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
