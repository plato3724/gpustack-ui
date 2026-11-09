import { useIntl } from '@umijs/max';
import { Flex, Typography } from 'antd';
import ReportView, { type ReportProps } from '../components/report-view';
export default function AttributionTab(props: ReportProps) {
  const intl = useIntl();
  return (
    <Flex vertical gap="middle">
      <Typography.Paragraph type="secondary">
        {intl.formatMessage({ id: 'billing.attributionHint' })}
      </Typography.Paragraph>
      <ReportView {...props} />
    </Flex>
  );
}
