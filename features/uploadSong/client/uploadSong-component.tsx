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
import {BoardConfig, Interfaces, ExtraTextItem, SongPayload} from "@/types/UploadSong/interfaces";

const { Title, Text: AntText } = Typography;
const { TextArea } = Input;

type EditableItem = ExtraTextItem | Interfaces;

const STAGE = {
    width: 1400,
    height: 1200,
};

const BOARD = {
    x: 120,
    y: 80,
};

const INITIAL_BOARD_CONFIG: BoardConfig = {
    boardWidth: 760,
    boardHeight: 980,
    backgroundColor: '#1f2937',
    borderColor: '#f59e0b',
    textColor: '#ffffff',
    fontSize: 18,
    padding: 24,
    textAlign: 'center',
    zoom: 0.62,
};

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

const ALIGN_OPTIONS = [
    { label: 'Izquierda', value: 'left' },
    { label: 'Centro', value: 'center' },
    { label: 'Derecha', value: 'right' },
];

const createId = () =>
    typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

const clampZoom = (value: number) => Math.min(2.5, Math.max(0.35, value));

const createInitialBlock = (): Interfaces => ({
    id: createId(),
    type: 'content',
    text: 'Escribe aquí la letra de tu canción',
    x: BOARD.x + 24,
    y: BOARD.y + 24,
    width: 340,
    color: '#ffffff',
    fontSize: 18,
    align: 'center',
});

