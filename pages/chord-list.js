import { Card, Checkbox, Col, Input, List, Row, Typography } from "antd"
import { useMemo, useState } from "react"
import Layout from "@/components/layout/layout"

const canciones = [
  { id: 1, titulo: "Cielos y Tierra", tono: "E" },
  { id: 2, titulo: "La Cruz", tono: "B" },
  { id: 3, titulo: "Abres Camino", tono: "D" },
  { id: 4, titulo: "Incomparable", tono: "G" },
  { id: 5, titulo: "Tu Fidelidad", tono: "F" },
  { id: 6, titulo: "Jesús", tono: "C" }
]

const ChordListPage = () => {
  const [seleccionadas, setSeleccionadas] = useState([])
  const [filtro, setFiltro] = useState("")

  const visibles = useMemo(() => canciones.filter(cancion =>
    cancion.titulo.toLowerCase().includes(filtro.toLowerCase())
  ), [filtro])

  const toggleCancion = id => {
    setSeleccionadas(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])
  }

  return (
    <Layout>
      <div className="chord-list-page">
        <div className="section-header">
          <Typography.Title level={2}>Chord List</Typography.Title>
          <Typography.Paragraph className="hint-text">
            Marca las alabanzas que usarás en la reunión y confirma el tono.
          </Typography.Paragraph>
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card className="chord-list-card" title="Selecciona alabanzas">
              <Input.Search
                placeholder="Buscar por título"
                allowClear
                value={filtro}
                onChange={event => setFiltro(event.target.value)} />
              <List
                dataSource={visibles}
                renderItem={item => (
                  <List.Item className="chord-item">
                    <Checkbox
                      checked={seleccionadas.includes(item.id)}
                      onChange={() => toggleCancion(item.id)}>
                      <div className="chord-text">
                        <Typography.Text strong>{item.titulo}</Typography.Text>
                        <Typography.Paragraph type="secondary">Tono: {item.tono}</Typography.Paragraph>
                      </div>
                    </Checkbox>
                  </List.Item>
                )} />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className="chord-summary-card" title="Alabanzas seleccionadas">
              {seleccionadas.length ? (
                <List
                  dataSource={canciones.filter(c => seleccionadas.includes(c.id))}
                  renderItem={item => (
                    <List.Item>
                      <Typography.Text>{item.titulo} — {item.tono}</Typography.Text>
                    </List.Item>
                  )} />
              ) : (
                <Typography.Paragraph className="hint-text">
                  Aún no has seleccionado alabanzas.
                </Typography.Paragraph>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  )
}

export default ChordListPage
