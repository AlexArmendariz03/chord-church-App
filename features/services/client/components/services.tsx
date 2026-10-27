"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { PlusOutlined } from "@ant-design/icons"
import { App, Button, Card, Col, Empty, Form, Modal, Row, Space, Tabs, Typography } from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "@/features/layout/client/components/session-provider"
import { songsApi } from "@/features/songs/client/songs-api"
import { errorMessage } from "@/shared/client/api"
import { useConfirmDelete } from "@/shared/client/use-confirm-delete"
import type { ServiceSummary, SongListItem } from "@/types/services"
import { servicesApi, type ServiceInput } from "../services-api"
import { ServiceCard } from "./service-card"
import { formValuesOf, ServiceForm, songFields, type ServiceFormValues } from "./service-form"

const { Title, Paragraph } = Typography

const Services = () => {
  const { message } = App.useApp()
  const confirmDelete = useConfirmDelete()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form] = Form.useForm<ServiceFormValues>()
  const { can } = useSession()
  const canManage = can("manageServices")
  const [songs, setSongs] = useState<SongListItem[]>([])
  const [services, setServices] = useState<ServiceSummary[]>([])
  // Services that already left the upcoming list; loaded the first time the tab opens
  const [pastServices, setPastServices] = useState<ServiceSummary[] | null>(null)
  const [loadingPast, setLoadingPast] = useState(false)
  const [listTab, setListTab] = useState<"upcoming" | "past">("upcoming")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  // "Editar" desde Inicio llega como ?edit=<id>; se abre una sola vez
  const urlEditApplied = useRef(false)
  // With no services yet the form is the page; once there are some, it moves into a modal
  // so the list stays in front
  const formInModal = services.length > 0

  const loadData = useCallback(() =>
    Promise.all([songsApi.list(), servicesApi.upcoming()])
      .then(([songList, serviceList]) => {
        setSongs(songList)
        setServices(serviceList)
      })
      .catch(error => message.error(errorMessage(error, "No se pudo cargar la información")))
      .finally(() => setLoading(false)), [message])

  useEffect(() => {
    loadData()
  }, [loadData])

  const loadPast = () => {
    setLoadingPast(true)
    servicesApi.past()
      .then(setPastServices)
      .catch(error => message.error(errorMessage(error, "No se pudieron cargar los servicios anteriores")))
      .finally(() => setLoadingPast(false))
  }

  const changeListTab = (key: string) => {
    setListTab(key as "upcoming" | "past")
    if (key === "past" && pastServices === null) loadPast()
  }

  // A past service as the starting point of a new one: same name and songs, new date
  const startReuse = (service: ServiceSummary) => {
    setEditingServiceId(null)
    form.resetFields()
    form.setFieldsValue({ title: service.title, ...songFields(service) })
    setFormOpen(true)
    if (!formInModal) window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const startEdit = useCallback((service: ServiceSummary) => {
    setEditingServiceId(service.id)
    form.setFieldsValue(formValuesOf(service))
    setFormOpen(true)
  }, [form])

  const startCreate = () => {
    setEditingServiceId(null)
    form.resetFields()
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingServiceId(null)
    form.resetFields()
  }

  // Se abre después de cargar, cuando el formulario ya está montado en el modal
  useEffect(() => {
    if (urlEditApplied.current || !services.length) return
    urlEditApplied.current = true
    const target = services.find(service => service.id === searchParams.get("edit"))
    // eslint-disable-next-line react-hooks/set-state-in-effect -- abre el formulario pedido en la URL, una sola vez
    if (target) startEdit(target)
  }, [services, searchParams, startEdit])

  const saveService = async (service: ServiceInput) => {
    setSaving(true)
    try {
      await servicesApi.save(editingServiceId, service)
      message.success(editingServiceId ? "Servicio actualizado correctamente" : "Servicio creado correctamente")
      closeForm()
      await loadData()
    } catch (error) {
      message.error(errorMessage(error, "Error al guardar el servicio"))
    } finally {
      setSaving(false)
    }
  }

  const deleteService = (service: ServiceSummary) => confirmDelete({
    title: "Eliminar servicio",
    content: `¿Seguro que deseas eliminar "${service.title}"? Esta acción no se puede deshacer.`,
    remove: () => servicesApi.remove(service.id),
    success: "Servicio eliminado",
    onDeleted: () => {
      if (editingServiceId === service.id) closeForm()
      if (pastServices?.some(past => past.id === service.id)) {
        setPastServices(past => past?.filter(item => item.id !== service.id) ?? null)
        return
      }
      return loadData()
    }
  })

  const serviceForm = (
    <ServiceForm
      form={form} songs={songs}
      editingServiceId={editingServiceId} saving={saving}
      onSubmit={saveService}
      onCancel={formInModal ? closeForm : undefined} />
  )

  return (
    <div style={{ padding: 24 }}>
      <Space
        orientation="vertical" size={20}
        style={{ width: "100%" }}>
        <Card>
          <Row
            align="middle" gutter={[16, 12]}
            justify="space-between">
            <Col flex="1 1 320px">
              <Title level={2} style={{ margin: 0 }}>Servicios</Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                Las canciones se tocan en el orden en que las eliges.
                Estudios y seminarios llevan solo 1 de adoración.
              </Paragraph>
            </Col>
            {canManage && formInModal && (
              <Col>
                <Button
                  type="primary" size="large"
                  icon={<PlusOutlined />} data-tour="agregar-evento"
                  onClick={startCreate}>
                  Agregar evento
                </Button>
              </Col>
            )}
          </Row>
        </Card>

        {canManage && !formInModal && !loading && (
          <Card title="Crear servicio" data-tour="agregar-evento">
            {serviceForm}
          </Card>
        )}

        {canManage && formInModal && (
          <Modal
            open={formOpen} title={editingServiceId ? "Editar servicio" : "Agregar evento"}
            onCancel={closeForm} footer={null}
            width={760} forceRender>
            {serviceForm}
          </Modal>
        )}

        <Card data-tour="lista-servicios">
          <Tabs
            activeKey={listTab} onChange={changeListTab}
            items={[
              {
                key: "upcoming",
                label: loading ? "Próximos" : `Próximos (${services.length})`,
                children: loading ? <Card loading variant="borderless" /> : services.length === 0 ? (
                  <Empty description="Aún no hay servicios programados" />
                ) : (
                  <div className="service-list">
                    {services.map((service, index) => (
                      <ServiceCard
                        key={service.id} service={service}
                        isNext={index === 0}
                        onOpen={() => router.push(`/en-curso?servicio=${service.id}`)}
                        onEdit={canManage ? () => startEdit(service) : undefined}
                        onDelete={canManage ? () => deleteService(service) : undefined} />
                    ))}
                  </div>
                )
              },
              {
                key: "past",
                label: "Anteriores",
                children: loadingPast || pastServices === null ? <Card loading variant="borderless" /> : pastServices.length === 0 ? (
                  <Empty description="Todavía no hay servicios anteriores" />
                ) : (
                  <div className="service-list">
                    {pastServices.map(service => (
                      <ServiceCard
                        key={service.id} service={service}
                        onReuse={canManage ? () => startReuse(service) : undefined}
                        onDelete={canManage ? () => deleteService(service) : undefined} />
                    ))}
                  </div>
                )
              }
            ]} />
        </Card>
      </Space>
    </div>
  )
}

export default Services
