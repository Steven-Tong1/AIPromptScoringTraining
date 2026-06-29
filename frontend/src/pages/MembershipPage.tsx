import { useEffect, useState } from 'react'
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  List,
  Space,
  Tag,
  message,
  Modal,
  Spin,
  Descriptions,
  Empty,
  Divider,
} from 'antd'
import {
  CrownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { membershipsAPI, MembershipPlan, PaymentRecord } from '../api'
import type { UserMembership } from '../api/memberships'

const { Title, Text, Paragraph } = Typography

const featureLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  max_prompts_per_day: { label: '每日提示词上限', icon: null },
  max_score_queries: { label: '每日评分次数', icon: null },
  can_use_ai_scoring: { label: 'AI智能评分', icon: null },
  can_export_reports: { label: '导出报告', icon: null },
  priority_support: { label: '优先客服支持', icon: null },
}

export default function MembershipPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [myMembership, setMyMembership] = useState<UserMembership | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [plansData, paymentsData] = await Promise.all([
        membershipsAPI.getPlans(),
        membershipsAPI.getPayments(),
      ])
      setPlans(plansData)
      setPayments(paymentsData)
      try {
        const membership = await membershipsAPI.getMyMembership()
        setMyMembership(membership)
      } catch {
        setMyMembership(null)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleBuy = (plan: MembershipPlan) => {
    setSelectedPlan(plan)
    Modal.confirm({
      title: `确认购买 ${plan.name}`,
      content: (
        <div>
          <Paragraph>
            您即将购买 <Text strong>{plan.name}</Text>，价格：
            <Text strong style={{ fontSize: 18, color: '#f5222d' }}>
              ¥{plan.price}
            </Text>
          </Paragraph>
          <Paragraph type="secondary">
            有效期：{plan.duration_days} 天
          </Paragraph>
        </div>
      ),
      onOk: async () => {
        setBuying(true)
        try {
          await membershipsAPI.createPayment({
            membership_id: plan.id,
            amount: plan.price,
          })
          message.success(`🎉 成功购买 ${plan.name}！`)
          fetchData()
        } catch {
          // handled by interceptor
        } finally {
          setBuying(false)
        }
      },
    })
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={3}>
          <CrownOutlined style={{ color: '#faad14' }} /> 会员方案
        </Title>
        <Text type="secondary">
          选择适合您的方案，解锁更多AI提示词学习功能
        </Text>
      </div>

      {/* Current Membership */}
      {myMembership && (
        <Card
          style={{
            marginBottom: 32,
            border: '1px solid #faad14',
            background: '#fffbe6',
          }}
        >
          <Space direction="vertical" size={8}>
            <Space>
              <CrownOutlined style={{ fontSize: 24, color: '#faad14' }} />
              <Title level={5} style={{ margin: 0 }}>
                当前会员：{myMembership.membership_name}
              </Title>
            </Space>
            <Text>
              有效期至：{new Date(myMembership.end_date).toLocaleDateString('zh-CN')}
              {myMembership.is_expired && (
                <Tag color="red" style={{ marginLeft: 8 }}>
                  已过期
                </Tag>
              )}
            </Text>
          </Space>
        </Card>
      )}

      {/* Plans Grid */}
      <Row gutter={[24, 24]} justify="center">
        {plans
          .filter((p) => p.price >= 0)
          .map((plan) => {
            const isFree = plan.price === 0
            const isPopular = plan.name.includes('专业版') && !plan.name.includes('年度')

            return (
              <Col xs={24} sm={12} md={8} lg={6} key={plan.id}>
                <Card
                  hoverable
                  style={{
                    border: isPopular ? '2px solid #1677ff' : undefined,
                    borderRadius: 12,
                    height: '100%',
                  }}
                  bodyStyle={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  {isPopular && (
                    <Tag
                      color="blue"
                      style={{ position: 'absolute', top: 12, right: 12 }}
                    >
                      推荐
                    </Tag>
                  )}

                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={4}>{plan.name}</Title>
                    <div>
                      <Text
                        style={{
                          fontSize: 36,
                          fontWeight: 'bold',
                          color: isFree ? '#999' : '#f5222d',
                        }}
                      >
                        ¥{plan.price}
                      </Text>
                      {!isFree && (
                        <Text type="secondary"> / {plan.duration_days}天</Text>
                      )}
                    </div>
                    <Paragraph type="secondary" style={{ marginTop: 8 }}>
                      {plan.description}
                    </Paragraph>
                  </div>

                  <Divider style={{ margin: '0 0 16px' }} />

                  <List
                    size="small"
                    split={false}
                    style={{ flex: 1 }}
                    dataSource={[
                      {
                        label: '每日提示词上限',
                        value: plan.max_prompts_per_day,
                        included: true,
                      },
                      {
                        label: '每日评分次数',
                        value: plan.max_score_queries,
                        included: true,
                      },
                      {
                        label: 'AI智能评分',
                        included: plan.can_use_ai_scoring,
                      },
                      {
                        label: '导出报告',
                        included: plan.can_export_reports,
                      },
                      {
                        label: '优先客服支持',
                        included: plan.priority_support,
                      },
                    ]}
                    renderItem={(item: any) => (
                      <List.Item>
                        <Space>
                          {item.included ? (
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          ) : (
                            <CloseCircleOutlined style={{ color: '#d9d9d9' }} />
                          )}
                          <Text
                            type={item.included ? undefined : 'secondary'}
                            style={
                              item.included ? undefined : { textDecoration: 'line-through' }
                            }
                          >
                            {item.label}
                            {item.value !== undefined
                              ? `: ${item.value}`
                              : ''}
                          </Text>
                        </Space>
                      </List.Item>
                    )}
                  />

                  <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Button
                      type={isPopular ? 'primary' : 'default'}
                      size="large"
                      block
                      onClick={() => handleBuy(plan)}
                      disabled={isFree}
                      loading={buying && selectedPlan?.id === plan.id}
                    >
                      {isFree ? '当前使用' : '立即购买'}
                    </Button>
                  </div>
                </Card>
              </Col>
            )
          })}
      </Row>

      {/* Payment History */}
      <Card title="充值记录" style={{ marginTop: 32 }}>
        {payments.length === 0 ? (
          <Empty description="暂无充值记录" />
        ) : (
          <List
            dataSource={payments}
            renderItem={(payment) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{payment.membership_name}</Text>
                      <Tag
                        color={
                          payment.status === 'completed'
                            ? 'success'
                            : payment.status === 'pending'
                            ? 'processing'
                            : 'error'
                        }
                      >
                        {payment.status === 'completed'
                          ? '已完成'
                          : payment.status === 'pending'
                          ? '处理中'
                          : '失败'}
                      </Tag>
                    </Space>
                  }
                  description={new Date(payment.created_at).toLocaleString('zh-CN')}
                />
                <Text strong style={{ color: '#f5222d', fontSize: 16 }}>
                  -¥{payment.amount}
                </Text>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}
