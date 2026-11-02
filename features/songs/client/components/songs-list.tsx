"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { MoreOutlined, PlusOutlined } from "@ant-design/icons"
import { App, Button, Card, Dropdown, Empty, Grid, Listy, Segmented, Space, Tabs, Typography } from "antd"
import { useRouter } from "next/navigation"
import { useSession } from "@/features/layout/client/components/session-provider"
import { errorMessage } from "@/shared/client/api"
import { useConfirmDelete } from "@/shared/client/use-confirm-delete"
import { CategoryTag, ServiceTag, YouthTag } from "@/shared/components/category-tag"
import type { SongListItem } from "@/types/services"
import { songsApi } from "../songs-api"
import { SongPreview } from "./song-preview"

const { Paragraph, Text, Title } = Typography

type TagFilter = "all" | "youth" | "service"

const SongsList = () => {
  const { message } = App.useApp()
  const confirmDelete = useConfirmDelete()
  const router = useRouter()
  const { can } = useSession()
  const canManage = can("manageSongs")
  const [songs, setSongs] = useState<SongListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tagFilter, setTagFilter] = useState<TagFilter>("all")
  // La alabanza abierta en la vista previa para ensayar
  const [previewSong, setPreviewSong] = useState<SongListItem | null>(null)
  // Phones: the filter goes above the tabs so both tabs keep their room
  const isWide = Grid.useBreakpoint().sm ?? true

  const visibleSongs = useMemo(() => {
    if (tagFilter === "youth") return songs.filter(song => song.isYouth)
    if (tagFilter === "service") return songs.filter(song => song.isService)
    return songs
  }, [songs, tagFilter])
  const jubiloSongs = useMemo(() => visibleSongs.filter(song => song.category === "jubilo"), [visibleSongs])
  const adoracionSongs = useMemo(() => visibleSongs.filter(song => song.category === "adoracion"), [visibleSongs])

  const loadSongs = useCallback(() =>
    songsApi.list()
      .then(setSongs)
      .catch(error => message.error(errorMessage(error, "Error cargando alabanzas")))
      .finally(() => setLoading(false)), [message])

  useEffect(() => {
    loadSongs()
  }, [loadSongs])

  const deleteSong = (song: SongListItem) => confirmDelete({
    title: "Eliminar alabanza",
    content: `¿Seguro que deseas eliminar ${song.name}? También se quitará de los servicios donde esté seleccionada.`,
    remove: () => songsApi.remove(song.id),
    success: "Alabanza eliminada",
    onDeleted: loadSongs
  })

  const renderSongs = (items: SongListItem[]) => {
    if (!items.length) return <Empty description="No hay alabanzas en esta categoría" />

    return (
      <div className="list-panel">
        <Listy
          items={items}
          rowKey="id"
          itemRender={song => (
            <div className="song-row">
              <button
                type="button" className="song-row-main"
                aria-label={`Ver ${song.name}`} data-tour="ver-alabanza"
                onClick={() => setPreviewSong(song)}>
                <Text strong className="song-row-name">{song.name}</Text>
                <Paragraph
                  type="secondary" ellipsis={{ rows: 1 }}
                  className="song-row-preview">
                  {song.preview}
                </Paragraph>
              </button>
              <div className="song-row-meta">
                <Text type="secondary">Tono: {song.key}</Text>
                {song.isYouth && <YouthTag />}
                {song.isService && <ServiceTag />}
                <CategoryTag category={song.category} />
                {canManage && <Dropdown
                  trigger={["click"]}
                  menu={{
                    items: [
                      { key: "edit", label: "Editar" },
                      { key: "delete", label: "Eliminar", danger: true }
                    ],
                    onClick: ({ key }) => {
                      if (key === "edit") router.push(`/alabanzas/editar?id=${song.id}`)
                      if (key === "delete") deleteSong(song)
                    }
                  }}>
                  <Button
                    type="text" icon={<MoreOutlined />}
                    aria-label="Más acciones" data-tour="alabanza-menu" />
                </Dropdown>}
              </div>
            </div>
          )} />
      </div>
    )
  }

  const tagFilterControl = (
    <Segmented<TagFilter>
      className="songs-tag-filter" size="small"
      value={tagFilter} onChange={setTagFilter}
      options={[
        { label: "Todas", value: "all" },
        { label: "Jóvenes", value: "youth" },
        { label: "Servicios", value: "service" }
      ]} />
  )

  return (
    <div style={{ padding: 24 }}>
      <Space
        orientation="vertical" size={20}
        style={{ width: "100%" }}>
        <Card>
          <div className="page-header">
            <div>
              <Title level={2} style={{ margin: 0 }}>Alabanzas</Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                {canManage
                  ? "Toca una alabanza para verla; usa el menú de cada fila para editar o eliminar."
                  : "Toca una alabanza para ver su letra con acordes y ensayarla en el tono que necesites."}
              </Paragraph>
            </div>
            {canManage && (
              <Button
                type="primary" icon={<PlusOutlined />}
                data-tour="nueva-alabanza" onClick={() => router.push("/alabanzas/nueva")}>
                Nueva alabanza
              </Button>
            )}
          </div>
        </Card>

        <Card loading={loading} data-tour="lista-alabanzas">
          {!isWide && tagFilterControl}
          <Tabs
            tabBarExtraContent={isWide ? tagFilterControl : undefined}
            items={[
              { key: "jubilo", label: `Júbilo (${jubiloSongs.length})`, children: renderSongs(jubiloSongs) },
              { key: "adoracion", label: `Adoración (${adoracionSongs.length})`, children: renderSongs(adoracionSongs) }
            ]} />
        </Card>
      </Space>

      <SongPreview song={previewSong} onClose={() => setPreviewSong(null)} />
    </div>
  )
}

export default SongsList
