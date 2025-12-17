import Head from "next/head"
import { useMemo, useState } from "react"
import { Col, Form, Row, Typography } from "antd"
import Layout from "@/components/layout/layout"
import SongDetails from "@/components/chords/song-details"
import SetList from "@/components/chords/set-list"
import MusiciansView from "@/components/chords/musicians-view"
import SongFormModal from "@/components/chords/song-form-modal"
import initialSongs from "@/components/chords/initial-songs"
import SongLibrary from "@/components/chords/song-library"

const { Title, Paragraph } = Typography

const ChordListPage = () => {
  const [songs, setSongs] = useState(initialSongs)
  const [selectedSongId, setSelectedSongId] = useState(initialSongs[0]?.id || null)
  const [setList, setSetList] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const filteredSongs = useMemo(() => songs, [songs])
  const selectedSong = useMemo(
    () => songs.find(song => song.id === selectedSongId) || null,
    [selectedSongId, songs]
  )

  const addSongToSetList = songId => {
    if (!songId || setList.includes(songId)) return
    setSetList(prev => [...prev, songId])
  }
  const moveSong = (from, to) => {
    setSetList(prev => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }
  const removeSong = songId => setSetList(prev => prev.filter(id => id !== songId))

  const handleCreateSong = values => {
    const { title, key, tempo, leader, lyrics, theme } = values
    const newSong = {
      id: title.toLowerCase().replace(/\s+/g, "-"),
      title,
      leader,
      key,
      tempo,
      theme: theme || "Servicio",
      lyrics: [
        {
          label: "Letra & acordes",
          lines: lyrics.split("\n").filter(Boolean)
        }
      ]
    }
    setSongs(prev => [...prev, newSong])
    setSelectedSongId(newSong.id)
    setIsModalOpen(false)
    form.resetFields()
  }
  return (
    <Layout>
      <Head>
        <title>Administrador de letras y acordes</title>
        <meta name="description" content="Organiza alabanzas, acordes y servicios" />
      </Head>
      <div className="page">
        <Title level={2} className="page-title">
          Letras y acordes
        </Title>
        <Paragraph className="page-subtitle">
          El dirigente arma el servicio y los músicos consultan la letra, acordes y tono en tiempo real.
        </Paragraph>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <SongLibrary
              songs={filteredSongs}
              selectedSongId={selectedSongId}
              onSelect={setSelectedSongId}
              onAdd={addSongToSetList}
              onCreate={() => setIsModalOpen(true)} />
          </Col>
          <Col xs={24} md={16}>
            <SongDetails song={selectedSong} />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={12}>
            <SetList
              setList={setList}
              songs={songs}
              onMove={moveSong}
              onRemove={removeSong} />
          </Col>
          <Col xs={24} md={12}>
            <MusiciansView setList={setList} songs={songs} />
          </Col>
        </Row>
      </div>

      <SongFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSong}
        form={form} />
    </Layout>
  )
}

export default ChordListPage
