"use client"

import type { LoginFormData } from "@/types/auth"
import { App, Button, Card, Col, Form, Input, Row } from "antd"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

const LoginComponent = () => {
  const router = useRouter()
  const { message } = App.useApp()

  const onFinish = async (values: LoginFormData) => {
    const { username, password } = values

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      })

      const data = (await response.json()) as { message: string }

      if (response.ok) {
        message.success(data.message)
        router.push("/dashboard")
        router.refresh()
      } else {
        message.error(data.message)
      }
    } catch {
      message.error("Error al intentar iniciar sesión")
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
          <p className="login-subtitle">Inicia sesión para ver las alabanzas</p>
        </div>
        <Card className="login-card">
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="username" rules={[{ required: true, message: "Escribe tu usuario" }]}>
              <Input placeholder="Usuario" autoComplete="username" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: "Escribe tu contraseña" }]}>
              <Input.Password placeholder="Contraseña" autoComplete="current-password" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary" htmlType="submit"
                block>
                Iniciar sesión
              </Button>
            </Form.Item>
          </Form>
        </Card>
        <p className="login-terms">
          Al iniciar sesión aceptas los <Link href="/terminos">Términos y condiciones</Link>.
        </p>
      </Col>
    </Row>
  )
}

export default LoginComponent
