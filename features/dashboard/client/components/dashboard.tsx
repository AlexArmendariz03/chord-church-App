"use client"

import { AppstoreAddOutlined, ArrowRightOutlined, CalendarOutlined, PlayCircleOutlined, UnorderedListOutlined, UploadOutlined } from "@ant-design/icons"
import { Button, Card, Col, Empty, Row, Tag, Typography } from "antd"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { ServiceWithSongs } from "@/types/services"

const { Meta } = Card
const { Title, Paragraph, Text } = Typography

const Dashboard = () => {
  const router = useRouter()
  const [role, setRole] = useState("musico")
  const [nextService, setNextService] = useState<ServiceWithSongs | null>(null)
  const [loadingService, setLoadingService] = useState(true)
  const isLeader = role === "leader"

  useEffect(() => {
    setRole(localStorage.getItem("userRole") ?? "musico")
  }, [])

  useEffect(() => {
    fetch("/api/services")
      .then(res => res.json())
      .then((services: ServiceWithSongs[]) => setNextService(services[0] ?? null))
      .catch(() => setNextService(null))
      .finally(() => setLoadingService(false))
  }, [])

  const navigateTo = (path: string) => {
    router.push(path)
  }

  const jubiloCount = nextService?.songs.filter(s => s.category === "jubilo").length ?? 0
  const adoracionCount = nextService?.songs.filter(s => s.category === "adoracion").length ?? 0

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
            <CalendarOutlined /> Próximo servicio
          </span>
        )}
        extra={nextService && (
          <Button
            type="link" onClick={() => navigateTo("/en-curso")}
            icon={<ArrowRightOutlined />} iconPosition="end">
            Abrir en curso
          </Button>
        )}>
        {nextService ? (
          <Row
            align="middle" gutter={[16, 16]}
            className="next-service-body">
            <Col flex="auto">
              <Title
                level={4} style={{ margin: 0 }}>
                {nextService.title}
              </Title>
              <Text type="secondary">{new Date(nextService.eventDate).toLocaleString()}</Text>
            </Col>
            <Col>
              <Tag color="gold">{jubiloCount} júbilo</Tag>
              <Tag color="purple">{adoracionCount} adoración</Tag>
            </Col>
          </Row>
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
