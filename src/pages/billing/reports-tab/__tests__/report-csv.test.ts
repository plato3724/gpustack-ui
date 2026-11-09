import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Report } from '../../config/types';
import { csvCell, reportCSV } from '../report-csv';

test('CSV quotes labels and neutralizes spreadsheet formulas', () => {
  assert.equal(csvCell('=SUM(A1)'), '"\'=SUM(A1)"');
  assert.equal(csvCell(' a,"b"\n'), '" a,""b""\n"');
  assert.equal(csvCell(undefined), '""');
});
const report: Report = {
  source: 'billing',
  currency: 'CNY',
  summary: {
    prompt_tokens: 1000,
    completion_tokens: 500,
    total_tokens: 1500,
    request_count: 2,
    token_cost: 3,
    gpu_cost: 1,
    gpu_hours: 0.25,
    total_cost: 4
  },
  items: [
    {
      key: '7',
      label: 'Team A',
      prompt: 1000,
      completion: 500,
      total_tokens: 1500,
      requests: 2,
      prompt_cost: 2,
      completion_cost: 1,
      cost: 3
    }
  ]
};
test('Token statement contains quantities and every row, without money settlement', () => {
  const csv = reportCSV(
    report,
    { start: '2026-11-01', end: '2026-11-02' },
    'organization',
    'token'
  );
  assert.match(csv, /"1000","500","1500","2"/);
  assert.match(csv, /"Team A"/);
  assert.doesNotMatch(csv, /token_cost|total_cost|CNY/);
});
test('Money statement includes actual token and GPU cost totals', () => {
  const csv = reportCSV(
    report,
    { start: '2026-11-01', end: '2026-11-02' },
    'organization',
    'money'
  );
  assert.match(csv, /"CNY"/);
  assert.match(csv, /"token_cost","gpu_hours","gpu_cost","total_cost"/);
  assert.match(csv, /"7","Team A","2","1","3","2"/);
});
