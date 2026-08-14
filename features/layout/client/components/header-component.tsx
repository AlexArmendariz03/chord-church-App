"use client"

import { LogoutOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Dropdown, Layout as ALayout, Menu, Tooltip, Typography } from "antd"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { getMenuItems } from "./menu-items"

const { Header } = ALayout
const { Title } = Typography

const HeaderBar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [role, setRole] = useState("musico")

  useEffect(() => {
    setRole(localStorage.getItem("userRole") ?? "musico")
  }, [])

  const isLeader = role === "leader"
  const menuItems = useMemo(() => getMenuItems(isLeader), [isLeader])

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" })
    } finally {
      localStorage.removeItem("userRole")
      router.push("/login")
    }
  }

  return (
    <Header className="header">
      <div className="mobile-menu-button">
        <Dropdown trigger={["click"]} menu={{ items: menuItems, selectedKeys: [pathname] }}>
          <Button icon={<MenuOutlined className="menu-icon" />} type="text" />
        </Dropdown>
      </div>
      <Link href="/dashboard">
        <Image
          src="/logo-mark.png" alt="Chord Church"
          width={120} height={120}
          className="image" priority />
      </Link>
      <Menu
        className="nav-menu" mode="horizontal"
        selectedKeys={[pathname]} items={menuItems} />
      <div className="user">
        <UserOutlined className="icon" />
        <Title
          className="text" level={5}
          style={{ margin: 0 }}>
          {isLeader ? "Líder" : "Músico"}
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
