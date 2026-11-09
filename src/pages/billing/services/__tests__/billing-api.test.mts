import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
let handler: (url: string, options: any) => Promise<unknown>;
mock.module('@umijs/max', {
  namedExports: {
    request: (url: string, options: any) => handler(url, options)
  }
});
const { queryReport, savePriceList, saveQuotaRule, deleteQuotaRule } =
  await import('../index.ts');
const period = { start: '2026-11-01', end: '2026-11-02' };
const summary = {
  prompt_tokens: 1,
  completion_tokens: 2,
  total_tokens: 3,
  request_count: 1
};
const missing = { response: { status: 404 } };

test('report uses real billing endpoints and selected dates/dimension', async () => {
  const calls: string[] = [];
  handler = async (url, opts) => {
    calls.push(url);
    assert.equal(opts.params.start, period.start);
    if (url.endsWith('summary')) return { ...summary, currency: 'CNY' };
    assert.equal(opts.params.group_by, 'organization');
    return { items: [{ key: '7', cost: 3 }] };
  };
  const result = await queryReport(period, 'organization');
  assert.equal(result.source, 'billing');
  assert.equal(result.currency, 'CNY');
  assert.deepEqual(calls.sort(), [
    '/billing/summary',
    '/billing/token-breakdown'
  ]);
});
test('404 falls back to all pages of usage including API summary and model route mapping', async () => {
  const pages: number[] = [];
  handler = async (url, opts) => {
    if (url.startsWith('/billing')) throw missing;
    assert.equal(url, '/usage/breakdown');
    assert.equal(opts.method, 'POST');
    assert.deepEqual(opts.data.group_by, ['route']);
    assert.equal(opts.data.start_date, period.start);
    pages.push(opts.data.page);
    return {
      summary: {
        input_tokens: 10,
        output_tokens: 20,
        total_tokens: 30,
        api_requests: 2
      },
      pagination: { totalPage: 2 },
      items: [
        {
          route: {
            label: `route-${opts.data.page}`,
            identity: { current: { route_id: opts.data.page } }
          },
          input_tokens: 5,
          output_tokens: 10,
          total_tokens: 15,
          api_requests: 1
        }
      ]
    };
  };
  const report = await queryReport(period, 'model');
  assert.equal(report.source, 'usage');
  assert.equal(report.summary.total_tokens, 30);
  assert.equal(report.items.length, 2);
  assert.equal(report.items[1].cost, undefined);
  assert.deepEqual(pages, [1, 2]);
});
test('403 and 500 stay visible instead of falling back', async () => {
  for (const status of [403, 500]) {
    handler = async () => {
      throw { response: { status } };
    };
    await assert.rejects(
      () => queryReport(period, 'user'),
      (error: any) => error.response.status === status
    );
  }
});
test('settings and budget writes use mutation APIs and propagate failures', async () => {
  const calls: [string, string][] = [];
  handler = async (url, options) => {
    calls.push([url, options.method]);
    throw missing;
  };
  const rule = {
    kind: 'token_budget' as const,
    subject_type: 'global' as const,
    subject_id: null,
    window_seconds: 60,
    limit_value: 100,
    enabled: true
  };
  await assert.rejects(() => saveQuotaRule(rule));
  await assert.rejects(() => saveQuotaRule(rule, 7));
  await assert.rejects(() => deleteQuotaRule(7));
  await assert.rejects(() =>
    savePriceList({
      currency: 'CNY',
      token_to_money: { unit_tokens: 1000, amount: 1 },
      token_prices: {},
      gpu_hour_prices: {}
    })
  );
  assert.deepEqual(calls, [
    ['/quota-rules', 'POST'],
    ['/quota-rules/7', 'PUT'],
    ['/quota-rules/7', 'DELETE'],
    ['/billing/price-list', 'PUT']
  ]);
});

test('oversized usage fallback fails with a shorter-period remedy', async () => {
  handler = async (url) => {
    if (url.startsWith('/billing')) throw missing;
    return {
      summary: {
        input_tokens: 0,
        output_tokens: 0,
        total_tokens: 0,
        api_requests: 0
      },
      pagination: { totalPage: 1001 },
      items: []
    };
  };
  await assert.rejects(
    () => queryReport(period, 'organization'),
    /billing.error.range/
  );
});
