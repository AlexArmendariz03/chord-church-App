import { Button, Col, Form, Input, Row, message } from "antd"
import Image from "next/image"
import { useRouter } from "next/router"

const LoginComponent = () => {
  const router = useRouter()

  const onFinish = async values => {
    const { username, password } = values

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok) {
        message.success(data.message)
        router.push("/dashboard")
      } else {
        message.error(data.message)
      }
    } catch (error) {
      message.error("Error al intentar iniciar sesión")
    }
  }

  const handleRegisterClick = () => {
    router.push("/register")
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
        <Button
          type="link"
          block
          onClick={handleRegisterClick}
          xs={{ span: 24 }}
          lg={{ span: 0 }}>
          Registrarse
        </Button>
      </Col>
    </Row>
  )
}

export default LoginComponent
