import { type TableColumnProps } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Button, Progress, Space } from 'antd';
import type { QuotaRule } from '../../config/types';

export default function useQuotaColumns(
  edit: (row: QuotaRule) => void,
  remove: (row: QuotaRule) => void
): TableColumnProps[] {
  const intl = useIntl();
  const t = (id: string) => intl.formatMessage({ id });
  return [
    { key: 'id', dataIndex: 'id', minWidth: 80, title: 'ID' },
    {
      key: 'kind',
      dataIndex: 'kind',
      minWidth: 160,
      title: t('billing.budget.kind'),
      render: (value) => t(`billing.kind.${value}`)
    },
    {
      key: 'subject',
      dataIndex: 'subject_type',
      minWidth: 160,
      title: t('billing.budget.subject'),
      render: (_, r: QuotaRule) =>
        `${t(`billing.dimension.${r.subject_type}`)}${r.subject_id === null ? '' : ` #${r.subject_id}`}`
    },
    {
      key: 'window',
      dataIndex: 'window_seconds',
      minWidth: 140,
      title: t('billing.budget.window')
    },
    {
      key: 'limit',
      dataIndex: 'limit_value',
      minWidth: 140,
      title: t('billing.budget.limit'),
      render: (value: number) => value.toLocaleString()
    },
    {
      key: 'used',
      dataIndex: 'used_value',
      minWidth: 180,
      title: t('billing.budget.used'),
      render: (_, r: QuotaRule) => (
        <Space direction="vertical" size={0}>
          <span>
            {r.used_value.toLocaleString()} / {r.limit_value.toLocaleString()}
          </span>
          <Progress
            size="small"
            percent={Math.min(
              100,
              Math.round((r.used_value / r.limit_value) * 100)
            )}
            status={r.used_value >= r.limit_value ? 'exception' : undefined}
          />
        </Space>
      )
    },
    {
      key: 'enabled',
      dataIndex: 'enabled',
      minWidth: 100,
      title: t('billing.budget.enabled'),
      render: (value) => t(value ? 'billing.yes' : 'billing.no')
    },
    {
      key: 'actions',
      dataIndex: 'id',
      minWidth: 180,
      title: t('common.table.operation'),
      render: (_, r: QuotaRule) => (
        <Space>
          <Button type="link" onClick={() => edit(r)}>
            {t('common.button.edit')}
          </Button>
          <Button type="link" danger onClick={() => remove(r)}>
            {t('common.button.delete')}
          </Button>
        </Space>
      )
    }
  ];
}
