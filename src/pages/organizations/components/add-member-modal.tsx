import {
  FormDrawer,
  Select,
  useAppUtils,
  useSubmitLock
} from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Alert, Button, Form, Spin } from 'antd';
import { OrgRoleOptions } from '../config';
import type { MemberFormData, MemberItem } from '../config/types';
import { queryMemberCandidates } from '../services';

interface Props {
  members: MemberItem[];
  onOk: (values: MemberFormData) => Promise<void>;
  onCancel: () => void;
}

const AddMemberModal = ({ members, onOk, onCancel }: Props) => {
  const intl = useIntl();
  const { getRuleMessage } = useAppUtils();
  const [form] = Form.useForm<MemberFormData>();
  const { loading: saving, guard, run, release } = useSubmitLock();
  // This component mounts only on open; useRequest drops late results on close.
  const { data, loading, error, refresh } = useRequest(queryMemberCandidates);
  const existingIds = new Set(members.map((member) => member.principal_id));
  const options = (data || [])
    .filter((candidate) => !existingIds.has(candidate.id))
    .map((candidate) => {
      const name =
        candidate.display_name && candidate.display_name !== candidate.name
          ? `${candidate.display_name} (${candidate.name})`
          : candidate.name;
      return {
        value: candidate.id,
        label: `${name} · ${intl.formatMessage({ id: `organizations.kind.${candidate.kind}` })}`
      };
    });

  return (
    <FormDrawer
      open
      title={intl.formatMessage({ id: 'organizations.members.add' })}
      onCancel={saving ? undefined : onCancel}
      onSubmit={() => {
        if (!loading && !error) guard(() => form.submit());
      }}
      loading={saving}
    >
      {error && (
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
      )}
      <Spin spinning={loading}>
        <Form<MemberFormData>
          form={form}
          initialValues={{ role: members.length === 0 ? 'owner' : 'member' }}
          onFinish={(values) => run(() => onOk(values))}
          onFinishFailed={release}
        >
          <Form.Item
            name="principal_ids"
            rules={[
              {
                required: true,
                message: getRuleMessage('select', 'organizations.members')
              }
            ]}
          >
            <Select
              mode="multiple"
              showSearch
              optionFilterProp="label"
              label={intl.formatMessage({ id: 'organizations.members' })}
              required
              disabled={loading || !!error || saving}
              options={options}
            />
          </Form.Item>
          <Form.Item name="role" rules={[{ required: true }]}>
            <Select
              label={intl.formatMessage({ id: 'organizations.role' })}
              required
              options={OrgRoleOptions}
            />
          </Form.Item>
        </Form>
      </Spin>
    </FormDrawer>
  );
};

export default AddMemberModal;
