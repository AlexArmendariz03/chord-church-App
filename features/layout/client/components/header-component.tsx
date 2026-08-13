"use client"

import { LogoutOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Dropdown, Layout as ALayout, Tooltip, Typography } from "antd"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { menuItems } from "./menu-items"

const { Header } = ALayout
const { Title } = Typography

const HeaderBar = () => {
  const router = useRouter()
  const [role, setRole] = useState("musico")

  useEffect(() => {
    setRole(localStorage.getItem("userRole") ?? "musico")
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" })
    } finally {
      localStorage.removeItem("userRole")
      router.push("/login")
    }
  }

  return (
    <Header className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div className="mobile-menu-button">
        <Dropdown trigger={["click"]} menu={{ items: menuItems }}>
          <Button icon={<MenuOutlined className="menu-icon" />} type="text" />
        </Dropdown>
      </div>
      <Link href="/dashboard">
        <Image
          src="/logo.png" alt="logo"
          width={120} height={120}
          className="image" />
      </Link>
      <div className="user" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <UserOutlined className="icon" style={{ fontSize: "20px" }} />
        <Title
          className="text" level={5}
          style={{ margin: 0 }}>
          {role === "leader" ? "Líder" : "Músico"}
        </Title>
        <Tooltip title="Cerrar sesión">
          <Button
            aria-label="Cerrar sesión" icon={<LogoutOutlined />}
            type="text" onClick={handleLogout}
            style={{ color: "#fff" }} />
        </Tooltip>
      </div>
    </Header>
  )
}

export default HeaderBar
