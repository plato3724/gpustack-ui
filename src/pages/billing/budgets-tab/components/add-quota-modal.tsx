import { FormDrawer, useSubmitLock } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Alert, Form, InputNumber, Select, Switch, Typography } from 'antd';
import { useState } from 'react';
import ApiError from '../../components/api-error';
import type { QuotaFormData, QuotaRule } from '../../config/types';
import { saveQuotaRule } from '../../services';

export default function AddQuotaModal({
  current,
  onClose,
  onSaved
}: {
  current?: QuotaRule;
  onClose: () => void;
  onSaved: () => void;
}) {
  const intl = useIntl();
  const t = (id: string) => intl.formatMessage({ id });
  const [form] = Form.useForm<QuotaFormData>();
  const subject = Form.useWatch('subject_type', form);
  const { loading, guard, run, release } = useSubmitLock();
  const [error, setError] = useState<unknown>();
  const submit = async (values: QuotaFormData) => {
    setError(undefined);
    try {
      await saveQuotaRule(
        {
          ...values,
          subject_id:
            values.subject_type === 'global' ? null : values.subject_id
        },
        current?.id
      );
      onSaved();
    } catch (e) {
      setError(e);
    }
  };
  return (
    <FormDrawer
      open
      title={t(current ? 'billing.budget.edit' : 'billing.budget.create')}
      onCancel={loading ? undefined : onClose}
      onSubmit={() => guard(() => form.submit())}
      loading={loading}
    >
      {error !== undefined && (
        <ApiError error={error} retry={() => guard(() => form.submit())} />
      )}
      <Form
        form={form}
        layout="vertical"
        initialValues={
          current || {
            kind: 'token_budget',
            subject_type: 'global',
            window_seconds: 2592000,
            limit_value: 1000000,
            enabled: true,
            subject_id: null
          }
        }
        onFinish={(values) => run(() => submit(values))}
        onFinishFailed={release}
      >
        <Form.Item
          name="kind"
          label={t('billing.budget.kind')}
          rules={[{ required: true }]}
        >
          <Select
            options={['token_budget', 'token_rate', 'request_rate'].map(
              (value) => ({ value, label: t(`billing.kind.${value}`) })
            )}
          />
        </Form.Item>
        <Form.Item
          name="subject_type"
          label={t('billing.budget.subject')}
          rules={[{ required: true }]}
        >
          <Select
            onChange={() => form.setFieldValue('subject_id', null)}
            options={['global', 'organization', 'user', 'model', 'api_key'].map(
              (value) => ({ value, label: t(`billing.dimension.${value}`) })
            )}
          />
        </Form.Item>
        {subject !== 'global' && (
          <Form.Item
            name="subject_id"
            label={t('billing.budget.subjectId')}
            extra={t('billing.budget.subjectHint')}
            rules={[
              {
                required: true,
                type: 'number',
                min: 1,
                max: Number.MAX_SAFE_INTEGER
              }
            ]}
          >
            <InputNumber min={1} precision={0} style={{ width: '100%' }} />
          </Form.Item>
        )}
        <Form.Item
          name="window_seconds"
          label={t('billing.budget.window')}
          extra={t('billing.budget.windowHint')}
          rules={[{ required: true, type: 'number', min: 1, max: 31536000 }]}
        >
          <InputNumber
            min={1}
            max={31536000}
            precision={0}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item
          name="limit_value"
          label={t('billing.budget.limit')}
          extra={t('billing.budget.limitHint')}
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
          name="enabled"
          label={t('billing.budget.enabled')}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Alert type="info" showIcon title={t('billing.budget.alertHint')} />
        <Typography.Paragraph type="secondary">
          {t('billing.budget.enforcementHint')}
        </Typography.Paragraph>
      </Form>
    </FormDrawer>
  );
}
