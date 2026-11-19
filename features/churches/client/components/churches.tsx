"use client"

import { BankOutlined, LoginOutlined, PlusOutlined, SettingOutlined } from "@ant-design/icons"
import { App, Avatar, Button, Card, Empty, Form, Input, Modal, Space, Tag, Typography } from "antd"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useSession } from "@/features/auth/client/session-provider"
import type { ChurchListItem } from "@/features/churches/types"
import { errorMessage } from "@/shared/client/api"
import { churchesApi } from "../churches-api"
import { CHURCH_NAME_RULES, plural, useEnterChurch } from "./church-actions"

const { Paragraph, Text, Title } = Typography

// Página del master: todas las iglesias. Desde aquí crea una, abre su página para administrarla con
// sus usuarios, o entra a ella para trabajar en su cancionero y sus servicios
const Churches = () => {
  const { message } = App.useApp()
  const router = useRouter()
  const { church: currentChurch } = useSession()
  const { enter, enteringId } = useEnterChurch()
  const [churches, setChurches] = useState<ChurchListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createForm] = Form.useForm<{ name: string }>()

  const loadChurches = useCallback(() =>
    churchesApi.list()
      .then(setChurches)
      .catch(error => message.error(errorMessage(error, "No se pudieron cargar las iglesias")))
      .finally(() => setLoading(false)), [message])

  useEffect(() => {
    loadChurches()
  }, [loadChurches])

  // Una iglesia nueva empieza sin usuarios: se abre su página para registrarlos
  const createChurch = async ({ name }: { name: string }) => {
    setSaving(true)
    try {
      const created = await churchesApi.create(name)
      setIsCreating(false)
      message.success(`Iglesia "${created.name}" creada. Ahora registra a sus usuarios.`)
      router.push(`/iglesias/${created.id}`)
    } catch (error) {
      message.error(errorMessage(error, "Error al crear la iglesia"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Space
        orientation="vertical" size={20}
        style={{ width: "100%" }}>
        <Card>
          <div className="page-header">
            <div>
              <Title level={2} style={{ margin: 0 }}>Iglesias</Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                Cada iglesia tiene sus usuarios, su cancionero y sus servicios. Administra una para manejar a sus usuarios.
              </Paragraph>
            </div>
            <Button
              type="primary" icon={<PlusOutlined />}
              onClick={() => setIsCreating(true)}>
              Nueva iglesia
            </Button>
          </div>
        </Card>

        <Card loading={loading}>
          {churches.length === 0 ? <Empty description="Todavía no hay iglesias" /> : (
            <div className="list-panel">
              {churches.map(church => {
                const isCurrent = church.id === currentChurch?.id
                return (
                  <div key={church.id} className="users-row">
                    <Link href={`/iglesias/${church.id}`} className="users-row-name church-row-link">
                      <Avatar icon={<BankOutlined />} size={36} />
                      <span className="church-row-text">
                        <Text strong>{church.name}</Text>
                        <Text type="secondary" className="church-row-stats">
                          {plural(church.users, "usuario", "usuarios")} · {plural(church.songs, "alabanza", "alabanzas")} · {plural(church.services, "servicio", "servicios")}
                        </Text>
                      </span>
                      {isCurrent && <Tag color="blue">Actual</Tag>}
                    </Link>
                    <div className="users-row-actions">
                      <Link href={`/iglesias/${church.id}`}>
                        <Button icon={<SettingOutlined />}>Administrar</Button>
                      </Link>
                      {!isCurrent && (
                        <Button
                          icon={<LoginOutlined />} loading={enteringId === church.id}
                          onClick={() => enter(church, "/dashboard")}>
                          Entrar
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </Space>

      <Modal
        open={isCreating} title="Nueva iglesia"
        onCancel={() => setIsCreating(false)} okText="Crear iglesia"
        cancelText="Cancelar" confirmLoading={saving}
        onOk={() => createForm.submit()} destroyOnHidden>
        <Paragraph type="secondary">
          Empieza vacía: sin usuarios, alabanzas ni servicios. Al crearla se abre su página para registrar a sus usuarios.
        </Paragraph>
        {/* El modal monta el formulario al abrirse; preserve={false} lo deja vacío la siguiente vez */}
        <Form
          form={createForm} layout="vertical"
          onFinish={createChurch} requiredMark={false}
          preserve={false}>
          <Form.Item
            name="name" label="Nombre"
            rules={CHURCH_NAME_RULES}>
            <Input autoComplete="off" placeholder="Ej. Iglesia Centro" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Churches
