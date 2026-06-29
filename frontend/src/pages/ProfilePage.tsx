import { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Descriptions,
  Space,
  Avatar,
  Divider,
  Tag,
} from 'antd'
import {
  UserOutlined,
  MailOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../api'

const { Title, Text } = Typography

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        display_name: user.display_name,
        email: user.email,
      })
    }
  }, [user])

  const handleSave = async (values: { display_name?: string; email?: string }) => {
    setSaving(true)
    try {
      const updated = await authAPI.updateProfile(values)
      updateUser(updated)
      message.success('个人资料已更新')
      setEditing(false)
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Avatar
            size={80}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1677ff', marginBottom: 16 }}
          />
          <Title level={4}>{user.display_name || user.username}</Title>
          <Tag icon={<SafetyOutlined />} color="blue">
            {user.is_superuser ? '管理员' : '普通用户'}
          </Tag>
        </div>

        {!editing ? (
          <>
            <Descriptions
              column={{ xs: 1, sm: 2 }}
              bordered
              size="middle"
            >
              <Descriptions.Item label="用户名">{user.username}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{user.email}</Descriptions.Item>
              <Descriptions.Item label="显示名称">
                {user.display_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="账户状态">
                <Tag color={user.is_active ? 'success' : 'error'}>
                  {user.is_active ? '正常' : '已禁用'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                <Space>
                  <ClockCircleOutlined />
                  {dayjs(user.created_at).format('YYYY-MM-DD HH:mm')}
                </Space>
              </Descriptions.Item>
            </Descriptions>
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Button type="primary" onClick={() => setEditing(true)}>
                编辑资料
              </Button>
            </div>
          </>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            size="large"
            style={{ maxWidth: 480, margin: '0 auto' }}
          >
            <Form.Item name="display_name" label="显示名称">
              <Input prefix={<UserOutlined />} placeholder="输入您的显示名称" />
            </Form.Item>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
            >
              <Input prefix={<MailOutlined />} placeholder="输入您的邮箱" />
            </Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={saving}>
                保存
              </Button>
              <Button onClick={() => setEditing(false)}>取消</Button>
            </Space>
          </Form>
        )}
      </Card>
    </div>
  )
}
