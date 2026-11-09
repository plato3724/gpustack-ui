import {
  FormDrawer,
  Input,
  useAppUtils,
  useSubmitLock
} from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Form } from 'antd';
import { isReservedOrganizationName, OrganizationNamePattern } from '../config';
import type { FormData, ListItem } from '../config/types';

interface Props {
  currentData?: ListItem;
  onOk: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

// Mounted afresh on each open so cancelled values never leak into another org.
const AddOrganizationModal = ({ currentData, onOk, onCancel }: Props) => {
  const intl = useIntl();
  const { getRuleMessage } = useAppUtils();
  const [form] = Form.useForm<FormData>();
  const { loading, guard, run, release } = useSubmitLock();
  const validateReservedName = (_: unknown, value?: string) =>
    value && isReservedOrganizationName(value)
      ? Promise.reject(
          new Error(intl.formatMessage({ id: 'organizations.form.reserved' }))
        )
      : Promise.resolve();

  return (
    <FormDrawer
      open
      title={intl.formatMessage({
        id: currentData ? 'organizations.edit' : 'organizations.create'
      })}
      onCancel={loading ? undefined : onCancel}
      onSubmit={() => guard(() => form.submit())}
      loading={loading}
    >
      <Form<FormData>
        form={form}
        initialValues={currentData || {}}
        onFinish={(values) => run(() => onOk(values))}
        onFinishFailed={release}
      >
        <Form.Item
          name="name"
          extra={intl.formatMessage({ id: 'organizations.form.name.hint' })}
          rules={[
            {
              required: true,
              message: getRuleMessage('input', 'organizations.name')
            },
            // Existing built-in names can be reserved; names are immutable.
            ...(!currentData
              ? [
                  {
                    pattern: OrganizationNamePattern,
                    message: intl.formatMessage({
                      id: 'organizations.form.name.hint'
                    })
                  },
                  { validator: validateReservedName },
                  {
                    validator: (_: unknown, value?: string) =>
                      value && /^user-\d+$/.test(value)
                        ? Promise.reject(
                            new Error(
                              intl.formatMessage({
                                id: 'organizations.form.reserved'
                              })
                            )
                          )
                        : Promise.resolve()
                  }
                ]
              : [])
          ]}
        >
          <Input.Input
            label={intl.formatMessage({ id: 'organizations.name' })}
            disabled={!!currentData}
            required
          />
        </Form.Item>
        <Form.Item
          name="display_name"
          rules={[
            {
              required: true,
              whitespace: true,
              message: getRuleMessage('input', 'common.table.displayName')
            },
            { validator: validateReservedName }
          ]}
        >
          <Input.Input
            label={intl.formatMessage({ id: 'common.table.displayName' })}
            required
          />
        </Form.Item>
        <Form.Item name="description">
          <Input.TextArea
            label={intl.formatMessage({ id: 'common.table.description' })}
          />
        </Form.Item>
      </Form>
    </FormDrawer>
  );
};

export default AddOrganizationModal;
