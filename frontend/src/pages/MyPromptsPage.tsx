import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  List,
  Tag,
  Typography,
  Space,
  Button,
  Empty,
  Rate,
  message,
  Modal,
  Row,
  Col,
} from 'antd'
import {
  PlusOutlined,
  FileTextOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { promptsAPI, Prompt } from '../api'
import { useAuthStore } from '../store/authStore'

const { Title, Text } = Typography

const difficultyColor: Record<string, string> = {
  beginner: 'green',
  intermediate: 'orange',
  advanced: 'red',
}

const difficultyLabel: Record<string, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
}

export default function MyPromptsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMyPrompts = async () => {
    setLoading(true)
    try {
      const data = await promptsAPI.list({
        author_id: user?.id,
        public_only: false,
        limit: 100,
      })
      setPrompts(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyPrompts()
  }, [user])

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个提示词吗？此操作不可撤销。',
      onOk: async () => {
        try {
          await promptsAPI.delete(id)
          message.success('删除成功')
          fetchMyPrompts()
        } catch {
          // handled by interceptor
        }
      },
    })
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            <FileTextOutlined /> 我的提示词
          </Title>
          <Text type="secondary">管理您创建的所有提示词</Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/prompts/create')}
          >
            创建新提示词
          </Button>
        </Col>
      </Row>

      <List
        loading={loading}
        dataSource={prompts}
        locale={{ emptyText: <Empty description="您还没有创建过提示词" /> }}
        renderItem={(prompt) => (
          <Card
            hoverable
            style={{ marginBottom: 12 }}
            onClick={() => navigate(`/prompts/${prompt.id}`)}
          >
            <List.Item
              actions={[
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/prompts/${prompt.id}`)
                  }}
                >
                  查看
                </Button>,
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(prompt.id)
                  }}
                >
                  删除
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space size={12}>
                    <Text strong style={{ fontSize: 16 }}>
                      {prompt.title}
                    </Text>
                    <Tag color={difficultyColor[prompt.difficulty]}>
                      {difficultyLabel[prompt.difficulty]}
                    </Tag>
                    <Tag color={prompt.is_public ? 'blue' : 'default'}>
                      {prompt.is_public ? '公开' : '私有'}
                    </Tag>
                    {prompt.category && <Tag>{prompt.category}</Tag>}
                  </Space>
                }
                description={
                  <Space direction="vertical" size={4}>
                    <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
                      {prompt.content}
                    </Typography.Paragraph>
                    {prompt.average_score !== null && prompt.average_score !== undefined && prompt.average_score > 0 && (
                      <Space size={4}>
                        <Rate
                          disabled
                          allowHalf
                          value={prompt.average_score / 2}
                          style={{ fontSize: 12 }}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          平均: {prompt.average_score}
                        </Text>
                      </Space>
                    )}
                  </Space>
                }
              />
            </List.Item>
          </Card>
        )}
      />
    </div>
  )
}
