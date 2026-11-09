import { Table as SealTable } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Row,
  Spin,
  Statistic,
  Typography
} from 'antd';
import { useState } from 'react';
import type { Dimension, Period, Report, Unit } from '../config/types';
import useBreakdownColumns from '../hooks/use-breakdown-columns';
import useReport from '../hooks/use-report';
import ApiError from './api-error';

export type ReportProps = {
  period: Period;
  dimension: Dimension;
  unit: Unit;
  priceVersion: number;
};
export default function ReportView({
  period,
  dimension,
  unit,
  children
}: ReportProps & { children?: (report: Report) => React.ReactNode }) {
  const intl = useIntl();
  const state = useReport(period, dimension);
  const [pagination, setPagination] = useState({ page: 1, size: 20 });
  const columns = useBreakdownColumns(unit, dimension, state.data?.currency);
  if (state.loading) return <Spin />;
  if (state.error) return <ApiError error={state.error} retry={state.reload} />;
  const report = state.data!;
  const s = report.summary;
  const money = unit === 'money';
  const stats = money
    ? ([
        ['billing.prompt', s.prompt_cost],
        ['billing.completion', s.completion_cost],
        ['billing.tokenCost', s.token_cost],
        ['billing.requests', s.request_count]
      ] as const)
    : ([
        ['billing.prompt', s.prompt_tokens],
        ['billing.completion', s.completion_tokens],
        ['billing.total', s.total_tokens],
        ['billing.requests', s.request_count]
      ] as const);
  return (
    <Flex vertical gap="middle">
      {report.source === 'usage' && (
        <Alert
          showIcon
          type="warning"
          title={intl.formatMessage({ id: 'billing.api.missing' })}
          description={intl.formatMessage({ id: 'billing.fallback' })}
        />
      )}
      <Flex justify="space-between" align="center" wrap gap="small">
        <Typography.Text type="secondary">
          {intl.formatMessage({
            id:
              report.source === 'usage' && dimension === 'model'
                ? 'billing.routeFallback'
                : 'billing.periodHint'
          })}
        </Typography.Text>
        <Button onClick={state.reload}>
          {intl.formatMessage({ id: 'billing.refresh' })}
        </Button>
      </Flex>
      <Row gutter={[16, 16]}>
        {stats.map(([id, value]) => (
          <Col xs={24} sm={12} xl={6} key={id}>
            <Card size="small">
              <Statistic
                title={intl.formatMessage({ id })}
                value={value ?? '—'}
                precision={money && id !== 'billing.requests' ? 6 : 0}
                prefix={
                  money && id !== 'billing.requests'
                    ? report.currency
                    : undefined
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
      {money && report.source === 'billing' && (
        <Typography.Text>
          {intl.formatMessage(
            { id: 'billing.gpuSummary' },
            {
              hours: s.gpu_hours ?? 0,
              cost: s.gpu_cost ?? 0,
              total: s.total_cost ?? 0,
              currency: report.currency
            }
          )}
        </Typography.Text>
      )}
      {children?.(report)}
      <SealTable
        rowKey="key"
        columns={columns}
        dataSource={report.items.slice(
          (pagination.page - 1) * pagination.size,
          pagination.page * pagination.size
        )}
        loading={false}
        loadend
        scroll={{ x: true }}
        pagination={{
          total: report.items.length,
          current: pagination.page,
          pageSize: pagination.size,
          showSizeChanger: true,
          onChange: (page, size) => setPagination({ page, size })
        }}
        empty={
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={intl.formatMessage({ id: 'billing.empty' })}
          />
        }
      />
    </Flex>
  );
}
