import { AutoTooltip, type TableColumnProps } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import type { BreakdownItem, Dimension, Unit } from '../config/types';

export const displayNumber = (value?: number) =>
  value === undefined
    ? '—'
    : value.toLocaleString(undefined, { maximumFractionDigits: 6 });
export default function useBreakdownColumns(
  unit: Unit,
  dimension: Dimension,
  currency?: string
): TableColumnProps[] {
  const intl = useIntl();
  const money = unit === 'money';
  const value = (
    row: BreakdownItem,
    token: 'prompt' | 'completion' | 'total_tokens',
    cost: 'prompt_cost' | 'completion_cost' | 'cost'
  ) =>
    money
      ? row[cost] === undefined
        ? '—'
        : `${currency} ${displayNumber(row[cost])}`
      : displayNumber(row[token]);
  return [
    {
      key: 'label',
      dataIndex: 'label',
      minWidth: 200,
      title: intl.formatMessage({ id: `billing.dimension.${dimension}` }),
      render: (label) => <AutoTooltip ghost>{label}</AutoTooltip>
    },
    ...(
      [
        ['prompt', 'prompt_cost', 'billing.prompt'],
        ['completion', 'completion_cost', 'billing.completion'],
        ['total_tokens', 'cost', 'billing.total']
      ] as const
    ).map(([token, cost, id]) => ({
      key: token,
      dataIndex: token,
      minWidth: 170,
      title: `${intl.formatMessage({ id })} (${money ? currency || '—' : 'Token'})`,
      render: (_: unknown, row: BreakdownItem) => value(row, token, cost)
    })),
    {
      key: 'requests',
      dataIndex: 'requests',
      minWidth: 130,
      title: intl.formatMessage({ id: 'billing.requests' }),
      render: displayNumber
    }
  ];
}
