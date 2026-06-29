import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Typography,
  message,
  Space,
} from 'antd'
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons'
import { promptsAPI } from '../api'

const { Title, Text } = Typography
const { TextArea } = Input

export default function CreatePromptPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const onFinish = async (values: any) => {
    setSubmitting(true)
    try {
      await promptsAPI.create(values)
      message.success('提示词创建成功！')
      navigate('/prompts')
    } catch {
      // handled by interceptor
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ padding: 0, marginBottom: 16 }}
      >
        返回
      </Button>

      <Card>
        <div style={{ marginBottom: 32 }}>
          <Title level={4}>创建新提示词</Title>
          <Text type="secondary">
            编写您的AI提示词，提交后可以获得社区评分和反馈，帮助您不断提升提示词技巧。
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            difficulty: 'beginner',
            is_public: true,
          }}
          size="large"
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[
              { required: true, message: '请输入提示词标题' },
              { max: 200, message: '标题不能超过200个字符' },
            ]}
          >
            <Input placeholder="例如：高质量文案生成提示词" />
          </Form.Item>

          <Form.Item
            name="content"
            label="提示词内容"
            rules={[
              { required: true, message: '请输入提示词内容' },
              { min: 10, message: '提示词内容至少10个字符' },
            ]}
          >
            <TextArea
              rows={8}
              placeholder="请在此输入您的AI提示词内容..."
              showCount
              maxLength={5000}
            />
          </Form.Item>

          <Space size={16} wrap>
            <Form.Item
              name="category"
              label="分类"
              style={{ minWidth: 160 }}
            >
              <Select
                placeholder="选择分类"
                allowClear
                options={[
                  { label: '文案写作', value: '文案写作' },
                  { label: '代码生成', value: '代码生成' },
                  { label: '数据分析', value: '数据分析' },
                  { label: '创意设计', value: '创意设计' },
                  { label: '教育学习', value: '教育学习' },
                  { label: '商务办公', value: '商务办公' },
                  { label: '其他', value: '其他' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="difficulty"
              label="难度等级"
              style={{ minWidth: 160 }}
            >
              <Select
                options={[
                  { label: '入门', value: 'beginner' },
                  { label: '进阶', value: 'intermediate' },
                  { label: '高级', value: 'advanced' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="is_public"
              label="公开可见"
              valuePropName="checked"
            >
              <Switch checkedChildren="公开" unCheckedChildren="私有" />
            </Form.Item>
          </Space>

          <div style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={submitting}
              size="large"
            >
              提交提示词
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}
