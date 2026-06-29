import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  List,
  Tag,
  Typography,
  Space,
  Input,
  Select,
  Row,
  Col,
  Button,
  Rate,
  Empty,
} from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  FileTextOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { promptsAPI, Prompt } from '../api'

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

export default function PromptListPage() {
  const navigate = useNavigate()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [difficulty, setDifficulty] = useState<string | undefined>(undefined)
  const [total, setTotal] = useState(0)

  const fetchPrompts = async (query?: string) => {
    setLoading(true)
    try {
      if (query) {
        const result = await promptsAPI.search(query)
        setPrompts(result)
        setTotal(result.length)
      } else {
        const result = await promptsAPI.list({
          difficulty,
          public_only: true,
          limit: 50,
        })
        setPrompts(result)
        setTotal(result.length)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrompts()
  }, [difficulty])

  const handleSearch = () => {
    fetchPrompts(searchQuery)
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            <FileTextOutlined /> 提示词库
          </Title>
          <Text type="secondary">浏览社区提示词，学习和评分</Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/prompts/create')}
          >
            创建提示词
          </Button>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }} bodyStyle={{ paddingBottom: 0 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="搜索提示词..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="选择难度"
              value={difficulty}
              onChange={setDifficulty}
              allowClear
              style={{ width: '100%' }}
              options={[
                { label: '入门', value: 'beginner' },
                { label: '进阶', value: 'intermediate' },
                { label: '高级', value: 'advanced' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Prompt List */}
      <List
        loading={loading}
        dataSource={prompts}
        locale={{ emptyText: <Empty description="暂无提示词" /> }}
        renderItem={(prompt) => (
          <Card
            hoverable
            style={{ marginBottom: 12 }}
            onClick={() => navigate(`/prompts/${prompt.id}`)}
          >
            <List.Item>
              <List.Item.Meta
                title={
                  <Space size={12}>
                    <Text strong style={{ fontSize: 16 }}>
                      {prompt.title}
                    </Text>
                    <Tag color={difficultyColor[prompt.difficulty]}>
                      {difficultyLabel[prompt.difficulty]}
                    </Tag>
                    {prompt.category && <Tag>{prompt.category}</Tag>}
                  </Space>
                }
                description={
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <Typography.Paragraph
                      type="secondary"
                      ellipsis={{ rows: 2 }}
                      style={{ maxWidth: 600, margin: 0 }}
                    >
                      {prompt.content}
                    </Typography.Paragraph>
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Space size={16}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <UserOutlined /> {prompt.author_name || '匿名'}
                          </Text>
                          {prompt.average_score !== null && prompt.average_score !== undefined && prompt.average_score > 0 && (
                            <Space size={4}>
                              <Rate
                                disabled
                                allowHalf
                                value={prompt.average_score / 2}
                                style={{ fontSize: 12 }}
                              />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {prompt.average_score}
                              </Text>
                            </Space>
                          )}
                        </Space>
                      </Col>
                    </Row>
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
