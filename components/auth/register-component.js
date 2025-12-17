import { Button, Col, Form, Input, Row, Typography, message } from "antd"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { getStoredUsers, saveStoredUsers } from "@/lib/auth-storage"

const { Text } = Typography

const RegisterComponent = () => {
  const router = useRouter()

  const onFinish = values => {
    const { username, password, confirmPassword } = values
    const users = getStoredUsers()

    if (users.some(user => user.username === username)) {
      message.error("El usuario ya existe, prueba con otro nombre")
      return
    }

    if (password !== confirmPassword) {
      message.error("Las contraseñas no coinciden")
      return
    }

    saveStoredUsers([...users, { username, password }])
    message.success("Usuario creado, ahora puedes iniciar sesión")
    router.push("/login")
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
            rules={[{ required: true, message: "¡Por favor ingresa un nombre de usuario!" }]}>
            <Input placeholder="Nombre de usuario" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "¡Por favor ingresa una contraseña!" }]}>
            <Input.Password placeholder="Contraseña" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            rules={[{ required: true, message: "Repite la contraseña" }]}>
            <Input.Password placeholder="Confirmar contraseña" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary" htmlType="submit"
              block>
              Crear usuario
            </Button>
          </Form.Item>
        </Form>
        <div className="auth-links">
          <Text>¿Ya tienes cuenta?</Text>
          <Link href="/login">Volver a iniciar sesión</Link>
        </div>
      </Col>
    </Row>
  )
}

export default RegisterComponent
