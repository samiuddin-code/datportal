import { useMemo, type FC, useState } from 'react';
import { Badge, Table, Tooltip, Typography as AntdTypography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { InvoiceModule } from '@modules/Invoice';
import { InvoiceTypes } from '@modules/Invoice/types';
import { InvoicePermissionsEnum } from '@modules/Invoice/permissions';
import { useConditionFetchData } from 'hooks';
import Typography from '@atoms/Headings';
import { InvoiceStatus } from '@helpers/commonEnums';
import { useSelector } from 'react-redux';
import { RootState } from 'Redux/store';
import styles from './styles.module.scss';
import { PlusCircleIcon } from '@icons/plus-circle';
import { formatCurrency } from '@helpers/common';

const { Paragraph } = AntdTypography;
interface ProjectInvoiceProps {
  projectId: number;
}

const ProjectInvoice: FC<ProjectInvoiceProps> = ({ projectId }) => {
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in InvoicePermissionsEnum]: boolean };
  const { readInvoice } = permissions;
  const module = useMemo(() => new InvoiceModule(), []);
  const [showManage, setShowManage] = useState<{ [key: number]: boolean }>({});

  const condition = useMemo(() => projectId && readInvoice === true, [readInvoice, projectId]);

  const { data, loading } = useConditionFetchData<InvoiceTypes[]>({
    method: module.getAllRecords,
    initialQuery: { projectId: projectId },
    condition: condition,
  });

  const columns: ColumnsType<InvoiceTypes> = [
    {
      title: (
        <div className='d-flex items-center'>
          <p className='mb-0'>
            Invoice Number
          </p>

          <Tooltip title="Create Invoice">
            <PlusCircleIcon
              className='ml-2' style={{ cursor: "pointer" }} stroke='var(--color-dark-main)'
              onClick={() => window.location.href = `/invoice?projectId=${projectId}&actionType=create`}
            />
          </Tooltip>
        </div>
      ),
      dataIndex: 'id',
      key: 'id',
      render: (id: number, record) => {
        return (
          <div className='d-flex items-center'>
            <Typography color='dark-main'>
              {record.invoiceNumber || `INV-${id}`}
            </Typography>

            <div className={styles.actionButtons}>
              {showManage[id] && (
                <>
                  <Tooltip
                    title={() => (
                      <>
                        {record.status === InvoiceStatus['Generated'] && "Edit Invoice"}
                        {record.status === InvoiceStatus['Paid'] && "Cannot edit invoice because it is paid"}
                        {record.status === InvoiceStatus['Canceled'] && "Cannot edit invoice because it is canceled"}
                        {record.status === InvoiceStatus['Sent'] && "Cannot edit invoice because it is sent to the client"}
                      </>
                    )}
                  >
                    <EditOutlined
                      className="ml-3" style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (record.status !== InvoiceStatus['Generated']) return;
                        window.location.href = `/invoice?id=${id}&projectId=${projectId}&actionType=edit`
                      }}
                    />
                  </Tooltip>
                  <Badge
                    className='ml-3' size='small'
                    count={
                      <div
                        className={styles.badge}
                        onClick={() => window.location.href = `/invoice?id=${id}&projectId=${projectId}&actionType=preview`}
                      >
                        <span style={{ fontSize: '10px' }}>Preview</span>
                      </div>
                    }
                  />
                </>
              )}
            </div>
          </div>
        )
      },
      width: 240
    },
    {
      title: 'Last Message',
      dataIndex: 'total',
      key: 'total',
      render: (total: number, record) => (
        <Paragraph
          className='mb-0'
          ellipsis={{ rows: 4, expandable: false }}
          style={{ width: '100%' }}
        >
          {(record.InvoiceFollowUp?.length > 0) ? record.InvoiceFollowUp[0].note : ""}
        </Paragraph>
      ),
      width: 400
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Typography color='dark-main'>
          {InvoiceStatus[status]}
        </Typography>
      ),
      width: 120
    },
    {
      title: 'Amount',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => (
        <Typography color='dark-main'>
          {formatCurrency(total)}
        </Typography>
      ),
      width: 120
    }
  ];

  return (
    <>
      {readInvoice === true && (
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
        />
      )}
    </>
  )
}
export default ProjectInvoice;