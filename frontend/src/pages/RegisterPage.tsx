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
import { UserOutlined, LockOutlined, MailOutlined, BulbOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'

const { Title, Text } = Typography

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  const onFinish = async (values: {
    username: string
    email: string
    password: string
    display_name?: string
  }) => {
    setLoading(true)
    try {
      await register(values)
      message.success('注册成功！欢迎加入！')
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
              创建账户
            </Title>
          </Space>
          <Text type="secondary">开始您的AI提示词学习之旅</Text>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="display_name"
            rules={[{ max: 100, message: '显示名称不能超过100个字符' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="显示名称（可选）" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              注册
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>
          <Text type="secondary">已有账户？</Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login">
            <Button type="link">返回登录</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
