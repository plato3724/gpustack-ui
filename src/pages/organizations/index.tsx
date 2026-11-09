import PageBox from '@/pages/_components/page-box';
import {
  DeleteModal,
  FilterBar,
  NoResult,
  Table as SealTable,
  useBodyScroll,
  useTableFetch
} from '@gpustack/core-ui';
import { Access, useAccess, useIntl } from '@umijs/max';
import { message } from 'antd';
import { useState } from 'react';
import AddOrganizationModal from './components/add-organization-modal';
import OrganizationDetail from './components/organization-detail';
import type { FormData, ListItem } from './config/types';
import useOrganizationsColumns from './hooks/use-organizations-columns';
import {
  createOrganization,
  deleteOrganization,
  queryOrganizations,
  updateOrganization
} from './services';

const OrganizationsContent = () => {
  const intl = useIntl();
  const { saveScrollHeight, restoreScrollHeight } = useBodyScroll();
  const [formState, setFormState] = useState<{
    open: boolean;
    currentData?: ListItem;
  }>({ open: false });
  const [detailId, setDetailId] = useState<number>();
  const {
    dataSource,
    queryParams,
    modalRef,
    handleDelete,
    fetchData,
    handlePageChange,
    handleSearch,
    handleNameChange
  } = useTableFetch<ListItem>({
    fetchAPI: queryOrganizations,
    deleteAPI: deleteOrganization,
    contentForDelete: 'organizations.organization'
  });

  const openForm = (currentData?: ListItem) => {
    saveScrollHeight();
    setFormState({ open: true, currentData });
  };
  const closeForm = () => {
    setFormState({ open: false });
    restoreScrollHeight();
  };
  const viewOrganization = (record: ListItem) => {
    saveScrollHeight();
    setDetailId(record.id);
  };
  const closeDetail = () => {
    setDetailId(undefined);
    restoreScrollHeight();
  };
  const saveOrganization = async (values: FormData) => {
    try {
      const data = {
        display_name: values.display_name.trim(),
        description: values.description?.trim() || null
      };
      const saved = formState.currentData
        ? await updateOrganization(formState.currentData.id, data)
        : await createOrganization({ ...data, name: values.name });
      if (formState.currentData) {
        closeForm();
      } else {
        // Switch directly to the new organization's members, retaining the
        // page's scroll lock until the detail drawer closes.
        setFormState({ open: false });
        setDetailId(saved.id);
      }
      void fetchData();
      message.success(intl.formatMessage({ id: 'common.message.success' }));
    } catch {
      // The shared request handler displays API conflicts and validation errors.
    }
  };
  const columns = useOrganizationsColumns({
    onView: viewOrganization,
    onEdit: openForm,
    onDelete: (record) => handleDelete({ ...record, name: record.name || '' })
  });

  return (
    <PageBox>
      <FilterBar
        showSelect={false}
        showDeleteButton={false}
        buttonText={intl.formatMessage({ id: 'organizations.create' })}
        handleInputChange={handleNameChange}
        handleSearch={handleSearch}
        handleClickPrimary={() => openForm()}
      />
      <SealTable
        rowKey="id"
        columns={columns}
        dataSource={dataSource.dataList}
        loading={dataSource.loading}
        loadend={dataSource.loadend}
        scroll={{ x: true }}
        empty={
          <NoResult
            loading={dataSource.loading}
            loadend={dataSource.loadend}
            dataSource={dataSource.dataList}
            filters={{ search: queryParams.search }}
            title={intl.formatMessage({ id: 'organizations.empty' })}
            subTitle={intl.formatMessage({ id: 'organizations.empty.hint' })}
            noFoundText={intl.formatMessage({ id: 'organizations.notFound' })}
            buttonText={intl.formatMessage({ id: 'organizations.create' })}
            onClick={() => openForm()}
          />
        }
        pagination={{
          current: queryParams.page,
          pageSize: queryParams.perPage,
          total: dataSource.total,
          showSizeChanger: true,
          onChange: handlePageChange
        }}
      />
      {formState.open && (
        <AddOrganizationModal
          currentData={formState.currentData}
          onCancel={closeForm}
          onOk={saveOrganization}
        />
      )}
      {detailId !== undefined && (
        <OrganizationDetail
          key={detailId}
          organizationId={detailId}
          onClose={closeDetail}
        />
      )}
      <DeleteModal ref={modalRef} />
    </PageBox>
  );
};

const Organizations = () => {
  const access = useAccess();
  return (
    <Access accessible={access.canSeeAdmin}>
      <OrganizationsContent />
    </Access>
  );
};

export default Organizations;
