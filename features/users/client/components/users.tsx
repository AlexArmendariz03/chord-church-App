"use client"

import { CopyOutlined, KeyOutlined, PlusOutlined, ReloadOutlined, UserOutlined } from "@ant-design/icons"
import { App, Avatar, Button, Card, Empty, Form, Input, Modal, Select, Space, Tooltip, Typography } from "antd"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSession } from "@/features/auth/client/session-provider"
import { errorMessage } from "@/shared/client/api"
import { ASSIGNABLE_ROLES, ROLE_LABELS, ROLES, type AssignableRole, type Role } from "@/shared/auth/permissions"
import type { CurrentChurch } from "@/features/churches/types"
import type { UserListItem } from "@/features/users/types"
import { generatePassword } from "../../password"
import { usersApiFor } from "../users-api"

const { Paragraph, Text, Title } = Typography

// Qué puede hacer cada rol, para elegirlo al crear un usuario
const ROLE_DESCRIPTIONS: Record<Role, string> = {
  master: "Todas las iglesias, con sus usuarios",
  leader: "Alabanzas, servicios y En curso con la vista del dirigente",
  musico: "Ver servicios y alabanzas, y seguir En curso con acordes",
  proyeccion: "Solo la lista de servicios con sus alabanzas"
}

// El master aparece para mostrar el rol de su cuenta, pero no se puede elegir (solo con create-user)
const ROLE_OPTIONS = ROLES.map(role => ({ value: role, label: ROLE_LABELS[role], disabled: role === "master" }))
const ROLE_OPTIONS_WITH_HELP = ASSIGNABLE_ROLES.map(role => ({
  value: role,
  label: (
    <span className="users-role-option">
      <strong>{ROLE_LABELS[role]}</strong>
      <span>{ROLE_DESCRIPTIONS[role]}</span>
    </span>
  )
}))

type NewUserValues = { username: string; role: AssignableRole; password: string }
type PasswordValues = { password: string }
// Lo que se muestra una sola vez después de crear o restablecer, para pasárselo al usuario
type Credentials = { username: string; password: string; isNew: boolean }

// Campo de contraseña con "Generar", que la llena con una al azar
const PasswordField = ({ onGenerate }: { onGenerate: () => void }) => (
  <Form.Item label="Contraseña" required>
    <Space.Compact style={{ width: "100%" }}>
      <Form.Item
        name="password" noStyle
        rules={[{ required: true, min: 8, message: "Al menos 8 caracteres" }]}>
        <Input className="users-password-input" autoComplete="new-password" />
      </Form.Item>
      <Button icon={<ReloadOutlined />} onClick={onGenerate}>Generar</Button>
    </Space.Compact>
  </Form.Item>
)

type UsersProps = {
  // Con iglesia, administra los usuarios de esa iglesia dentro de su página (solo el master);
  // sin ella, es la página Usuarios con los de la iglesia de la sesión
  church?: CurrentChurch
  // Después de crear un usuario, para que la página de la iglesia actualice su total
  onUserCreated?: () => void
}

