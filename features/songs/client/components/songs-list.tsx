"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { MoreOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons"
import { App, Button, Card, Dropdown, Empty, Grid, Input, Listy, Segmented, Space, Tabs, Typography } from "antd"
import { useRouter } from "next/navigation"
import { useSession } from "@/features/auth/client/session-provider"
import { errorMessage } from "@/shared/client/api"
import { useConfirmDelete } from "@/shared/client/use-confirm-delete"
import { CategoryTag, ServiceTag, YouthTag } from "@/features/songs/client/components/category-tag"
import type { SongListItem } from "@/features/songs/types"
import { searchSongs } from "../../song-search"
import { useSongsScope } from "../songs-scope"
import { SongPreview } from "./song-preview"

const { Paragraph, Text, Title } = Typography

type TagFilter = "all" | "youth" | "service"
type CategoryTab = SongListItem["category"]

const SongsList = () => {
  const { message } = App.useApp()
  const confirmDelete = useConfirmDelete()
  const router = useRouter()
  const { can } = useSession()
  const canManage = can("manageSongs")
  // Dentro de la página de una iglesia, su cancionero; si no, el de la sesión
  const { api: songsApi, basePath, church, onSongsChanged } = useSongsScope()
  const [songs, setSongs] = useState<SongListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tagFilter, setTagFilter] = useState<TagFilter>("all")
  const [categoryTab, setCategoryTab] = useState<CategoryTab>("jubilo")
  // Mientras hay algo escrito, la lista junta las dos categorías y muestra las que coinciden por nombre
  const [query, setQuery] = useState("")
  // La alabanza abierta en la vista previa para ensayar
  const [previewSong, setPreviewSong] = useState<SongListItem | null>(null)
  // Phones: the filter goes above the tabs so both tabs keep their room
  const isWide = Grid.useBreakpoint().sm ?? true

  const visibleSongs = useMemo(() => {
    if (tagFilter === "youth") return songs.filter(song => song.isYouth)
    if (tagFilter === "service") return songs.filter(song => song.isService)
    return songs
  }, [songs, tagFilter])
  const results = useMemo(() => searchSongs(visibleSongs, query), [visibleSongs, query])
  const isSearching = Boolean(query.trim())
  const jubiloSongs = useMemo(() => visibleSongs.filter(song => song.category === "jubilo"), [visibleSongs])
  const adoracionSongs = useMemo(() => visibleSongs.filter(song => song.category === "adoracion"), [visibleSongs])

  const loadSongs = useCallback(() =>
    songsApi.list()
      .then(setSongs)
      .catch(error => message.error(errorMessage(error, "Error cargando alabanzas")))
      .finally(() => setLoading(false)), [message, songsApi])

  useEffect(() => {
    loadSongs()
  }, [loadSongs])

  const deleteSong = (song: SongListItem) => confirmDelete({
    title: "Eliminar alabanza",
    content: `¿Seguro que deseas eliminar ${song.name}? También se quitará de los servicios donde esté seleccionada.`,
    remove: () => songsApi.remove(song.id),
    success: "Alabanza eliminada",
    onDeleted: () => {
      onSongsChanged?.()
      return loadSongs()
    }
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
                      if (key === "edit") router.push(`${basePath}/editar?id=${song.id}`)
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

  const renderResults = () => {
    if (!results.length) {
      return (
        <Empty
          description={`Ninguna alabanza se llama “${query.trim()}”`}
          image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )
    }
    return (
      <>
        <Text type="secondary" className="songs-search-count">
          {results.length} {results.length === 1 ? "alabanza" : "alabanzas"}
        </Text>
        {renderSongs(results)}
      </>
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
    // Dentro de la página de una iglesia ya hay margen alrededor
    <div style={church ? undefined : { padding: 24 }}>
      <Space
        orientation="vertical" size={20}
        style={{ width: "100%" }}>
        <Card>
          <div className="page-header">
            <div>
              <Title level={church ? 3 : 2} style={{ margin: 0 }}>Alabanzas</Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                {church ? <>Cancionero de <strong>{church.name}</strong>. </> : null}
                {canManage
                  ? "Toca una alabanza para verla; usa el menú de cada fila para editar o eliminar."
                  : "Toca una alabanza para ver su letra con acordes y ensayarla en el tono que necesites."}
              </Paragraph>
            </div>
            {canManage && (
              <Button
                type="primary" icon={<PlusOutlined />}
                data-tour="nueva-alabanza" onClick={() => router.push(`${basePath}/nueva`)}>
                Nueva alabanza
              </Button>
            )}
          </div>
        </Card>

        <Card loading={loading} data-tour="lista-alabanzas">
          <Input
            className="songs-search" allowClear
            prefix={<SearchOutlined />} value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={event => event.key === "Escape" && setQuery("")}
            placeholder="Buscar por nombre"
            aria-label="Buscar alabanzas" data-tour="buscar-alabanza" />
          {(!isWide || isSearching) && tagFilterControl}
          {isSearching ? renderResults() : <Tabs
            activeKey={categoryTab} onChange={key => setCategoryTab(key as CategoryTab)}
            tabBarExtraContent={isWide ? tagFilterControl : undefined}
            items={[
              { key: "jubilo", label: `Júbilo (${jubiloSongs.length})`, children: renderSongs(jubiloSongs) },
              { key: "adoracion", label: `Adoración (${adoracionSongs.length})`, children: renderSongs(adoracionSongs) }
            ]} />}
        </Card>
      </Space>

      <SongPreview song={previewSong} onClose={() => setPreviewSong(null)} />
    </div>
  )
}

export default SongsList
