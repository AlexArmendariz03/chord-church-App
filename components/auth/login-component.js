import { Button, Col, Form, Input, Row, message } from "antd"
import Image from "next/image"
import { useRouter } from "next/router"

const LoginComponent = () => {
  const router = useRouter()

  const onFinish = values => {
    const { username, password } = values
    if (username === "admin" && password === "password123") {
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
      </Col>
    </Row>
  )
}

export default LoginComponent
