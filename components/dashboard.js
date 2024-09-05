import { Card , Col , Row , Typography } from "antd"
import { UploadOutlined, AppstoreAddOutlined, UnorderedListOutlined } from "@ant-design/icons"

const { Meta } = Card

const Dashboard = () => {
  return (
    <Row
      className="dashboard" justify="center"
      align="middle">
      <Col xs={24}>
        <Typography.Title level={2}>Panel de Control</Typography.Title>
        <Row justify="center" gutter={[16, 16]}>
          <Col>
            <Card
              hoverable
              className="dashboard-card"
              onClick={() => navigateTo("/cargar")}>
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
