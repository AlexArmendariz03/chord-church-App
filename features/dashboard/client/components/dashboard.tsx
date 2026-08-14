"use client"

import { AppstoreAddOutlined, CalendarOutlined, MoreOutlined, PlayCircleOutlined, UnorderedListOutlined, UploadOutlined } from "@ant-design/icons"
import { App, Button, Card, Col, Collapse, Dropdown, Empty, Row, Space, Tag, Typography } from "antd"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { ServiceWithSongs } from "@/types/services"

const { Meta } = Card
const { Title, Paragraph, Text } = Typography

const Dashboard = () => {
  const router = useRouter()
  const { modal, message } = App.useApp()
  const [role, setRole] = useState("musico")
  const [services, setServices] = useState<ServiceWithSongs[]>([])
  const [loadingService, setLoadingService] = useState(true)
  const isLeader = role === "leader"

  useEffect(() => {
    setRole(localStorage.getItem("userRole") ?? "musico")
  }, [])

  const fetchServices = () => {
    setLoadingService(true)
    fetch("/api/services")
      .then(res => res.json())
      .then((data: ServiceWithSongs[]) => {
        const sorted = [...data].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
        setServices(sorted)
      })
      .catch(() => setServices([]))
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
        <Text className="dashboard-eyebrow">PANEL DE CONTROL</Text>
        <Title
          level={2} style={{ margin: "4px 0 6px" }}>
          Hola, {isLeader ? "Líder" : "Músico"}
        </Title>
        <Paragraph className="dashboard-subtitle">
          {isLeader ? "Administra alabanzas y arma los próximos servicios." : "Consulta los servicios programados y sigue las letras en vivo."}
        </Paragraph>

        <Row gutter={[20, 20]}>
          {isLeader && (
            <>
              <Col
                xs={24} sm={12}
                lg={6}>
                <Card
                  hoverable className="dashboard-card"
                  onClick={() => navigateTo("/uploadPage")}>
                  <div className="dashboard-card-content">
                    <div className="dashboard-card-icon-wrap">
                      <UploadOutlined className="dashboard-card-icon" />
                    </div>
                    <Meta
                      title="Crear alabanzas" description="Crear letras, tonos y categorías"
                      className="dashboard-card-meta" />
                  </div>
                </Card>
              </Col>
              <Col
                xs={24} sm={12}
                lg={6}>
                <Card
                  hoverable className="dashboard-card"
                  onClick={() => navigateTo("/alabanzas")}>
                  <div className="dashboard-card-content">
                    <div className="dashboard-card-icon-wrap">
                      <UnorderedListOutlined className="dashboard-card-icon" />
                    </div>
                    <Meta
                      title="Lista de alabanzas" description="Editar o eliminar por categoría"
                      className="dashboard-card-meta" />
                  </div>
                </Card>
              </Col>
            </>
          )}
          <Col
            xs={24} sm={12}
            lg={6}>
            <Card
              hoverable className="dashboard-card"
              onClick={() => navigateTo("/servicios")}>
              <div className="dashboard-card-content">
                <div className="dashboard-card-icon-wrap">
                  <AppstoreAddOutlined className="dashboard-card-icon" />
                </div>
                <Meta
                  title="Servicios"
                  description={isLeader ? "Programa canciones por fecha" : "Ver servicios programados"}
                  className="dashboard-card-meta" />
              </div>
            </Card>
          </Col>
          <Col
            xs={24} sm={12}
            lg={6}>
            <Card
              hoverable className="dashboard-card"
              onClick={() => navigateTo("/en-curso")}>
              <div className="dashboard-card-content">
                <div className="dashboard-card-icon-wrap">
                  <PlayCircleOutlined className="dashboard-card-icon" />
                </div>
                <Meta
                  title="En curso" description="Abrir alabanzas una a una"
                  className="dashboard-card-meta" />
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <Card
        className="next-service-card" loading={loadingService}
        title={(
          <span className="next-service-title">
            <CalendarOutlined /> Próximos servicios
          </span>
        )}>
        {services.length ? (
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
                        {new Date(service.eventDate).toLocaleString()}
                      </Text>
                    </Col>
                    <Col>
                      <Space size={4}>
                        <Tag color="gold">{jubiloCount} júbilo</Tag>
                        <Tag color="purple">{adoracionCount} adoración</Tag>
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
                          <Tag color={category === "jubilo" ? "green" : "purple"}>
                            {category === "jubilo" ? "Júbilo" : "Adoración"}
                          </Tag>
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
