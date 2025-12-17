import { useEffect, useMemo, useState } from "react"
import { Col, Form, Row, Typography, message } from "antd"
import Layout from "@/components/layout/layout"
import CanvaPreview from "@/components/cargar/canva-preview"
import SongForm from "@/components/cargar/song-form"
import SectionsEditor from "@/components/cargar/sections-editor"
import { buildCanvaEmbedLink } from "@/lib/canva"

const baseSections = [
  { id: 1, label: "Verso o intro", tone: "C", text: "" },
  { id: 2, label: "Coro o estribillo", tone: "C", text: "" },
  { id: 3, label: "Puente o cierre", tone: "C", text: "" }
]

const CargarPage = () => {
  const [form] = Form.useForm()
  const [canvaLink, setCanvaLink] = useState("")
  const [sections, setSections] = useState(baseSections.map(section => ({ ...section })))
  const [preview, setPreview] = useState({
    title: "Nueva canción",
    tone: "C",
    sections: baseSections.map(section => ({ ...section }))
  })

  const embedLink = useMemo(() => buildCanvaEmbedLink(canvaLink), [canvaLink])

  const handleFinish = values => {
    message.success(`La canción "${values.title}" quedó lista con ${sections.length} bloques de letra.`)
  }

  const resetForm = () => {
    form.resetFields()
    setCanvaLink("")
    setSections(baseSections.map(section => ({ ...section })))
    setPreview({
      title: "Nueva canción",
      tone: "C",
      sections: baseSections.map(section => ({ ...section }))
    })
  }

  const handleValuesChange = (_, allValues) => {
    setPreview({
      title: allValues.title || "Nueva canción",
      tone: allValues.tone || "C",
      sections
    })
  }

  const handleSectionChange = (id, field, value) => {
    const updated = sections.map(section => section.id === id ? { ...section, [field]: value } : section)
    setSections(updated)
  }

  const handleMoveSection = (index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= sections.length) return
    const reordered = [...sections]
    const [removed] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, removed)
    setSections(reordered)
  }

  useEffect(() => {
    setPreview(prev => ({
      ...prev,
      sections
    }))
  }, [sections])

  return (
    <Layout>
      <div className="cargar-page">
        <div className="section-header">
          <Typography.Title level={2}>Cargar letras con tonos</Typography.Title>
          <Typography.Paragraph className="hint-text">
            Completa la información de la canción, agrega el tono en cada bloque y pega el enlace de tu diseño en Canva
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
            <SectionsEditor
              sections={sections}
              onChangeSection={handleSectionChange}
              onMove={handleMoveSection} />
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
