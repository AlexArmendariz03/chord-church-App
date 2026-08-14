"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { MoreOutlined } from "@ant-design/icons"
import { App, Button, Card, Dropdown, Empty, List, Space, Tabs, Tag, Typography } from "antd"
import { useRouter } from "next/navigation"
import type { SongWithMeta } from "@/types/services"

const { Paragraph, Text, Title } = Typography

const SongsListComponent = () => {
  const { modal, message } = App.useApp()
  const router = useRouter()
  const [role, setRole] = useState("musico")
  const [songs, setSongs] = useState<SongWithMeta[]>([])
  const [loading, setLoading] = useState(false)

  const isLeader = role === "leader"
  const jubiloSongs = useMemo(() => songs.filter(song => song.category === "jubilo"), [songs])
  const adoracionSongs = useMemo(() => songs.filter(song => song.category === "adoracion"), [songs])

  const fetchSongs = useCallback(async () => {
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
  }, [message])

  useEffect(() => {
    setRole(localStorage.getItem("userRole") ?? "musico")
    fetchSongs()
  }, [fetchSongs])

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
      <List
        itemLayout="horizontal"
        dataSource={items}
        rowKey="id"
        renderItem={song => (
          <List.Item className="song-row">
            <div className="song-row-main">
              <Text strong className="song-row-name">{song.name}</Text>
              <Paragraph
                type="secondary" ellipsis={{ rows: 1 }}
                className="song-row-preview">
                {song.lyrics}
              </Paragraph>
            </div>
            <div className="song-row-meta">
              <Text type="secondary">Tono: {song.key}</Text>
              <Tag color={song.category === "jubilo" ? "green" : "purple"}>
                {song.category === "jubilo" ? "Júbilo" : "Adoración"}
              </Tag>
              <Dropdown
                trigger={["click"]}
                menu={{
                  items: [
                    { key: "edit", label: "Editar" },
                    { key: "delete", label: "Eliminar", danger: true }
                  ],
                  onClick: ({ key }) => {
                    if (key === "edit") router.push(`/uploadPage?id=${song.id}`)
                    if (key === "delete") deleteSong(song)
                  }
                }}>
                <Button
                  type="text" icon={<MoreOutlined />}
                  aria-label="Más acciones" />
              </Dropdown>
            </div>
          </List.Item>
        )} />
    )
  }

  if (!isLeader) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Title level={3}>Acceso solo para líder</Title>
          <Paragraph>El músico solo puede consultar las alabanzas dentro de Servicios o En curso.</Paragraph>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <Space
        direction="vertical" size={20}
        style={{ width: "100%" }}>
        <Card>
          <Title level={2}>Lista de alabanzas</Title>
          <Paragraph>
            Crea, edita y elimina alabanzas por categoría. Usa el menú de cada fila para editar en el editor visual o eliminar.
          </Paragraph>
        </Card>

        <Card loading={loading}>
          <Tabs
            items={[
              { key: "jubilo", label: `Júbilo (${jubiloSongs.length})`, children: renderSongs(jubiloSongs) },
              { key: "adoracion", label: `Adoración (${adoracionSongs.length})`, children: renderSongs(adoracionSongs) }
            ]} />
        </Card>
      </Space>
    </div>
  )
}

export default SongsListComponent
