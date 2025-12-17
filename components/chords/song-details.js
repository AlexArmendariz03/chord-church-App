import { Card, Divider, Space, Tag, Typography } from "antd"

const { Title, Paragraph, Text } = Typography

const parseLinesWithChords = line => {
  const parts = line.split(/\[([^\]]+)\]/)
  return parts.map((part, index) => {
    const isChord = index % 2 === 1
    if (!part) return null
    if (isChord) {
      return (
        <Tag
          color="blue"
          key={`${part}-${index}`}
          className="chord-tag">
          {part.trim()}
        </Tag>
      )
    }
    return (
      <Text
        key={`${part}-${index}`}
        className="lyric-text">
        {part}
      </Text>
    )
  })
}

const SongDetails = ({ song }) => {
  if (!song) {
    return (
      <Card>
        <Paragraph>Selecciona una alabanza para ver la letra y acordes.</Paragraph>
      </Card>
    )
  }

  return (
    <Card title={song.title} extra={<Tag color="green">Tono {song.key}</Tag>}>
      <Paragraph type="secondary">
        {song.theme} · {song.tempo} · {song.leader}
      </Paragraph>
      <Divider />
      {song.lyrics.map(section => (
        <div key={`${song.id}-${section.label}`} className="section">
          <Title level={5}>{section.label}</Title>
          <Space
            direction="vertical"
            size="small"
            className="section-lines">
            {section.lines.map((line, idx) => (
              <Text
                key={`${section.label}-${idx}`}
                className="line">
                {parseLinesWithChords(line)}
              </Text>
            ))}
          </Space>
          <Divider />
        </div>
      ))}
    </Card>
  )
}

export default SongDetails
