"use client"

import { LockOutlined, UserOutlined } from "@ant-design/icons"
import type { LoginFormData } from "@/types/auth"
import { App, Button, Card, Col, Form, Input, Row } from "antd"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { errorMessage } from "@/shared/client/api"
import { authApi } from "../auth-api"

const LoginForm = () => {
  const router = useRouter()
  const { message } = App.useApp()

  const onFinish = async (values: LoginFormData) => {
    try {
      const { message: welcome } = await authApi.login({ username: values.username, password: values.password })
      message.success(welcome)
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      message.error(errorMessage(error, "Error al intentar iniciar sesión"))
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
            layout="vertical" size="large"
            onFinish={onFinish}>
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
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary" htmlType="submit"
                block>
                Entrar
              </Button>
            </Form.Item>
          </Form>
        </Card>
        <p className="login-terms">
          Al entrar aceptas los <Link href="/terminos">Términos y condiciones</Link>.
        </p>
      </Col>
    </Row>
  )
}

export default LoginForm
