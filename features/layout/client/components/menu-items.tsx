import { AppstoreAddOutlined, HomeOutlined, PlayCircleOutlined, UnorderedListOutlined, UploadOutlined } from "@ant-design/icons"
import Link from "next/link"

const LEADER_ONLY_ITEMS = [
  {
    key: "/uploadPage",
    icon: <UploadOutlined />,
    label: <Link href="/uploadPage">Crear alabanzas</Link>
  },
  {
    key: "/alabanzas",
    icon: <UnorderedListOutlined />,
    label: <Link href="/alabanzas">Lista de alabanzas</Link>
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
    key: "/servicios",
    icon: <AppstoreAddOutlined />,
    label: <Link href="/servicios">Servicios</Link>
  },
  {
    key: "/en-curso",
    icon: <PlayCircleOutlined />,
    label: <Link href="/en-curso">En curso</Link>
  }
]
