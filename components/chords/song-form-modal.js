import { Button, Col, Form, Input, Modal, Row, Select } from "antd"

const SongFormModal = ({ open, onClose, onSubmit, form }) => (
  <Modal
    title="Registrar letra y acordes"
    open={open}
    onCancel={onClose}
    footer={null}
    width={720}>
    <Form
      layout="vertical"
      form={form}
      onFinish={onSubmit}>
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            label="Título"
            name="title"
            rules={[{ required: true, message: "Escribe el título" }]}>
            <Input placeholder="Nombre de la alabanza" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Dirigente" name="leader">
            <Input placeholder="Quien dirige" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={8}>
          <Form.Item
            label="Tono"
            name="key"
            rules={[{ required: true, message: "Define el tono" }]}>
            <Input placeholder="Ej: Mi, Re, Sol" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Tempo" name="tempo">
            <Input placeholder="Ej: 74 bpm" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Tema" name="theme">
            <Select
              placeholder="Selecciona"
              options={[
                { value: "Adoración", label: "Adoración" },
                { value: "Gratitud", label: "Gratitud" },
                { value: "Clamor", label: "Clamor" },
                { value: "Servicio", label: "Servicio" }
              ]} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        label="Letra con acordes"
        name="lyrics"
        rules={[{ required: true, message: "Pega la letra con acordes" }]}
        extra="Escribe los acordes entre corchetes [G], [D/F#] para resaltarlos.">
        <Input.TextArea rows={6} placeholder="Ej: [G] Eres mi Dios [D] en la tormenta" />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block>
          Guardar alabanza
        </Button>
      </Form.Item>
    </Form>
  </Modal>
)

export default SongFormModal
