'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import {
    App,
    Button,
    Card,
    Col,
    Collapse,
    Empty,
    Input,
    Row,
    Select,
    Slider,
    Space,
    Tag,
    Tooltip,
    Typography,
} from 'antd';
import type { CollapseProps } from 'antd';
import {
    BgColorsOutlined,
    DeleteOutlined,
    EditOutlined,
    FontSizeOutlined,
    FormatPainterOutlined,
    HighlightOutlined,
    MinusOutlined,
    PlusOutlined,
    ReloadOutlined,
    SettingOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
} from '@ant-design/icons';

const { Title, Text: AntText } = Typography;
const { TextArea } = Input;

type ExtraTextItem = {
    id: string;
    text: string;
    x: number;
    y: number;
    color: string;
    fontSize: number;
};

export const UploadSongComponent = () => {
    const { message } = App.useApp();
    const previewContainerRef = useRef<HTMLDivElement | null>(null);

    const stageWidth = 1400;
    const stageHeight = 1200;

    const [lyrics, setLyrics] = useState(`Sublime gracia del Señor
Que a un infeliz salvó
Fui ciego mas hoy miro yo
Perdido y Él me halló`);

    const [boardX] = useState(120);
    const [boardY] = useState(80);
    const [boardWidth, setBoardWidth] = useState(740);
    const [boardHeight, setBoardHeight] = useState(980);

    const [backgroundColor, setBackgroundColor] = useState('#1f2937');
    const [borderColor, setBorderColor] = useState('#f59e0b');
    const [textColor, setTextColor] = useState('#ffffff');

    const [fontSize, setFontSize] = useState(16);
    const [padding, setPadding] = useState(24);
    const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');

    const [textX, setTextX] = useState(0);
    const [textY, setTextY] = useState(0);

    const [zoom, setZoom] = useState(0.5);

    const [extraTexts, setExtraTexts] = useState<ExtraTextItem[]>([]);
    const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

    const textAreaWidth = useMemo(() => {
        return Math.max(boardWidth - padding * 2, 100);
    }, [boardWidth, padding]);

    const selectedText =
        extraTexts.find((item) => item.id === selectedTextId) || null;

    const clampZoom = (value: number) => Math.min(2.5, Math.max(0.35, value));

    const handleAddText = () => {
        const newItem: ExtraTextItem = {
            id:
                typeof crypto !== 'undefined' && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random()}`,
            text: 'Em',
            x: boardX + padding + 20,
            y: boardY + padding - 30,
            color: '#2563eb',
            fontSize: 28,
        };

        setExtraTexts((prev) => [...prev, newItem]);
        setSelectedTextId(newItem.id);
        message.success('Tono agregado');
    };

    const handleUpdateSelectedText = (
        field: keyof Omit<ExtraTextItem, 'id'>,
        value: string | number
    ) => {
        if (!selectedTextId) return;

        setExtraTexts((prev) =>
            prev.map((item) =>
                item.id === selectedTextId ? { ...item, [field]: value } : item
            )
        );
    };

    const handleDeleteSelectedText = () => {
        if (!selectedTextId) return;

        setExtraTexts((prev) => prev.filter((item) => item.id !== selectedTextId));
        setSelectedTextId(null);
        message.success('Texto eliminado');
    };

    const handleResetMainTextPosition = () => {
        setTextX(0);
        setTextY(0);
        message.success('Verso reubicado');
    };

    const handleZoomIn = () => {
        setZoom((prev) => clampZoom(Number((prev + 0.1).toFixed(2))));
    };

    const handleZoomOut = () => {
        setZoom((prev) => clampZoom(Number((prev - 0.1).toFixed(2))));
    };

    const handleResetZoom = () => {
        setZoom(1);
    };

    const handleFitZoom = () => {
        const container = previewContainerRef.current;
        if (!container) return;

        const availableWidth = container.clientWidth - 64;
        const fitScale = availableWidth / stageWidth;
        setZoom(clampZoom(Number(fitScale.toFixed(2))));
        message.success('Zoom ajustado');
    };

    const collapseItems: CollapseProps['items'] = [
        {
            key: 'contenido',
            label: (
                <Space>
                    <EditOutlined />
                    <span>Contenido</span>
                </Space>
            ),
            children: (
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <div>
                        <AntText strong>Verso / canción</AntText>
                        <TextArea
                            value={lyrics}
                            onChange={(e) => setLyrics(e.target.value)}
                            rows={9}
                            placeholder="Escribe aquí el verso o fragmento"
                            style={{
                                borderRadius: 12,
                                marginTop: 8,
                            }}
                        />
                    </div>

                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleResetMainTextPosition}
                        block
                    >
                        Recentrar verso
                    </Button>
                </Space>
            ),
        },
        {
            key: 'tablero',
            label: (
                <Space>
                    <SettingOutlined />
                    <span>Tablero</span>
                </Space>
            ),
            children: (
                <Space direction="vertical" size={14} style={{ width: '100%' }}>
                    <Row gutter={[10, 10]}>
                        <Col span={8}>
                            <Card size="small" style={{ borderRadius: 14 }}>
                                <Space direction="vertical" size={6} style={{ width: '100%' }}>
                                    <AntText strong style={{ fontSize: 12 }}>
                                        <BgColorsOutlined /> Fondo
                                    </AntText>
                                    <input
                                        type="color"
                                        value={backgroundColor}
                                        onChange={(e) => setBackgroundColor(e.target.value)}
                                        style={{
                                            width: '100%',
                                            height: 40,
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                        }}
                                    />
                                </Space>
                            </Card>
                        </Col>

                        <Col span={8}>
                            <Card size="small" style={{ borderRadius: 14 }}>
                                <Space direction="vertical" size={6} style={{ width: '100%' }}>
                                    <AntText strong style={{ fontSize: 12 }}>
                                        <HighlightOutlined /> Borde
                                    </AntText>
                                    <input
                                        type="color"
                                        value={borderColor}
                                        onChange={(e) => setBorderColor(e.target.value)}
                                        style={{
                                            width: '100%',
                                            height: 40,
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                        }}
                                    />
                                </Space>
                            </Card>
                        </Col>

                        <Col span={8}>
                            <Card size="small" style={{ borderRadius: 14 }}>
                                <Space direction="vertical" size={6} style={{ width: '100%' }}>
                                    <AntText strong style={{ fontSize: 12 }}>
                                        <FontSizeOutlined /> Texto
                                    </AntText>
                                    <input
                                        type="color"
                                        value={textColor}
                                        onChange={(e) => setTextColor(e.target.value)}
                                        style={{
                                            width: '100%',
                                            height: 40,
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                        }}
                                    />
                                </Space>
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[12, 10]}>
                        <Col span={12}>
                            <AntText strong style={{ fontSize: 13 }}>
                                Fuente: {fontSize}px
                            </AntText>
                            <Slider
                                min={14}
                                max={60}
                                value={fontSize}
                                onChange={(value) => setFontSize(value)}
                                style={{ marginTop: 6, marginBottom: 0 }}
                            />
                        </Col>

                        <Col span={12}>
                            <AntText strong style={{ fontSize: 13 }}>
                                Padding: {padding}px
                            </AntText>
                            <Slider
                                min={8}
                                max={80}
                                value={padding}
                                onChange={(value) => setPadding(value)}
                                style={{ marginTop: 6, marginBottom: 0 }}
                            />
                        </Col>

                        <Col span={12}>
                            <AntText strong style={{ fontSize: 13 }}>
                                Ancho: {boardWidth}px
                            </AntText>
                            <Slider
                                min={300}
                                max={1200}
                                value={boardWidth}
                                onChange={(value) => setBoardWidth(value)}
                                style={{ marginTop: 6, marginBottom: 0 }}
                            />
                        </Col>

                        <Col span={12}>
                            <AntText strong style={{ fontSize: 13 }}>
                                Alto: {boardHeight}px
                            </AntText>
                            <Slider
                                min={180}
                                max={1100}
                                value={boardHeight}
                                onChange={(value) => setBoardHeight(value)}
                                style={{ marginTop: 6, marginBottom: 0 }}
                            />
                        </Col>
                    </Row>

                    <div>
                        <AntText strong style={{ fontSize: 13 }}>
                            Alineación del verso
                        </AntText>
                        <Select
                            value={textAlign}
                            onChange={(value) => setTextAlign(value)}
                            style={{ width: '100%', marginTop: 8 }}
                            options={[
                                { label: 'Izquierda', value: 'left' },
                                { label: 'Centro', value: 'center' },
                                { label: 'Derecha', value: 'right' },
                            ]}
                        />
                    </div>
                </Space>
            ),
        },
        {
            key: 'tonos',
            label: (
                <Space>
                    <FormatPainterOutlined />
                    <span>Tonos / textos manuales</span>
                </Space>
            ),
            extra: (
                <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleAddText();
                    }}
                >
                    Agregar
                </Button>
            ),
            children: selectedText ? (
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <div>
                        <AntText strong style={{ fontSize: 13 }}>
                            Tono seleccionado
                        </AntText>
                        <Input
                            value={selectedText.text}
                            onChange={(e) =>
                                handleUpdateSelectedText('text', e.target.value)
                            }
                            placeholder="Ej. Em, B7, C, G"
                            style={{ marginTop: 8 }}
                        />
                    </div>

                    <div>
                        <AntText strong style={{ fontSize: 13 }}>
                            Color
                        </AntText>
                        <div style={{ marginTop: 8 }}>
                            <input
                                type="color"
                                value={selectedText.color}
                                onChange={(e) =>
                                    handleUpdateSelectedText('color', e.target.value)
                                }
                                style={{
                                    width: '100%',
                                    height: 40,
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <AntText strong style={{ fontSize: 13 }}>
                            Tamaño: {selectedText.fontSize}px
                        </AntText>
                        <Slider
                            min={14}
                            max={60}
                            value={selectedText.fontSize}
                            onChange={(value) =>
                                handleUpdateSelectedText('fontSize', value)
                            }
                            style={{ marginTop: 6, marginBottom: 0 }}
                        />
                    </div>

                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDeleteSelectedText}
                        block
                    >
                        Eliminar tono
                    </Button>
                </Space>
            ) : (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Agrega un tono o selecciona uno dentro del tablero"
                />
            ),
        },
    ];

    return (
        <div
            style={{
                padding: 16,
                background: '#f5f7fb',
                minHeight: '100vh',
            }}
        >
            <Row gutter={[20, 20]} align="top">
                <Col xs={24} lg={8} xl={7}>
                    <div
                        style={{
                            position: 'sticky',
                            top: 16,
                        }}
                    >
                        <Space
                            direction="vertical"
                            size={16}
                            style={{ width: '100%', alignItems: 'stretch' }}
                        >
                            <Card
                                style={{
                                    borderRadius: 24,
                                    boxShadow: '0 16px 40px rgba(15,23,42,0.08)',
                                    border: '1px solid #eef2f6',
                                }}
                                styles={{ body: { padding: 20 } }}
                            >
                                <Space
                                    direction="vertical"
                                    size={12}
                                    style={{ width: '100%' }}
                                >
                                    <div>
                                        <Title level={2} style={{ margin: 0, fontSize: 28 }}>
                                            Editor de canción
                                        </Title>
                                        <AntText
                                            type="secondary"
                                            style={{ fontSize: 16 }}
                                        >
                                            Prepara versos y tonos para consultarlos o proyectarlos en otra pantalla.
                                        </AntText>
                                    </div>

                                    <Space wrap size={[8, 8]}>
                                        <Tag color="blue">Verso draggable</Tag>
                                        <Tag color="purple">Tonos manuales</Tag>
                                        <Tag color="gold">Zoom del lienzo</Tag>
                                    </Space>
                                </Space>
                            </Card>

                            <Card
                                style={{
                                    borderRadius: 24,
                                    boxShadow: '0 16px 40px rgba(15,23,42,0.08)',
                                    border: '1px solid #eef2f6',
                                }}
                                styles={{ body: { padding: 10 } }}
                            >
                                <Collapse
                                    bordered={false}
                                    defaultActiveKey={['contenido', 'tablero', 'tonos']}
                                    items={collapseItems}
                                    style={{ background: 'transparent' }}
                                />
                            </Card>
                        </Space>
                    </div>
                </Col>

                <Col xs={24} lg={16} xl={17}>
                    <Card
                        style={{
                            borderRadius: 24,
                            boxShadow: '0 16px 40px rgba(15,23,42,0.08)',
                            border: '1px solid #eef2f6',
                        }}
                        styles={{ body: { padding: 18 } }}
                    >
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            <Row justify="space-between" align="middle" gutter={[16, 16]}>
                                <Col xs={24} md={10}>
                                    <div>
                                        <Title level={3} style={{ margin: 0 }}>
                                            Vista previa
                                        </Title>
                                        <AntText type="secondary" style={{ fontSize: 15 }}>
                                            Usa zoom para revisar canciones largas y acomodar tonos con precisión.
                                        </AntText>
                                    </div>
                                </Col>

                                <Col xs={24} md={14}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            gap: 8,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <Tooltip title="Alejar">
                                            <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
                                        </Tooltip>

                                        <div
                                            style={{
                                                minWidth: 220,
                                                padding: '0 12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                                border: '1px solid #e5e7eb',
                                                borderRadius: 14,
                                                background: '#fff',
                                                height: 40,
                                            }}
                                        >
                                            <AntText strong style={{ minWidth: 50 }}>
                                                {Math.round(zoom * 100)}%
                                            </AntText>
                                            <Slider
                                                min={35}
                                                max={250}
                                                value={Math.round(zoom * 100)}
                                                onChange={(value) => setZoom(value / 100)}
                                                style={{ flex: 1, margin: 0 }}
                                            />
                                        </div>

                                        <Tooltip title="Acercar">
                                            <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
                                        </Tooltip>

                                        <Button icon={<ReloadOutlined />} onClick={handleResetZoom}>
                                            100%
                                        </Button>

                                        <Button icon={<MinusOutlined />} onClick={handleFitZoom}>
                                            Fit
                                        </Button>
                                    </div>
                                </Col>
                            </Row>

                            <div
                                ref={previewContainerRef}
                                style={{
                                    border: '1px solid #e8edf3',
                                    borderRadius: 22,
                                    overflow: 'auto',
                                    background:
                                        'linear-gradient(180deg, #fbfcfe 0%, #f4f6fa 100%)',
                                    minHeight: 760,
                                    maxHeight: '80vh',
                                    padding: 24,
                                }}
                            >
                                <div
                                    style={{
                                        width: stageWidth * zoom,
                                        height: stageHeight * zoom,
                                        margin: '0 auto',
                                        transform: `scale(${zoom})`,
                                        transformOrigin: 'top left',
                                    }}
                                >
                                    <Stage
                                        width={stageWidth}
                                        height={stageHeight}
                                        onMouseDown={(e) => {
                                            const clickedOnEmpty = e.target === e.target.getStage();
                                            if (clickedOnEmpty) {
                                                setSelectedTextId(null);
                                            }
                                        }}
                                    >
                                        <Layer>
                                            <Rect
                                                x={boardX}
                                                y={boardY}
                                                width={boardWidth}
                                                height={boardHeight}
                                                fill={backgroundColor}
                                                stroke={borderColor}
                                                strokeWidth={4}
                                                cornerRadius={18}
                                                shadowBlur={18}
                                                shadowOpacity={0.16}
                                            />

                                            <Text
                                                x={boardX + padding + textX}
                                                y={boardY + padding + textY}
                                                text={lyrics}
                                                width={textAreaWidth}
                                                height={boardHeight - padding * 2}
                                                fontSize={fontSize}
                                                fill={textColor}
                                                align={textAlign}
                                                verticalAlign="middle"
                                                lineHeight={1.3}
                                                draggable
                                                onDragEnd={(e) => {
                                                    const newX = e.target.x() - (boardX + padding);
                                                    const newY = e.target.y() - (boardY + padding);
                                                    setTextX(newX);
                                                    setTextY(newY);
                                                }}
                                            />

                                            {extraTexts.map((item) => (
                                                <Text
                                                    key={item.id}
                                                    x={item.x}
                                                    y={item.y}
                                                    text={item.text}
                                                    fontSize={item.fontSize}
                                                    fill={item.color}
                                                    fontStyle="bold"
                                                    draggable
                                                    onClick={() => setSelectedTextId(item.id)}
                                                    onTap={() => setSelectedTextId(item.id)}
                                                    onDragEnd={(e) => {
                                                        const { x, y } = e.target.position();

                                                        setExtraTexts((prev) =>
                                                            prev.map((textItem) =>
                                                                textItem.id === item.id
                                                                    ? { ...textItem, x, y }
                                                                    : textItem
                                                            )
                                                        );
                                                    }}
                                                />
                                            ))}
                                        </Layer>
                                    </Stage>
                                </div>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};