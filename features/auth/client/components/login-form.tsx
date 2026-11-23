"use client"

import { BankOutlined, LockOutlined, UserOutlined } from "@ant-design/icons"
import type { LoginChurchChoice, LoginFormData } from "@/features/auth/types"
import { Alert, App, Button, Card, Col, Form, Input, Row, Select } from "antd"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { errorMessage } from "@/shared/client/api"
import { authApi, churchChoicesOf } from "../auth-api"

const LoginForm = () => {
  const router = useRouter()
  const { message } = App.useApp()
  const [form] = Form.useForm<LoginFormData>()
  const [submitting, setSubmitting] = useState(false)
  // Solo si esa cuenta existe en más de una iglesia: se elige con cuál entrar
  const [churchChoices, setChurchChoices] = useState<LoginChurchChoice[] | null>(null)

  // Si cambia el usuario o la contraseña, la elección de iglesia ya no aplica
  const onValuesChange = (changed: Partial<LoginFormData>) => {
    if (churchChoices && ("username" in changed || "password" in changed)) {
      setChurchChoices(null)
      form.setFieldValue("churchId", undefined)
    }
  }

  const onFinish = async (values: LoginFormData) => {
    setSubmitting(true)
    try {
      const { message: welcome } = await authApi.login({ username: values.username, password: values.password, churchId: values.churchId })
      message.success(welcome)
      // El botón sigue cargando hasta que se abre el dashboard; replace para que "atrás" no regrese al login
      router.replace("/dashboard")
    } catch (error) {
      const choices = churchChoicesOf(error)
      if (choices) setChurchChoices(choices)
      else message.error(errorMessage(error, "Error al intentar iniciar sesión"))
      setSubmitting(false)
    }
  }

  return (
    <Row
      justify="center" align="middle"
      className="login-container">
      <Col
        xs={24} sm={18}
        md={12} lg={7}>
        <div className="login-brand">
          <span className="login-emblem">
            <Image
              src="/logo-icon.png" alt=""
              width={166} height={253}
              className="login-emblem-icon" priority />
          </span>
          <h1 className="login-title">Chord Church</h1>
          <p className="login-subtitle">Inicia sesión para comenzar</p>
        </div>
        <Card className="login-card">
          <Form
            form={form} layout="vertical"
            size="large" onFinish={onFinish}
            onValuesChange={onValuesChange}>
            <Form.Item name="username" rules={[{ required: true, message: "Escribe tu usuario" }]}>
              <Input
                prefix={<UserOutlined />} placeholder="Usuario"
                autoComplete="username" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: "Escribe tu contraseña" }]}>
              <Input.Password
                prefix={<LockOutlined />} placeholder="Contraseña"
                autoComplete="current-password" />
            </Form.Item>
            {churchChoices && (
              <>
                <Alert
                  type="info" showIcon
                  className="login-church-alert" title="Tienes cuenta en más de una iglesia" />
                <Form.Item
                  name="churchId" label="¿Con qué iglesia entras?"
                  rules={[{ required: true, message: "Elige tu iglesia" }]}>
                  <Select
                    prefix={<BankOutlined />} placeholder="Elige tu iglesia"
                    options={churchChoices.map(church => ({ value: church.id, label: church.name }))} />
                </Form.Item>
              </>
            )}
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary" htmlType="submit"
                block loading={submitting}>
                Entrar
              </Button>
            </Form.Item>
          </Form>
        </Card>
        <p className="login-terms">
          Al entrar aceptas los <Link href="/terminos">Términos y condiciones</Link> y el{" "}
          <Link href="/privacidad">Aviso de privacidad</Link>.
        </p>
      </Col>
    </Row>
  )
}

export default LoginForm
