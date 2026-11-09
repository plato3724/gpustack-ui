export type Unit = 'token' | 'money';
export type Dimension = 'organization' | 'user' | 'model' | 'api_key';
export type Period = { start: string; end: string };
export type TokenPrice = {
  input_per_million: number;
  output_per_million: number;
};
export type PriceList = {
  currency: string;
  token_to_money: { unit_tokens: number; amount: number };
  token_prices: Record<string, TokenPrice>;
  gpu_hour_prices: Record<string, number>;
};
export type Summary = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  request_count: number;
  prompt_cost?: number;
  completion_cost?: number;
  token_cost?: number;
  gpu_hours?: number;
  gpu_cost?: number;
  total_cost?: number;
};
export type BreakdownItem = {
  key: string;
  label: string;
  prompt: number;
  completion: number;
  total_tokens: number;
  requests: number;
  prompt_cost?: number;
  completion_cost?: number;
  cost?: number;
};
export type Report = {
  source: 'billing' | 'usage';
  currency?: string;
  summary: Summary;
  items: BreakdownItem[];
};
export type QuotaKind = 'token_budget' | 'token_rate' | 'request_rate';
export type Subject = 'global' | Dimension;
export type QuotaFormData = {
  kind: QuotaKind;
  subject_type: Subject;
  subject_id: number | null;
  window_seconds: number;
  limit_value: number;
  enabled: boolean;
};
export type QuotaRule = QuotaFormData & {
  id: number;
  used_value: number;
  remaining_value: number;
};
export type QuotaAlert = {
  id: number;
  occurred_at: string;
  message: string;
  rule_id: number;
};
