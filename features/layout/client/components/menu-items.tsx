import { AppstoreAddOutlined, BankOutlined, HomeOutlined, PlayCircleOutlined, TeamOutlined, UnorderedListOutlined } from "@ant-design/icons"
import Link from "next/link"
import { can, type Permission, type Role } from "@/shared/auth/permissions"

// Cada sección del menú, con el permiso que pide (el mismo que revisa el proxy); Inicio es para todos
const ITEMS: { path: string, label: string, icon: React.ReactNode, permission?: Permission }[] = [
  { path: "/dashboard", label: "Inicio", icon: <HomeOutlined /> },
  { path: "/alabanzas", label: "Alabanzas", icon: <UnorderedListOutlined />, permission: "viewSongs" },
  { path: "/servicios", label: "Servicios", icon: <AppstoreAddOutlined />, permission: "manageServices" },
  { path: "/en-curso", label: "En curso", icon: <PlayCircleOutlined />, permission: "goLive" },
  { path: "/usuarios", label: "Usuarios", icon: <TeamOutlined />, permission: "manageUsers" },
  { path: "/iglesias", label: "Iglesias", icon: <BankOutlined />, permission: "manageChurches" }
]

export const getMenuItems = (role?: Role) =>
  ITEMS
    .filter(item => !item.permission || can(role, item.permission))
    .map(({ path, label, icon }) => ({ key: path, icon, label: <Link href={path}>{label}</Link> }))

// "/alabanzas/nueva" highlights "Alabanzas"
export const getSelectedMenuKey = (pathname: string) => `/${pathname.split("/")[1] ?? ""}`