export const UploadSongComponent = () => {
    const { message } = App.useApp();
    const previewContainerRef = useRef<HTMLDivElement | null>(null);

    const [songName, setSongName] = useState('');
    const [songKey, setSongKey] = useState('C');
    const [songCategory, setSongCategory] = useState<'jubilo' | 'adoracion'>('jubilo');
    const [boardConfig, setBoardConfig] = useState<BoardConfig>(INITIAL_BOARD_CONFIG);
    const [contentBlocks, setContentBlocks] = useState<Interfaces[]>([createInitialBlock()]);
    const [extraTexts, setExtraTexts] = useState<ExtraTextItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selectedItem = useMemo<EditableItem | null>(() => {
        return (
            contentBlocks.find((item) => item.id === selectedId) ||
            extraTexts.find((item) => item.id === selectedId) ||
            null
        );
    }, [contentBlocks, extraTexts, selectedId]);

    const updateBoardConfig = <K extends keyof BoardConfig>(key: K, value: BoardConfig[K]) => {
        setBoardConfig((prev) => ({ ...prev, [key]: value }));
    };

    const clearSelection = () => setSelectedId(null);

    const constrainPosition = (x: number, y: number, width = 100, height = 40) => {
        const minX = BOARD.x + 8;
        const minY = BOARD.y + 8;
        const maxX = BOARD.x + boardConfig.boardWidth - width - 8;
        const maxY = BOARD.y + boardConfig.boardHeight - height - 8;

        return {
            x: Math.max(minX, Math.min(x, maxX)),
            y: Math.max(minY, Math.min(y, maxY)),
        };
    };

    const handleAddContentBlock = () => {
        const newItem: Interfaces = {
            id: createId(),
            type: 'content',
            text: 'Nuevo bloque de contenido',
            x: BOARD.x + boardConfig.padding + 20,
            y: BOARD.y + boardConfig.padding + 20,
            width: 320,
            color: boardConfig.textColor,
            fontSize: boardConfig.fontSize,
            align: boardConfig.textAlign,
        };

        setContentBlocks((prev) => [...prev, newItem]);
        setSelectedId(newItem.id);
        message.success('Bloque agregado');
    };

    const handleAddTone = () => {
        const newItem: ExtraTextItem = {
            id: createId(),
            type: 'tone',
            text: 'Em',
            x: BOARD.x + boardConfig.padding + 20,
            y: BOARD.y + boardConfig.padding - 28,
            color: '#2563eb',
            fontSize: 28,
        };

        setExtraTexts((prev) => [...prev, newItem]);
        setSelectedId(newItem.id);
        message.success('Tono agregado');
    };

    const updateSelectedItem = (field: string, value: string | number) => {
        if (!selectedItem) return;

        if (selectedItem.type === 'content') {
            setContentBlocks((prev) =>
                prev.map((item) => (item.id === selectedItem.id ? { ...item, [field]: value } : item))
            );
            return;
        }

        setExtraTexts((prev) =>
            prev.map((item) => (item.id === selectedItem.id ? { ...item, [field]: value } : item))
        );
    };

    const deleteItemById = (id: string) => {
        setContentBlocks((prev) => prev.filter((item) => item.id !== id));
        setExtraTexts((prev) => prev.filter((item) => item.id !== id));
        if (selectedId === id) setSelectedId(null);
        message.success('Elemento eliminado');
    };

    const handleResetContentPositions = () => {
        setContentBlocks((prev) =>
            prev.map((item, index) => ({
                ...item,
                x: BOARD.x + boardConfig.padding,
                y: BOARD.y + boardConfig.padding + index * 150,
            }))
        );
        message.success('Bloques reordenados');
    };

    const handleZoomChange = (value: number) => updateBoardConfig('zoom', clampZoom(value));
    const handleZoomIn = () => handleZoomChange(Number((boardConfig.zoom + 0.1).toFixed(2)));
    const handleZoomOut = () => handleZoomChange(Number((boardConfig.zoom - 0.1).toFixed(2)));
    const handleResetZoom = () => handleZoomChange(1);

    const handleFitZoom = () => {
        const container = previewContainerRef.current;
        if (!container) return;

        const availableWidth = container.clientWidth - 40;
        handleZoomChange(Number((availableWidth / STAGE.width).toFixed(2)));
        message.success('Zoom ajustado');
    };

    const getDeleteButtonPosition = (item: EditableItem) => {
        if (item.type === 'content') {
            return { x: item.x + item.width - 4, y: item.y - 6 };
        }

        const approxWidth = Math.max(34, item.text.length * item.fontSize * 0.58);
        return { x: item.x + approxWidth, y: item.y - 6 };
    };

    const buildSongPayload = (): SongPayload => ({
        boardConfig: {
            stageWidth: STAGE.width,
            stageHeight: STAGE.height,
            boardX: BOARD.x,
            boardY: BOARD.y,
            ...boardConfig,
        },
        contentBlocks,
        extraTexts,
    });

    const resetEditor = () => {
        setSongName('');
        setSongKey('C');
        setSongCategory('jubilo');
        setBoardConfig(INITIAL_BOARD_CONFIG);
        setContentBlocks([createInitialBlock()]);
        setExtraTexts([]);
        setSelectedId(null);
    };

    const handleSaveSong = async () => {
        try {
            if (!songName.trim() || !songKey.trim()) {
                message.error('El nombre y tono de la canción son obligatorios');
                return;
            }

            const lyrics = contentBlocks.map((block) => block.text.trim()).filter(Boolean).join('\n\n');

            if (!lyrics.trim()) {
                message.error('La letra de la canción es obligatoria');
                return;
            }

            const response = await fetch('/api/songs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: songName,
                    key: songKey,
                    category: songCategory,
                    lyrics,
                    payload: buildSongPayload(),
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
                            </Space>
                        </Col>

                        <Col>
                            <Space wrap>
                                <Input
                                    placeholder="Nombre de la canción"
                                    value={songName}
                                    onChange={(e) => setSongName(e.target.value)}
                                />
                                <Input
                                    placeholder="Tono (ej. C, Em, F#)"
                                    value={songKey}
                                    onChange={(e) => setSongKey(e.target.value)}
                                    style={{ width: 150 }}
                                />
                                <Select
                                    value={songCategory}
                                    onChange={setSongCategory}
                                    style={{ width: 150 }}
                                    options={[
                                        { label: 'Júbilo', value: 'jubilo' },
                                        { label: 'Adoración', value: 'adoracion' },
                                    ]}
                                />
                                <Button type="primary" onClick={handleSaveSong}>
                                    Guardar canción
                                </Button>
                                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddContentBlock}>
                                    Bloque
                                </Button>
                                <Button icon={<FormatPainterOutlined />} onClick={handleAddTone}>
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
                    <Card style={{ ...CARD_STYLE, height: '100%' }} styles={{ body: { padding: 14, height: '100%' } }}>
                        <div style={{ display: 'grid', gridTemplateRows: 'auto auto', gap: 14 }}>
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
                                                <AntText strong style={{ fontSize: 13 }}>
                                                    Texto
                                                </AntText>

                                                {selectedItem.type === 'content' ? (
                                                    <TextArea
                                                        rows={4}
                                                        value={selectedItem.text}
                                                        onChange={(e) => updateSelectedItem('text', e.target.value)}
                                                        style={{ marginTop: 6, borderRadius: 10 }}
                                                    />
                                                ) : (
                                                    <Input
                                                        value={selectedItem.text}
                                                        onChange={(e) => updateSelectedItem('text', e.target.value)}
                                                        style={{ marginTop: 6 }}
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
                                                    onChange={(value) => updateSelectedItem('fontSize', value)}
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
                                                            onChange={(value) => updateSelectedItem('width', value)}
                                                            style={{ margin: '4px 0 0' }}
                                                        />
                                                    </Col>

                                                    <Col span={12}>
                                                        <AntText strong style={{ fontSize: 13 }}>
                                                            Alineación
                                                        </AntText>
                                                        <Select
                                                            size="small"
                                                            value={selectedItem.align}
                                                            onChange={(value) => updateSelectedItem('align', value)}
                                                            style={{ width: '100%' }}
                                                            options={ALIGN_OPTIONS}
                                                        />
                                                    </Col>
                                                </Row>
                                            )}

                                            <div>
                                                <AntText strong style={{ fontSize: 13 }}>
                                                    Color
                                                </AntText>
                                                <input
                                                    type="color"
                                                    value={selectedItem.color}
                                                    onChange={(e) => updateSelectedItem('color', e.target.value)}
                                                    style={COLOR_INPUT_STYLE}
                                                />
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
                                                value={boardConfig.backgroundColor}
                                                onChange={(e) => updateBoardConfig('backgroundColor', e.target.value)}
                                                style={COLOR_INPUT_STYLE}
                                            />
                                        </Col>

                                        <Col span={8}>
                                            <AntText style={{ fontSize: 12 }}>Borde</AntText>
                                            <input
                                                type="color"
                                                value={boardConfig.borderColor}
                                                onChange={(e) => updateBoardConfig('borderColor', e.target.value)}
                                                style={COLOR_INPUT_STYLE}
                                            />
                                        </Col>

                                        <Col span={8}>
                                            <AntText style={{ fontSize: 12 }}>Texto</AntText>
                                            <input
                                                type="color"
                                                value={boardConfig.textColor}
                                                onChange={(e) => updateBoardConfig('textColor', e.target.value)}
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
                                                value={boardConfig.fontSize}
                                                onChange={(value) => updateBoardConfig('fontSize', value)}
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
                                                value={boardConfig.padding}
                                                onChange={(value) => updateBoardConfig('padding', value)}
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
                                                value={boardConfig.boardWidth}
                                                onChange={(value) => updateBoardConfig('boardWidth', value)}
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
                                                value={boardConfig.boardHeight}
                                                onChange={(value) => updateBoardConfig('boardHeight', value)}
                                                style={{ margin: '4px 0 0' }}
                                            />
                                        </Col>

                                        <Col span={24}>
                                            <AntText strong style={{ fontSize: 12 }}>
                                                Alineación base
                                            </AntText>
                                            <Select
                                                size="small"
                                                value={boardConfig.textAlign}
                                                onChange={(value) => updateBoardConfig('textAlign', value)}
                                                style={{ width: '100%', marginTop: 6 }}
                                                options={ALIGN_OPTIONS}
                                            />
                                        </Col>
                                    </Row>
                                </Space>
                            </div>
                        </div>
                    </Card>

                    <Card style={{ ...CARD_STYLE, height: '100%' }} styles={{ body: { padding: 14, height: '100%' } }}>
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
                                            Click para seleccionar
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
                                                {Math.round(boardConfig.zoom * 100)}%
                                            </AntText>
                                            <Slider
                                                min={35}
                                                max={250}
                                                value={Math.round(boardConfig.zoom * 100)}
                                                onChange={(value) => handleZoomChange(value / 100)}
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
                                        width: STAGE.width * boardConfig.zoom,
                                        height: STAGE.height * boardConfig.zoom,
                                        margin: '0 auto',
                                        transform: `scale(${boardConfig.zoom})`,
                                        transformOrigin: 'top left',
                                    }}
                                >
                                    <Stage
                                        width={STAGE.width}
                                        height={STAGE.height}
                                        onMouseDown={(e) => {
                                            if (e.target === e.target.getStage()) clearSelection();
                                        }}
                                    >
                                        <Layer>
                                            <Rect
                                                x={BOARD.x}
                                                y={BOARD.y}
                                                width={boardConfig.boardWidth}
                                                height={boardConfig.boardHeight}
                                                fill={boardConfig.backgroundColor}
                                                stroke={boardConfig.borderColor}
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
                                                            height={boardConfig.boardHeight - boardConfig.padding * 2}
                                                            fontSize={item.fontSize}
                                                            fill={item.color}
                                                            align={item.align}
                                                            lineHeight={1.3}
                                                            draggable
                                                            stroke={isSelected ? '#60a5fa' : undefined}
                                                            strokeWidth={isSelected ? 0.4 : 0}
                                                            onClick={() => setSelectedId(item.id)}
                                                            onTap={() => setSelectedId(item.id)}
                                                            onDblClick={() => setSelectedId(item.id)}
                                                            onDblTap={() => setSelectedId(item.id)}
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
                                                                <Circle radius={8} fill="rgba(15,23,42,0.72)" shadowBlur={2} />
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
                                                            onClick={() => setSelectedId(item.id)}
                                                            onTap={() => setSelectedId(item.id)}
                                                            onDblClick={() => setSelectedId(item.id)}
                                                            onDblTap={() => setSelectedId(item.id)}
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
                                                                    prev.map((tone) =>
                                                                        tone.id === item.id ? { ...tone, x, y } : tone
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
                                                                <Circle radius={8} fill="rgba(15,23,42,0.72)" shadowBlur={2} />
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