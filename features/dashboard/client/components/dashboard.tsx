"use client"

import { AppstoreAddOutlined, CalendarOutlined, MoreOutlined, PlayCircleOutlined, UnorderedListOutlined } from "@ant-design/icons"
import { Alert, App, Button, Card, Col, Collapse, Dropdown, Empty, Row, Space, Typography } from "antd"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "@/features/layout/client/components/session-provider"
import { formatServiceDate } from "@/shared/utils/dates"
import { displayName } from "@/shared/utils/user"
import { CategoryTag } from "@/shared/components/category-tag"
import type { ServiceWithSongs } from "@/types/services"

const { Meta } = Card
const { Title, Paragraph, Text } = Typography

const LEADER_SHORTCUTS = [
  {
    path: "/alabanzas",
    title: "Alabanzas",
    description: "Crea y edita letras y tonos",
    icon: <UnorderedListOutlined className="dashboard-card-icon" />
  },
  {
    path: "/servicios",
    title: "Servicios",
    description: "Arma las canciones de cada fecha",
    icon: <AppstoreAddOutlined className="dashboard-card-icon" />
  },
  {
    path: "/en-curso",
    title: "En curso",
    description: "Sigue las letras en vivo",
    icon: <PlayCircleOutlined className="dashboard-card-icon" />
  }
]

const Dashboard = () => {
  const router = useRouter()
  const { modal, message } = App.useApp()
  const { user, isLeader } = useSession()
  const [services, setServices] = useState<ServiceWithSongs[]>([])
  const [loadingService, setLoadingService] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const fetchServices = () => {
    setLoadingService(true)
    setLoadError(false)
    fetch("/api/services")
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data: ServiceWithSongs[]) => setServices(data))
      .catch(() => setLoadError(true))
      .finally(() => setLoadingService(false))
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const navigateTo = (path: string) => {
    router.push(path)
  }

  const deleteService = (service: ServiceWithSongs) => {
    modal.confirm({
      title: "Eliminar servicio",
      content: `¿Seguro que deseas eliminar "${service.title}"? Esta acción no se puede deshacer.`,
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      async onOk() {
        const response = await fetch(`/api/services/${service.id}`, { method: "DELETE" })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message ?? "Error al eliminar")
        message.success("Servicio eliminado")
        fetchServices()
      }
    })
  }

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <Title
          level={2} style={{ margin: "0 0 6px" }}>
          Hola, {displayName(user?.username) || (isLeader ? "Líder" : "Músico")}
        </Title>
        <Paragraph className="dashboard-subtitle">
          {isLeader ? "Administra alabanzas y arma los próximos servicios." : "Abre el servicio en curso para seguir las letras en vivo."}
        </Paragraph>

        {isLeader ? (
          <Row gutter={[20, 20]}>
            {LEADER_SHORTCUTS.map(({ path, title, description, icon }) => (
              <Col
                key={path} xs={24}
                sm={8}>
                <Card
                  hoverable className="dashboard-card"
                  onClick={() => navigateTo(path)}>
                  <div className="dashboard-card-content">
                    <div className="dashboard-card-icon-wrap">{icon}</div>
                    <Meta
                      title={title} description={description}
                      className="dashboard-card-meta" />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Button
            type="primary" size="large"
            icon={<PlayCircleOutlined />} onClick={() => navigateTo("/en-curso")}>
            Abrir servicio en curso
          </Button>
        )}
      </div>

      <Card
        className="next-service-card" loading={loadingService}
        title={(
          <span className="next-service-title">
            <CalendarOutlined /> Próximos servicios
          </span>
        )}>
        {loadError ? (
          <Alert
            type="error" showIcon
            title="No se pudieron cargar los servicios"
            action={<Button size="small" onClick={fetchServices}>Reintentar</Button>} />
        ) : services.length ? (
          <Collapse
            ghost
            className="collapse-panel-list"
            items={services.map(service => {
              const jubiloCount = service.songs.filter(s => s.category === "jubilo").length
              const adoracionCount = service.songs.filter(s => s.category === "adoracion").length

              return {
                key: service.id,
                label: (
                  <Row
                    align="middle" gutter={12}
                    wrap={false}>
                    <Col flex="auto">
                      <Text strong>{service.title}</Text>
                      <br />
                      <Text
                        type="secondary" style={{ fontSize: 13 }}>
                        {formatServiceDate(service.eventDate)}
                      </Text>
                    </Col>
                    <Col>
                      <Space size={4}>
                        <CategoryTag category="jubilo" count={jubiloCount} />
                        <CategoryTag category="adoracion" count={adoracionCount} />
                      </Space>
                    </Col>
                    {isLeader && (
                      <Col onClick={e => e.stopPropagation()}>
                        <Dropdown
                          trigger={["click"]}
                          menu={{
                            items: [
                              { key: "edit", label: "Editar" },
                              { key: "delete", label: "Eliminar", danger: true }
                            ],
                            onClick: ({ key }) => {
                              if (key === "edit") navigateTo(`/servicios?edit=${service.id}`)
                              if (key === "delete") deleteService(service)
                            }
                          }}>
                          <Button
                            type="text" icon={<MoreOutlined />}
                            aria-label="Más acciones" />
                        </Dropdown>
                      </Col>
                    )}
                  </Row>
                ),
                children: (
                  <div>
                    {[...service.songs].sort((a, b) => a.position - b.position).map(({ id, song, category, position }) => (
                      <div key={id} className="nested-song-row">
                        <Text>{position}. {song.name}</Text>
                        <Space>
                          <Text type="secondary">Tono: {song.key}</Text>
                          <CategoryTag category={category} />
                        </Space>
                      </div>
                    ))}
                  </div>
                )
              }
            })} />
        ) : (
          <Empty
            description={isLeader ? "Aún no hay servicios programados" : "No hay servicios programados por ahora"}
            image={Empty.PRESENTED_IMAGE_SIMPLE}>
            {isLeader && (
              <Button
                type="primary" onClick={() => navigateTo("/servicios")}>
                Crear el primero
              </Button>
            )}
          </Empty>
        )}
      </Card>
    </div>
  )
}

export default Dashboard
