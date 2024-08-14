import { useMemo, type FC, useState } from 'react';
import { Segmented, message } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from 'Redux/store';
import { useConditionFetchData } from 'hooks';
import { TransactionsModule } from '@modules/Transactions';
import { TransactionsType } from '@modules/Transactions/types';
import { TransactionsPermissionsEnum } from '@modules/Transactions/permissions';
import Typography from '@atoms/Headings';
import { TransactionStatus } from '@helpers/commonEnums';
import TransactionsTable from '@organisms/Transactions/table-columns';
import { Pagination } from '@atoms/Pagination';

interface ClientGovernmentFeesProps {
  clientId: number;
}

type ModalOpenType = {
  type: "new" | "edit"
  recordId: number;
  open: boolean;
  projectId?: number;
}


enum SegmentedValues {
  all = 'all',
  sent_to_client = 'sent_to_client',
  pending_payment = 'pending_payment',
  paid = 'paid',
  canceled = 'canceled'
}

// Status Filters
const statusValues: { [key in SegmentedValues]: TransactionStatus[] | undefined } = {
  all: undefined,
  sent_to_client: [TransactionStatus["Sent to client"]],
  pending_payment: [TransactionStatus["Pending payment"], TransactionStatus["Sent to client"]],
  paid: [TransactionStatus.Paid],
  canceled: [TransactionStatus.Canceled]
}

const ClientGovernmentFees: FC<ClientGovernmentFeesProps> = ({ clientId }) => {
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in TransactionsPermissionsEnum]: boolean };
  const { readTransaction, updateTransaction } = permissions;

  const module = useMemo(() => new TransactionsModule(), []);
  const [modalOpen, setModalOpen] = useState<ModalOpenType>({ type: "new", recordId: 0, open: false });

  const condition = useMemo(() => clientId && readTransaction === true, [readTransaction, clientId]);

  const { data, loading, onRefresh, meta } = useConditionFetchData<TransactionsType[]>({
    method: module.getAllRecords,
    initialQuery: { clientId, onlyGovernmentFees: true },
    condition,
  });

  const onEditIconClick = (record: TransactionsType) => {
    if (updateTransaction === false) {
      message.error("You don't have permission to update this record");
      return;
    }
    setModalOpen({
      ...modalOpen, open: !modalOpen.open, type: "edit",
      recordId: record.id
    });
  };


  return (
    <>
      {readTransaction === true && (
        <>
          <div className='d-flex align-center'>
            <Typography
              color="dark-main" size="sm" weight="bold"
              className='mr-2'
            >
              Government Fees
            </Typography>
            <div style={{ overflow: "auto" }}>
              <Segmented
                defaultValue='active'
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Active', value: 'active' }
                ]}
                onChange={(value) => {
                  if (value === 'all') return onRefresh({ clientId, perPage: 10 })
                  const _value = value as SegmentedValues;
                  onRefresh({
                    __status: statusValues[_value], clientId, perPage: 10
                  })
                }}
              />
            </div>
          </div>

          <TransactionsTable
            tableData={data || []}
            tableLoading={loading}
            onEditIconClick={onEditIconClick}
            reloadTableData={onRefresh}
            permissions={permissions}
          />
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

    </>
  )
}
export default ClientGovernmentFees;