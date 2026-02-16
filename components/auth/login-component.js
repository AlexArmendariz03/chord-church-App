import { Button, Col, Divider, Form, Input, Row, Space, message } from "antd"
import Image from "next/image"
import { useRouter } from "next/router"

const demoCredentials = {
  DIRIGENTE: { username: "dirigente", password: "Dirigente123" },
  MUSICO: { username: "musico", password: "Musico123" }
}

const LoginComponent = () => {
  const router = useRouter()
  const [form] = Form.useForm()

  const persistCurrentUser = user => {
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("currentUser", JSON.stringify(user))
    }
  }

  const loginRequest = async ({ username, password }) => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data?.message ?? "No se pudo iniciar sesión")
    }

    return data
  }

  const onFinish = async values => {
    const { username, password } = values

    try {
      const data = await loginRequest({ username, password })
      persistCurrentUser(data.user)
      message.success(data.message)
      router.push("/dashboard")
    } catch (error) {
      message.error(error?.message ?? "Error al intentar iniciar sesión")
    }
  }

  const loginAsRole = async role => {
    const credentials = demoCredentials[role]

    form.setFieldsValue(credentials)

    try {
      const data = await loginRequest(credentials)
      persistCurrentUser(data.user)
      message.success(`${data.message} (${role === "DIRIGENTE" ? "Dirigente" : "Músico"})`)
      router.push("/dashboard")
    } catch (error) {
      message.error(error?.message ?? "Error al iniciar con cuenta demo")
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
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}>
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

        <Divider plain>Ingreso rápido</Divider>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button block onClick={() => loginAsRole("DIRIGENTE")}>Entrar como Dirigente</Button>
          <Button block onClick={() => loginAsRole("MUSICO")}>Entrar como Músico</Button>
        </Space>

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
