import { useMemo, type FC, useState } from 'react';
import {
  Badge, Table, Tooltip, Typography as AntdTypography, Segmented, message
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { InvoiceModule } from '@modules/Invoice';
import { InvoiceTypes } from '@modules/Invoice/types';
import { InvoicePermissionsEnum } from '@modules/Invoice/permissions';
import { useConditionFetchData, useInvoiceDrawer } from 'hooks';
import Typography from '@atoms/Headings';
import { InvoiceStatus } from '@helpers/commonEnums';
import { useSelector } from 'react-redux';
import { RootState } from 'Redux/store';
import styles from './styles.module.scss';
import { formatCurrency } from '@helpers/common';
import InvoicesTable from '@organisms/Invoice/table-columns';
import { Pagination } from '@atoms/Pagination';
import { InvoiceDrawerTypes } from '@organisms/Invoice/Drawer/types';
import InvoiceDrawer from '@organisms/Invoice/Drawer';
import InvoiceNotes from '@organisms/Invoice/Notes';

const { Paragraph } = AntdTypography;
interface ClientInvoiceProps {
  clientId: number;
}

type ModalOpenType = {
  type: "new" | "edit" | "notes" | "attachments";
  recordId: number;
  open: boolean;
}

enum SegmentedValues {
  all = 'all',
  active = 'active',
  paid = 'paid',
  canceled = 'canceled',
  draft = 'draft'
}

// Status Filters
const statusValues: { [key in SegmentedValues]: InvoiceStatus[] | undefined } = {
  all: undefined,
  active: [InvoiceStatus.Generated, InvoiceStatus.Sent],
  paid: [InvoiceStatus.Paid],
  canceled: [InvoiceStatus.Canceled],
  draft: [InvoiceStatus.Generated]
}

const ClientInvoice: FC<ClientInvoiceProps> = ({ clientId }) => {
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in InvoicePermissionsEnum]: boolean };
  const { readInvoice } = permissions;
  const module = useMemo(() => new InvoiceModule(), []);

  const condition = useMemo(() => clientId > 0 && readInvoice === true, [readInvoice, clientId]);

  const { data, loading, onRefresh, meta } = useConditionFetchData<InvoiceTypes[]>({
    method: module.getAllRecords,
    initialQuery: { clientId, __status: statusValues[SegmentedValues.active], perPage: 10 },
    condition: condition,
  });

  // drawer state
  const { drawer, setDrawer } = useInvoiceDrawer()

  const [openNotesModal, setOpenNotesModal] = useState<ModalOpenType>({
    type: "notes", recordId: 0, open: false
  });

  const onEditIconClick = (recordId: number) => {
    if (permissions.updateInvoice === false) {
      message.error("You don't have permission to update record");
      return;
    }
    setDrawer({ open: true, id: recordId, type: "edit", projectId: 0 })
  };

  const onAddNoteClick = (record: InvoiceTypes) => {
    if (permissions.updateInvoice === false) {
      message.error("You don't have permission to add notes");
      return;
    }
    setOpenNotesModal({ type: "notes", open: true, recordId: record?.id })
  };

  return (
    <>
      {readInvoice === true && (
        <>
          <div className='d-flex align-center'>
            <Typography
              color="dark-main" size="sm" weight="bold"
              className='mr-2'
            >
              Invoices
            </Typography>
            <div style={{ overflow: "auto" }}>
              <Segmented
                defaultValue='active'
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Active', value: 'active' }
                ]}
                onChange={(value) => {
                  if (value === 'all') return onRefresh({ clientId })
                  const _value = value as SegmentedValues;
                  onRefresh({ __status: statusValues[_value], clientId })
                }}
              />
            </div>
          </div>

          <div className={styles.antdTableWrapper}>
            <InvoicesTable
              tableData={data || []}
              tableLoading={loading}
              permissions={permissions}
              setDrawer={setDrawer}
              onEditIconClick={onEditIconClick}
              onAddNoteClick={onAddNoteClick}
              reloadTableData={() => {
                onRefresh({ clientId, __status: statusValues[SegmentedValues.active] })
              }}
            />
          </div>
          <Pagination
            total={meta?.total || 0}
            current={meta?.page || 1}
            defaultPageSize={meta?.pageCount || 10}
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={(page, perPage) => {
              onRefresh({ page, perPage, clientId })
            }}
          />
        </>
      )}

      {drawer.open && (
        <InvoiceDrawer
          drawer={drawer}
          setDrawer={setDrawer}
          onRefresh={onRefresh}
          permissions={permissions}
        />
      )}

      {/*TODO: Add Note logs in modal */}
      {openNotesModal.open && (
        <InvoiceNotes
          open={openNotesModal.open}
          permissions={permissions}
          invoiceId={openNotesModal.recordId}
          onRefresh={onRefresh}
          onCancel={() => {
            setOpenNotesModal({ type: "new", recordId: 0, open: false })
          }}
        />
      )}
    </>
  )
}
export default ClientInvoice;