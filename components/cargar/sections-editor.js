import { Button, Card, Col, Input, Row, Select, Space, Tag } from "antd"
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons"
import { tonalidades } from "@/lib/canva"

const SectionsEditor = ({ sections, onChangeSection, onMove }) => (
  <Card title="Secciones de la letra" className="sections-card">
    <Space
      direction="vertical"
      size={16}
      style={{ width: "100%" }}>
      {sections.map((section, index) => (
        <Card
          key={section.id}
          size="small"
          className="section-item"
          title={<SectionTitle index={index} label={section.label} />}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={10}>
              <Select
                value={section.tone}
                onChange={value => onChangeSection(section.id, "tone", value)}
                placeholder="Tono de la sección"
                options={tonalidades.map(t => ({ label: t, value: t }))}
                className="tone-select" />
            </Col>
            <Col
              xs={24}
              sm={14}
              className="move-controls">
              <Button
                icon={<ArrowUpOutlined />}
                disabled={index === 0}
                onClick={() => onMove(index, -1)}>
                Subir
              </Button>
              <Button
                icon={<ArrowDownOutlined />}
                disabled={index === sections.length - 1}
                onClick={() => onMove(index, 1)}>
                Bajar
              </Button>
            </Col>
            <Col span={24}>
              <Input.TextArea
                value={section.text}
                rows={3}
                placeholder="Agrega la letra y marca dónde va el tono (ej: [C]Grande es el Señor)"
                onChange={event => onChangeSection(section.id, "text", event.target.value)} />
            </Col>
          </Row>
        </Card>
      ))}
    </Space>
  </Card>
)

const SectionTitle = ({ index, label }) => (
  <Space>
    <Tag color="blue">{`Bloque ${index + 1}`}</Tag>
    <span>{label}</span>
  </Space>
)

export default SectionsEditor
