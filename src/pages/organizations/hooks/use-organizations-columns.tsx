import { AutoTooltip, type TableColumnProps } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Button, Space } from 'antd';
import dayjs from 'dayjs';
import type { ListItem } from '../config/types';

export default function useOrganizationsColumns({
  onView,
  onEdit,
  onDelete
}: {
  onView: (record: ListItem) => void;
  onEdit: (record: ListItem) => void;
  onDelete: (record: ListItem) => void;
}): TableColumnProps[] {
  const intl = useIntl();
  return [
    {
      title: intl.formatMessage({ id: 'organizations.name' }),
      dataIndex: 'name',
      key: 'name',
      minWidth: 180,
      render: (_, record: ListItem) => (
        <Button type="link" onClick={() => onView(record)}>
          {record.name}
        </Button>
      )
    },
    {
      title: intl.formatMessage({ id: 'common.table.displayName' }),
      dataIndex: 'display_name',
      key: 'display_name',
      minWidth: 160,
      render: (value) => <AutoTooltip ghost>{value || '-'}</AutoTooltip>
    },
    {
      title: intl.formatMessage({ id: 'common.table.description' }),
      dataIndex: 'description',
      key: 'description',
      minWidth: 200,
      render: (value) => <AutoTooltip ghost>{value || '-'}</AutoTooltip>
    },
    {
      title: intl.formatMessage({ id: 'common.table.createTime' }),
      dataIndex: 'created_at',
      key: 'created_at',
      minWidth: 180,
      render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: intl.formatMessage({ id: 'common.table.operation' }),
      key: 'operation',
      dataIndex: 'operation',
      minWidth: 210,
      render: (_, record: ListItem) => (
        <Space>
          <Button type="link" onClick={() => onView(record)}>
            {intl.formatMessage({ id: 'organizations.detail' })}
          </Button>
          <Button type="link" onClick={() => onEdit(record)}>
            {intl.formatMessage({ id: 'common.button.edit' })}
          </Button>
          {!record.is_platform && (
            <Button type="link" danger onClick={() => onDelete(record)}>
              {intl.formatMessage({ id: 'common.button.delete' })}
            </Button>
          )}
        </Space>
      )
    }
  ];
}
