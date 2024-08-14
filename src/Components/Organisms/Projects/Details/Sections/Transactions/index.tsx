import { useMemo, type FC, useState } from 'react';
import { Avatar, Segmented, Table, Tooltip } from 'antd';
import { useSelector } from 'react-redux';
import { EditOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { RootState } from 'Redux/store';
import { useConditionFetchData } from 'hooks';
import { TransactionsModule } from '@modules/Transactions';
import { TransactionsType } from '@modules/Transactions/types';
import { TransactionsPermissionsEnum } from '@modules/Transactions/permissions';
import Typography from '@atoms/Headings';
import { TransactionStatus } from '@helpers/commonEnums';
import { convertDate } from '@helpers/dateHandler';
import { APPLICATION_RESOURCE_BASE_URL, RESOURCE_BASE_URL } from '@helpers/constants';
import { PlusCircleIcon, ExternalIcon } from '@icons/';
import { formatCurrency } from '@helpers/common';
import styles from './styles.module.scss';

interface ProjectProjectGovernmentFeesProps {
  projectId: number;
}

const ProjectGovernmentFees: FC<ProjectProjectGovernmentFeesProps> = ({ projectId }) => {
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in TransactionsPermissionsEnum]: boolean };
  const { readTransaction } = permissions;
  const module = useMemo(() => new TransactionsModule(), []);
  const [showManage, setShowManage] = useState<{ [key: number]: boolean }>({});

  const condition = useMemo(() => projectId && readTransaction === true, [readTransaction, projectId]);

  const { data, loading, onRefresh } = useConditionFetchData<TransactionsType[]>({
    method: module.getAllRecords,
    initialQuery: { projectId: projectId, onlyGovernmentFees: true },
    condition: condition,
  });

  const columns: ColumnsType<TransactionsType> = [
    {
      title: (
        <div style={{ overflow: "auto" }} className='d-flex align-center'>
          <Segmented
            defaultValue='onlyGovernmentFees'
            options={[
              { label: 'Government Fees', value: 'onlyGovernmentFees' },
              { label: 'Invoice Payments', value: 'onlyInvoicePayments' }
            ]}
            onChange={(value) => onRefresh({ [value]: true, projectId: projectId })}
          />

          <Tooltip title="Create Government Fees">
            <PlusCircleIcon
              className='ml-2' style={{ cursor: "pointer" }} stroke='var(--color-dark-main)'
              onClick={() => window.location.href = `/transactions?projectId=${projectId}&actionType=create`}
            />
          </Tooltip>
        </div>
      ),
      dataIndex: 'id',
      key: 'id',
      render: (id: number, record) => {
        return (
          <div className='d-flex align-center justify-space-between'>
            <div className='d-flex flex-column'>
              <Typography color="dark-main" size="sm">
                {record.title}
              </Typography>

              <div className='d-flex items-center' >
                <Typography color="dark-main" size="sm" weight="bold">
                  Remarks:
                </Typography>
                <Typography color="dark-main" size="sm" className="ml-1">
                  {record.remarks}
                </Typography>
              </div>
            </div>

            <div className={styles.actionButtons}>
              {showManage[id] && (
                <div className='d-flex align-center'>
                  <Tooltip title={"View More"}>
                    <EyeOutlined
                      style={{ cursor: "pointer" }}
                      onClick={() => window.location.href = `/transactions?id=${id}&projectId=${projectId}&actionType=view`}
                    />
                  </Tooltip>
                  <Tooltip title={"Edit"}>
                    <EditOutlined
                      className="ml-3" style={{ cursor: "pointer" }}
                      onClick={() => window.location.href = `/transactions?id=${id}&projectId=${projectId}&actionType=edit`}
                    />
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        )
      },
      width: '400px'
    },
    {
      title: 'Overview',
      dataIndex: 'overview',
      key: 'overview',
      render: (_overview: string, record) => (
        <>
          <div className="d-flex justify-between">
            <Typography color="dark-main" size="sm" weight="bold">
              Reference:
            </Typography>
            <Typography color="dark-main" size="sm" className="ml-1">
              {record.transactionReference}
            </Typography>
          </div>
          <div className="d-flex justify-between">
            <Typography color="dark-main" size="sm" weight="bold">
              Date:
            </Typography>
            <Typography color="dark-main" size="sm" className="ml-1">
              {convertDate(record.transactionDate, "dd M,yy")}
            </Typography>
          </div>
          <div className="d-flex justify-between flex-wrap">
            <Typography color="dark-main" size="sm" weight="bold">
              Authority:
            </Typography>
            <Typography color="dark-main" size="sm" className="ml-1">
              {record?.Authority?.title}
            </Typography>
          </div>
          {record?.receipt && (
            <a
              href={`${APPLICATION_RESOURCE_BASE_URL}${record?.receipt}`}
              target="_blank" rel="noreferrer" title=" View Receipt"
              className="d-flex align-center mt-2"
            >
              <Typography color="dark-main" size="sm">
                View Receipt
              </Typography>
              <ExternalIcon />
            </a>
          )}
        </>
      ),
      width: "350px"
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Typography color='dark-main'>
          {formatCurrency(amount)}
        </Typography>
      ),
      width: "200px"
    },
    {
      title: 'Assigned To',
      dataIndex: 'AssignedTo',
      key: 'AssignedTo',
      render: (AssignedTo: TransactionsType['AssignedTo']) => (
        <div className='d-flex align-center'>
          <Avatar
            src={`${RESOURCE_BASE_URL}${AssignedTo?.profile}`}
            icon={<UserOutlined />} size={30}
          />
          <Typography color="dark-sub" size="sm" className="ml-1">
            {`${(AssignedTo?.firstName && AssignedTo?.lastName) ? `${AssignedTo?.firstName} ${AssignedTo?.lastName}` : "Not Assigned"}`}
          </Typography>
        </div>
      ),
      width: "250px"
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Typography color='dark-main'>
          {TransactionStatus[status]}
        </Typography>
      ),
      width: "150px"
    },
  ];

  return (
    <>
      {readTransaction === true && (
        <Table
          dataSource={data} columns={columns}
          pagination={false} loading={loading} sticky
          rowKey='id' style={{ minHeight: '200px', overflowY: 'auto' }}
          onHeaderRow={(_columns, _index) => {
            return {
              style: { backgroundColor: 'var(--color-light)' }
            };
          }}
          onRow={(record) => {
            return {
              onMouseEnter: () => setShowManage({ [record.id]: true }),
              onMouseLeave: () => setShowManage({}),
            };
          }}
          scroll={{ x: 1000 }}
        />
      )}
    </>
  )
}
export default ProjectGovernmentFees;