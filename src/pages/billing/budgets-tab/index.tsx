import {
  DeleteModal,
  Table as SealTable,
  useBodyScroll
} from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Alert, Button, Empty, Flex, List, Spin, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import ApiError from '../components/api-error';
import type { QuotaAlert, QuotaRule } from '../config/types';
import {
  deleteQuotaRule,
  queryQuotaAlerts,
  queryQuotaRules
} from '../services';
import AddQuotaModal from './components/add-quota-modal';
import useQuotaColumns from './hooks/use-quota-columns';

export default function BudgetsTab() {
  const intl = useIntl();
  const t = (id: string) => intl.formatMessage({ id });
  const { saveScrollHeight, restoreScrollHeight } = useBodyScroll();
  const [state, setState] = useState<{
    loading: boolean;
    rules?: QuotaRule[];
    alerts?: QuotaAlert[];
    error?: unknown;
    alertError?: unknown;
  }>({ loading: true });
  const [form, setForm] = useState<{ current?: QuotaRule }>();
  const modalRef = useRef<any>(null);
  const currentRequest = useRef<AbortController>();
  const load = async () => {
    currentRequest.current?.abort();
    const controller = new AbortController();
    currentRequest.current = controller;
    setState({ loading: true });
    const [rules, alerts] = await Promise.allSettled([
      queryQuotaRules(controller.signal),
      queryQuotaAlerts(controller.signal)
    ]);
    if (controller.signal.aborted) return;
    if (rules.status === 'rejected') {
      setState({ loading: false, error: rules.reason });
      return;
    }
    setState({
      loading: false,
      rules: rules.value.items,
      alerts: alerts.status === 'fulfilled' ? alerts.value.items : undefined,
      alertError: alerts.status === 'rejected' ? alerts.reason : undefined
    });
  };
  useEffect(() => {
    void load();
    return () => currentRequest.current?.abort();
  }, []);
  const open = (rule?: QuotaRule) => {
    saveScrollHeight();
    setForm({ current: rule });
  };
  const close = () => {
    setForm(undefined);
    restoreScrollHeight();
  };
  const columns = useQuotaColumns(open, (rule) =>
    modalRef.current?.show({
      content: 'billing.budget.rule',
      name: String(rule.id),
      operation: 'common.delete.single.confirm',
      async onOk() {
        try {
          await deleteQuotaRule(rule.id);
          await load();
        } catch (error) {
          setState((s) => ({ ...s, error }));
          throw error;
        }
      }
    })
  );
  if (state.loading) return <Spin />;
  if (state.error) return <ApiError error={state.error} retry={load} />;
  return (
    <Flex vertical gap="middle">
      <Alert
        showIcon
        type="info"
        title={t('billing.budget.tokenOnly')}
        description={t('billing.budget.enforcementHint')}
      />
      <Flex justify="space-between" wrap gap="small">
        <Button type="primary" onClick={() => open()}>
          {t('billing.budget.create')}
        </Button>
        <Button onClick={load}>{t('billing.refresh')}</Button>
      </Flex>
      <SealTable
        rowKey="id"
        columns={columns}
        dataSource={state.rules || []}
        loadend
        loading={false}
        scroll={{ x: true }}
        empty={
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('billing.budget.empty')}
          />
        }
      />
      <Typography.Title level={5}>
        {t('billing.budget.alerts')}
      </Typography.Title>
      {state.alertError !== undefined ? (
        <ApiError error={state.alertError} retry={load} />
      ) : (
        <List
          dataSource={state.alerts}
          locale={{ emptyText: t('billing.budget.noAlerts') }}
          renderItem={(alert) => (
            <List.Item>
              <Typography.Text>
                {alert.occurred_at} · #{alert.rule_id} · {alert.message}
              </Typography.Text>
            </List.Item>
          )}
        />
      )}
      {form && (
        <AddQuotaModal
          current={form.current}
          onClose={close}
          onSaved={() => {
            close();
            void load();
          }}
        />
      )}
      <DeleteModal ref={modalRef} />
    </Flex>
  );
}
