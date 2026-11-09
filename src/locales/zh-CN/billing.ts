export default {
  'billing.subtitle': '用量明细、账期报表与 Token 预算',
  'billing.unit': '显示单位',
  'billing.money': '金额',
  'billing.period': '账期',
  'billing.groupBy': '归属维度',
  'billing.refresh': '刷新',
  'billing.prompt': '输入',
  'billing.completion': '输出',
  'billing.total': '合计',
  'billing.requests': '请求数',
  'billing.tokenCost': 'Token 费用',
  'billing.tab.usage': '成本 / 用量明细',
  'billing.tab.reports': '账单 / 报表',
  'billing.tab.budgets': '预算与告警',
  'billing.tab.attribution': '费用归属 / 分摊',
  'billing.tab.settings': '计费设置',
  'billing.dimension.organization': '组织',
  'billing.dimension.user': '用户',
  'billing.dimension.model': '模型',
  'billing.dimension.api_key': 'API 密钥',
  'billing.dimension.global': '全局',
  'billing.api.missing': '需要升级计费后端',
  'billing.api.upgrade':
    '请部署 OSS 计费 API 分支并完成数据库迁移，然后刷新此页。',
  'billing.api.forbidden': '需要平台管理员权限',
  'billing.api.error': '无法加载计费数据',
  'billing.api.retry': '请检查权限与后端连接后刷新。此次操作未保存更改。',
  'billing.fallback':
    '当前从用量 API 加载 Token 数量。金额、换算设置与预算需要升级计费 / 配额后端。请部署计费 API 分支、执行数据库迁移后刷新。',
  'billing.routeFallback':
    '此后端提供模型路由用量，当前按路由分组，而非部署模型。',
  'billing.periodHint':
    '日期包含起止两天，按 UTC 每日用量汇总。用量采集完成后可刷新查看。',
  'billing.empty': '此账期暂无用量。请发起推理请求或选择其他账期。',
  'billing.moneyHint':
    '金额依次使用模型单价、默认模型单价、Token 换算费率。GPU 费用仅计入账期汇总。可在「计费设置」编辑费率。',
  'billing.gpuSummary':
    'GPU 小时：{hours} · GPU 费用：{currency} {cost} · 账期总费用：{currency} {total}',
  'billing.attributionHint':
    '按消费组织、用户、模型或 API 密钥归属 Token 用量与费用。组织维度可能包含个人空间；GPU 费用仅在账期汇总中展示。',
  'billing.reportHint':
    '基于当前 API 结果生成账期对账单。CSV 包含全部已加载明细与所选单位的账期汇总。费率按生成时的设置计算；此报表不作为税务发票。',
  'billing.export': '导出账期对账单（CSV）',
  'billing.error.range': '数据量过大，请缩短账期。',
  'billing.budget.create': '创建预算 / 速率限制',
  'billing.budget.edit': '编辑预算 / 速率限制',
  'billing.budget.kind': '规则类型',
  'billing.budget.subject': '适用对象',
  'billing.budget.subjectId': '对象 ID',
  'billing.budget.subjectHint':
    '请填写管理 API 中的组织主体、用户、模型或 API 密钥数字 ID。全局规则适用于所有请求。',
  'billing.budget.window': '时间窗口（秒）',
  'billing.budget.windowHint':
    '按最近若干秒滚动统计，不按自然月对齐。60 = 1 分钟；86400 = 1 天；2592000 = 30 天。最大 31536000 秒。',
  'billing.budget.limit': '上限',
  'billing.budget.limitHint':
    'Token 预算 / 速率的单位为 Token，请求速率的单位为请求数。切换金额视图不会改变限额单位。',
  'billing.budget.enabled': '启用',
  'billing.budget.used': '已用 / 上限',
  'billing.budget.rule': '配额规则',
  'billing.budget.empty': '暂无配额规则。可创建 Token 预算或速率限制。',
  'billing.budget.tokenOnly': '预算按 Token 执行，请求速率按请求数执行。',
  'billing.budget.alertHint': 'Token 预算达到 80%、95%、100% 时产生告警。',
  'billing.budget.enforcementHint':
    'MVP 计数器按服务进程独立统计，重启或编辑规则后重置。Token 在用量采集写入后累计，在途请求可能超限。网关限额需启用远程鉴权（local_auth.enabled=false、failure_mode_allow_authenticated=false）；跳过鉴权的公开路由不在此限额范围内。请使用单服务进程执行这些限额。',
  'billing.budget.alerts': '最近预算告警（最多 100 条）',
  'billing.budget.noAlerts':
    '暂无阈值告警。采集到的用量达到预算阈值后会显示告警。',
  'billing.kind.token_budget': 'Token 预算',
  'billing.kind.token_rate': 'Token 速率',
  'billing.kind.request_rate': '请求速率',
  'billing.yes': '是',
  'billing.no': '否',
  'billing.settings.hint':
    '设置统一的 Token 与金额换算。每次进入页面默认显示 Token；金额报表使用当前价目表，历史用量也会按当前费率重新计算。',
  'billing.settings.currency': '货币代码',
  'billing.settings.currencyHint': '请输入三位大写货币代码，例如 CNY 或 USD。',
  'billing.settings.unitTokens': '换算：Token 数量',
  'billing.settings.amount': '换算：对应的金额',
  'billing.settings.precedence':
    'Token 费率优先级：模型名称精确匹配 → default → 统一换算。费率为 0 表示免费。GPU 费率：SKU 精确匹配 → default → 0。',
  'billing.settings.tokenPrices': '模型 Token 单价（JSON）',
  'billing.settings.tokenHint':
    '以模型名称或 default 为键，每项必须包含 input_per_million 和 output_per_million，单位为每百万 Token 的所选货币金额。填写 {} 则仅使用统一换算。',
  'billing.settings.gpuPrices': 'GPU 小时单价（JSON）',
  'billing.settings.gpuHint':
    '以 SKU 或 default 为键，值为每 GPU 小时的金额。填写 {} 则不计 GPU 费用。',
  'billing.settings.invalidRates':
    '请输入有效 JSON 对象，费率必须为有限非负数。Token 项必须包含 input_per_million 和 output_per_million。',
  'billing.settings.saveError':
    '价目表保存失败。请检查 API、权限及费率后重试，当前编辑内容已保留。'
};
