import type { Dimension, Period, Report, Unit } from '../config/types';
// Quotes delimiters/newlines and neutralizes spreadsheet formula injection.
export const csvCell = (value: unknown) => {
  let text = value === undefined || value === null ? '' : String(value);
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
};
export function reportCSV(
  report: Report,
  period: Period,
  dimension: Dimension,
  unit: Unit
) {
  const money = unit === 'money';
  const rows: unknown[][] = [
    ['start', 'end', 'source', 'group_by', 'unit', 'currency'],
    [
      period.start,
      period.end,
      report.source,
      dimension,
      unit,
      money ? report.currency : ''
    ],
    [
      'summary',
      'prompt_tokens',
      'completion_tokens',
      'total_tokens',
      'requests',
      ...(money ? ['token_cost', 'gpu_hours', 'gpu_cost', 'total_cost'] : [])
    ],
    [
      'period',
      report.summary.prompt_tokens,
      report.summary.completion_tokens,
      report.summary.total_tokens,
      report.summary.request_count,
      ...(money
        ? [
            report.summary.token_cost,
            report.summary.gpu_hours,
            report.summary.gpu_cost,
            report.summary.total_cost
          ]
        : [])
    ],
    [],
    [
      'id',
      dimension,
      money ? 'prompt_cost' : 'prompt_tokens',
      money ? 'completion_cost' : 'completion_tokens',
      money ? 'token_cost' : 'total_tokens',
      'requests'
    ],
    ...report.items.map((r) => [
      r.key,
      r.label,
      money ? r.prompt_cost : r.prompt,
      money ? r.completion_cost : r.completion,
      money ? r.cost : r.total_tokens,
      r.requests
    ])
  ];
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}
