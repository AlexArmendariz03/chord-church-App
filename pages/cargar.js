import { useMemo, useState } from "react"
import { Col, Form, Row, Typography, message } from "antd"
import Layout from "@/components/layout/layout"
import CanvaPreview from "@/components/cargar/canva-preview"
import SongForm from "@/components/cargar/song-form"
import { buildCanvaEmbedLink } from "@/lib/canva"

const CargarPage = () => {
  const [form] = Form.useForm()
  const [canvaLink, setCanvaLink] = useState("")
  const [preview, setPreview] = useState({
    title: "Nueva canción",
    tone: "C",
    lyrics: ""
  })

  const embedLink = useMemo(() => buildCanvaEmbedLink(canvaLink), [canvaLink])

  const handleFinish = values => {
    message.success(`La canción "${values.title}" quedó lista para editar en Canva.`)
  }

  const resetForm = () => {
    form.resetFields()
    setCanvaLink("")
    setPreview({
      title: "Nueva canción",
      tone: "C",
      lyrics: ""
    })
  }

  const handleValuesChange = (_, allValues) => {
    setPreview({
      title: allValues.title || "Nueva canción",
      tone: allValues.tone || "C",
      lyrics: allValues.lyrics || ""
    })
  }

  return (
    <Layout>
      <div className="cargar-page">
        <div className="section-header">
          <Typography.Title level={2}>Cargar letras con tonos</Typography.Title>
          <Typography.Paragraph className="hint-text">
            Completa la información de la canción, agrega el tono y pega el enlace de tu diseño en Canva
            para generar una vista previa integrada.
          </Typography.Paragraph>
        </div>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <SongForm
              form={form}
              onFinish={handleFinish}
              onValuesChange={handleValuesChange}
              onReset={resetForm}
              onCanvaChange={setCanvaLink} />
          </Col>
          <Col xs={24} lg={12}>
            <CanvaPreview
              preview={preview}
              embedLink={embedLink}
              canvaLink={canvaLink} />
          </Col>
        </Row>
      </div>
    </Layout>
  )
}

export default CargarPage
