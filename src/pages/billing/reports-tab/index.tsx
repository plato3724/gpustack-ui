import { downloadFile } from '@/utils/download-stream';
import { useIntl } from '@umijs/max';
import { Button, Flex, Typography } from 'antd';
import ReportView, { type ReportProps } from '../components/report-view';
import { reportCSV } from './report-csv';

export default function ReportsTab(props: ReportProps) {
  const intl = useIntl();
  return (
    <ReportView {...props}>
      {(report) => (
        <Flex vertical gap="small">
          <Typography.Paragraph>
            {intl.formatMessage({ id: 'billing.reportHint' })}
          </Typography.Paragraph>
          <Button
            disabled={props.unit === 'money' && report.source !== 'billing'}
            style={{ alignSelf: 'flex-start' }}
            onClick={() =>
              downloadFile(
                new Blob(
                  [
                    '\uFEFF',
                    reportCSV(report, props.period, props.dimension, props.unit)
                  ],
                  { type: 'text/csv;charset=utf-8;' }
                ),
                `billing_${props.period.start}_${props.period.end}_${props.dimension}_${props.unit}.csv`
              )
            }
          >
            {intl.formatMessage({ id: 'billing.export' })}
          </Button>
        </Flex>
      )}
    </ReportView>
  );
}
