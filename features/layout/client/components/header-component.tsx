"use client"

import { CloseOutlined, LogoutOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Drawer, Layout as ALayout, Menu, Tooltip, Typography } from "antd"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { getMenuItems, getSelectedMenuKey } from "./menu-items"
import { displayName } from "@/shared/utils/user"
import { useSession } from "./session-provider"

const { Header } = ALayout
const { Title } = Typography
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION

const HeaderBar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLeader } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuItems = useMemo(() => getMenuItems(isLeader), [isLeader])
  const selectedKeys = [getSelectedMenuKey(pathname)]
  const name = displayName(user?.username) || (isLeader ? "Líder" : "Músico")
  const roleLabel = isLeader ? "Dirigente" : "Músico"

  const handleLogout = async () => {
    setIsMenuOpen(false)
    try {
      await fetch("/api/logout", { method: "POST" })
    } finally {
      router.push("/login")
      router.refresh()
    }
  }

  return (
    <Header className="header">
      {/* Phones and tablets: burger on the left, the emblem centered, the user's initial on the right */}
      <Button
        className="mobile-menu-button" type="text"
        icon={<MenuOutlined />} aria-label="Abrir menú"
        aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(true)} />

      <Link
        href="/dashboard" className="brand"
        aria-label="Chord Church, inicio">
        <span className="brand-emblem">
          <Image
            src="/logo-icon.png" alt=""
            width={32} height={49}
            className="brand-icon" priority />
        </span>
        <span className="brand-text">
          <span className="brand-name">Chord Church</span>
          <span className="brand-byline">by AA · v{APP_VERSION}</span>
        </span>
      </Link>

      <Menu
        className="nav-menu" mode="horizontal"
        selectedKeys={selectedKeys} items={menuItems} />

      <div className="user">
        <UserOutlined className="icon" />
        <Title
          className="text" level={5}
          style={{ margin: 0 }}>
          {name}
        </Title>
        <Tooltip title="Cerrar sesión">
          <Button
            aria-label="Cerrar sesión" icon={<LogoutOutlined />}
            type="text" onClick={handleLogout} />
        </Tooltip>
      </div>

      <button
        type="button" className="mobile-avatar"
        aria-label={`${name}: abrir menú`} onClick={() => setIsMenuOpen(true)}>
        {name.charAt(0)}
      </button>

      <Drawer
        open={isMenuOpen} onClose={() => setIsMenuOpen(false)}
        placement="left" size={300}
        closable={false} rootClassName="mobile-nav-drawer">
        <div className="mobile-nav">
          <div className="mobile-nav-top">
            <span className="brand-emblem is-small">
              <Image
                src="/logo-icon.png" alt=""
                width={32} height={49}
                className="brand-icon" />
            </span>
            <span className="brand-text">
              <span className="mobile-nav-title">Chord Church</span>
              <span className="brand-byline">by AA · v{APP_VERSION}</span>
            </span>
            <Button
              type="text" icon={<CloseOutlined />}
              aria-label="Cerrar menú" onClick={() => setIsMenuOpen(false)} />
          </div>

          <div className="mobile-nav-user">
            <span className="mobile-nav-avatar">{name.charAt(0)}</span>
            <span>
              <span className="mobile-nav-user-name">Hola, {name}</span>
              <span className="mobile-nav-user-role">{roleLabel}</span>
            </span>
          </div>

          <Menu
            className="mobile-nav-menu" mode="inline"
            selectedKeys={selectedKeys} items={menuItems}
            onClick={() => setIsMenuOpen(false)} />

          <Button
            className="mobile-nav-logout" icon={<LogoutOutlined />}
            size="large" block
            onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </Drawer>
    </Header>
  )
}

export default HeaderBar
