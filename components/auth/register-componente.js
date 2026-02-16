import { Button, Col, Form, Input, Row, Select, message } from "antd"
import { useRouter } from "next/router"

const roleOptions = [
  { label: "Dirigente", value: "DIRIGENTE" },
  { label: "Músico", value: "MUSICO" }
]

const RegisterComponent = () => {
  const router = useRouter()

  const onFinish = async values => {
    const { username, password, role } = values

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password, role })
      })

      const data = await response.json()

      if (response.ok) {
        message.success(data.message)
        router.push("/login")
      } else {
        message.error(data.message)
      }
    } catch (error) {
      message.error("Error al intentar registrar el usuario")
    }
  }

  return (
    <Row
      justify="center"
      align="middle"
      style={{ minHeight: "100vh" }}>
      <Col
        xs={22} sm={16}
        md={12} lg={8}>
        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ role: "MUSICO" }}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Por favor ingrese su nombre de usuario!" }]}>
            <Input placeholder="Nombre de usuario" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Por favor ingrese su contraseña!" }]}>
            <Input.Password placeholder="Contraseña" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: "Selecciona un rol" }]}>
            <Select options={roleOptions} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary" htmlType="submit"
              block>
              Registrar
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  )
}

export default RegisterComponent
