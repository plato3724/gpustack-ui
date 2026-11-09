import type { UsageBreakdownResponse } from '@/pages/usage/config/types';
import { request } from '@umijs/max';
import type {
  BreakdownItem,
  Dimension,
  Period,
  PriceList,
  QuotaAlert,
  QuotaFormData,
  QuotaRule,
  Report,
  Summary
} from '../config/types';

const options = { skipErrorHandler: true };
export const statusOf = (error: unknown): number | undefined =>
  (error as { response?: { status?: number } })?.response?.status;

export function queryPriceList(signal?: AbortSignal) {
  return request<PriceList>('/billing/price-list', { ...options, signal });
}
export function savePriceList(data: PriceList) {
  return request<PriceList>('/billing/price-list', {
    ...options,
    method: 'PUT',
    data
  });
}

export async function queryReport(
  period: Period,
  dimension: Dimension,
  signal?: AbortSignal
): Promise<Report> {
  const results = await Promise.allSettled([
    request<Summary & { currency: string }>('/billing/summary', {
      ...options,
      params: period,
      signal
    }),
    request<{ currency: string; items: BreakdownItem[] }>(
      '/billing/token-breakdown',
      {
        ...options,
        params: { ...period, group_by: dimension },
        signal
      }
    )
  ]);
  // Only a missing route permits fallback. Permission and server failures
  // must remain visible instead of looking like an empty, healthy report.
  for (const result of results) {
    if (result.status === 'rejected' && statusOf(result.reason) !== 404) {
      throw result.reason;
    }
  }
  if (results[0].status === 'fulfilled' && results[1].status === 'fulfilled') {
    return {
      source: 'billing',
      currency: results[0].value.currency,
      summary: results[0].value,
      items: results[1].value.items
    };
  }
  return queryUsageReport(period, dimension, signal);
}

async function queryUsageReport(
  period: Period,
  dimension: Dimension,
  signal?: AbortSignal
): Promise<Report> {
  // OSS breakdown includes its period summary, avoiding a dependency on a
  // separate /usage/summary endpoint on older servers.
  const group = dimension === 'model' ? 'route' : dimension;
  const items: BreakdownItem[] = [];
  let summary: Summary | undefined;
  let page = 1;
  let totalPages = 1;
  do {
    const result = await request<UsageBreakdownResponse>('/usage/breakdown', {
      ...options,
      method: 'POST',
      signal,
      data: {
        start_date: period.start,
        end_date: period.end,
        scope: 'all',
        group_by: [group],
        filters: {},
        page,
        perPage: 100
      }
    });
    summary = {
      prompt_tokens: result.summary.input_tokens,
      completion_tokens: result.summary.output_tokens,
      total_tokens: result.summary.total_tokens,
      request_count: result.summary.api_requests
    };
    for (const row of result.items) {
      const identity =
        row[group as 'route' | 'organization' | 'user' | 'api_key'];
      items.push({
        key: JSON.stringify(
          identity?.identity || identity?.label || items.length
        ),
        label: identity?.label || '—',
        prompt: row.input_tokens,
        completion: row.output_tokens,
        total_tokens: row.total_tokens,
        requests: row.api_requests
      });
    }
    totalPages = result.pagination.totalPage;
    page += 1;
    if (totalPages > 1000) throw new Error('billing.error.range');
  } while (page <= totalPages);
  return { source: 'usage', summary: summary!, items };
}

export function queryQuotaRules(signal?: AbortSignal) {
  return request<{ items: QuotaRule[] }>('/quota-rules', {
    ...options,
    signal
  });
}
export function queryQuotaAlerts(signal?: AbortSignal) {
  return request<{ items: QuotaAlert[] }>('/quota-rules/alerts', {
    ...options,
    signal
  });
}
export function saveQuotaRule(data: QuotaFormData, id?: number) {
  return request<QuotaRule>(id ? `/quota-rules/${id}` : '/quota-rules', {
    ...options,
    method: id ? 'PUT' : 'POST',
    data
  });
}
export function deleteQuotaRule(id: number) {
  return request(`/quota-rules/${id}`, { ...options, method: 'DELETE' });
}
