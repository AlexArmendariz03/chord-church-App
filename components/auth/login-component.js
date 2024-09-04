import { Button, Col, Form, Input, Row, Image } from "antd"

const LoginComponent = () => {
  return(
    <Row
      justify="center"
      align="middle"
      className="login-container">
      <Col
        xs={24}
        sm={18}
        md={12}
        lg={8}>
        <Row justify="center">
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image
            width={450}
            height={450}
            src="/1.png"
            preview={false} />
        </Row>
        <Form layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}>
            <Input
              placeholder="Nombre de usuario" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}>
            <Input.Password
              placeholder="Introduce tu contraseña" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  )
}

export default LoginComponent