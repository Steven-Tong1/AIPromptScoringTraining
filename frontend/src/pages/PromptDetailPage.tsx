import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Typography,
  Space,
  Tag,
  Descriptions,
  Button,
  Rate,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Spin,
  Divider,
  List,
  Row,
  Col,
  Statistic,
  Tooltip,
  Empty,
} from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { promptsAPI, Prompt, PromptScore, ScoreCreateData } from '../api'
import { useAuthStore } from '../store/authStore'

const { Title, Text, Paragraph } = Typography

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

export default function PromptDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [scores, setScores] = useState<PromptScore[]>([])
  const [loading, setLoading] = useState(true)
  const [scoreModalOpen, setScoreModalOpen] = useState(false)
  const [scoring, setScoring] = useState(false)
  const [scoreForm] = Form.useForm()

  const fetchData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const promptData = await promptsAPI.get(parseInt(id))
      setPrompt(promptData)
      const scoresData = await promptsAPI.getScores(parseInt(id))
      setScores(scoresData)
    } catch {
      message.error('获取提示词详情失败')
      navigate('/prompts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个提示词吗？此操作不可撤销。',
      onOk: async () => {
        try {
          await promptsAPI.delete(parseInt(id!))
          message.success('删除成功')
          navigate('/prompts')
        } catch {
          // handled by interceptor
        }
      },
    })
  }

  const handleScore = async (values: ScoreCreateData) => {
    setScoring(true)
    try {
      await promptsAPI.score(parseInt(id!), values)
      message.success('评分成功！')
      setScoreModalOpen(false)
      scoreForm.resetFields()
      fetchData()
    } catch {
      // handled by interceptor
    } finally {
      setScoring(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!prompt) {
    return <Empty description="提示词不存在" />
  }

  const isAuthor = user?.id === prompt.author_id
  const userScore = scores.find((s) => s.user_id === user?.id)

  return (
    <div>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/prompts')}
        style={{ padding: 0, marginBottom: 16 }}
      >
        返回列表
      </Button>

      <Card>
        <Row justify="space-between" align="top">
          <Col flex="auto">
            <Space size={12} style={{ marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>
                {prompt.title}
              </Title>
              <Tag color={difficultyColor[prompt.difficulty]}>
                {difficultyLabel[prompt.difficulty]}
              </Tag>
              {prompt.category && <Tag>{prompt.category}</Tag>}
            </Space>
          </Col>
          <Col>
            {isAuthor && (
              <Space>
                <Tooltip title="编辑">
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/prompts/create?edit=${prompt.id}`)}
                  />
                </Tooltip>
                <Tooltip title="删除">
                  <Button danger icon={<DeleteOutlined />} onClick={handleDelete} />
                </Tooltip>
              </Space>
            )}
          </Col>
        </Row>

        <Card
          style={{
            background: '#fafafa',
            marginBottom: 16,
            borderRadius: 8,
          }}
          bodyStyle={{ padding: 16 }}
        >
          <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
            {prompt.content}
          </Text>
        </Card>

        <Descriptions size="small" column={{ xs: 1, sm: 2, md: 4 }}>
          <Descriptions.Item label={<><UserOutlined /> 作者</>}>
            {prompt.author_name || '匿名'}
          </Descriptions.Item>
          <Descriptions.Item label={<><StarOutlined /> 平均评分</>}>
            {prompt.average_score && prompt.average_score > 0 ? (
              <Space>
                <Rate disabled allowHalf value={prompt.average_score / 2} />
                <Text>{prompt.average_score}</Text>
              </Space>
            ) : (
              '暂无评分'
            )}
          </Descriptions.Item>
          <Descriptions.Item label={<><ClockCircleOutlined /> 创建时间</>}>
            {dayjs(prompt.created_at).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="可见性">
            <Tag color={prompt.is_public ? 'blue' : 'default'}>
              {prompt.is_public ? '公开' : '私有'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        {!userScore && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button
              type="primary"
              icon={<StarOutlined />}
              size="large"
              onClick={() => setScoreModalOpen(true)}
            >
              评分此提示词
            </Button>
          </div>
        )}

        {userScore && (
          <Card style={{ marginTop: 16, background: '#f6ffed' }} size="small">
            <Space>
              <Text type="success">✔ 您已评分</Text>
              <Rate disabled allowHalf value={userScore.overall_score / 2} />
              <Text strong>{userScore.overall_score} 分</Text>
            </Space>
          </Card>
        )}
      </Card>

      {/* Scores Section */}
      <Card title="评分与反馈" style={{ marginTop: 16 }}>
        {scores.length === 0 ? (
          <Empty description="暂无评分，来第一个评分吧！" />
        ) : (
          <List
            dataSource={scores}
            renderItem={(score) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{score.username || '匿名用户'}</Text>
                      <Rate disabled allowHalf value={score.overall_score / 2} />
                      <Text type="secondary">{score.overall_score} 分</Text>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={4}>
                      <Space size={16}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          清晰度: {score.clarity}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          具体性: {score.specificity}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          创造性: {score.creativity}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          可行性: {score.feasibility}
                        </Text>
                      </Space>
                      {score.feedback && (
                        <Paragraph
                          style={{
                            margin: 0,
                            padding: 8,
                            background: '#f5f5f5',
                            borderRadius: 4,
                          }}
                        >
                          <Text>{score.feedback}</Text>
                        </Paragraph>
                      )}
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(score.created_at).format('YYYY-MM-DD HH:mm')}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Score Modal */}
      <Modal
        title="评分提示词"
        open={scoreModalOpen}
        onCancel={() => setScoreModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form form={scoreForm} layout="vertical" onFinish={handleScore}>
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                name="clarity"
                label="清晰度"
                rules={[{ required: true, message: '请评分' }]}
              >
                <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="specificity"
                label="具体性"
                rules={[{ required: true, message: '请评分' }]}
              >
                <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="creativity"
                label="创造性"
                rules={[{ required: true, message: '请评分' }]}
              >
                <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="feasibility"
                label="可行性"
                rules={[{ required: true, message: '请评分' }]}
              >
                <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="feedback" label="评语（可选）">
            <Input.TextArea rows={4} placeholder="写下您的评价和建议..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={scoring} block>
              提交评分
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
