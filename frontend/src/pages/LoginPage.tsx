import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Space,
  Divider,
} from 'antd'
import { UserOutlined, LockOutlined, BulbOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'

const { Title, Text } = Typography

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      await login(values)
      message.success('登录成功！')
      navigate('/')
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 24,
      }}
    >
      <Card style={{ width: 420, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Space align="center" size={12}>
            <BulbOutlined style={{ fontSize: 36, color: '#1677ff' }} />
            <Title level={3} style={{ margin: 0 }}>
              AI提示词培训平台
            </Title>
          </Space>
          <Text type="secondary">登录您的账户</Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>
          <Text type="secondary">还没有账户？</Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Link to="/register">
            <Button type="link">立即注册</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
