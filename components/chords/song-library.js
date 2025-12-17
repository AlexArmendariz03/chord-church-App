import { Button, Card, List, Space, Tag } from "antd"

const SongLibrary = ({ songs, selectedSongId, onSelect, onAdd, onCreate }) => (
  <Card
    title="Cancionero"
    extra={(
      <Button type="primary" onClick={onCreate}>
        Nueva alabanza
      </Button>
    )}>
    <List
      dataSource={songs}
      renderItem={song => (
        <List.Item
          className={song.id === selectedSongId ? "active-song" : ""}
          onClick={() => onSelect(song.id)}>
          <List.Item.Meta
            title={song.title}
            description={(
              <Space size="small">
                <Tag>{song.key}</Tag>
                <Tag color="purple">{song.theme}</Tag>
              </Space>
            )} />
          <Button type="link" onClick={() => onAdd(song.id)}>
            Agregar al servicio
          </Button>
        </List.Item>
      )} />
  </Card>
)

export default SongLibrary
