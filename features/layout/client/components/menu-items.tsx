import { AppstoreAddOutlined, HomeOutlined, PlayCircleOutlined, UnorderedListOutlined } from "@ant-design/icons"
import Link from "next/link"

const LEADER_ONLY_ITEMS = [
  {
    key: "/alabanzas",
    icon: <UnorderedListOutlined />,
    label: <Link href="/alabanzas">Alabanzas</Link>
  },
  {
    key: "/servicios",
    icon: <AppstoreAddOutlined />,
    label: <Link href="/servicios">Servicios</Link>
  }
]

export const getMenuItems = (isLeader: boolean) => [
  {
    key: "/dashboard",
    icon: <HomeOutlined />,
    label: <Link href="/dashboard">Inicio</Link>
  },
  ...(isLeader ? LEADER_ONLY_ITEMS : []),
  {
    key: "/en-curso",
    icon: <PlayCircleOutlined />,
    label: <Link href="/en-curso">En curso</Link>
  }
]

// "/alabanzas/nueva" highlights "Alabanzas"
export const getSelectedMenuKey = (pathname: string) => `/${pathname.split("/")[1] ?? ""}`
