"use client"

import { AppstoreAddOutlined, PlayCircleOutlined, UnorderedListOutlined, UploadOutlined } from "@ant-design/icons"
import { Card, Col, Row, Typography } from "antd"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const { Meta } = Card

const Dashboard = () => {
  const router = useRouter()
  const [role, setRole] = useState("musico")
  const isLeader = role === "dirigente" || role === "leader"

  useEffect(() => {
    setRole(localStorage.getItem("userRole") ?? "musico")
  }, [])

  const navigateTo = (path: string) => {
    router.push(path)
  }

  return (
    <Row className="dashboard" justify="center" align="middle">
      <Col xs={24}>
        <Typography.Title level={2}>Panel de Control</Typography.Title>
        <Typography.Paragraph>
          Rol actual: <Typography.Text strong>{isLeader ? "Dirigente" : "Músico"}</Typography.Text>
        </Typography.Paragraph>
        <Row justify="center" gutter={[16, 16]}>
          {isLeader && (
            <>
              <Col>
                <Card hoverable className="dashboard-card" onClick={() => navigateTo("/uploadPage")}>
                  <div className="dashboard-card-content">
                    <UploadOutlined className="dashboard-card-icon" />
                    <Meta title="Crear alabanzas" description="Crear letras, tonos y categorías" className="dashboard-card-meta" />
                  </div>
                </Card>
              </Col>
              <Col>
                <Card hoverable className="dashboard-card" onClick={() => navigateTo("/alabanzas")}>
                  <div className="dashboard-card-content">
                    <UnorderedListOutlined className="dashboard-card-icon" />
                    <Meta title="Lista de alabanzas" description="Editar o eliminar por categoría" className="dashboard-card-meta" />
                  </div>
                </Card>
              </Col>
            </>
          )}
          <Col>
            <Card hoverable className="dashboard-card" onClick={() => navigateTo("/servicios")}>
              <div className="dashboard-card-content">
                <AppstoreAddOutlined className="dashboard-card-icon" />
                <Meta
                  title="Servicios"
                  description={isLeader ? "Programa canciones por fecha" : "Ver servicios programados"}
                  className="dashboard-card-meta"
                />
              </div>
            </Card>
          </Col>
          <Col>
            <Card hoverable className="dashboard-card" onClick={() => navigateTo("/en-curso")}>
              <div className="dashboard-card-content">
                <PlayCircleOutlined className="dashboard-card-icon" />
                <Meta title="En curso" description="Abrir alabanzas una a una" className="dashboard-card-meta" />
              </div>
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default Dashboard
