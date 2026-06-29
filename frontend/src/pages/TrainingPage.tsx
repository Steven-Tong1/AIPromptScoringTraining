import { useState, useRef, useEffect } from 'react'
import {
  Card,
  Typography,
  Select,
  Button,
  Space,
  Row,
  Col,
  Tag,
  Steps,
  Spin,
  Empty,
  Divider,
  Collapse,
  Alert,
  Progress,
  Tooltip,
  Badge,
  Rate,
  Tabs,
  Statistic,
  theme,
} from 'antd'
import {
  RadarChartOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  BulbOutlined,
  ExperimentOutlined,
  SendOutlined,
  ClearOutlined,
  RobotOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  TrophyOutlined,
  AimOutlined,
  StarOutlined,
  GithubOutlined,
} from '@ant-design/icons'
import { trainingAPI, TrainingResponse } from '../api'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const { Title, Text, Paragraph } = Typography

const difficultyColors: Record<string, string> = {
  beginner: 'green',
  intermediate: 'orange',
  advanced: 'red',
}

const difficultyLabels: Record<string, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
}

export default function TrainingPage() {
  const { token: themeToken } = theme.useToken()
  const [promptContent, setPromptContent] = useState('')
  const [selectedModel, setSelectedModel] = useState('deepseek')
  const [selectedScenario, setSelectedScenario] = useState('general')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TrainingResponse | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [models, setModels] = useState<{ value: string; label: string; description: string }[]>([])
  const [scenarios, setScenarios] = useState<{ value: string; label: string; description: string }[]>([])
  const resultRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    trainingAPI.getModels().then(setModels).catch(() => {})
    trainingAPI.getScenarios().then(setScenarios).catch(() => {})
  }, [])

  const handleAnalyze = async () => {
    if (!promptContent.trim()) return
    setLoading(true)
    setActiveStep(1)
    try {
      const res = await trainingAPI.analyze({
        prompt_content: promptContent,
        model: selectedModel,
        scenario: selectedScenario,
      })
      setResult(res)
      setActiveStep(2)
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    } catch {
      setActiveStep(0)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setPromptContent('')
    setResult(null)
    setActiveStep(0)
  }

  const selectedModelLabel = models.find((m) => m.value === selectedModel)?.label || selectedModel
  const selectedScenarioLabel = scenarios.find((s) => s.value === selectedScenario)?.label || selectedScenario

  // Build radar data (8 dimensions)
  const radarData = result
    ? [
        { dimension: '清晰度', score: result.radar_scores.clarity },
        { dimension: '具体性', score: result.radar_scores.specificity },
        { dimension: '创造性', score: result.radar_scores.creativity },
        { dimension: '可行性', score: result.radar_scores.feasibility },
        { dimension: '完整性', score: result.radar_scores.completeness },
        { dimension: '简洁性', score: result.radar_scores.conciseness },
        { dimension: '模型适配', score: result.radar_scores.model_fit },
        { dimension: 'Token效率', score: result.radar_scores.token_efficiency },
      ]
    : []

  const overallScore = result
    ? (
        (result.radar_scores.clarity +
          result.radar_scores.specificity +
          result.radar_scores.creativity +
          result.radar_scores.feasibility +
          result.radar_scores.completeness +
          result.radar_scores.conciseness +
          result.radar_scores.model_fit +
          result.radar_scores.token_efficiency) /
        8
      ).toFixed(1)
    : '0.0'

  return (
    <div>
      {/* Step Progress */}
      <Card style={{ marginBottom: 24 }}>
        <Steps
          current={activeStep}
          size="small"
          items={[
            {
              title: '输入 Prompt',
              description: '编写与选择模型',
              icon: <FileTextOutlined />,
            },
            {
              title: '引擎分析',
              description: loading ? '分析中...' : 'AI 评分与诊断',
              icon: loading ? <Spin size="small" /> : <ThunderboltOutlined />,
            },
            {
              title: '结果反馈',
              description: '评分与训练建议',
              icon: <BulbOutlined />,
            },
          ]}
        />
      </Card>

      {/* Step 1: Input Layer */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <span>Prompt 编辑器</span>
                <Tag color="blue">Step 1</Tag>
              </Space>
            }
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {promptContent.length} 字符
              </Text>
            }
          >
            <textarea
              ref={editorRef}
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              placeholder={`在此输入您的 AI Prompt...\n\n示例：\n"请帮我写一篇关于人工智能未来发展的文章，要求2000字左右，面向普通读者，语言通俗易懂"`}
              style={{
                width: '100%',
                height: 300,
                padding: 16,
                fontSize: 14,
                fontFamily: "'SF Mono', 'Monaco', 'Cascadia Code', monospace",
                lineHeight: 1.6,
                border: `1px solid ${themeToken.colorBorder}`,
                borderRadius: 8,
                resize: 'vertical',
                outline: 'none',
                background: '#1e1e1e',
                color: '#d4d4d4',
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <RobotOutlined />
                <span>模型与场景</span>
                <Tag color="blue">Step 1</Tag>
              </Space>
            }
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  <SwapOutlined /> 选择目标模型
                </Text>
                <Select
                  value={selectedModel}
                  onChange={setSelectedModel}
                  style={{ width: '100%' }}
                  size="large"
                  optionRender={(option) => (
                    <div style={{ padding: '4px 0' }}>
                      <div style={{ fontWeight: 600, lineHeight: 1.4 }}>{option.data.label}</div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{option.data.description}</div>
                    </div>
                  )}
                  options={models.map((m) => ({
                    label: m.label,
                    description: m.description,
                    value: m.value,
                  }))}
                />
              </div>

              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  <AimOutlined /> 选择使用场景
                </Text>
                <Select
                  value={selectedScenario}
                  onChange={setSelectedScenario}
                  style={{ width: '100%' }}
                  size="large"
                  optionRender={(option) => (
                    <div style={{ padding: '4px 0' }}>
                      <div style={{ fontWeight: 600, lineHeight: 1.4 }}>{option.data.label}</div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{option.data.description}</div>
                    </div>
                  )}
                  options={scenarios.map((s) => ({
                    label: s.label,
                    description: s.description,
                    value: s.value,
                  }))}
                />
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <Space style={{ width: '100%' }} size={12}>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleAnalyze}
                  loading={loading}
                  disabled={!promptContent.trim()}
                  size="large"
                  block
                  style={{ height: 48 }}
                >
                  开始评分与训练
                </Button>
                <Tooltip title="清空">
                  <Button
                    icon={<ClearOutlined />}
                    onClick={handleClear}
                    disabled={!promptContent && !result}
                    size="large"
                  />
                </Tooltip>
              </Space>
            </Space>
          </Card>

          {/* Quick tips */}
          <Card size="small" style={{ marginTop: 16 }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <BulbOutlined /> 提示：好的 Prompt 应包含角色设定、具体任务、输出格式和约束条件
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Step 3: Results Layer */}
      {result && (
        <div ref={resultRef} style={{ marginTop: 24 }}>
          <Divider>
            <Tag color="success" style={{ fontSize: 14, padding: '4px 16px' }}>
              <CheckCircleOutlined /> 分析完成 — 目标模型：{result.selected_model} | 场景：{result.scenario}
            </Tag>
          </Divider>

          {/* Overall Score Banner */}
          <Card
            style={{
              marginBottom: 24,
              background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
              borderRadius: 12,
              border: 'none',
            }}
          >
            <Row align="middle" justify="space-between">
              <Col>
                <Space direction="vertical" size={4}>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
                    <TrophyOutlined /> 综合评分：{overallScore} / 10
                  </Text>
                  <Text style={{ color: '#ffffffcc' }}>
                    {parseFloat(overallScore) >= 7
                      ? '🎉 表现优秀！您的提示词写作技巧很出色！'
                      : parseFloat(overallScore) >= 5
                      ? '📈 基础不错！继续优化可以更上一层楼！'
                      : '🌱 起步阶段！通过训练可以快速提升！'}
                  </Text>
                </Space>
              </Col>
              <Col>
                <Progress
                  type="circle"
                  percent={Math.round(parseFloat(overallScore) * 10)}
                  size={80}
                  strokeColor={{ '0%': '#ffd700', '100%': '#ff6b6b' }}
                  format={() => `${overallScore}`}
                  trailColor="#ffffff33"
                />
              </Col>
            </Row>
          </Card>

          {/* Main Results Grid */}
          <Row gutter={[24, 24]}>
            {/* Radar Chart */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <RadarChartOutlined />
                    <span>评分雷达图</span>
                  </Space>
                }
                extra={
                  <Space size={4}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <StarOutlined /> 8维评估
                    </Text>
                    <Tag color="purple" style={{ fontSize: 10, lineHeight: '16px' }}>含模型适配</Tag>
                  </Space>
                }
              >
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e8e8e8" />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{ fontSize: 13, fill: '#666' }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 10]}
                      tick={{ fontSize: 11, fill: '#999' }}
                    />
                    <Radar
                      name="当前评分"
                      dataKey="score"
                      stroke={themeToken.colorPrimary}
                      fill={themeToken.colorPrimary}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>

                {/* Dimension description */}
                <Collapse
                  ghost
                  size="small"
                  style={{ marginTop: 8 }}
                  items={[
                    {
                      key: 'dims',
                      label: (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <BulbOutlined /> 8个维度说明（含2个模型感知维度）
                        </Text>
                      ),
                      children: (
                        <Row gutter={[8, 8]}>
                          {[
                            { dim: '清晰度', desc: '指令表达是否清晰明确', color: '#1677ff' },
                            { dim: '具体性', desc: '是否包含具体数字、示例和约束', color: '#52c41a' },
                            { dim: '创造性', desc: '词汇多样性与创意引导', color: '#722ed1' },
                            { dim: '可行性', desc: '输出要求是否可执行', color: '#fa8c16' },
                            { dim: '完整性', desc: '角色+任务+约束+输出是否完整', color: '#eb2f96' },
                            { dim: '简洁性', desc: '表达是否精炼无冗余', color: '#13c2c2' },
                            { dim: '模型适配', desc: `Prompt结构是否匹配 ${result.selected_model} 的特性`, color: '#fa541c' },
                            { dim: 'Token效率', desc: `Token使用效率是否符合 ${result.selected_model} 的最佳实践`, color: '#2f54eb' },
                          ].map((item) => (
                            <Col xs={12} key={item.dim}>
                              <Space size={6}>
                                <div
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: item.color,
                                    flexShrink: 0,
                                  }}
                                />
                                <div>
                                  <Text style={{ fontSize: 12, fontWeight: 500 }}>{item.dim}</Text>
                                  <br />
                                  <Text type="secondary" style={{ fontSize: 11 }}>
                                    {item.desc}
                                  </Text>
                                </div>
                              </Space>
                            </Col>
                          ))}
                        </Row>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>

            {/* Token Diagnosis */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <WarningOutlined />
                    <span>冗余 Token 诊断</span>
                  </Space>
                }
                extra={
                  <Tag
                    color={
                      result.token_diagnosis.redundant_ratio > 0.3
                        ? 'red'
                        : result.token_diagnosis.redundant_ratio > 0.15
                        ? 'orange'
                        : 'green'
                    }
                  >
                    {result.token_diagnosis.redundant_ratio > 0.3
                      ? '冗余较多'
                      : result.token_diagnosis.redundant_ratio > 0.15
                      ? '轻度冗余'
                      : '较为简洁'}
                  </Tag>
                }
              >
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Statistic
                      title="总 Token"
                      value={result.token_diagnosis.total_tokens}
                      valueStyle={{ fontSize: 20 }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="冗余 Token"
                      value={result.token_diagnosis.redundant_tokens}
                      valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="冗余占比"
                      value={result.token_diagnosis.redundant_ratio * 100}
                      suffix="%"
                      precision={1}
                      valueStyle={{
                        color:
                          result.token_diagnosis.redundant_ratio > 0.3
                            ? '#ff4d4f'
                            : result.token_diagnosis.redundant_ratio > 0.15
                            ? '#faad14'
                            : '#52c41a',
                        fontSize: 20,
                      }}
                    />
                  </Col>
                </Row>

                <Collapse
                  ghost
                  defaultActiveKey={['details']}
                  items={[
                    {
                      key: 'details',
                      label: (
                        <Space>
                          <FileTextOutlined />
                          <span>诊断详情</span>
                          <Tag>{result.token_diagnosis.redundant_details.length} 项</Tag>
                        </Space>
                      ),
                      children: (
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          {result.token_diagnosis.redundant_details.map((d, i) => (
                            <Alert
                              key={i}
                              message={d}
                              type="warning"
                              showIcon
                              icon={<CloseCircleOutlined />}
                              style={{ padding: '8px 12px' }}
                            />
                          ))}
                          {result.token_diagnosis.redundant_details.length === 0 && (
                            <Text type="secondary">未发现明显冗余问题</Text>
                          )}
                        </Space>
                      ),
                    },
                    {
                      key: 'suggestions',
                      label: (
                        <Space>
                          <BulbOutlined />
                          <span>优化建议</span>
                        </Space>
                      ),
                      children: (
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          {result.token_diagnosis.suggestions.map((s, i) => (
                            <Alert
                              key={i}
                              message={s}
                              type="info"
                              showIcon
                              icon={<CheckCircleOutlined />}
                              style={{ padding: '8px 12px' }}
                            />
                          ))}
                        </Space>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>

            {/* Optimized Versions */}
            <Col xs={24}>
              <Card
                title={
                  <Space>
                    <ExperimentOutlined />
                    <span>优化三版本</span>
                  </Space>
                }
                extra={
                  <Tag color="blue">
                    <SwapOutlined /> 选择最适合您需求的版本
                  </Tag>
                }
              >
                <Row gutter={[16, 16]}>
                  {result.optimized_versions.map((v, i) => (
                    <Col xs={24} md={8} key={i}>
                      <Badge.Ribbon
                        text={v.title}
                        color={
                          i === 0 ? 'green' : i === 1 ? 'blue' : 'purple'
                        }
                      >
                        <Card
                          style={{
                            border: `1px solid ${
                              i === 0
                                ? '#52c41a'
                                : i === 1
                                ? '#1677ff'
                                : '#722ed1'
                            }22`,
                          }}
                          bodyStyle={{ padding: 16 }}
                        >
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {v.focus}
                          </Text>
                          <div
                            style={{
                              marginTop: 12,
                              padding: 12,
                              background: '#f6f8fa',
                              borderRadius: 6,
                              maxHeight: 200,
                              overflow: 'auto',
                              fontSize: 13,
                              lineHeight: 1.6,
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {v.content}
                          </div>
                          <Button
                            type="link"
                            size="small"
                            style={{ marginTop: 8 }}
                            icon={<GithubOutlined />}
                            onClick={() => {
                              navigator.clipboard.writeText(v.content)
                            }}
                          >
                            复制此版本
                          </Button>
                        </Card>
                      </Badge.Ribbon>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>

            {/* Training Coach Advice */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <BulbOutlined />
                    <span>训练教练建议</span>
                    <Tag color="gold">AI Coach</Tag>
                  </Space>
                }
              >
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <Alert
                    message={
                      <div>
                        <Text strong>综合评估</Text>
                        <Paragraph style={{ margin: '8px 0 0 0' }}>
                          {result.training_advice.summary}
                        </Paragraph>
                      </div>
                    }
                    type="success"
                    showIcon
                  />

                  <Tabs
                    size="small"
                    items={[
                      {
                        key: 'strengths',
                        label: (
                          <span>
                            <CheckCircleOutlined /> 优势 
                            <Tag style={{ marginLeft: 4 }}>{result.training_advice.strengths.length}</Tag>
                          </span>
                        ),
                        children: (
                          <Space direction="vertical" size={8} style={{ width: '100%' }}>
                            {result.training_advice.strengths.map((s, i) => (
                              <Text key={i} style={{ display: 'block', padding: '4px 0' }}>
                                {s}
                              </Text>
                            ))}
                          </Space>
                        ),
                      },
                      {
                        key: 'weaknesses',
                        label: (
                          <span>
                            <CloseCircleOutlined /> 待提升
                            <Tag style={{ marginLeft: 4 }}>{result.training_advice.weaknesses.length}</Tag>
                          </span>
                        ),
                        children: (
                          <Space direction="vertical" size={8} style={{ width: '100%' }}>
                            {result.training_advice.weaknesses.map((s, i) => (
                              <Text key={i} style={{ display: 'block', padding: '4px 0' }}>
                                {s}
                              </Text>
                            ))}
                          </Space>
                        ),
                      },
                      {
                        key: 'improvements',
                        label: (
                          <span>
                            <AimOutlined /> 改进建议
                          </span>
                        ),
                        children: (
                          <Space direction="vertical" size={8} style={{ width: '100%' }}>
                            {result.training_advice.improvements.map((s, i) => (
                              <Alert
                                key={i}
                                message={s}
                                type="info"
                                showIcon
                                style={{ padding: '6px 12px' }}
                              />
                            ))}
                          </Space>
                        ),
                      },
                    ]}
                  />

                  <Divider style={{ margin: '8px 0' }} />

                  <Alert
                    message={
                      <div>
                        <Text strong>
                          <RobotOutlined /> {result.selected_model} 专属建议
                        </Text>
                        <Paragraph style={{ margin: '8px 0 0 0' }}>
                          {result.training_advice.model_specific_tips}
                        </Paragraph>
                      </div>
                    }
                    type="info"
                    showIcon
                  />

                  <Alert
                    message={
                      <div>
                        <Text strong>
                          <AimOutlined /> {result.scenario} 场景建议
                        </Text>
                        <Paragraph style={{ margin: '8px 0 0 0' }}>
                          {result.training_advice.scenario_tips}
                        </Paragraph>
                      </div>
                    }
                    type="warning"
                    showIcon
                  />
                </Space>
              </Card>
            </Col>

            {/* Training Center */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <TrophyOutlined />
                    <span>训练中心 — 专属练习任务</span>
                    <Tag color="volcano">Practice</Tag>
                  </Space>
                }
              >
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  {result.training_tasks.map((task, i) => (
                    <Card
                      key={i}
                      size="small"
                      hoverable
                      style={{
                        borderLeft: `4px solid ${
                          task.difficulty === 'beginner'
                            ? '#52c41a'
                            : task.difficulty === 'intermediate'
                            ? '#faad14'
                            : '#ff4d4f'
                        }`,
                      }}
                    >
                      <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        <Row justify="space-between" align="middle">
                          <Col>
                            <Space>
                              <Text strong>
                                {i === 0 ? '①' : i === 1 ? '②' : '③'} {task.title}
                              </Text>
                              <Tag color={difficultyColors[task.difficulty]}>
                                {difficultyLabels[task.difficulty]}
                              </Tag>
                            </Space>
                          </Col>
                          <Col>
                            <Tooltip title="将此任务描述复制到编辑器中开始练习">
                              <Button
                                type="link"
                                size="small"
                                icon={<SendOutlined />}
                                onClick={() => {
                                  setPromptContent(task.description)
                                  window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                              >
                                去练习
                              </Button>
                            </Tooltip>
                          </Col>
                        </Row>
                        <Paragraph
                          style={{ margin: 0, fontSize: 13, color: '#666' }}
                        >
                          {task.description}
                        </Paragraph>
                        <Collapse
                          ghost
                          size="small"
                          items={[
                            {
                              key: 'hint',
                              label: (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  <BulbOutlined /> 查看提示
                                </Text>
                              ),
                              children: (
                                <div style={{ padding: '8px 12px', background: '#fffbe6', borderRadius: 4 }}>
                                  <Text style={{ fontSize: 13 }}>{task.hint}</Text>
                                </div>
                              ),
                            },
                          ]}
                        />
                        <Alert
                          message={
                            <Text style={{ fontSize: 12 }}>
                              <TrophyOutlined /> {task.expected_improvement}
                            </Text>
                          }
                          type="success"
                          showIcon={false}
                          style={{
                            padding: '4px 12px',
                            background: '#f6ffed',
                            border: '1px solid #b7eb8f',
                          }}
                        />
                      </Space>
                    </Card>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>

          {/* AI Training Feedback — 核心提示词增强 */}
          <Card
            style={{ marginTop: 24 }}
            title={
              <Space>
                <TrophyOutlined />
                <span>🎯 AI 训练教练 — 核心反馈</span>
                <Tag color="gold">Model-Aware Coach</Tag>
              </Space>
            }
          >
            <Space direction="vertical" size={20} style={{ width: '100%' }}>
              {/* Short Feedback Banner */}
              <Alert
                message={
                  <div style={{ fontSize: 15, fontWeight: 500 }}>
                    {result.training_feedback.short_feedback}
                  </div>
                }
                type={result.training_feedback.user_level === 'advanced' ? 'success' : result.training_feedback.user_level === 'intermediate' ? 'info' : 'warning'}
                showIcon
                style={{ padding: '12px 16px' }}
              />

              {/* User Level Badge */}
              <Space>
                <Text strong>用户水平：</Text>
                <Tag
                  color={
                    result.training_feedback.user_level === 'advanced'
                      ? 'gold'
                      : result.training_feedback.user_level === 'intermediate'
                      ? 'blue'
                      : 'green'
                  }
                  style={{ fontSize: 13, padding: '2px 12px' }}
                >
                  {result.training_feedback.user_level === 'advanced'
                    ? '🏆 高级'
                    : result.training_feedback.user_level === 'intermediate'
                    ? '📈 进阶'
                    : '🌱 入门'}
                </Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  基于6维评分综合判定
                </Text>
              </Space>

              <Divider style={{ margin: '4px 0' }} />

              {/* Main Mistakes */}
              <div>
                <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 12 }}>
                  <CloseCircleOutlined /> 主要问题分析
                </Text>
                <Row gutter={[16, 16]}>
                  {result.training_feedback.main_mistakes.map((m, i) => (
                    <Col xs={24} md={12} key={i}>
                      <Card
                        size="small"
                        style={{
                          borderLeft: '4px solid #ff4d4f',
                          height: '100%',
                        }}
                      >
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          <Text strong style={{ color: '#ff4d4f', fontSize: 14 }}>
                            ⚠️ {m.mistake}
                          </Text>
                          <div
                            style={{
                              padding: '8px 12px',
                              background: '#fff2f0',
                              borderRadius: 4,
                              fontSize: 13,
                            }}
                          >
                            <Text type="secondary">
                              <span style={{ fontWeight: 600, color: '#cf1322' }}>为什么重要：</span>
                              {m.why_it_matters}
                            </Text>
                          </div>
                          <div
                            style={{
                              padding: '8px 12px',
                              background: '#f6ffed',
                              borderRadius: 4,
                              fontSize: 13,
                            }}
                          >
                            <Text type="secondary">
                              <span style={{ fontWeight: 600, color: '#389e0d' }}>如何修改：</span>
                              {m.how_to_fix}
                            </Text>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>

              {/* Learning Formula */}
              <Divider style={{ margin: '4px 0' }} />
              <div>
                <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 8 }}>
                  <BulbOutlined /> 下次写作公式
                </Text>
                <div
                  style={{
                    padding: 16,
                    background: '#f0f5ff',
                    border: '1px solid #d6e4ff',
                    borderRadius: 8,
                    fontSize: 14,
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap',
                    fontFamily: "'SF Mono', 'Monaco', 'Cascadia Code', monospace",
                  }}
                >
                  {result.training_feedback.learning_formula}
                </div>
              </div>

              {/* Next Practice */}
              <Divider style={{ margin: '4px 0' }} />
              <div>
                <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 12 }}>
                  <ExperimentOutlined /> 专属练习任务
                </Text>
                <Card
                  style={{
                    borderLeft: '4px solid #722ed1',
                    background: '#f9f0ff',
                  }}
                >
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <Text strong style={{ fontSize: 14, color: '#722ed1' }}>
                      📋 {result.training_feedback.next_practice.task}
                    </Text>
                    <div
                      style={{
                        padding: 12,
                        background: '#fff',
                        borderRadius: 6,
                        fontSize: 13,
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {result.training_feedback.next_practice.instruction}
                    </div>
                    <Alert
                      message={
                        <Text style={{ fontSize: 12 }}>
                          <RobotOutlined /> {result.training_feedback.next_practice.model_suggestion}
                        </Text>
                      }
                      type="info"
                      showIcon={false}
                      style={{
                        padding: '6px 12px',
                        background: '#e6f7ff',
                        border: '1px solid #91d5ff',
                      }}
                    />
                    <Button
                      type="primary"
                      ghost
                      icon={<SendOutlined />}
                      onClick={() => {
                        setPromptContent(result.training_feedback.next_practice.instruction)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                    >
                      去练习
                    </Button>
                  </Space>
                </Card>
              </div>
            </Space>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <Card style={{ marginTop: 24, textAlign: 'center' }}>
          <Empty
            image={<ThunderboltOutlined style={{ fontSize: 64, color: '#ccc' }} />}
            description={
              <Space direction="vertical" size={8}>
                <Text strong>准备开始训练</Text>
                <Text type="secondary">
                  在上方编辑器中输入您的 Prompt，选择模型与场景，然后点击"开始评分与训练"
                </Text>
              </Space>
            }
          />
        </Card>
      )}
    </div>
  )
}
