"use client"

import { CloseOutlined, CompassOutlined, DownOutlined, LogoutOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons"
import { Avatar, Button, Drawer, Dropdown, Layout as ALayout, Menu, type MenuProps } from "antd"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { openTour, useHasTour } from "@/features/tour/client/app-tour"
import { getMenuItems, getSelectedMenuKey } from "./menu-items"
import { displayName } from "@/shared/utils/user"
import { useSession } from "./session-provider"

const { Header } = ALayout
// "1.6" (set in next.config.ts from package.json); shown in the user menu to check which version is deployed
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION

const HeaderBar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLeader, isProjection } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const hasTour = useHasTour()
  const menuItems = useMemo(() => getMenuItems(isLeader, !isProjection), [isLeader, isProjection])
  const selectedKeys = [getSelectedMenuKey(pathname)]
  const roleLabel = isLeader ? "Dirigente" : isProjection ? "Proyección" : "Músico"
  const name = displayName(user?.username) || (isLeader ? "Líder" : roleLabel)
  const roleClass = isLeader ? "is-leader" : isProjection ? "is-projection" : "is-musician"
  // antd icon avatar in the role's color
  const userAvatar = (size: number) => (
    <Avatar size={size} icon={<UserOutlined />} className={`user-avatar ${roleClass}`} />
  )
  // Shared accounts are named after their role ("dirigente"): no badge repeating the name
  const nameIsRole = name.toLowerCase() === roleLabel.toLowerCase()
  const roleBadge = nameIsRole ? null : <span className={`role-badge ${roleClass}`}>{roleLabel}</span>

  const handleLogout = async () => {
    setIsMenuOpen(false)
    try {
      await fetch("/api/logout", { method: "POST" })
    } finally {
      router.push("/login")
      router.refresh()
    }
  }

  // En el teléfono primero se cierra el menú lateral, para que el recorrido señale la página
  const showHelp = () => {
    setIsMenuOpen(false)
    setTimeout(openTour, 300)
  }

  const userMenuItems: MenuProps["items"] = [
    ...(hasTour ? [{ key: "tour", icon: <CompassOutlined />, label: "Tour guiado", onClick: openTour }] : []),
    { key: "terms", label: <Link href="/terminos">Términos y condiciones</Link> },
    { key: "logout", icon: <LogoutOutlined />, label: "Cerrar sesión", onClick: handleLogout },
    { type: "divider" },
    { key: "version", label: <span className="user-menu-version">Versión {APP_VERSION}</span>, disabled: true }
  ]

  return (
    <Header className="header">
      {/* Phones and tablets: burger on the left, the emblem centered, the user's initial on the right */}
      <Button
        className="mobile-menu-button" type="text"
        data-tour="menu" icon={<MenuOutlined />}
        aria-label="Abrir menú" aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen(true)} />

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
          <span className="brand-byline">by AA</span>
        </span>
      </Link>

      <Menu
        className="nav-menu" mode="horizontal"
        data-tour="menu" selectedKeys={selectedKeys}
        items={menuItems} />

      <Dropdown
        menu={{ items: userMenuItems }} trigger={["click"]}
        placement="bottomRight" rootClassName="user-menu">
        <button
          type="button" className="user"
          data-tour="usuario" aria-label={`${name}, ${roleLabel}: abrir menú de usuario`}>
          {userAvatar(34)}
          <span className="user-text">
            <span className="user-name">{name}</span>
            {roleBadge}
          </span>
          <DownOutlined className="user-caret" />
        </button>
      </Dropdown>

      <button
        type="button" className="mobile-avatar"
        data-tour="usuario" aria-label={`${name}: abrir menú`}
        onClick={() => setIsMenuOpen(true)}>
        {userAvatar(38)}
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
              <span className="brand-byline">by AA</span>
            </span>
            <Button
              type="text" icon={<CloseOutlined />}
              aria-label="Cerrar menú" onClick={() => setIsMenuOpen(false)} />
          </div>

          <div className="mobile-nav-user">
            {userAvatar(40)}
            <span>
              <span className="mobile-nav-user-name">{nameIsRole ? name : `Hola, ${name}`}</span>
              {roleBadge}
            </span>
          </div>

          <Menu
            className="mobile-nav-menu" mode="inline"
            selectedKeys={selectedKeys} items={menuItems}
            onClick={() => setIsMenuOpen(false)} />

          {hasTour && (
            <Button
              className="mobile-nav-help" icon={<CompassOutlined />}
              size="large" block
              onClick={showHelp}>
              Tour guiado
            </Button>
          )}
          <Button
            className="mobile-nav-logout" icon={<LogoutOutlined />}
            size="large" block
            onClick={handleLogout}>
            Cerrar sesión
          </Button>
          <span className="mobile-nav-version">
            Versión {APP_VERSION} · <Link href="/terminos" onClick={() => setIsMenuOpen(false)}>Términos</Link>
          </span>
        </div>
      </Drawer>
    </Header>
  )
}

export default HeaderBar
