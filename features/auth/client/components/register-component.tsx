"use client"

import type { LoginFormData } from "@/types/auth"
import { Button, Col, Form, Input, Row, message } from "antd"
import { useRouter } from "next/navigation"

const RegisterComponent = () => {
  const router = useRouter()

  const onFinish = async (values: LoginFormData) => {
    const { username, password } = values

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      })

      const data = (await response.json()) as { message: string }

      if (response.status === 201) {
        message.success(data.message)
        router.push("/login")
      } else {
        message.error(data.message)
      }
    } catch {
      message.error("Error al intentar registrar el usuario")
    }
  }

  return (
    <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
      <Col xs={24} sm={18} md={12} lg={8}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true, message: "Por favor ingrese su nombre de usuario!" }]}>
            <Input placeholder="Nombre de usuario" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "Por favor ingrese su contraseña!" }]}>
            <Input.Password placeholder="Contraseña" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Registrar
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  )
}

export default RegisterComponent
