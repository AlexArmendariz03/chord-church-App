import { Card, Paragraph, Space, Tag, Typography } from "antd"

const { Title } = Typography

const MusiciansView = ({ setList, songs }) => (
  <Card title="Vista para músicos">
    {setList.length === 0 ? (
      <Paragraph type="secondary">Agrega alabanzas al servicio para generar la vista.</Paragraph>
    ) : (
      <Space
        direction="vertical"
        size="large"
        className="musicians-view">
        {setList.map(songId => {
          const song = songs.find(({ id }) => id === songId)
          if (!song) return null
          return (
            <Card
              key={`musician-${song.id}`}
              size="small"
              className="musician-card">
              <Title level={5} className="musician-title">{song.title}</Title>
              <Paragraph type="secondary">Tono {song.key} · {song.tempo}</Paragraph>
              <Space wrap>
                {song.lyrics
                  .flatMap(section => section.lines)
                  .slice(0, 3)
                  .map((line, idx) => (
                    <Tag key={`${song.id}-snippet-${idx}`}>
                      {line.replace(/\[(.*?)\]/g, "$1")}
                    </Tag>
                  ))}
              </Space>
            </Card>
          )
        })}
      </Space>
    )}
  </Card>
)

export default MusiciansView
