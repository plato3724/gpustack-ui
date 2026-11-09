import { Input, useSubmitLock } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import {
  Alert,
  Button,
  Form,
  InputNumber,
  Spin,
  Typography,
  message
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import ApiError from '../components/api-error';
import type { PriceList } from '../config/types';
import { queryPriceList, savePriceList } from '../services';
import { parseRates } from './price-validation';

type FormData = {
  currency: string;
  unit_tokens: number;
  amount: number;
  tokens: string;
  gpus: string;
};
export default function SettingsTab({ onSaved }: { onSaved: () => void }) {
  const intl = useIntl();
  const t = (id: string) => intl.formatMessage({ id });
  const [form] = Form.useForm<FormData>();
  const [state, setState] = useState<{
    loading: boolean;
    price?: PriceList;
    error?: unknown;
  }>({ loading: true });
  const { loading: saving, guard, run, release } = useSubmitLock();
  const currentRequest = useRef<AbortController>();
  const load = async () => {
    currentRequest.current?.abort();
    const controller = new AbortController();
    currentRequest.current = controller;
    setState({ loading: true });
    try {
      const price = await queryPriceList(controller.signal);
      if (controller.signal.aborted) return;
      setState({ loading: false, price });
    } catch (error) {
      if (!controller.signal.aborted) setState({ loading: false, error });
    }
  };
  useEffect(() => {
    void load();
    return () => currentRequest.current?.abort();
  }, []);
  const save = async (values: FormData) => {
    try {
      const prices = parseRates(values.tokens, values.gpus);
      await savePriceList({
        currency: values.currency,
        token_to_money: {
          unit_tokens: values.unit_tokens,
          amount: values.amount
        },
        ...prices
      });
      message.success(t('common.message.success'));
      onSaved();
    } catch (error) {
      // Keep edits in place if the server rejects the update.
      message.error(
        t(
          error instanceof SyntaxError ||
            (error instanceof Error &&
              error.message === 'billing.settings.invalidRates')
            ? 'billing.settings.invalidRates'
            : 'billing.settings.saveError'
        )
      );
    }
  };
  if (state.loading) return <Spin />;
  if (state.error) return <ApiError error={state.error} retry={load} />;
  const p = state.price!;
  const validateRates = async () => {
    try {
      parseRates(form.getFieldValue('tokens'), form.getFieldValue('gpus'));
    } catch {
      throw new Error(t('billing.settings.invalidRates'));
    }
  };
  return (
    <Form
      form={form}
      layout="vertical"
      style={{ maxWidth: 780 }}
      initialValues={{
        currency: p.currency,
        unit_tokens: p.token_to_money?.unit_tokens ?? 1000000,
        amount: p.token_to_money?.amount ?? 0,
        tokens: JSON.stringify(p.token_prices, null, 2),
        gpus: JSON.stringify(p.gpu_hour_prices, null, 2)
      }}
      onFinish={(values) => run(() => save(values))}
      onFinishFailed={release}
    >
      <Typography.Paragraph>{t('billing.settings.hint')}</Typography.Paragraph>
      <Form.Item
        name="currency"
        rules={[
          {
            required: true,
            pattern: /^[A-Z]{3}$/,
            message: t('billing.settings.currencyHint')
          }
        ]}
      >
        <Input.Input
          label={t('billing.settings.currency')}
          required
          maxLength={3}
        />
      </Form.Item>
      <Form.Item
        name="unit_tokens"
        label={t('billing.settings.unitTokens')}
        rules={[
          {
            required: true,
            type: 'number',
            min: 1,
            max: Number.MAX_SAFE_INTEGER
          }
        ]}
      >
        <InputNumber
          min={1}
          max={Number.MAX_SAFE_INTEGER}
          precision={0}
          style={{ width: '100%' }}
        />
      </Form.Item>
      <Form.Item
        name="amount"
        label={t('billing.settings.amount')}
        rules={[{ required: true, type: 'number', min: 0 }]}
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      <Alert showIcon type="info" title={t('billing.settings.precedence')} />
      <Form.Item
        name="tokens"
        rules={[{ required: true }, { validator: validateRates }]}
        extra={t('billing.settings.tokenHint')}
      >
        <Input.TextArea
          label={t('billing.settings.tokenPrices')}
          autoSize={{ minRows: 5, maxRows: 15 }}
        />
      </Form.Item>
      <Form.Item
        name="gpus"
        rules={[{ required: true }, { validator: validateRates }]}
        extra={t('billing.settings.gpuHint')}
      >
        <Input.TextArea
          label={t('billing.settings.gpuPrices')}
          autoSize={{ minRows: 3, maxRows: 10 }}
        />
      </Form.Item>
      <Button
        type="primary"
        loading={saving}
        onClick={() => guard(() => form.submit())}
      >
        {t('common.button.save')}
      </Button>
    </Form>
  );
}
