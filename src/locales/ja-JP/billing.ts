export default {
  'billing.subtitle': 'Usage, billing reports, and token budgets',
  'billing.unit': 'Display unit',
  'billing.money': '金額',
  'billing.period': 'Billing period',
  'billing.groupBy': 'Group by',
  'billing.refresh': '更新',
  'billing.prompt': 'Prompt',
  'billing.completion': 'Completion',
  'billing.total': 'Total',
  'billing.requests': 'Requests',
  'billing.tokenCost': 'Token cost',
  'billing.tab.usage': 'コスト / 使用量',
  'billing.tab.reports': '請求書 / レポート',
  'billing.tab.budgets': '予算とアラート',
  'billing.tab.attribution': '費用の帰属',
  'billing.tab.settings': '設定',
  'billing.dimension.organization': '組織',
  'billing.dimension.user': 'ユーザー',
  'billing.dimension.model': 'モデル',
  'billing.dimension.api_key': 'API キー',
  'billing.dimension.global': '全体',
  'billing.api.missing': 'Billing backend upgrade required',
  'billing.api.upgrade':
    'Deploy the OSS billing API branch and run its database migrations, then refresh this page.',
  'billing.api.forbidden': 'Platform administrator access required',
  'billing.api.error': 'Unable to load billing data',
  'billing.api.retry':
    'Check your permissions and backend connectivity, then refresh. No changes have been saved.',
  'billing.fallback':
    'Token quantities are loaded from the usage API. Money, conversion settings, and budgets require the billing / quota backend upgrade. Deploy the billing API branch, run migrations, and refresh.',
  'billing.routeFallback':
    'This backend provides model-route usage; rows are grouped by route instead of deployment model.',
  'billing.periodHint':
    'Dates include both endpoints and use UTC daily usage rollups. Refresh after usage has been collected.',
  'billing.empty':
    'No usage in this period. Send inference requests or select a different period.',
  'billing.moneyHint':
    'Money uses model rates, then the default model rate, then the configured Token conversion. GPU charges are added only to the period summary. Edit rates in Settings.',
  'billing.gpuSummary':
    'GPU-hours: {hours} · GPU cost: {currency} {cost} · Period total: {currency} {total}',
  'billing.attributionHint':
    'Attribute token usage and token cost to the consuming organization, user, model, or API key. Organization rows may include personal scopes. GPU cost is available only in the period summary.',
  'billing.reportHint':
    'Generate a period statement from the current API results. CSV includes all loaded breakdown rows and period totals in the selected unit. Rates apply at report time; this statement is not a tax invoice.',
  'billing.export': 'Export period statement (CSV)',
  'billing.error.range': 'Too many rows. Select a shorter period.',
  'billing.budget.create': 'Create budget / rate limit',
  'billing.budget.edit': 'Edit budget / rate limit',
  'billing.budget.kind': 'Rule type',
  'billing.budget.subject': 'Subject',
  'billing.budget.subjectId': 'Subject ID',
  'billing.budget.subjectHint':
    'Enter the numeric organization principal, user, model, or API key ID from the management API. Global rules apply to everyone.',
  'billing.budget.window': 'Window (seconds)',
  'billing.budget.windowHint':
    'Trailing seconds, without calendar alignment. 60 = minute; 86400 = day; 2592000 = 30 days. Maximum: 31536000.',
  'billing.budget.limit': 'Limit',
  'billing.budget.limitHint':
    'Tokens for token budgets / token rates; requests for request rates. The limit remains in these units in Money view.',
  'billing.budget.enabled': 'Enabled',
  'billing.budget.used': 'Used / limit',
  'billing.budget.rule': 'quota rule',
  'billing.budget.empty':
    'No quota rules. Create a token budget or rate limit to begin.',
  'billing.budget.tokenOnly':
    'Budgets are enforced in tokens; request rates use requests.',
  'billing.budget.alertHint':
    'Token budgets generate alerts at 80%, 95%, and 100%.',
  'billing.budget.enforcementHint':
    'MVP counters are per server process and reset on restart or rule edits. Tokens accrue after the usage collector flushes; in-flight usage can exceed caps. Gateway enforcement requires remote authorization (local_auth.enabled=false, failure_mode_allow_authenticated=false); public routes that skip authorization are outside this guard. Use a single server process for these caps.',
  'billing.budget.alerts': 'Recent budget alerts (latest 100)',
  'billing.budget.noAlerts':
    'No threshold alerts yet. Alerts appear after collected usage crosses a budget threshold.',
  'billing.kind.token_budget': 'Token budget',
  'billing.kind.token_rate': 'Token rate',
  'billing.kind.request_rate': 'Request rate',
  'billing.yes': 'Yes',
  'billing.no': 'No',
  'billing.settings.hint':
    'Set one Token-to-money conversion. New visits always start in Token view. All money reports use the current price list, including historical usage.',
  'billing.settings.currency': 'Currency code',
  'billing.settings.currencyHint':
    'Use a three-letter uppercase currency code, for example CNY or USD.',
  'billing.settings.unitTokens': 'Conversion: number of tokens',
  'billing.settings.amount': 'Conversion: money amount for those tokens',
  'billing.settings.precedence':
    'Token pricing precedence: exact model name → default → conversion. A zero rate means free. GPU pricing: exact SKU → default → zero.',
  'billing.settings.tokenPrices': 'Per-model token rates (JSON)',
  'billing.settings.tokenHint':
    'Object keyed by model name or default. Each entry requires input_per_million and output_per_million in the selected currency per 1,000,000 tokens. Use {} to apply only the simple conversion.',
  'billing.settings.gpuPrices': 'GPU-hour rates (JSON)',
  'billing.settings.gpuHint':
    'Object keyed by SKU or default; each value is money per GPU-hour. Use {} for no GPU charges.',
  'billing.settings.invalidRates':
    'Enter valid JSON objects with finite, nonnegative rates. Token entries require input_per_million and output_per_million.',
  'billing.settings.saveError':
    'Unable to save prices. Check API availability, permissions, and the price values, then retry. Your edits are retained.'
};
