import { AppstoreAddOutlined, HomeOutlined, UnorderedListOutlined, UploadOutlined } from "@ant-design/icons"
import Link from "next/link"

export const menuItems = [
  {
    key: "/",
    icon: <HomeOutlined />,
    label: <Link href="/">Inicio</Link>
  },
  {
    key: "/cargar",
    icon: <UploadOutlined />,
    label: <Link href="/cargar">Cargar letras</Link>
  },
  {
    key: "/servicios",
    icon: <AppstoreAddOutlined />,
    label: <Link href="/servicios">Servicios</Link>
  },
  {
    key: "/chord-list",
    icon: <UnorderedListOutlined />,
    label: <Link href="/chord-list">Chord List</Link>
  }
]
