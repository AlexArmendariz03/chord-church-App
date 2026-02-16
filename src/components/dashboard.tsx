import { AppstoreAddOutlined, UnorderedListOutlined, UploadOutlined } from "@ant-design/icons"
import { Card, Col, Row, Typography } from "antd"
import { useRouter } from "next/router"

const { Meta } = Card

const Dashboard = () => {
  const router = useRouter()

  const navigateTo = (path: string) => {
    void router.push(path)
  }

  return (
    <Row
      className="dashboard"
      justify="center"
      align="middle">
      <Col xs={24}>
        <Typography.Title level={2}>Panel de Control</Typography.Title>
        <Row justify="center" gutter={[16, 16]}>
          <Col>
            <Card
              hoverable
              className="dashboard-card"
              onClick={() => navigateTo("/uploadPage")}>
              <div className="dashboard-card-content">
                <UploadOutlined className="dashboard-card-icon" />
                <Meta
                  title="Cargar"
                  description="Sube tus archivos"
                  className="dashboard-card-meta" />
              </div>
            </Card>
          </Col>
          <Col>
            <Card
              hoverable
              className="dashboard-card"
              onClick={() => navigateTo("/servicios")}>
              <div className="dashboard-card-content">
                <AppstoreAddOutlined className="dashboard-card-icon" />
                <Meta
                  title="Servicios"
                  description="Accede a los servicios"
                  className="dashboard-card-meta" />
              </div>
            </Card>
          </Col>
          <Col>
            <Card
              hoverable
              className="dashboard-card"
              onClick={() => navigateTo("/chord-list")}>
              <div className="dashboard-card-content">
                <UnorderedListOutlined className="dashboard-card-icon" />
                <Meta
                  title="Chord List"
                  description="Ver lista de acordes"
                  className="dashboard-card-meta" />
              </div>
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default Dashboard
