import {
  DeleteModal,
  Table as SealTable,
  useSubmitLock
} from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { useRequest } from 'ahooks';
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Empty,
  Flex,
  Spin,
  Typography,
  message
} from 'antd';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import type { MemberFormData, MemberItem, OrgRole } from '../config/types';
import useMembersColumns from '../hooks/use-members-columns';
import {
  addOrganizationMembers,
  queryOrganization,
  queryOrganizationMembers,
  removeOrganizationMember,
  updateOrganizationMember
} from '../services';
import AddMemberModal from './add-member-modal';

const OrganizationDetail = ({
  organizationId,
  onClose
}: {
  organizationId: number;
  onClose: () => void;
}) => {
  const intl = useIntl();
  const [adding, setAdding] = useState(false);
  const modalRef = useRef<any>(null);
  const { loading: saving, guard, run } = useSubmitLock();
  // The keyed detail drawer is mounted for one org; late results are discarded
  // by useRequest when the drawer closes or a different organization opens.
  const { data, loading, error, refresh, mutate } = useRequest(async () => {
    const [organization, members] = await Promise.all([
      queryOrganization(organizationId),
      queryOrganizationMembers(organizationId)
    ]);
    return { organization, members };
  });
  const memberList = data?.members ?? [];

  const closeAdd = () => {
    setAdding(false);
  };
  const addMembers = async (values: MemberFormData) => {
    try {
      const added = await addOrganizationMembers(organizationId, values);
      mutate(
        (current) =>
          current && { ...current, members: [...current.members, ...added] }
      );
      closeAdd();
      message.success(intl.formatMessage({ id: 'common.message.success' }));
    } catch {
      // Keep selections and the form open when the backend rejects the change.
    }
  };
  const changeRole = (member: MemberItem, role: OrgRole) => {
    if (role === member.role) return;
    guard(() => {
      void run(async () => {
        const updated = await updateOrganizationMember(
          organizationId,
          member.principal_id,
          role
        );
        mutate(
          (current) =>
            current && {
              ...current,
              members: current.members.map((item) =>
                item.principal_id === updated.principal_id ? updated : item
              )
            }
        );
        message.success(intl.formatMessage({ id: 'common.message.success' }));
      }).catch(() => {
        // Keep the server's previous role visible, including on last-owner 409s.
      });
    });
  };
  const removeMember = (member: MemberItem) => {
    modalRef.current?.show({
      content: 'organizations.member',
      name:
        member.principal_display_name ||
        member.principal_name ||
        String(member.principal_id),
      okText: 'organizations.members.remove',
      operation: 'common.delete.single.confirm',
      async onOk() {
        await run(async () => {
          await removeOrganizationMember(organizationId, member.principal_id);
          mutate(
            (current) =>
              current && {
                ...current,
                members: current.members.filter(
                  (item) => item.principal_id !== member.principal_id
                )
              }
          );
        });
      }
    });
  };
  const columns = useMembersColumns({
    disabled: saving || adding || loading,
    onChangeRole: changeRole,
    onRemove: removeMember
  });
  const organization = data?.organization;

  return (
    <Drawer
      open
      title={intl.formatMessage({ id: 'organizations.detail' })}
      onClose={saving || adding ? undefined : onClose}
      width={960}
      destroyOnHidden
    >
      <Spin spinning={loading}>
        {error ? (
          <Alert
            type="error"
            showIcon
            title={intl.formatMessage({ id: 'organizations.loadError' })}
            action={
              <Button onClick={refresh}>
                {intl.formatMessage({ id: 'organizations.retry' })}
              </Button>
            }
          />
        ) : (
          organization && (
            <Flex vertical gap="large">
              <Descriptions
                column={1}
                bordered
                items={[
                  { key: 'id', label: 'ID', children: organization.id },
                  {
                    key: 'name',
                    label: intl.formatMessage({ id: 'organizations.name' }),
                    children: organization.name
                  },
                  {
                    key: 'display_name',
                    label: intl.formatMessage({
                      id: 'common.table.displayName'
                    }),
                    children: organization.display_name || '-'
                  },
                  {
                    key: 'description',
                    label: intl.formatMessage({
                      id: 'common.table.description'
                    }),
                    children: organization.description || '-'
                  },
                  {
                    key: 'created_at',
                    label: intl.formatMessage({
                      id: 'common.table.createTime'
                    }),
                    children: dayjs(organization.created_at).format(
                      'YYYY-MM-DD HH:mm:ss'
                    )
                  }
                ]}
              />
              <Alert
                type="info"
                showIcon
                title={intl.formatMessage({ id: 'organizations.members.hint' })}
              />
              <Flex align="center" justify="space-between">
                <Typography.Title level={5} style={{ margin: 0 }}>
                  {intl.formatMessage({ id: 'organizations.members' })} (
                  {memberList.length})
                </Typography.Title>
                <Button
                  type="primary"
                  disabled={saving}
                  onClick={() => {
                    setAdding(true);
                  }}
                >
                  {intl.formatMessage({ id: 'organizations.members.add' })}
                </Button>
              </Flex>
              <SealTable
                rowKey="principal_id"
                columns={columns}
                dataSource={memberList}
                loading={loading}
                loadend={!loading}
                scroll={{ x: true }}
                empty={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
              />
            </Flex>
          )
        )}
      </Spin>
      {adding && (
        <AddMemberModal
          members={memberList}
          onCancel={closeAdd}
          onOk={addMembers}
        />
      )}
      <DeleteModal ref={modalRef} />
    </Drawer>
  );
};

export default OrganizationDetail;
