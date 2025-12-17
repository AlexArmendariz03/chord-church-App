import { Button, Card, List, Typography } from "antd"

const { Text } = Typography

const SetList = ({ setList, songs, onMove, onRemove }) => (
  <Card title="Orden del servicio" extra={<Text type="secondary">Músicos y multimedia</Text>}>
    {setList.length === 0 ? (
      <Text type="secondary">Aún no has agregado alabanzas al servicio.</Text>
    ) : (
      <List
        itemLayout="horizontal"
        dataSource={setList}
        renderItem={(songId, index) => {
          const song = songs.find(({ id }) => id === songId)
          if (!song) return null
          return (
            <List.Item
              actions={[
                <Button
                  key="up"
                  type="text"
                  disabled={index === 0}
                  onClick={() => onMove(index, index - 1)}>
                  Subir
                </Button>,
                <Button
                  key="down"
                  type="text"
                  disabled={index === setList.length - 1}
                  onClick={() => onMove(index, index + 1)}>
                  Bajar
                </Button>,
                <Button
                  danger
                  type="link"
                  key="remove"
                  onClick={() => onRemove(songId)}>
                  Quitar
                </Button>
              ]}>
              <List.Item.Meta title={song.title} description={`Tono ${song.key} · ${song.theme}`} />
            </List.Item>
          )
        }} />
        )}
  </Card>
)

export default SetList
