import { Card, Col, List, Row, Tag, Typography } from "antd"
import Layout from "@/components/layout/layout"

const servicios = [
  {
    id: 1,
    nombre: "Servicio Dominical",
    fecha: "Próximo domingo 10:00 AM",
    lugar: "Auditorio principal",
    alabanzas: [
      { titulo: "Eres Fiel", tono: "G" },
      { titulo: "Glorioso Día", tono: "D" },
      { titulo: "Danzando", tono: "A" }
    ]
  },
  {
    id: 2,
    nombre: "Noche de Alabanza",
    fecha: "Próximo viernes 7:30 PM",
    lugar: "Sala juvenil",
    alabanzas: [
      { titulo: "Espíritu Ven", tono: "E" },
      { titulo: "En Tu Presencia", tono: "C" },
      { titulo: "Jardines en Llamas", tono: "B" }
    ]
  }
]

const ServiciosPage = () => (
  <Layout>
    <div className="servicios-page">
      <div className="section-header">
        <Typography.Title level={2}>Servicios próximos</Typography.Title>
        <Typography.Paragraph className="hint-text">
          Consulta las alabanzas preparadas para cada servicio y confirma los tonos antes del ensayo.
        </Typography.Paragraph>
      </div>
      <Row gutter={[16, 16]}>
        {servicios.map(servicio => (
          <Col
            xs={24}
            md={12}
            key={servicio.id}>
            <Card className="servicio-card" title={servicio.nombre}>
              <div className="servicio-meta">
                <Tag color="green">{servicio.fecha}</Tag>
                <Typography.Text type="secondary">{servicio.lugar}</Typography.Text>
              </div>
              <List
                dataSource={servicio.alabanzas}
                renderItem={item => (
                  <List.Item className="servicio-item">
                    <div>
                      <Typography.Text strong>{item.titulo}</Typography.Text>
                      <Typography.Paragraph type="secondary" className="servicio-tono">{`Tono sugerido: ${item.tono}`}</Typography.Paragraph>
                    </div>
                    <Tag color="processing">{item.tono}</Tag>
                  </List.Item>
                )} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  </Layout>
)

export default ServiciosPage
