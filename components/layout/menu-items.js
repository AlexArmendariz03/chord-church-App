import { HomeOutlined, UploadOutlined } from "@ant-design/icons"
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
  }
]
