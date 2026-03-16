"use client"

import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons"
import { Layout as ALayout, Menu } from "antd"
import { usePathname } from "next/navigation"
import { menuItems } from "./menu-items"

const { Sider } = ALayout

type SiderBarProps = {
  collapseSider: boolean
  toggleCollapsedSider: () => void
}

const SiderBar = ({ collapseSider, toggleCollapsedSider }: SiderBarProps) => {
  const currentPath = usePathname()

  return (
    <Sider className="sider" theme="light" collapsed={collapseSider} onCollapse={toggleCollapsedSider} collapsedWidth={70}>
      <Menu theme="light" selectedKeys={[currentPath]} items={menuItems} />
      <div className="sider-footer">
        {collapseSider ? (
          <MenuUnfoldOutlined className="menu-toggle" onClick={toggleCollapsedSider} />
        ) : (
          <MenuFoldOutlined className="menu-toggle" onClick={toggleCollapsedSider} />
        )}
      </div>
    </Sider>
  )
}

export default SiderBar
