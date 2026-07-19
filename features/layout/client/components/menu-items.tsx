import { AppstoreAddOutlined, HomeOutlined, PlayCircleOutlined, UnorderedListOutlined, UploadOutlined } from "@ant-design/icons"
import Link from "next/link"

export const menuItems = [
  {
    key: "/dashboard",
    icon: <HomeOutlined />,
    label: <Link href="/dashboard">Inicio</Link>
  },
  {
    key: "/uploadPage",
    icon: <UploadOutlined />,
    label: <Link href="/uploadPage">Crear alabanzas</Link>
  },
  {
    key: "/alabanzas",
    icon: <UnorderedListOutlined />,
    label: <Link href="/alabanzas">Lista de alabanzas</Link>
  },
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
