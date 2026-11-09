import {
  AutoTooltip,
  ThemeTag,
  type TableColumnProps
} from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Button, Select } from 'antd';
import dayjs from 'dayjs';
import { OrgRoleOptions } from '../config';
import type { MemberItem, OrgRole } from '../config/types';

export default function useMembersColumns({
  disabled,
  onChangeRole,
  onRemove
}: {
  disabled: boolean;
  onChangeRole: (member: MemberItem, role: OrgRole) => void;
  onRemove: (member: MemberItem) => void;
}): TableColumnProps[] {
  const intl = useIntl();
  return [
    {
      title: intl.formatMessage({ id: 'organizations.members' }),
      dataIndex: 'principal_name',
      key: 'principal_name',
      minWidth: 180,
      render: (_, record: MemberItem) => (
        <AutoTooltip ghost>
          {record.principal_display_name ||
            record.principal_name ||
            record.principal_id}
          {record.principal_display_name && record.principal_name
            ? ` (${record.principal_name})`
            : ''}
        </AutoTooltip>
      )
    },
    {
      title: intl.formatMessage({ id: 'organizations.kind' }),
      dataIndex: 'principal_kind',
      key: 'principal_kind',
      minWidth: 100,
      render: (kind) => (
        <ThemeTag>
          {intl.formatMessage({ id: `organizations.kind.${kind}` })}
        </ThemeTag>
      )
    },
    {
      title: intl.formatMessage({ id: 'organizations.role' }),
      dataIndex: 'role',
      key: 'role',
      minWidth: 150,
      render: (role: OrgRole | null, record: MemberItem) => (
        <Select<OrgRole>
          aria-label={intl.formatMessage({ id: 'organizations.role' })}
          style={{ width: '100%' }}
          value={role}
          disabled={disabled}
          options={OrgRoleOptions.map((option) => ({
            value: option.value as OrgRole,
            label: intl.formatMessage({ id: option.label })
          }))}
          onChange={(value) => onChangeRole(record, value)}
        />
      )
    },
    {
      title: intl.formatMessage({ id: 'organizations.members.joinedAt' }),
      dataIndex: 'created_at',
      key: 'created_at',
      minWidth: 170,
      render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: intl.formatMessage({ id: 'common.table.operation' }),
      key: 'operation',
      dataIndex: 'operation',
      minWidth: 100,
      render: (_, record: MemberItem) => (
        <Button
          type="link"
          danger
          disabled={disabled}
          onClick={() => onRemove(record)}
        >
          {intl.formatMessage({ id: 'organizations.members.remove' })}
        </Button>
      )
    }
  ];
}
