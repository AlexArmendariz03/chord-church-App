"use client"

import { ArrowLeftOutlined, EditOutlined, LoginOutlined, TeamOutlined, UnorderedListOutlined } from "@ant-design/icons"
import { Button, Card, Result, Space, Tabs, Tag, Typography } from "antd"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import { useSession } from "@/features/auth/client/session-provider"
import SongsList from "@/features/songs/client/components/songs-list"
import { ChurchSongsScope } from "@/features/songs/client/songs-scope"
import Users from "@/features/users/client/components/users"
import { plural, RenameChurchModal, useChurch, useEnterChurch } from "./church-actions"

const { Paragraph, Title } = Typography

export type ChurchSection = "usuarios" | "alabanzas"

const backLink = (href: string, label: string) => (
  <Link href={href}>
    <Button
      type="link" icon={<ArrowLeftOutlined />}
      style={{ paddingInline: 0 }}>{label}</Button>
  </Link>
)

const ChurchNotFound = () => (
  <div style={{ padding: 24 }}>
    <Card>
      <Result
        status="404" title="Iglesia no encontrada"
        extra={backLink("/iglesias", "Iglesias")} />
    </Card>
  </div>
)

// Página de una iglesia (solo el master): su nombre, cuánto tiene y dos pestañas, Usuarios y
// Alabanzas, para administrarlos sin cambiar la iglesia de la sesión
export const ChurchDetail = ({ churchId, section }: { churchId: string; section: ChurchSection }) => {
  const router = useRouter()
  const { church: currentChurch } = useSession()
  const { enter, enteringId } = useEnterChurch()
  const { church, setChurch, notFound, reload } = useChurch(churchId)
  const [isRenaming, setIsRenaming] = useState(false)

  if (notFound) return <ChurchNotFound />

  const isCurrent = church?.id === currentChurch?.id
  const basePath = `/iglesias/${churchId}`

  return (
    <div style={{ padding: 24 }}>
      <Space
        orientation="vertical" size={20}
        style={{ width: "100%" }}>
        <Card loading={!church} className="church-detail-header">
          {backLink("/iglesias", "Iglesias")}
          {church && (
            <div className="page-header">
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  {church.name} {isCurrent && <Tag color="blue" className="church-current-tag">Actual</Tag>}
                </Title>
                <Paragraph type="secondary" style={{ margin: 0 }}>
                  {plural(church.users, "usuario", "usuarios")} · {plural(church.songs, "alabanza", "alabanzas")} · {plural(church.services, "servicio", "servicios")}
                </Paragraph>
              </div>
              <Space wrap>
                <Button icon={<EditOutlined />} onClick={() => setIsRenaming(true)}>Renombrar</Button>
                {!isCurrent && (
                  <Button
                    icon={<LoginOutlined />} loading={enteringId === church.id}
                    onClick={() => enter(church, "/dashboard")}>
                    Entrar para ver sus servicios
                  </Button>
                )}
              </Space>
            </div>
          )}
          <Tabs
            className="church-detail-tabs" activeKey={section}
            onChange={key => router.push(key === "usuarios" ? basePath : `${basePath}/${key}`)}
            items={[
              { key: "usuarios", label: "Usuarios", icon: <TeamOutlined /> },
              { key: "alabanzas", label: "Alabanzas", icon: <UnorderedListOutlined /> }
            ]} />
        </Card>

        {church && section === "usuarios" && <Users church={church} onUserCreated={reload} />}
        {church && section === "alabanzas" && (
          <ChurchSongsScope church={church} onSongsChanged={reload}>
            <SongsList />
          </ChurchSongsScope>
        )}
      </Space>

      <RenameChurchModal
        church={isRenaming ? church : null} onClose={() => setIsRenaming(false)}
        onRenamed={renamed => {
          setIsRenaming(false)
          setChurch(current => current && { ...current, name: renamed.name })
          // El encabezado muestra el nombre de la iglesia actual
          if (isCurrent) router.refresh()
        }} />
    </div>
  )
}

// El editor de alabanzas con el cancionero de esa iglesia: guarda ahí y vuelve a su pestaña Alabanzas
export const ChurchSongEditor = ({ churchId, children }: { churchId: string; children: ReactNode }) => {
  const { church, notFound } = useChurch(churchId)
  if (notFound) return <ChurchNotFound />
  if (!church) return null
  return <ChurchSongsScope church={church}>{children}</ChurchSongsScope>
}
