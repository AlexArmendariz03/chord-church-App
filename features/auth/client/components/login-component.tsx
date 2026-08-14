"use client"

import type { LoginFormData } from "@/types/auth"
import { App, Button, Card, Col, Form, Input, Row, Typography } from "antd"
import Image from "next/image"
import { useRouter } from "next/navigation"

const { Text } = Typography

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

      const data = (await response.json()) as { message: string; role?: string }

      if (response.ok) {
        message.success(data.message)
        if (data.role) localStorage.setItem("userRole", data.role)
        router.push("/dashboard")
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
        <Row justify="center">
          <Image
            width={140} height={140}
            src="/logo-mark.png" alt="Chord Church"
            priority />
        </Row>
        <Card className="login-card">
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="username" rules={[{ required: true, message: "¡Por favor ingrese su usuario!" }]}>
              <Input placeholder="Usuario" autoComplete="username" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: "¡Por favor ingrese su contraseña!" }]}>
              <Input.Password placeholder="Contraseña" autoComplete="current-password" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary" htmlType="submit"
                block>
                Iniciar Sesión
              </Button>
            </Form.Item>
          </Form>
        </Card>
        <Text className="login-dev-note">
          Modo desarrollo — Líder: leader / leader123 · Músico: musico / musico123
        </Text>
      </Col>
    </Row>
  )
}

export default LoginComponent
