import { useIntl } from '@umijs/max';
import { Alert, Button } from 'antd';
import { statusOf } from '../services';

export default function ApiError({
  error,
  retry
}: {
  error: unknown;
  retry: () => void;
}) {
  const intl = useIntl();
  const status = statusOf(error);
  const tooLarge =
    error instanceof Error && error.message === 'billing.error.range';
  const id =
    status === 404
      ? 'billing.api.missing'
      : status === 403
        ? 'billing.api.forbidden'
        : 'billing.api.error';
  return (
    <Alert
      showIcon
      type={status === 404 ? 'warning' : 'error'}
      title={intl.formatMessage({ id })}
      description={intl.formatMessage({
        id: tooLarge
          ? 'billing.error.range'
          : status === 404
            ? 'billing.api.upgrade'
            : 'billing.api.retry'
      })}
      action={
        <Button onClick={retry}>
          {intl.formatMessage({ id: 'billing.refresh' })}
        </Button>
      }
    />
  );
}
