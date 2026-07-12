import { AppstoreAddOutlined, HomeOutlined, UploadOutlined } from "@ant-design/icons"
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
    label: <Link href="/uploadPage">Alabanzas</Link>
  },
  {
    key: "/servicios",
    icon: <AppstoreAddOutlined />,
    label: <Link href="/servicios">Servicios</Link>
  }
]
