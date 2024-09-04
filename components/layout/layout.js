import { Layout as ALayout } from "antd"
import React, { useState } from "react"
import HeaderBar from "./header-component"
import SiderBar from "./sider-component"

const { Content } = ALayout

export const Layout = ({ children }) => {
  const [collapseSider, setCollapseSider] = useState(false)

  const toggleCollapsedSider = () => {
    setCollapseSider(!collapseSider)
  }

  return (
    <ALayout className="layout">
      <HeaderBar />
      <ALayout>
        <SiderBar collapseSider={collapseSider} toggleCollapsedSider={toggleCollapsedSider} />
        <ALayout>
          <Content className={`content ${collapseSider ? "content-collapsed" : ""}`}>
            <div>{children}</div>
          </Content>
        </ALayout>
      </ALayout>
    </ALayout>
  )
}

export default Layout
