import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Space,
  Button,
  List,
  Tag,
  Rate,
  theme,
} from 'antd'
import {
  FileTextOutlined,
  StarOutlined,
  UserOutlined,
  PlusOutlined,
  RightOutlined,
  ArrowRightOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  BulbOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { promptsAPI, Prompt } from '../api'

const { Title, Text, Paragraph } = Typography

export default function HomePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { token: themeToken } = theme.useToken()
  const [recentPrompts, setRecentPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prompts = await promptsAPI.list({ limit: 6, public_only: true })
        setRecentPrompts(prompts)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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

  return (
    <div>
      {/* Welcome Banner */}
      <Card
        style={{
          marginBottom: 24,
          background: `linear-gradient(135deg, ${themeToken.colorPrimary} 0%, #1677ff88 100%)`,
          borderRadius: 12,
          border: 'none',
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={3} style={{ color: '#fff', margin: 0 }}>
              👋 欢迎回来，{user?.display_name || user?.username}！
            </Title>
            <Paragraph style={{ color: '#fff', marginTop: 8, marginBottom: 0, opacity: 0.9 }}>
              今天也是提升AI提示词技能的好日子！探索提示词库或创建新的提示词吧。
            </Paragraph>
          </Col>
          <Col>
            <Space>
              <Button
                type="default"
                ghost
                icon={<PlusOutlined />}
                onClick={() => navigate('/prompts/create')}
              >
                创建提示词
              </Button>
              <Button
                type="primary"
                ghost
                style={{ borderColor: '#fff', color: '#fff' }}
                icon={<CrownOutlined />}
                onClick={() => navigate('/membership')}
              >
                升级会员
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Training Banner */}
      <Card
        hoverable
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 12,
          border: 'none',
          cursor: 'pointer',
        }}
        onClick={() => navigate('/training')}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>
                <ThunderboltOutlined /> AI Prompt 训练中心
              </Title>
              <Paragraph style={{ color: '#fff', margin: 0, opacity: 0.9 }}>
                输入您的Prompt → 选择模型 → AI多维评分 → 获得优化建议与专属训练任务
              </Paragraph>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              ghost
              size="large"
              icon={<BulbOutlined />}
              style={{ borderColor: '#fff', color: '#fff' }}
            >
              开始训练
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card hoverable onClick={() => navigate('/prompts')}>
            <Statistic
              title="提示词库"
              value={recentPrompts.length}
              prefix={<FileTextOutlined />}
              suffix="个最新"
              valueStyle={{ color: themeToken.colorPrimary }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable onClick={() => navigate('/my-prompts')}>
            <Statistic
              title="我的提示词"
              value="..."

              prefix={<UserOutlined />}
              valueStyle={{ color: themeToken.colorSuccess }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable onClick={() => navigate('/training')}>
            <Statistic
              title="训练中心"
              value="3步评分"
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: themeToken.colorPrimary }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Prompts */}
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>最新提示词</span>
          </Space>
        }
        extra={
          <Button type="link" onClick={() => navigate('/prompts')}>
            查看全部 <ArrowRightOutlined />
          </Button>
        }
        loading={loading}
      >
        <List
          dataSource={recentPrompts}
          renderItem={(prompt) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  icon={<RightOutlined />}
                  onClick={() => navigate(`/prompts/${prompt.id}`)}
                >
                  详情
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong>{prompt.title}</Text>
                    <Tag color={difficultyColor[prompt.difficulty]}>
                      {difficultyLabel[prompt.difficulty]}
                    </Tag>
                    {prompt.average_score !== null && prompt.average_score !== undefined && prompt.average_score > 0 && (
                      <Rate
                        disabled
                        allowHalf
                        value={prompt.average_score / 2}
                        style={{ fontSize: 14 }}
                      />
                    )}
                  </Space>
                }
                description={
                  <Space direction="vertical" size={2}>
                    <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
                      {prompt.content}
                    </Typography.Paragraph>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {prompt.author_name && `作者: ${prompt.author_name}`}
                      {prompt.category && ` | 分类: ${prompt.category}`}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: '暂无提示词数据' }}
        />
      </Card>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12}>
          <Card
            hoverable
            onClick={() => navigate('/prompts/create')}
            style={{ textAlign: 'center', padding: 32 }}
          >
            <PlusOutlined style={{ fontSize: 48, color: themeToken.colorPrimary, marginBottom: 16 }} />
            <Title level={4}>创建新提示词</Title>
            <Text type="secondary">编写并提交您的AI提示词，获取专业评分与反馈</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card
            hoverable
            onClick={() => navigate('/prompts')}
            style={{ textAlign: 'center', padding: 32 }}
          >
            <StarOutlined style={{ fontSize: 48, color: themeToken.colorWarning, marginBottom: 16 }} />
            <Title level={4}>探索提示词库</Title>
            <Text type="secondary">浏览社区提示词，学习优秀写法，为他人的作品打分</Text>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
