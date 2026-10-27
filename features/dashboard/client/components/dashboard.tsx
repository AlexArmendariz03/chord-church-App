"use client"

import { AppstoreAddOutlined, CalendarOutlined, PlayCircleOutlined, UnorderedListOutlined } from "@ant-design/icons"
import { Alert, App, Button, Card, Col, Empty, Row, Typography } from "antd"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "@/features/layout/client/components/session-provider"
import { ROLE_LABELS, type Role } from "@/shared/auth/permissions"
import { displayName } from "@/shared/utils/user"
import { ServiceCard } from "@/shared/components/service-card"
import type { ServiceWithSongs } from "@/types/services"

const { Meta } = Card
const { Title, Paragraph } = Typography

// Lo que cada rol hace en la app, bajo el saludo
const SUBTITLES: Record<Role, string> = {
  leader: "Administra alabanzas y arma los próximos servicios.",
  musico: "Abre el servicio en curso para seguir las letras en vivo.",
  proyeccion: "Aquí están las alabanzas de cada servicio, en el orden en que se proyectan."
}

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
  const { user, role, can } = useSession()
  const canManage = can("manageServices")
  const canGoLive = can("goLive")
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
          Hola, {displayName(user?.username) || (role && ROLE_LABELS[role])}
        </Title>
        <Paragraph className="dashboard-subtitle">
          {role && SUBTITLES[role]}
        </Paragraph>

        {canManage ? (
          <Row gutter={[20, 20]} data-tour="atajos">
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
        ) : canGoLive && (
          <Button
            type="primary" size="large"
            icon={<PlayCircleOutlined />} data-tour="abrir-en-curso"
            onClick={() => navigateTo("/en-curso")}>
            Abrir servicio en curso
          </Button>
        )}
      </div>

      <Card
        className="next-service-card" data-tour="proximos"
        loading={loadingService}
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
          <div className="service-list">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id} service={service}
                isNext={index === 0}
                onOpen={!canGoLive ? undefined : () => navigateTo(`/en-curso?servicio=${service.id}`)}
                onEdit={canManage ? () => navigateTo(`/servicios?edit=${service.id}`) : undefined}
                onDelete={canManage ? () => deleteService(service) : undefined} />
            ))}
          </div>
        ) : (
          <Empty
            description={canManage ? "Aún no hay servicios programados" : "No hay servicios programados por ahora"}
            image={Empty.PRESENTED_IMAGE_SIMPLE}>
            {canManage && (
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
