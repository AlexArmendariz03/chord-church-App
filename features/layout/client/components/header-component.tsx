"use client"

import { MenuOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Dropdown, Layout as ALayout, Typography } from "antd"
import Image from "next/image"
import Link from "next/link"
import { menuItems } from "./menu-items"

const { Header } = ALayout
const { Title } = Typography

const HeaderBar = () => {
  return (
    <Header className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div className="mobile-menu-button">
        <Dropdown trigger={["click"]} menu={{ items: menuItems }}>
          <Button icon={<MenuOutlined className="menu-icon" />} type="text" />
        </Dropdown>
      </div>
      <Link href="/">
        <Image src="/logo.png" alt="logo" width={120} height={120} className="image" />
      </Link>
      <div className="user" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <UserOutlined className="icon" style={{ fontSize: "20px" }} />
        <Title className="text" level={5} style={{ margin: 0 }}>
          User rol
        </Title>
      </div>
    </Header>
  )
}

export default HeaderBar
