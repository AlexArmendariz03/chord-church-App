'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Layer, Rect, Stage, Text, Group, Circle, Line } from 'react-konva';
import {
    App,
    Button,
    Card,
    Col,
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
import {
    FormatPainterOutlined,
    MinusOutlined,
    PlusOutlined,
    ReloadOutlined,
    SettingOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
} from '@ant-design/icons';


const { Title, Text: AntText } = Typography;
const { TextArea } = Input;

type AlignType = 'left' | 'center' | 'right';

type ExtraTextItem = {
    id: string;
    type: 'tone';
    text: string;
    x: number;
    y: number;
    color: string;
    fontSize: number;
};

type ContentBlockItem = {
    id: string;
    type: 'content';
    text: string;
    x: number;
    y: number;
    width: number;
    color: string;
    fontSize: number;
    align: AlignType;
};

type SongPayload = {
    boardConfig: {
        stageWidth: number;
        stageHeight: number;
        boardX: number;
        boardY: number;
        boardWidth: number;
        boardHeight: number;
        backgroundColor: string;
        borderColor: string;
        textColor: string;
        fontSize: number;
        padding: number;
        textAlign: AlignType;
        zoom: number;
    };
    contentBlocks: ContentBlockItem[];
    extraTexts: ExtraTextItem[];
};

type EditableItem = ExtraTextItem | ContentBlockItem;

const createId = () =>
    typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

const CARD_STYLE: React.CSSProperties = {
    borderRadius: 22,
    boxShadow: '0 10px 28px rgba(15,23,42,0.08)',
    border: '1px solid #eef2f6',
};

const COLOR_INPUT_STYLE: React.CSSProperties = {
    width: '100%',
    height: 38,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
};

const SECTION_STYLE: React.CSSProperties = {
    border: '1px solid #eef2f6',
    borderRadius: 16,
    padding: 14,
    background: '#fff',
};

export const UploadSongComponent = () => {
    const { message } = App.useApp();
    const previewContainerRef = useRef<HTMLDivElement | null>(null);

    const stageWidth = 1400;
    const stageHeight = 1200;

    const boardX = 120;
    const boardY = 80;

    const INITIAL_BOARD_WIDTH = 760;
    const INITIAL_BOARD_HEIGHT = 980;
    const INITIAL_BACKGROUND_COLOR = '#1f2937';
    const INITIAL_BORDER_COLOR = '#f59e0b';
    const INITIAL_TEXT_COLOR = '#ffffff';
    const INITIAL_FONT_SIZE = 18;
    const INITIAL_PADDING = 24;
    const INITIAL_TEXT_ALIGN: AlignType = 'center';
    const INITIAL_ZOOM = 0.62;

    const getInitialContentBlocks = (boardX: number, boardY: number): ContentBlockItem[] => [
        {
            id: createId(),
            type: 'content',
            text: `Escirbe aqui la letra de tu cancion `,
            x: boardX + 24,
            y: boardY + 24,
            width: 340,
            color: '#ffffff',
            fontSize: 18,
            align: 'center',
        },
    ];

    const [boardWidth, setBoardWidth] = useState(INITIAL_BOARD_WIDTH);
    const [boardHeight, setBoardHeight] = useState(INITIAL_BOARD_HEIGHT);

    const [backgroundColor, setBackgroundColor] = useState(INITIAL_BACKGROUND_COLOR);
    const [borderColor, setBorderColor] = useState(INITIAL_BORDER_COLOR);
    const [textColor, setTextColor] = useState(INITIAL_TEXT_COLOR);

    const [fontSize, setFontSize] = useState(INITIAL_FONT_SIZE);
    const [padding, setPadding] = useState(INITIAL_PADDING);
    const [textAlign, setTextAlign] = useState<AlignType>(INITIAL_TEXT_ALIGN);

    const [zoom, setZoom] = useState(INITIAL_ZOOM);

    const [contentBlocks, setContentBlocks] = useState<ContentBlockItem[]>(
        getInitialContentBlocks(boardX, boardY)
    );

    const [extraTexts, setExtraTexts] = useState<ExtraTextItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(contentBlocks[0]?.id ?? null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const selectedItem = useMemo<EditableItem | null>(() => {
        const content = contentBlocks.find((item) => item.id === selectedId);
        if (content) return content;

        const tone = extraTexts.find((item) => item.id === selectedId);
        if (tone) return tone;

        return null;
    }, [contentBlocks, extraTexts, selectedId]);

    const clampZoom = (value: number) => Math.min(2.5, Math.max(0.35, value));

    const clearSelection = () => {
        setSelectedId(null);
        setEditingId(null);
    };

    const constrainPosition = (x: number, y: number, width = 100, height = 40) => {
        const minX = boardX + 8;
        const minY = boardY + 8;
        const maxX = boardX + boardWidth - width - 8;
        const maxY = boardY + boardHeight - height - 8;

        return {
            x: Math.max(minX, Math.min(x, maxX)),
            y: Math.max(minY, Math.min(y, maxY)),
        };
    };

    const selectItem = (id: string) => {
        setSelectedId(id);
    };

    const startEditing = (id: string) => {
        setSelectedId(id);
        setEditingId(id);
    };

    const handleAddContentBlock = () => {
        const newItem: ContentBlockItem = {
            id: createId(),
            type: 'content',
            text: 'Nuevo bloque de contenido',
            x: boardX + padding + 20,
            y: boardY + padding + 20,
            width: 320,
            color: textColor,
            fontSize,
            align: textAlign,
        };

        setContentBlocks((prev) => [...prev, newItem]);
        setSelectedId(newItem.id);
        setEditingId(newItem.id);
        message.success('Bloque agregado');
    };

    const handleAddTone = () => {
        const newItem: ExtraTextItem = {
            id: createId(),
            type: 'tone',
            text: 'Em',
            x: boardX + padding + 20,
            y: boardY + padding - 28,
            color: '#2563eb',
            fontSize: 28,
        };

        setExtraTexts((prev) => [...prev, newItem]);
        setSelectedId(newItem.id);
        setEditingId(newItem.id);
        message.success('Tono agregado');
    };

    const updateSelectedItem = (field: string, value: string | number) => {
        if (!selectedItem) return;

        if (selectedItem.type === 'content') {
            setContentBlocks((prev) =>
                prev.map((item) =>
                    item.id === selectedItem.id ? { ...item, [field]: value } : item
                )
            );
            return;
        }

        setExtraTexts((prev) =>
            prev.map((item) =>
                item.id === selectedItem.id ? { ...item, [field]: value } : item
            )
        );
    };

    const deleteItemById = (id: string) => {
        const isContent = contentBlocks.some((item) => item.id === id);

        if (isContent) {
            setContentBlocks((prev) => prev.filter((item) => item.id !== id));
        } else {
            setExtraTexts((prev) => prev.filter((item) => item.id !== id));
        }

        if (selectedId === id) setSelectedId(null);
        if (editingId === id) setEditingId(null);

        message.success('Elemento eliminado');
    };

    const handleResetContentPositions = () => {
        setContentBlocks((prev) =>
            prev.map((item, index) => ({
                ...item,
                x: boardX + padding,
                y: boardY + padding + index * 150,
            }))
        );
        message.success('Bloques reordenados');
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

        const availableWidth = container.clientWidth - 40;
        const fitScale = availableWidth / stageWidth;
        setZoom(clampZoom(Number(fitScale.toFixed(2))));
        message.success('Zoom ajustado');
    };

    const getDeleteButtonPosition = (item: EditableItem) => {
        if (item.type === 'content') {
            return {
                x: item.x + item.width - 4,
                y: item.y - 6,
            };
        }

        const approxWidth = Math.max(34, item.text.length * item.fontSize * 0.58);
        return {
            x: item.x + approxWidth,
            y: item.y - 6,
        };
    };

    const [songName, setSongName] = useState('');

    const buildSongPayload = (): SongPayload => ({
        boardConfig: {
            stageWidth,
            stageHeight,
            boardX,
            boardY,
            boardWidth,
            boardHeight,
            backgroundColor,
            borderColor,
            textColor,
            fontSize,
            padding,
            textAlign,
            zoom,
        },
        contentBlocks,
        extraTexts,
    });

    const resetEditor = () => {
        const initialBlocks = getInitialContentBlocks(boardX, boardY);

        setSongName('');

        setBoardWidth(INITIAL_BOARD_WIDTH);
        setBoardHeight(INITIAL_BOARD_HEIGHT);

        setBackgroundColor(INITIAL_BACKGROUND_COLOR);
        setBorderColor(INITIAL_BORDER_COLOR);
        setTextColor(INITIAL_TEXT_COLOR);

        setFontSize(INITIAL_FONT_SIZE);
        setPadding(INITIAL_PADDING);
        setTextAlign(INITIAL_TEXT_ALIGN);

        setZoom(INITIAL_ZOOM);

        setContentBlocks(initialBlocks);
        setExtraTexts([]);

        setSelectedId(initialBlocks[0]?.id ?? null);
        setEditingId(null);
    };

    const handleSaveSong = async () => {
        try {
            if (!songName.trim()) {
                message.error('El nombre de la canción es obligatorio');
                return;
            }

            const payload = buildSongPayload();

            const response = await fetch('/api/songs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: songName,
                    payload,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al guardar');
            }

            message.success('Canción guardada con éxito');
            resetEditor();
        } catch (error) {
            message.error(
                error instanceof Error ? error.message : 'Error al guardar la canción'
            );
        }
    };

    return (
        <div
            style={{
                padding: 16,
                background: '#f5f7fb',
                height: '100vh',
                overflow: 'hidden',
                boxSizing: 'border-box',
            }}
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateRows: 'auto 1fr',
                    gap: 16,
                    height: '100%',
                    minHeight: 0,
                }}
            >
                <Card style={CARD_STYLE} styles={{ body: { padding: 14 } }}>
                    <Row gutter={[12, 12]} align="middle" justify="space-between">
                        <Col flex="auto">
                            <Space size={8} wrap>
                                <Title level={4} style={{ margin: 0 }}>
                                    Editor de canción
                                </Title>
                                <Tag color="blue">Seleccionar</Tag>
                                <Tag color="purple">Doble click</Tag>
                                <Tag color="gold">Edición directa</Tag>
                            </Space>
                        </Col>

                        <Col>
                            <Space wrap>
                                <Input
                                    placeholder="Nombre de la canción"
                                    value={songName}
                                    onChange={(e) => setSongName(e.target.value)}
                                />
                                <Button type="primary" onClick={handleSaveSong}>
                                    Guardar canción
                                </Button>

                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleAddContentBlock}
                                >
                                    Bloque
                                </Button>

                                <Button
                                    icon={<FormatPainterOutlined />}
                                    onClick={handleAddTone}
                                >
                                    Tono
                                </Button>

                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleResetContentPositions}
                                    disabled={!contentBlocks.length}
                                >
                                    Reordenar
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '300px minmax(0, 1fr)',
                        gap: 16,
                        minHeight: 0,
                        height: '100%',
                    }}
                >
                    <Card
                        style={{ ...CARD_STYLE, height: '100%' }}
                        styles={{ body: { padding: 14, height: '100%' } }}
                    >
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateRows: 'auto auto',
                                gap: 14,
                            }}
                        >
                            <div style={SECTION_STYLE}>
                                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                                    <div>
                                        <Title level={5} style={{ margin: 0 }}>
                                            Propiedades
                                        </Title>
                                        <AntText type="secondary" style={{ fontSize: 13 }}>
                                            Elemento seleccionado
                                        </AntText>
                                    </div>

                                    {selectedItem ? (
                                        <>
                                            <Tag color={selectedItem.type === 'content' ? 'blue' : 'purple'}>
                                                {selectedItem.type === 'content' ? 'Bloque' : 'Tono'}
                                            </Tag>

                                            <div>
                                                <AntText strong style={{ fontSize: 13 }}>Texto</AntText>
                                                {selectedItem.type === 'content' ? (
                                                    <TextArea
                                                        value={selectedItem.text}
                                                        onChange={(e) =>
                                                            updateSelectedItem('text', e.target.value)
                                                        }
                                                        rows={4}
                                                        style={{ marginTop: 6, borderRadius: 10 }}
                                                        placeholder="Escribe el contenido"
                                                    />
                                                ) : (
                                                    <Input
                                                        value={selectedItem.text}
                                                        onChange={(e) =>
                                                            updateSelectedItem('text', e.target.value)
                                                        }
                                                        style={{ marginTop: 6 }}
                                                        placeholder="Ej. Em, G, C"
                                                    />
                                                )}
                                            </div>

                                            <div>
                                                <AntText strong style={{ fontSize: 13 }}>
                                                    Tamaño: {selectedItem.fontSize}px
                                                </AntText>
                                                <Slider
                                                    min={14}
                                                    max={60}
                                                    value={selectedItem.fontSize}
                                                    onChange={(value) =>
                                                        updateSelectedItem('fontSize', value)
                                                    }
                                                    style={{ margin: '4px 0 0' }}
                                                />
                                            </div>

                                            {selectedItem.type === 'content' && (
                                                <Row gutter={[10, 10]}>
                                                    <Col span={12}>
                                                        <AntText strong style={{ fontSize: 13 }}>
                                                            Ancho
                                                        </AntText>
                                                        <Slider
                                                            min={180}
                                                            max={700}
                                                            value={selectedItem.width}
                                                            onChange={(value) =>
                                                                updateSelectedItem('width', value)
                                                            }
                                                            style={{ margin: '4px 0 0' }}
                                                        />
                                                    </Col>

                                                    <Col span={12}>
                                                        <AntText strong style={{ fontSize: 13 }}>
                                                            Alineación
                                                        </AntText>
                                                        <Select
                                                            value={selectedItem.align}
                                                            onChange={(value) =>
                                                                updateSelectedItem('align', value)
                                                            }
                                                            size="small"
                                                            style={{ width: '100%' }}
                                                            options={[
                                                                { label: 'Izquierda', value: 'left' },
                                                                { label: 'Centro', value: 'center' },
                                                                { label: 'Derecha', value: 'right' },
                                                            ]}
                                                        />
                                                    </Col>
                                                </Row>
                                            )}

                                            <div>
                                                <AntText strong style={{ fontSize: 13 }}>Color</AntText>
                                                <div>
                                                    <input
                                                        type="color"
                                                        value={selectedItem.color}
                                                        onChange={(e) =>
                                                            updateSelectedItem('color', e.target.value)
                                                        }
                                                        style={COLOR_INPUT_STYLE}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description="Selecciona un elemento"
                                        />
                                    )}
                                </Space>
                            </div>

                            <div style={SECTION_STYLE}>
                                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                                    <Space size={6}>
                                        <SettingOutlined />
                                        <AntText strong>Tablero</AntText>
                                    </Space>

                                    <Row gutter={[8, 8]}>
                                        <Col span={8}>
                                            <AntText style={{ fontSize: 12 }}>Fondo</AntText>
                                            <input
                                                type="color"
                                                value={backgroundColor}
                                                onChange={(e) => setBackgroundColor(e.target.value)}
                                                style={COLOR_INPUT_STYLE}
                                            />
                                        </Col>

                                        <Col span={8}>
                                            <AntText style={{ fontSize: 12 }}>Borde</AntText>
                                            <input
                                                type="color"
                                                value={borderColor}
                                                onChange={(e) => setBorderColor(e.target.value)}
                                                style={COLOR_INPUT_STYLE}
                                            />
                                        </Col>

                                        <Col span={8}>
                                            <AntText style={{ fontSize: 12 }}>Texto</AntText>
                                            <input
                                                type="color"
                                                value={textColor}
                                                onChange={(e) => setTextColor(e.target.value)}
                                                style={COLOR_INPUT_STYLE}
                                            />
                                        </Col>

                                        <Col span={12}>
                                            <AntText strong style={{ fontSize: 12 }}>
                                                Fuente base
                                            </AntText>
                                            <Slider
                                                min={14}
                                                max={60}
                                                value={fontSize}
                                                onChange={setFontSize}
                                                style={{ margin: '4px 0 0' }}
                                            />
                                        </Col>

                                        <Col span={12}>
                                            <AntText strong style={{ fontSize: 12 }}>
                                                Padding
                                            </AntText>
                                            <Slider
                                                min={8}
                                                max={80}
                                                value={padding}
                                                onChange={setPadding}
                                                style={{ margin: '4px 0 0' }}
                                            />
                                        </Col>

                                        <Col span={12}>
                                            <AntText strong style={{ fontSize: 12 }}>
                                                Ancho
                                            </AntText>
                                            <Slider
                                                min={300}
                                                max={1200}
                                                value={boardWidth}
                                                onChange={setBoardWidth}
                                                style={{ margin: '4px 0 0' }}
                                            />
                                        </Col>

                                        <Col span={12}>
                                            <AntText strong style={{ fontSize: 12 }}>
                                                Alto
                                            </AntText>
                                            <Slider
                                                min={180}
                                                max={1100}
                                                value={boardHeight}
                                                onChange={setBoardHeight}
                                                style={{ margin: '4px 0 0' }}
                                            />
                                        </Col>

                                        <Col span={24}>
                                            <AntText strong style={{ fontSize: 12 }}>
                                                Alineación base
                                            </AntText>
                                            <Select
                                                value={textAlign}
                                                onChange={(value) => setTextAlign(value)}
                                                size="small"
                                                style={{ width: '100%', marginTop: 6 }}
                                                options={[
                                                    { label: 'Izquierda', value: 'left' },
                                                    { label: 'Centro', value: 'center' },
                                                    { label: 'Derecha', value: 'right' },
                                                ]}
                                            />
                                        </Col>
                                    </Row>
                                </Space>
                            </div>
                        </div>
                    </Card>

                    <Card
                        style={{ ...CARD_STYLE, height: '100%' }}
                        styles={{ body: { padding: 14, height: '100%' } }}
                    >
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateRows: 'auto 1fr',
                                gap: 12,
                                height: '100%',
                                minHeight: 0,
                            }}
                        >
                            <Row justify="space-between" align="middle" gutter={[12, 12]}>
                                <Col flex="auto">
                                    <div>
                                        <Title level={4} style={{ margin: 0 }}>
                                            Vista previa
                                        </Title>
                                        <AntText type="secondary" style={{ fontSize: 13 }}>
                                            Click para seleccionar. Doble click para editar.
                                        </AntText>
                                    </div>
                                </Col>

                                <Col>
                                    <Space size={8} wrap>
                                        <Tooltip title="Alejar">
                                            <Button size="small" icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
                                        </Tooltip>

                                        <div
                                            style={{
                                                width: 180,
                                                padding: '0 10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                border: '1px solid #e5e7eb',
                                                borderRadius: 12,
                                                background: '#fff',
                                                height: 34,
                                            }}
                                        >
                                            <AntText strong style={{ minWidth: 42, fontSize: 12 }}>
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
                                            <Button size="small" icon={<ZoomInOutlined />} onClick={handleZoomIn} />
                                        </Tooltip>

                                        <Button size="small" icon={<ReloadOutlined />} onClick={handleResetZoom}>
                                            100%
                                        </Button>

                                        <Button size="small" icon={<MinusOutlined />} onClick={handleFitZoom}>
                                            Fit
                                        </Button>
                                    </Space>
                                </Col>
                            </Row>

                            <div
                                ref={previewContainerRef}
                                style={{
                                    border: '1px solid #e8edf3',
                                    borderRadius: 18,
                                    overflow: 'auto',
                                    background: 'linear-gradient(180deg, #fbfcfe 0%, #f4f6fa 100%)',
                                    padding: 16,
                                    minHeight: 0,
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
                                            if (clickedOnEmpty) clearSelection();
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

                                            {contentBlocks.map((item) => {
                                                const isSelected = selectedId === item.id;
                                                const deletePos = getDeleteButtonPosition(item);

                                                return (
                                                    <Group key={item.id}>
                                                        <Text
                                                            x={item.x}
                                                            y={item.y}
                                                            text={item.text}
                                                            width={item.width}
                                                            height={boardHeight - padding * 2}
                                                            fontSize={item.fontSize}
                                                            fill={item.color}
                                                            align={item.align}
                                                            lineHeight={1.3}
                                                            draggable
                                                            stroke={isSelected ? '#60a5fa' : undefined}
                                                            strokeWidth={isSelected ? 0.4 : 0}
                                                            onClick={() => selectItem(item.id)}
                                                            onTap={() => selectItem(item.id)}
                                                            onDblClick={() => startEditing(item.id)}
                                                            onDblTap={() => startEditing(item.id)}
                                                            dragBoundFunc={(pos) => {
                                                                const lines = item.text.split('\n').length;
                                                                const estimatedHeight = Math.max(42, lines * item.fontSize * 1.5);
                                                                return constrainPosition(pos.x, pos.y, item.width, estimatedHeight);
                                                            }}
                                                            onDragEnd={(e) => {
                                                                const { x, y } = e.target.position();
                                                                setContentBlocks((prev) =>
                                                                    prev.map((block) =>
                                                                        block.id === item.id ? { ...block, x, y } : block
                                                                    )
                                                                );
                                                            }}
                                                        />

                                                        {isSelected && (
                                                            <Group
                                                                x={deletePos.x}
                                                                y={deletePos.y}
                                                                onClick={(e) => {
                                                                    e.cancelBubble = true;
                                                                    deleteItemById(item.id);
                                                                }}
                                                                onTap={(e) => {
                                                                    e.cancelBubble = true;
                                                                    deleteItemById(item.id);
                                                                }}
                                                            >
                                                                <Circle
                                                                    radius={8}
                                                                    fill="rgba(15,23,42,0.72)"
                                                                    shadowBlur={2}
                                                                />
                                                                <Line
                                                                    points={[-3, -3, 3, 3]}
                                                                    stroke="#fff"
                                                                    strokeWidth={1.4}
                                                                    lineCap="round"
                                                                />
                                                                <Line
                                                                    points={[-3, 3, 3, -3]}
                                                                    stroke="#fff"
                                                                    strokeWidth={1.4}
                                                                    lineCap="round"
                                                                />
                                                            </Group>
                                                        )}
                                                    </Group>
                                                );
                                            })}

                                            {extraTexts.map((item) => {
                                                const isSelected = selectedId === item.id;
                                                const deletePos = getDeleteButtonPosition(item);

                                                return (
                                                    <Group key={item.id}>
                                                        <Text
                                                            x={item.x}
                                                            y={item.y}
                                                            text={item.text}
                                                            fontSize={item.fontSize}
                                                            fill={item.color}
                                                            fontStyle="bold"
                                                            draggable
                                                            stroke={isSelected ? '#a855f7' : undefined}
                                                            strokeWidth={isSelected ? 0.45 : 0}
                                                            onClick={() => selectItem(item.id)}
                                                            onTap={() => selectItem(item.id)}
                                                            onDblClick={() => startEditing(item.id)}
                                                            onDblTap={() => startEditing(item.id)}
                                                            dragBoundFunc={(pos) =>
                                                                constrainPosition(
                                                                    pos.x,
                                                                    pos.y,
                                                                    Math.max(36, item.text.length * item.fontSize * 0.7),
                                                                    item.fontSize + 12
                                                                )
                                                            }
                                                            onDragEnd={(e) => {
                                                                const { x, y } = e.target.position();
                                                                setExtraTexts((prev) =>
                                                                    prev.map((textItem) =>
                                                                        textItem.id === item.id ? { ...textItem, x, y } : textItem
                                                                    )
                                                                );
                                                            }}
                                                        />

                                                        {isSelected && (
                                                            <Group
                                                                x={deletePos.x}
                                                                y={deletePos.y}
                                                                onClick={(e) => {
                                                                    e.cancelBubble = true;
                                                                    deleteItemById(item.id);
                                                                }}
                                                                onTap={(e) => {
                                                                    e.cancelBubble = true;
                                                                    deleteItemById(item.id);
                                                                }}
                                                            >
                                                                <Circle
                                                                    radius={8}
                                                                    fill="rgba(15,23,42,0.72)"
                                                                    shadowBlur={2}
                                                                />
                                                                <Line
                                                                    points={[-3, -3, 3, 3]}
                                                                    stroke="#fff"
                                                                    strokeWidth={1.4}
                                                                    lineCap="round"
                                                                />
                                                                <Line
                                                                    points={[-3, 3, 3, -3]}
                                                                    stroke="#fff"
                                                                    strokeWidth={1.4}
                                                                    lineCap="round"
                                                                />
                                                            </Group>
                                                        )}
                                                    </Group>
                                                );
                                            })}
                                        </Layer>
                                    </Stage>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};