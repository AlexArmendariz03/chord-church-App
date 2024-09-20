import { Button, Col, Form, Input, Row, message } from "antd"
import { useRouter } from "next/router"
import axios from "axios"

const RegisterComponent = () => {
  const router = useRouter()

  const onFinish = async values => {
    const { username, password } = values

    try {
      const response = await axios.post("/api/register", {
        username,
        password
      })

      if (response.status === 201) {
        message.success(response.data.message)
        router.push("/login")
      } else {
        message.error(response.data.message)
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
        xs={0} sm={0}
        md={0} lg={8}>
        <Form layout="vertical" onFinish={onFinish}>
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
