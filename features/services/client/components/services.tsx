"use client"

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import { PlusOutlined } from "@ant-design/icons"
import { App, Button, Card, Drawer, Empty, Form, Grid, Space, Tabs, Typography } from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "@/features/auth/client/session-provider"
import { songsApi } from "@/features/songs/client/songs-api"
import { errorMessage } from "@/shared/client/api"
import { useConfirmDelete } from "@/shared/client/use-confirm-delete"
import type { ServiceSummary } from "@/features/services/types"
import type { SongListItem } from "@/features/songs/types"
import { servicesApi, type ServiceInput } from "../services-api"
import { ServiceCard } from "./service-card"
import { formValuesOf, ServiceForm, songFields, type ServiceFormValues } from "./service-form"

const { Title, Paragraph } = Typography

const subscribeNothing = () => () => {}

const Services = () => {
  const { message, modal } = App.useApp()
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
  // El formulario va en un panel desde la derecha; en el teléfono ocupa toda la pantalla
  const isWide = Grid.useBreakpoint().md ?? true
  // El panel se arma de una vez (forceRender) para que el formulario exista antes de abrirlo;
  // solo en el navegador, porque en el servidor no hay dónde ponerlo y React avisa de la diferencia
  const isClient = useSyncExternalStore(subscribeNothing, () => true, () => false)

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

  // Cerrar el panel (✕, Cancelar, Esc o tocar fuera) no tira lo que ya se escribió sin preguntar
  const requestClose = () => {
    if (!form.isFieldsTouched()) {
      closeForm()
      return
    }
    modal.confirm({
      title: "¿Descartar los cambios?",
      content: "Lo que llevas del servicio no se ha guardado.",
      okText: "Descartar",
      okButtonProps: { danger: true },
      cancelText: "Seguir editando",
      onOk: closeForm
    })
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

  // Los nombres que ya se han usado, para sugerirlos al escribir uno
  const titleSuggestions = [...services, ...(pastServices ?? [])].map(service => service.title)

  const serviceForm = (
    <ServiceForm
      form={form} songs={songs}
      editingServiceId={editingServiceId} saving={saving}
      onSubmit={saveService} titleSuggestions={titleSuggestions}
      onCancel={requestClose} />
  )

  return (
    <div style={{ padding: 24 }}>
      <Space
        orientation="vertical" size={20}
        style={{ width: "100%" }}>
        <Card>
          <div className="page-header">
            <div>
              <Title level={2} style={{ margin: 0 }}>Servicios</Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                Arma el orden de alabanzas de cada fecha y la guía para quien dirige.
              </Paragraph>
            </div>
            {canManage && (
              <Button
                type="primary" icon={<PlusOutlined />}
                data-tour="agregar-evento" onClick={startCreate}>
                Nuevo servicio
              </Button>
            )}
          </div>
        </Card>

        {canManage && isClient && (
          <Drawer
            open={formOpen} onClose={requestClose}
            title={editingServiceId ? "Editar servicio" : "Nuevo servicio"}
            placement="right" size={isWide ? 760 : "100%"}
            rootClassName="service-form-drawer" forceRender
            styles={{ body: { paddingBottom: 0 } }}>
            {serviceForm}
          </Drawer>
        )}

        <Card data-tour="lista-servicios">
          <Tabs
            activeKey={listTab} onChange={changeListTab}
            items={[
              {
                key: "upcoming",
                label: loading ? "Próximos" : `Próximos (${services.length})`,
                children: loading ? <Card loading variant="borderless" /> : services.length === 0 ? (
                  <Empty description="Aún no hay servicios programados">
                    {canManage && (
                      <Button
                        type="primary" icon={<PlusOutlined />}
                        onClick={startCreate}>
                        Crear el primero
                      </Button>
                    )}
                  </Empty>
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
