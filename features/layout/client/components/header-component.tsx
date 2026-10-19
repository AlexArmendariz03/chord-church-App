"use client"

import { LogoutOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Dropdown, Layout as ALayout, Menu, Tooltip, Typography } from "antd"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMemo } from "react"
import { getMenuItems, getSelectedMenuKey } from "./menu-items"
import { displayName } from "@/shared/utils/user"
import { useSession } from "./session-provider"

const { Header } = ALayout
const { Title } = Typography

const HeaderBar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLeader } = useSession()
  const menuItems = useMemo(() => getMenuItems(isLeader), [isLeader])
  const selectedKeys = [getSelectedMenuKey(pathname)]

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" })
    } finally {
      router.push("/login")
      router.refresh()
    }
  }

  return (
    <Header className="header">
      <div className="mobile-menu-button">
        <Dropdown trigger={["click"]} menu={{ items: menuItems, selectedKeys }}>
          <Button icon={<MenuOutlined className="menu-icon" />} type="text" />
        </Dropdown>
      </div>
      <Link href="/dashboard" className="brand">
        <Image
          src="/logo-icon.png" alt=""
          width={32} height={49}
          className="brand-icon" priority />
        <span className="brand-name">Chord Church</span>
      </Link>
      <Menu
        className="nav-menu" mode="horizontal"
        selectedKeys={selectedKeys} items={menuItems} />
      <div className="user">
        <UserOutlined className="icon" />
        <Title
          className="text" level={5}
          style={{ margin: 0 }}>
          {displayName(user?.username) || (isLeader ? "Líder" : "Músico")}
        </Title>
        <Tooltip title="Cerrar sesión">
          <Button
            aria-label="Cerrar sesión" icon={<LogoutOutlined />}
            type="text" onClick={handleLogout} />
        </Tooltip>
      </div>
    </Header>
  )
}

export default HeaderBar
