"use client"

import { App, Form, Input, Modal } from "antd"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import type { ChurchListItem, CurrentChurch } from "@/features/churches/types"
import { ApiError, errorMessage } from "@/shared/client/api"
import { churchesApi } from "../churches-api"

// Lo que comparten la lista de iglesias y la página de cada una: entrar a una iglesia y el nombre

export const CHURCH_NAME_RULES = [
  { required: true, whitespace: true, message: "Escribe el nombre de la iglesia" },
  { min: 2, max: 80, message: "De 2 a 80 caracteres" }
]

export const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

// Carga una iglesia con sus totales para sus páginas; notFound si el id no existe
export const useChurch = (churchId: string) => {
  const { message } = App.useApp()
  const [church, setChurch] = useState<ChurchListItem | null>(null)
  const [notFound, setNotFound] = useState(false)

  const reload = useCallback(() =>
    churchesApi.get(churchId)
      .then(setChurch)
      .catch(error => {
        if (error instanceof ApiError && error.status === 404) setNotFound(true)
        else message.error(errorMessage(error, "No se pudo cargar la iglesia"))
      }), [churchId, message])

  useEffect(() => {
    reload()
  }, [reload])

  return { church, setChurch, notFound, reload }
}

// Cambia la iglesia de la sesión y va a la página indicada; router.refresh vuelve a leer la sesión
// en el encabezado
export const useEnterChurch = () => {
  const { message } = App.useApp()
  const router = useRouter()
  const [enteringId, setEnteringId] = useState<string | null>(null)

  const enter = async (church: CurrentChurch, path: string) => {
    setEnteringId(church.id)
    try {
      await churchesApi.enter(church.id)
      message.success(`Ahora trabajas en ${church.name}`)
      router.push(path)
      router.refresh()
    } catch (error) {
      message.error(errorMessage(error, "Error al cambiar de iglesia"))
    } finally {
      setEnteringId(null)
    }
  }

  return { enter, enteringId }
}

type RenameChurchModalProps = {
  church: CurrentChurch | null
  onClose: () => void
  onRenamed: (church: CurrentChurch) => void
}

// Modal para cambiar el nombre; el formulario se monta al abrirse con el nombre actual
export const RenameChurchModal = ({ church, onClose, onRenamed }: RenameChurchModalProps) => {
  const { message } = App.useApp()
  const [form] = Form.useForm<{ name: string }>()
  const [saving, setSaving] = useState(false)

  const rename = async ({ name }: { name: string }) => {
    if (!church) return
    setSaving(true)
    try {
      onRenamed(await churchesApi.rename(church.id, name))
    } catch (error) {
      message.error(errorMessage(error, "Error al renombrar la iglesia"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={Boolean(church)} title="Renombrar iglesia"
      onCancel={onClose} okText="Guardar"
      cancelText="Cancelar" confirmLoading={saving}
      onOk={() => form.submit()} destroyOnHidden>
      <Form
        form={form} layout="vertical"
        onFinish={rename} requiredMark={false}
        initialValues={{ name: church?.name }} preserve={false}>
        <Form.Item
          name="name" label="Nombre"
          rules={CHURCH_NAME_RULES}>
          <Input autoComplete="off" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
