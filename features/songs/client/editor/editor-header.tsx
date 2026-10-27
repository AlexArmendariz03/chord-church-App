"use client"

import { ArrowLeftOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons"
import { Button, Card, Checkbox, Col, Input, Row, Select, Space, Typography } from "antd"
import type { SongCategory } from "@/types/services"
import { CARD_STYLE } from "./constants"

const { Title, Text } = Typography

export type SongFields = {
  songName: string
  songKey: string
  songCategory: SongCategory
  isYouth: boolean
  isService: boolean
}

type EditorHeaderProps = {
  isEditing: boolean
  fields: SongFields
  onChange: (patch: Partial<SongFields>) => void
  hasBlocks: boolean
  onAddBlock: () => void
  onReorder: () => void
  onBack: () => void
  onSave: () => void
}

// Nombre, tono, tipo y etiquetas de la alabanza, con las acciones del editor
export const EditorHeader = ({ isEditing, fields, onChange, hasBlocks, onAddBlock, onReorder, onBack, onSave }: EditorHeaderProps) => (
  <Card style={CARD_STYLE} styles={{ body: { padding: 14 } }}>
    <Row
      gutter={[12, 12]} align="middle"
      justify="space-between">
      <Col flex="auto">
        <Title level={4} style={{ margin: 0 }}>
          {isEditing ? "Editar alabanza" : "Crear alabanza"}
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Haz clic en un texto del tablero para editarlo. Escribe cada acorde en la línea de arriba de la letra.
        </Text>
      </Col>

      <Col>
        <Space wrap>
          <Input
            placeholder="Nombre de la alabanza" value={fields.songName}
            onChange={e => onChange({ songName: e.target.value })} />
          <Input
            placeholder="Tono (ej. C, Em, F#)" value={fields.songKey}
            onChange={e => onChange({ songKey: e.target.value })}
            style={{ width: 150 }} />
          <Select
            value={fields.songCategory} onChange={value => onChange({ songCategory: value })}
            style={{ width: 150 }}
            options={[
              { label: "Júbilo", value: "jubilo" },
              { label: "Adoración", value: "adoracion" }
            ]} />
          <Checkbox checked={fields.isYouth} onChange={e => onChange({ isYouth: e.target.checked })}>
            Jóvenes
          </Checkbox>
          <Checkbox checked={fields.isService} onChange={e => onChange({ isService: e.target.checked })}>
            Servicios
          </Checkbox>
          <Button icon={<PlusOutlined />} onClick={onAddBlock}>
            Bloque
          </Button>
          <Button
            icon={<ReloadOutlined />} onClick={onReorder}
            disabled={!hasBlocks}>
            Reordenar
          </Button>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            Volver
          </Button>
          <Button type="primary" onClick={onSave}>
            {isEditing ? "Guardar cambios" : "Guardar alabanza"}
          </Button>
        </Space>
      </Col>
    </Row>
  </Card>
)
