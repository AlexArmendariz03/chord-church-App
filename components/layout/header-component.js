import { Layout as ALayout, Typography, Dropdown, Button } from "antd"
import { MenuOutlined, UserOutlined } from "@ant-design/icons"
import Image from "next/image"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { menuItems } from "./menu-items"

const { Header } = ALayout
const { Title } = Typography

const HeaderBar = () => {
  const [userLabel, setUserLabel] = useState("Invitado")

  useEffect(() => {
    const rawUser = localStorage.getItem("currentUser")

    if (!rawUser) {
      setUserLabel("Invitado")
      return
    }

    try {
      const parsedUser = JSON.parse(rawUser)
      const roleLabel = parsedUser?.role === "DIRIGENTE" ? "Dirigente" : "Músico"
      setUserLabel(`${parsedUser?.username ?? "Usuario"} · ${roleLabel}`)
    } catch {
      setUserLabel("Invitado")
    }
  }, [])

  return (
    <Header className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div className="mobile-menu-button">
        <Dropdown trigger={["click"]} menu={{ items: menuItems }}>
          <Button icon={<MenuOutlined className="menu-icon" />} type="text" />
        </Dropdown>
      </div>
      <Link href="/">
        <Image
          src="/logo.png"
          alt="logo"
          width={120}
          height={120}
          className="image" />
      </Link>
      <div className="user" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <UserOutlined className="icon" style={{ fontSize: "20px" }} />
        <Title
          className="text" level={5}
          style={{ margin: 0 }}>
          {userLabel}
        </Title>
      </div>
    </Header>
  )
}

export default HeaderBar
