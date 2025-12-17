import { Button, Card, Tag, Typography } from "antd"

const CanvaPreview = ({ preview, embedLink, canvaLink }) => (
  <>
    <Card title="Vista previa" className="preview-card">
      <Typography.Title level={4} className="preview-title">{preview.title}</Typography.Title>
      <Typography.Text className="preview-tone">Tono principal: {preview.tone}</Typography.Text>
      <div className="lyrics-preview">
        {preview.sections?.length ? preview.sections.map(section => (
          <div className="section-preview" key={section.id}>
            <div className="section-header">
              <Tag color="geekblue">{section.tone || preview.tone}</Tag>
              <Typography.Text className="section-label">{section.label}</Typography.Text>
            </div>
            <Typography.Paragraph className="section-text">
              {section.text || "Agrega la letra de este bloque para ver la vista previa"}
            </Typography.Paragraph>
          </div>
        )) : (
          <Typography.Paragraph>
            Aquí verás tu letra con acordes y cada bloque con su tono.
          </Typography.Paragraph>
        )}
      </div>
    </Card>
    <Card title="Diseño de Canva" className="canva-card">
      {embedLink ? (
        <iframe
          className="canva-embed"
          src={embedLink}
          allowFullScreen
          loading="lazy"
          title="Vista previa de Canva" />
      ) : (
        <div className="empty-embed">
          <Typography.Text className="hint-text">Pega el enlace de Canva para ver la incrustación.</Typography.Text>
        </div>
      )}
      <div className="canva-actions">
        <Button
          type="link"
          href={canvaLink || "https://www.canva.com/"}
          target="_blank"
          rel="noreferrer">
          Abrir Canva
        </Button>
      </div>
    </Card>
  </>
)

export default CanvaPreview
