"use client"

import { useRef } from "react"
import { Circle, Group, Layer, Line, Rect, Stage, Text } from "react-konva"
import { MinusOutlined, ReloadOutlined, ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons"
import { App, Button, Card, Col, Row, Slider, Space, Tooltip, Typography } from "antd"
import { BOARD, CARD_STYLE, STAGE } from "./constants"
import type { BoardConfig, ContentBlock, EditableItem, ExtraTextItem } from "./types"

const { Title, Text: AntText } = Typography

type EditorCanvasProps = {
  boardConfig: BoardConfig
  stageHeight: number
  contentBlocks: ContentBlock[]
  extraTexts: ExtraTextItem[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onMove: (id: string, x: number, y: number) => void
  onDelete: (id: string) => void
  onZoomChange: (zoom: number) => void
}

// Where the ✕ to delete the selected item goes: its top-right corner
const deleteButtonPosition = (item: EditableItem) => {
  if (item.type === "content") return { x: item.x + item.width - 4, y: item.y - 6 }
  const approxWidth = Math.max(34, item.text.length * item.fontSize * 0.58)
  return { x: item.x + approxWidth, y: item.y - 6 }
}

// Small round ✕ next to the selected item
const DeleteHandle = ({ item, onDelete }: { item: EditableItem; onDelete: (id: string) => void }) => {
  const { x, y } = deleteButtonPosition(item)
  const remove = (e: { cancelBubble: boolean }) => {
    e.cancelBubble = true
    onDelete(item.id)
  }
  return (
    <Group
      x={x} y={y}
      onClick={remove} onTap={remove}>
      <Circle
        radius={8} fill="rgba(15,23,42,0.72)"
        shadowBlur={2} />
      <Line
        points={[-3, -3, 3, 3]} stroke="#fff"
        strokeWidth={1.4} lineCap="round" />
      <Line
        points={[-3, 3, 3, -3]} stroke="#fff"
        strokeWidth={1.4} lineCap="round" />
    </Group>
  )
}

// Vista previa del tablero: zoom y lienzo donde se seleccionan y arrastran los textos
export const EditorCanvas = ({
  boardConfig,
  stageHeight,
  contentBlocks,
  extraTexts,
  selectedId,
  onSelect,
  onMove,
  onDelete,
  onZoomChange
}: EditorCanvasProps) => {
  const { message } = App.useApp()
  const previewContainerRef = useRef<HTMLDivElement | null>(null)
  const { zoom } = boardConfig

  // Keeps a dragged text inside the board
  const constrainPosition = (x: number, y: number, width = 100, height = 40) => ({
    x: Math.max(BOARD.x + 8, Math.min(x, BOARD.x + boardConfig.boardWidth - width - 8)),
    y: Math.max(BOARD.y + 8, Math.min(y, BOARD.y + boardConfig.boardHeight - height - 8))
  })

  const fitZoom = () => {
    const container = previewContainerRef.current
    if (!container) return
    onZoomChange(Number(((container.clientWidth - 40) / STAGE.width).toFixed(2)))
    message.success("Zoom ajustado")
  }

  const select = (id: string) => ({
    onClick: () => onSelect(id),
    onTap: () => onSelect(id),
    onDblClick: () => onSelect(id),
    onDblTap: () => onSelect(id)
  })

  return (
    <Card
      className="upload-editor-preview" style={CARD_STYLE}
      styles={{ body: { padding: 14, height: "100%" } }}>
      <div style={{ display: "grid", gridTemplateRows: "auto 1fr", gap: 12, height: "100%", minHeight: 0 }}>
        <Row
          justify="space-between" align="middle"
          gutter={[12, 12]}>
          <Col flex="auto">
            <Title level={4} style={{ margin: 0 }}>Vista previa</Title>
            <AntText type="secondary" style={{ fontSize: 13 }}>Haz clic para seleccionar</AntText>
          </Col>

          <Col>
            <Space size={8} wrap>
              <Tooltip title="Alejar">
                <Button
                  size="small" icon={<ZoomOutOutlined />}
                  onClick={() => onZoomChange(Number((zoom - 0.1).toFixed(2)))} />
              </Tooltip>
              <div
                style={{
                  width: 180,
                  padding: "0 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1px solid var(--app-border)",
                  borderRadius: 12,
                  background: "var(--app-surface)",
                  height: 34
                }}>
                <AntText strong style={{ minWidth: 42, fontSize: 12 }}>{Math.round(zoom * 100)}%</AntText>
                <Slider
                  min={35} max={250}
                  value={Math.round(zoom * 100)}
                  onChange={value => onZoomChange(value / 100)}
                  style={{ flex: 1, margin: 0 }} />
              </div>
              <Tooltip title="Acercar">
                <Button
                  size="small" icon={<ZoomInOutlined />}
                  onClick={() => onZoomChange(Number((zoom + 0.1).toFixed(2)))} />
              </Tooltip>
              <Button
                size="small" icon={<ReloadOutlined />}
                onClick={() => onZoomChange(1)}>
                100%
              </Button>
              <Button
                size="small" icon={<MinusOutlined />}
                onClick={fitZoom}>
                Ajustar
              </Button>
            </Space>
          </Col>
        </Row>

        <div
          ref={previewContainerRef}
          style={{
            border: "1px solid var(--app-canvas-border)",
            borderRadius: 18,
            overflow: "auto",
            background: "var(--app-canvas-bg)",
            padding: 16,
            minHeight: 0
          }}>
          <div
            style={{
              width: STAGE.width * zoom,
              height: stageHeight * zoom,
              margin: "0 auto",
              transform: `scale(${zoom})`,
              transformOrigin: "top left"
            }}>
            <Stage
              width={STAGE.width} height={stageHeight}
              onMouseDown={e => {
                if (e.target === e.target.getStage()) onSelect(null)
              }}>
              <Layer>
                <Rect
                  x={BOARD.x} y={BOARD.y}
                  width={boardConfig.boardWidth} height={boardConfig.boardHeight}
                  fill={boardConfig.backgroundColor} stroke={boardConfig.borderColor}
                  strokeWidth={4} cornerRadius={18}
                  shadowBlur={18} shadowOpacity={0.16} />

                {contentBlocks.map(item => {
                  const isSelected = selectedId === item.id
                  return (
                    <Group key={item.id}>
                      <Text
                        x={item.x} y={item.y}
                        text={item.text} width={item.width}
                        height={boardConfig.boardHeight - boardConfig.padding * 2}
                        fontSize={item.fontSize} fill={item.color}
                        align={item.align} lineHeight={1.3}
                        draggable
                        stroke={isSelected ? "#60a5fa" : undefined} strokeWidth={isSelected ? 0.4 : 0}
                        {...select(item.id)}
                        dragBoundFunc={pos => {
                          const lines = item.text.split("\n").length
                          const estimatedHeight = Math.max(42, lines * item.fontSize * 1.5)
                          return constrainPosition(pos.x, pos.y, item.width, estimatedHeight)
                        }}
                        onDragEnd={e => onMove(item.id, e.target.x(), e.target.y())} />
                      {isSelected && <DeleteHandle item={item} onDelete={onDelete} />}
                    </Group>
                  )
                })}

                {extraTexts.map(item => {
                  const isSelected = selectedId === item.id
                  return (
                    <Group key={item.id}>
                      <Text
                        x={item.x} y={item.y}
                        text={item.text} fontSize={item.fontSize}
                        fill={item.color} fontStyle="bold"
                        draggable
                        stroke={isSelected ? "#3a66f0" : undefined} strokeWidth={isSelected ? 0.45 : 0}
                        {...select(item.id)}
                        dragBoundFunc={pos =>
                          constrainPosition(pos.x, pos.y, Math.max(36, item.text.length * item.fontSize * 0.7), item.fontSize + 12)}
                        onDragEnd={e => onMove(item.id, e.target.x(), e.target.y())} />
                      {isSelected && <DeleteHandle item={item} onDelete={onDelete} />}
                    </Group>
                  )
                })}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </Card>
  )
}