const Users = ({ church: targetChurch, onUserCreated }: UsersProps) => {
  const { message, modal } = App.useApp()
  const { user: sessionUser, church: sessionChurch } = useSession()
  const church = targetChurch ?? sessionChurch
  const usersApi = useMemo(() => usersApiFor(targetChurch?.id), [targetChurch?.id])
  const [users, setUsers] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  // El usuario al que se le restablece la contraseña
  const [resetting, setResetting] = useState<UserListItem | null>(null)
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  // Contraseña al azar con la que abren los formularios de crear y restablecer
  const [initialPassword, setInitialPassword] = useState("")
  const [newUserForm] = Form.useForm<NewUserValues>()
  const [passwordForm] = Form.useForm<PasswordValues>()

  const loadUsers = useCallback(() =>
    usersApi.list()
      .then(setUsers)
      .catch(error => message.error(errorMessage(error, "No se pudieron cargar los usuarios")))
      .finally(() => setLoading(false)), [message, usersApi])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const openCreate = () => {
    setInitialPassword(generatePassword())
    setIsCreating(true)
  }

  const openReset = (user: UserListItem) => {
    setInitialPassword(generatePassword())
    setResetting(user)
  }

  const createUser = async (values: NewUserValues) => {
    setSaving(true)
    try {
      const created = await usersApi.create(values)
      setIsCreating(false)
      setCredentials({ username: created.username, password: values.password, isNew: true })
      onUserCreated?.()
      await loadUsers()
    } catch (error) {
      message.error(errorMessage(error, "Error al crear el usuario"))
    } finally {
      setSaving(false)
    }
  }

  const resetPassword = async ({ password }: PasswordValues) => {
    if (!resetting) return
    setSaving(true)
    try {
      await usersApi.update(resetting.id, { password })
      setCredentials({ username: resetting.username, password, isNew: false })
      setResetting(null)
    } catch (error) {
      message.error(errorMessage(error, "Error al restablecer la contraseña"))
    } finally {
      setSaving(false)
    }
  }

  const changeRole = (user: UserListItem, role: AssignableRole) => modal.confirm({
    title: "Cambiar rol",
    content: `¿Cambiar a "${user.username}" de ${ROLE_LABELS[user.role]} a ${ROLE_LABELS[role]}? El cambio se aplica la próxima vez que inicie sesión.`,
    okText: "Cambiar rol",
    cancelText: "Cancelar",
    onOk: async () => {
      try {
        await usersApi.update(user.id, { role })
        message.success(`Ahora "${user.username}" es ${ROLE_LABELS[role]}`)
        await loadUsers()
      } catch (error) {
        message.error(errorMessage(error, "Error al cambiar el rol"))
      }
    }
  })

  const copyCredentials = async () => {
    if (!credentials) return
    try {
      await navigator.clipboard.writeText(`Usuario: ${credentials.username}\nContraseña: ${credentials.password}`)
      message.success("Copiado")
    } catch {
      message.error("No se pudo copiar; selecciona el texto y cópialo a mano")
    }
  }

  return (
    // Dentro de la página de una iglesia ya hay margen alrededor
    <div style={targetChurch ? undefined : { padding: 24 }}>
      <Space
        orientation="vertical" size={20}
        style={{ width: "100%" }}>
        <Card>
          <div className="page-header">
            <div>
              <Title level={targetChurch ? 3 : 2} style={{ margin: 0 }}>Usuarios</Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                {church ? <>Cuentas de <strong>{church.name}</strong>. </> : null}
                Crea cuentas, cambia el rol de cada una o restablece su contraseña.
              </Paragraph>
            </div>
            <Button
              type="primary" icon={<PlusOutlined />}
              onClick={openCreate}>
              Nuevo usuario
            </Button>
          </div>
        </Card>

        <Card loading={loading}>
          {users.length === 0 ? <Empty description="Todavía no hay usuarios" /> : (
            <div className="list-panel">
              {users.map(user => {
                const isMe = user.username === sessionUser?.username
                const roleLocked = isMe || user.role === "master"
                return (
                  <div key={user.id} className="users-row">
                    <div className="users-row-name">
                      <Avatar icon={<UserOutlined />} size={36} />
                      <Text strong>{user.username}</Text>
                      {isMe && <Text type="secondary">(tú)</Text>}
                    </div>
                    <div className="users-row-actions">
                      <Tooltip title={isMe ? "No puedes cambiar tu propio rol" : user.role === "master" ? "El rol master no se cambia desde la app" : undefined}>
                        <Select
                          value={user.role} options={ROLE_OPTIONS}
                          disabled={roleLocked} aria-label={`Rol de ${user.username}`}
                          onChange={role => role !== "master" && changeRole(user, role)}
                          className="users-role-select" />
                      </Tooltip>
                      <Button icon={<KeyOutlined />} onClick={() => openReset(user)}>
                        Restablecer contraseña
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </Space>

      <Modal
        open={isCreating} title="Nuevo usuario"
        onCancel={() => setIsCreating(false)} okText="Crear usuario"
        cancelText="Cancelar" confirmLoading={saving}
        onOk={() => newUserForm.submit()} destroyOnHidden>
        {/* El modal monta el formulario al abrirse: los valores iniciales van aquí, no con setFieldsValue */}
        <Form
          form={newUserForm} layout="vertical"
          onFinish={createUser} requiredMark={false}
          initialValues={{ username: "", role: "musico", password: initialPassword }} preserve={false}>
          <Form.Item
            name="username" label="Usuario"
            extra="En minúsculas, sin espacios ni acentos. Así lo escribirá al iniciar sesión."
            rules={[
              { required: true, message: "Escribe el usuario" },
              { pattern: /^\s*[a-zA-Z0-9._-]{3,40}\s*$/, message: "De 3 a 40 letras sin acentos, números, punto o guion" }
            ]}>
            <Input autoComplete="off" placeholder="Ej. pastor" />
          </Form.Item>
          <Form.Item name="role" label="Rol">
            <Select options={ROLE_OPTIONS_WITH_HELP} labelRender={({ value }) => ROLE_LABELS[value as Role]} />
          </Form.Item>
          <PasswordField onGenerate={() => newUserForm.setFieldsValue({ password: generatePassword() })} />
        </Form>
      </Modal>

      <Modal
        open={Boolean(resetting)} title={`Restablecer contraseña de "${resetting?.username ?? ""}"`}
        onCancel={() => setResetting(null)} okText="Guardar contraseña"
        cancelText="Cancelar" confirmLoading={saving}
        onOk={() => passwordForm.submit()} destroyOnHidden>
        <Paragraph type="secondary">
          La contraseña anterior deja de funcionar. Las sesiones que ya estén abiertas siguen hasta que expiren.
        </Paragraph>
        <Form
          form={passwordForm} layout="vertical"
          onFinish={resetPassword} requiredMark={false}
          initialValues={{ password: initialPassword }} preserve={false}>
          <PasswordField onGenerate={() => passwordForm.setFieldsValue({ password: generatePassword() })} />
        </Form>
      </Modal>

      <Modal
        open={Boolean(credentials)} title={credentials?.isNew ? "Usuario creado" : "Contraseña restablecida"}
        onCancel={() => setCredentials(null)}
        footer={[
          <Button
            key="copy" icon={<CopyOutlined />}
            onClick={copyCredentials}>
            Copiar
          </Button>,
          <Button
            key="done" type="primary"
            onClick={() => setCredentials(null)}>
            Listo
          </Button>
        ]}>
        <Paragraph>Pásale estos datos. La contraseña no se vuelve a mostrar.</Paragraph>
        <div className="users-credentials">
          <span>Usuario</span><strong>{credentials?.username}</strong>
          <span>Contraseña</span><strong>{credentials?.password}</strong>
        </div>
      </Modal>
    </div>
  )
}

export default Users
