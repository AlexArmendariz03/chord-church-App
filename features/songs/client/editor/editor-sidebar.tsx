"use client"

import { useState, type CSSProperties } from "react"
import { SettingOutlined } from "@ant-design/icons"
import { Button, Card, Col, Empty, Input, Row, Select, Slider, Space, Tag, Typography } from "antd"
import { ALIGN_OPTIONS, CARD_STYLE, STYLE_PRESETS, type StylePreset } from "./constants"
import type { BoardConfig, EditableItem } from "./types"

const { Title, Text } = Typography

const COLOR_INPUT_STYLE: CSSProperties = {
  width: "100%",
  height: 38,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  padding: 0
}

const SECTION_STYLE: CSSProperties = {
  border: "1px solid #eef2f6",
  borderRadius: 16,
  padding: 14,
  background: "#fff"
}

type EditorSidebarProps = {
  selectedItem: EditableItem | null
  onUpdateSelected: (field: string, value: string | number) => void
  boardConfig: BoardConfig
  onUpdateBoard: <K extends keyof BoardConfig>(key: K, value: BoardConfig[K]) => void
  onApplyPreset: (preset: StylePreset) => void
}

const SectionTitle = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div>
    <Title level={5} style={{ margin: 0 }}>{title}</Title>
    <Text type="secondary" style={{ fontSize: 13 }}>{subtitle}</Text>
  </div>
)

// Estilos rápidos, propiedades del elemento seleccionado y diseño del tablero
export const EditorSidebar = ({ selectedItem, onUpdateSelected, boardConfig, onUpdateBoard, onApplyPreset }: EditorSidebarProps) => {
  const [showBoardSettings, setShowBoardSettings] = useState(false)

  return (
    <Card
      className="upload-editor-sidebar" style={CARD_STYLE}
      styles={{ body: { padding: 14, height: "100%" } }}>
      <div style={{ display: "grid", gridTemplateRows: "auto auto auto", gap: 14 }}>
        <div style={SECTION_STYLE}>
          <Space
            orientation="vertical" size={10}
            style={{ width: "100%" }}>
            <SectionTitle title="Estilos rápidos" subtitle="Aplica hoja, letra y acordes de una vez" />
            <Space
              orientation="vertical" size={6}
              style={{ width: "100%" }}>
              {STYLE_PRESETS.map(preset => (
                <Button
                  key={preset.key} block
                  onClick={() => onApplyPreset(preset)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 10 }}>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: preset.background,
                      border: `2px solid ${preset.border}`,
                      flexShrink: 0
                    }} />
                  {preset.name}
                </Button>
              ))}
            </Space>
          </Space>
        </div>

        <div style={SECTION_STYLE}>
          <Space
            orientation="vertical" size={10}
            style={{ width: "100%" }}>
            <SectionTitle title="Propiedades" subtitle="Elemento seleccionado" />
            {selectedItem ? (
              <>
                <Tag color={selectedItem.type === "content" ? "blue" : "purple"}>
                  {selectedItem.type === "content" ? "Bloque" : "Acorde"}
                </Tag>

                <div>
                  <Text strong style={{ fontSize: 13 }}>Texto</Text>
                  {selectedItem.type === "content" ? (
                    <Input.TextArea
                      autoSize={{ minRows: 4, maxRows: 14 }}
                      value={selectedItem.text}
                      onChange={e => onUpdateSelected("text", e.target.value)}
                      style={{ marginTop: 6, borderRadius: 10, fontFamily: "var(--font-mono)" }} />
                  ) : (
                    <Input
                      value={selectedItem.text}
                      onChange={e => onUpdateSelected("text", e.target.value)}
                      style={{ marginTop: 6 }} />
                  )}
                </div>

                <div>
                  <Text strong style={{ fontSize: 13 }}>Tamaño: {selectedItem.fontSize}px</Text>
                  <Slider
                    min={14} max={60}
                    value={selectedItem.fontSize}
                    onChange={value => onUpdateSelected("fontSize", value)}
                    style={{ margin: "4px 0 0" }} />
                </div>

                {selectedItem.type === "content" && (
                  <Row gutter={[10, 10]}>
                    <Col span={12}>
                      <Text strong style={{ fontSize: 13 }}>Ancho</Text>
                      <Slider
                        min={180} max={700}
                        value={selectedItem.width}
                        onChange={value => onUpdateSelected("width", value)}
                        style={{ margin: "4px 0 0" }} />
                    </Col>
                    <Col span={12}>
                      <Text strong style={{ fontSize: 13 }}>Alineación</Text>
                      <Select
                        size="small" value={selectedItem.align}
                        onChange={value => onUpdateSelected("align", value)}
                        style={{ width: "100%" }}
                        options={ALIGN_OPTIONS} />
                    </Col>
                  </Row>
                )}

                <div>
                  <Text strong style={{ fontSize: 13 }}>Color</Text>
                  <input
                    type="color" value={selectedItem.color}
                    onChange={e => onUpdateSelected("color", e.target.value)}
                    style={COLOR_INPUT_STYLE} />
                </div>
              </>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Selecciona un elemento" />
            )}
          </Space>
        </div>

        <div style={SECTION_STYLE}>
          <Space
            orientation="vertical" size={10}
            style={{ width: "100%" }}>
            <Button
              type="text" block
              icon={<SettingOutlined />}
              onClick={() => setShowBoardSettings(prev => !prev)}
              style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", paddingInline: 0 }}>
              Personalizar diseño del tablero {showBoardSettings ? "▲" : "▼"}
            </Button>

            {showBoardSettings && (
              <Row gutter={[8, 8]}>
                {([["backgroundColor", "Fondo"], ["borderColor", "Borde"], ["textColor", "Texto"]] as const).map(([key, label]) => (
                  <Col key={key} span={8}>
                    <Text style={{ fontSize: 12 }}>{label}</Text>
                    <input
                      type="color" value={boardConfig[key]}
                      onChange={e => onUpdateBoard(key, e.target.value)}
                      style={COLOR_INPUT_STYLE} />
                  </Col>
                ))}

                {([
                  ["fontSize", "Fuente base", 14, 60],
                  ["padding", "Margen interno", 8, 80],
                  ["boardWidth", "Ancho", 300, 1200],
                  ["boardHeight", "Alto", 180, 3500]
                ] as const).map(([key, label, min, max]) => (
                  <Col key={key} span={12}>
                    <Text strong style={{ fontSize: 12 }}>{label}</Text>
                    <Slider
                      min={min} max={max}
                      value={boardConfig[key]}
                      onChange={value => onUpdateBoard(key, value)}
                      style={{ margin: "4px 0 0" }} />
                  </Col>
                ))}

                <Col span={24}>
                  <Text strong style={{ fontSize: 12 }}>Alineación base</Text>
                  <Select
                    size="small" value={boardConfig.textAlign}
                    onChange={value => onUpdateBoard("textAlign", value)}
                    style={{ width: "100%", marginTop: 6 }}
                    options={ALIGN_OPTIONS} />
                </Col>
              </Row>
            )}
          </Space>
        </div>
      </div>
    </Card>
  )
}
