import { Card , Col , Row } from "antd"


const Dashboard = () => {
  return(
    <Row
      justify="center" align="middle"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        color: "#000",
        textAlign: "center"
      }}>
      <Col xs={24}>
        <h1 style={{ marginBottom: "30px" }}>Panel de Control</h1>
        <Row justify="center" gutter={[16, 16]}>
          <Col>
            <Card
              hoverable
              style={{ width: 240 }}
              onClick={() => navigateTo("/cargar")}
              cover={<img src="/cargar.png" />}>
              <Card.Meta title="Cargar" description="Sube tus archivos" />
            </Card>
          </Col>
          <Col>
            <Card
              hoverable
              style={{ width: 240 }}
              onClick={() => navigateTo("/servicios")}
              cover={<img src="/servicios.png" />}>
              <Card.Meta title="Servicios" description="Accede a los servicios" />
            </Card>
          </Col>
          <Col>
            <Card
              hoverable
              style={{ width: 240 }}
              onClick={() => navigateTo("/chord-list")}
              cover={<img src="/chord-list.png" />}>
              <Card.Meta title="Chord List" description="Ver lista de acordes" />
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default Dashboard