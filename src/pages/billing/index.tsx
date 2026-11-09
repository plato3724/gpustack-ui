import PageBox from '@/pages/_components/page-box';
import { Access, useAccess, useIntl } from '@umijs/max';
import {
  Alert,
  DatePicker,
  Flex,
  Segmented,
  Select,
  Tabs,
  Typography
} from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import AttributionTab from './attribution-tab';
import BudgetsTab from './budgets-tab';
import type { Dimension, Period, Unit } from './config/types';
import ReportsTab from './reports-tab';
import SettingsTab from './settings-tab';
import UsageTab from './usage-tab';

const BillingContent = () => {
  const intl = useIntl();
  const t = (id: string) => intl.formatMessage({ id });
  const [unit, setUnit] = useState<Unit>('token');
  const [tab, setTab] = useState('usage');
  const [dimension, setDimension] = useState<Dimension>('organization');
  const [period, setPeriod] = useState<Period>({
    start: dayjs().subtract(29, 'day').format('YYYY-MM-DD'),
    end: dayjs().format('YYYY-MM-DD')
  });
  const [priceVersion, setPriceVersion] = useState(0);
  const props = { period, dimension, unit, priceVersion };
  const reportKey = `${tab}:${period.start}:${period.end}:${dimension}:${priceVersion}`;
  const reportTab = ['usage', 'reports', 'attribution'].includes(tab);
  return (
    <PageBox>
      <Flex vertical gap="middle">
        <Flex justify="space-between" align="center" wrap gap="middle">
          <Typography.Text type="secondary">
            {t('billing.subtitle')}
          </Typography.Text>
          <Segmented
            aria-label={t('billing.unit')}
            value={unit}
            onChange={(value) => setUnit(value as Unit)}
            options={[
              { label: 'Token', value: 'token' },
              { label: t('billing.money'), value: 'money' }
            ]}
          />
        </Flex>
        {reportTab && (
          <Flex align="center" wrap gap="middle">
            <DatePicker.RangePicker
              allowClear={false}
              aria-label={t('billing.period')}
              value={[dayjs(period.start), dayjs(period.end)]}
              onChange={(dates) => {
                if (dates?.[0] && dates[1])
                  setPeriod({
                    start: dates[0].format('YYYY-MM-DD'),
                    end: dates[1].format('YYYY-MM-DD')
                  });
              }}
            />
            <Select
              aria-label={t('billing.groupBy')}
              value={dimension}
              style={{ minWidth: 180 }}
              onChange={setDimension}
              options={(
                ['organization', 'user', 'model', 'api_key'] as const
              ).map((value) => ({
                value,
                label: t(`billing.dimension.${value}`)
              }))}
            />
          </Flex>
        )}
        {unit === 'money' && reportTab && (
          <Alert type="info" showIcon title={t('billing.moneyHint')} />
        )}
        <Tabs
          activeKey={tab}
          onChange={setTab}
          destroyOnHidden
          items={[
            {
              key: 'usage',
              label: t('billing.tab.usage'),
              children: <UsageTab key={reportKey} {...props} />
            },
            {
              key: 'reports',
              label: t('billing.tab.reports'),
              children: <ReportsTab key={reportKey} {...props} />
            },
            {
              key: 'budgets',
              label: t('billing.tab.budgets'),
              children: <BudgetsTab />
            },
            {
              key: 'attribution',
              label: t('billing.tab.attribution'),
              children: <AttributionTab key={reportKey} {...props} />
            },
            {
              key: 'settings',
              label: t('billing.tab.settings'),
              children: (
                <SettingsTab onSaved={() => setPriceVersion((v) => v + 1)} />
              )
            }
          ]}
        />
      </Flex>
    </PageBox>
  );
};
export default function Billing() {
  const access = useAccess();
  return (
    <Access accessible={access.canSeeAdmin}>
      <BillingContent />
    </Access>
  );
}
