import { Button, Card, Col, Form, Input, Row, Select } from "antd"
import { tonalidades } from "@/lib/canva"

const SongForm = ({ form, onFinish, onValuesChange, onReset, onCanvaChange }) => (
  <Card title="Información de la canción" className="upload-card">
    <Form
      layout="vertical"
      form={form}
      onFinish={onFinish}
      onValuesChange={onValuesChange}>
      <Form.Item
        name="title"
        label="Título"
        rules={[{ required: true, message: "Ingresa el título de la canción" }]}>
        <Input placeholder="Ej: Eres Fiel" />
      </Form.Item>
      <Form.Item
        name="tone"
        label="Tono"
        rules={[{ required: true, message: "Selecciona el tono" }]}>
        <Select
          showSearch
          placeholder="Elige el tono"
          options={tonalidades.map(tone => ({ value: tone, label: tone }))} />
      </Form.Item>
      <Form.Item
        name="lyrics"
        label="Letra con acordes"
        rules={[{ required: true, message: "Agrega la letra con sus acordes" }]}>
        <Input.TextArea
          rows={6}
          placeholder="Escribe la letra y marca los acordes, por ejemplo: [C]Grande es el Señor" />
      </Form.Item>
      <Form.Item
        name="canva"
        label="Enlace de Canva"
        extra="Pega el enlace para compartir del diseño y generaremos un embed."
        rules={[{ required: true, message: "Agrega el enlace de Canva" }]}>
        <Input
          placeholder="https://www.canva.com/design/"
          onChange={event => onCanvaChange(event.target.value)} />
      </Form.Item>
      <Row gutter={12} justify="end">
        <Col>
          <Button onClick={onReset}>Limpiar</Button>
        </Col>
        <Col>
          <Button type="primary" htmlType="submit">Guardar para Canva</Button>
        </Col>
      </Row>
    </Form>
  </Card>
)

export default SongForm
