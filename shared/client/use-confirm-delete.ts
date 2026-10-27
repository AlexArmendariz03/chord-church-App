import { App } from "antd"
import { errorMessage } from "./api"

type ConfirmDeleteOptions = {
  title: string
  content: string
  // La llamada a la API que elimina
  remove: () => Promise<unknown>
  success: string
  // Después de eliminar, por ejemplo para recargar la lista
  onDeleted?: () => unknown
}

// Confirmación antes de eliminar algo; si falla, muestra el motivo que dio la API
export const useConfirmDelete = () => {
  const { modal, message } = App.useApp()

  return ({ title, content, remove, success, onDeleted }: ConfirmDeleteOptions) =>
    modal.confirm({
      title,
      content,
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      async onOk() {
        try {
          await remove()
        } catch (error) {
          message.error(errorMessage(error, "Error al eliminar"))
          return
        }
        message.success(success)
        await onDeleted?.()
      }
    })
}
