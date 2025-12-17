import { Button, Col, Form, Input, Row, Typography, message } from "antd"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { ensureDefaultUser, getStoredUsers, defaultUser } from "@/lib/auth-storage"
import { useEffect } from "react"

const { Text } = Typography

const LoginComponent = () => {
  const router = useRouter()

  useEffect(() => {
    ensureDefaultUser()
  }, [])

  const onFinish = values => {
    const { username, password } = values
    const users = getStoredUsers()

    const isAdmin = username === "admin" && password === "password123"
    const isStoredUser = users.some(
      user => user.username === username && user.password === password
    )

    if (isAdmin || isStoredUser) {
      message.success("¡Inicio de sesión exitoso!")
      router.push("/dashboard")
    } else {
      message.error("Usuario o contraseña incorrectos")
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
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: "¡Por favor ingrese su nombre de usuario!" }]}>
            <Input placeholder="Nombre de usuario" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "¡Por favor ingrese su contraseña!" }]}>
            <Input.Password placeholder="Introduce tu contraseña" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary" htmlType="submit"
              block>
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>
        <div className="auth-extra">
          <Text type="secondary">
            También puedes entrar con usuario &quot;{defaultUser.username}&quot; y contraseña
            &quot;{defaultUser.password}&quot;.
          </Text>
          <div className="auth-links">
            <Text>¿No tienes cuenta?</Text>
            <Link href="/registro">Crear usuario</Link>
          </div>
        </div>
      </Col>
    </Row>
  )
}

export default LoginComponent
