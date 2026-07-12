"use client"

import { useEffect, useMemo, useState } from "react"
import { App, Button, Card, Col, Empty, Form, Input, Modal, Row, Select, Space, Tabs, Tag, Typography } from "antd"
import type { SongWithMeta } from "@/types/services"

const { Paragraph, Title } = Typography
const { TextArea } = Input

type SongFormValues = {
  name: string
  key: string
  category: "jubilo" | "adoracion"
  lyrics: string
}

const CATEGORY_OPTIONS = [
  { label: "Júbilo", value: "jubilo" },
  { label: "Adoración", value: "adoracion" }
]

const SongsListComponent = () => {
  const { modal, message } = App.useApp()
  const [form] = Form.useForm<SongFormValues>()
  const [role, setRole] = useState("musico")
  const [songs, setSongs] = useState<SongWithMeta[]>([])
  const [editingSong, setEditingSong] = useState<SongWithMeta | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const isLeader = role === "dirigente" || role === "leader"
  const jubiloSongs = useMemo(() => songs.filter((song) => song.category === "jubilo"), [songs])
  const adoracionSongs = useMemo(() => songs.filter((song) => song.category === "adoracion"), [songs])

  const fetchSongs = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/songs")
      const data = (await response.json()) as SongWithMeta[]
      if (!response.ok) throw new Error("No se pudieron cargar las alabanzas")
      setSongs(data)
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error cargando alabanzas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setRole(localStorage.getItem("userRole") ?? "musico")
    fetchSongs()
  }, [])

  const openEditModal = (song: SongWithMeta) => {
    setEditingSong(song)
    form.setFieldsValue({ name: song.name, key: song.key, category: song.category, lyrics: song.lyrics })
  }

  const closeEditModal = () => {
    setEditingSong(null)
    form.resetFields()
  }

  const updateSong = async (values: SongFormValues) => {
    if (!editingSong) return
    setSaving(true)
    try {
      const response = await fetch(`/api/songs/${editingSong.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message ?? "Error al actualizar")
      message.success("Alabanza actualizada")
      closeEditModal()
      await fetchSongs()
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al actualizar")
    } finally {
      setSaving(false)
    }
  }

  const deleteSong = (song: SongWithMeta) => {
    modal.confirm({
      title: "Eliminar alabanza",
      content: `¿Seguro que deseas eliminar ${song.name}? También se quitará de los servicios donde esté seleccionada.`,
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      async onOk() {
        const response = await fetch(`/api/songs/${song.id}`, { method: "DELETE" })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message ?? "Error al eliminar")
        message.success("Alabanza eliminada")
        await fetchSongs()
      }
    })
  }

  const renderSongs = (items: SongWithMeta[]) => {
    if (!items.length) return <Empty description="No hay alabanzas en esta categoría" />

    return (
      <Row gutter={[16, 16]}>
        {items.map((song) => (
          <Col xs={24} md={12} xl={8} key={song.id}>
            <Card
              title={song.name}
              extra={<Tag color={song.category === "jubilo" ? "green" : "purple"}>{song.category === "jubilo" ? "Júbilo" : "Adoración"}</Tag>}
              actions={[
                <Button type="link" key="edit" onClick={() => openEditModal(song)}>Editar</Button>,
                <Button type="link" danger key="delete" onClick={() => deleteSong(song)}>Eliminar</Button>
              ]}
            >
              <Title level={5}>Tono: {song.key}</Title>
              <Paragraph ellipsis={{ rows: 5, expandable: true, symbol: "ver más" }} style={{ whiteSpace: "pre-wrap" }}>
                {song.lyrics}
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    )
  }

  if (!isLeader) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Title level={3}>Acceso solo para dirigente</Title>
          <Paragraph>El músico solo puede consultar las alabanzas dentro de Servicios o En curso.</Paragraph>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        <Card>
          <Title level={2}>Lista de alabanzas</Title>
          <Paragraph>
            Administra las alabanzas creadas. Entra a cada pestaña para editar tonos, letras, categoría o eliminar registros.
          </Paragraph>
        </Card>

        <Card loading={loading}>
          <Tabs
            items={[
              { key: "jubilo", label: `Júbilo (${jubiloSongs.length})`, children: renderSongs(jubiloSongs) },
              { key: "adoracion", label: `Adoración (${adoracionSongs.length})`, children: renderSongs(adoracionSongs) }
            ]}
          />
        </Card>
      </Space>

      <Modal title="Editar alabanza" open={Boolean(editingSong)} onCancel={closeEditModal} footer={null} destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={updateSong}>
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: "Escribe el nombre" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="key" label="Tono" rules={[{ required: true, message: "Escribe el tono" }]}>
            <Input placeholder="Ej. C, D, Em" />
          </Form.Item>
          <Form.Item name="category" label="Categoría" rules={[{ required: true, message: "Selecciona categoría" }]}>
            <Select options={CATEGORY_OPTIONS} />
          </Form.Item>
          <Form.Item name="lyrics" label="Letra" rules={[{ required: true, message: "Escribe la letra" }]}>
            <TextArea rows={8} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving} block>
            Guardar cambios
          </Button>
        </Form>
      </Modal>
    </div>
  )
}

export default SongsListComponent
