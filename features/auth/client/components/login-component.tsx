"use client"

import type { LoginFormData } from "@/types/auth"
import { Alert, Button, Col, Form, Input, Row, Space, Typography, message } from "antd"
import Image from "next/image"
import { useRouter } from "next/navigation"

const LoginComponent = () => {
  const router = useRouter()

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
        md={12} lg={8}>
        <Row justify="center">
          <Image
            width={450} height={450}
            src="/1.png" alt="logo" />
        </Row>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Credenciales hardcodeadas"
          description={
            <Space direction="vertical" size={0}>
              <Typography.Text>Líder: leader / leader123</Typography.Text>
              <Typography.Text>Músico: musico / musico123</Typography.Text>
            </Space>
          } />
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true, message: "¡Por favor ingrese su usuario!" }]}>
            <Input placeholder="Usuario" autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "¡Por favor ingrese su contraseña!" }]}>
            <Input.Password placeholder="Contraseña" autoComplete="current-password" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary" htmlType="submit"
              block>
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  )
}

export default LoginComponent
