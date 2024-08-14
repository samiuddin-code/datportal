import { useMemo, type FC, useState } from 'react';
import { Table, Tooltip } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { PermitsModule } from '@modules/Permits';
import { PermitsType } from '@modules/Permits/types';
import { PermitsPermissionsEnum } from '@modules/Permits/permissions';
import { useConditionFetchData } from 'hooks';
import Typography from '@atoms/Headings';
import { PermitClientStatus, PermitFinanceStatus } from '@helpers/commonEnums';
import { useSelector } from 'react-redux';
import { RootState } from 'Redux/store';
import { PlusCircleIcon } from '@icons/plus-circle';
import { convertDate } from '@helpers/dateHandler';
import { isDateGreaterThan } from '@helpers/common';
import ViewPermitFiles from '@organisms/Permits/view-files';
import styles from './styles.module.scss';

interface ProjectPermitsProps {
  projectId: number;
}

type StatusEnumTypes = {
  financeColors: { [key: number]: string }
  clientColors: { [key: number]: string }
}

const statusEnum: StatusEnumTypes = {
  financeColors: {
    [PermitFinanceStatus["Pending Payment"]]: "var(--color-yellow-dark)",
    [PermitFinanceStatus.Paid]: "var(--color-primary-main)",
    [PermitFinanceStatus.Canceled]: "var(--color-red-yp)",
  },
  clientColors: {
    [PermitClientStatus["To be sent"]]: "var(--color-yellow-dark)",
    [PermitClientStatus.Sent]: "var(--color-primary-main)",
  }
}

const ProjectPermits: FC<ProjectPermitsProps> = ({ projectId }) => {
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in PermitsPermissionsEnum]: boolean };
  const { readPermit } = permissions;
  const module = useMemo(() => new PermitsModule(), []);
  const [showManage, setShowManage] = useState<{ [key: number]: boolean }>({});
  const [permitFiles, setPermitFiles] = useState<{ open: boolean; id: number; }>();

  const condition = useMemo(() => projectId && readPermit === true, [readPermit, projectId]);

  const { data, loading } = useConditionFetchData<PermitsType[]>({
    method: module.getAllRecords,
    initialQuery: { projectId: projectId },
    condition: condition,
  });

  const columns: ColumnsType<PermitsType> = [
    {
      title: (
        <div className='d-flex items-center'>
          <p className='mb-0'>
            Permits
          </p>

          <Tooltip title="Create Permits">
            <PlusCircleIcon
              className='ml-2' style={{ cursor: "pointer" }} stroke='var(--color-dark-main)'
              onClick={() => window.location.href = `/permits?projectId=${projectId}&actionType=create`}
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

              <div className="d-flex justify-between">
                <Typography color="dark-main" size="sm" weight="bold">
                  Authority:
                </Typography>
                <Typography color="dark-main" size="sm" className="ml-1">
                  {record.Authority.title}
                </Typography>
              </div>
              <div className="d-flex justify-between">
                <Typography color="dark-main" size="sm" weight="bold">
                  Remarks:
                </Typography>
                <Typography color="dark-main" size="sm" className="ml-1">
                  {record.remarks}
                </Typography>
              </div>

              <Typography
                color="dark-sub" size="sm" className="cursor-pointer text-underline mt-1"
                onClick={() => {
                  if (record?._count?.Resources > 0) {
                    setPermitFiles({ open: true, id: record.id })
                  }
                }}
              >
                {`${record?._count?.Resources > 0 ? `${record?._count?.Resources} files Attached` : "No Attachments"} `}
              </Typography>
            </div>

            <div className={styles.actionButtons}>
              {showManage[id] && (
                <div className='d-flex align-center'>
                  <Tooltip title={"View More"}>
                    <EyeOutlined
                      style={{ cursor: "pointer" }}
                      onClick={() => window.location.href = `/permits?id=${id}&projectId=${projectId}&actionType=view`}
                    />
                  </Tooltip>
                  <Tooltip title={"Edit"} >
                    <EditOutlined
                      className="ml-3" style={{ cursor: "pointer" }}
                      onClick={() => window.location.href = `/permits?id=${id}&projectId=${projectId}&actionType=edit`}
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
      title: "Date/Status",
      dataIndex: "date",
      key: "date",
      render: (_date: string, record) => {
        const isExpired = isDateGreaterThan(record?.expiryDate, new Date().toISOString());
        return (
          <>
            <div className="d-flex justify-between">
              <Typography color="dark-main" size="sm" weight="bold">
                Approved:
              </Typography>
              <Typography color="dark-main" size="sm" className="ml-1">
                {convertDate(record.approvedDate, "MM dd,yy")}
              </Typography>
            </div>

            <div className="d-flex justify-between">
              <Typography color="dark-main" size="sm" weight="bold">
                Expiry:
              </Typography>
              <Typography color="dark-main" size="sm" className="ml-1">
                {convertDate(record.expiryDate, "MM dd,yy")}
              </Typography>
            </div>

            <div className="d-flex justify-between mt-2">
              <Typography color="dark-main" size="sm" weight="bold">
                Status:
              </Typography>
              <Typography
                size="sm"
                className={`ml-1 ${isExpired ? 'color-red-yp' : 'color-primary-main'}`}
              >
                {isExpired ? 'Expired' : 'Active'}
              </Typography>
            </div>
          </>
        )
      },
      width: '200px'
    },
    {
      title: 'Finance Status',
      dataIndex: 'financeStatus',
      key: 'financeStatus',
      render: (financeStatus: number) => (
        <Typography style={{ color: statusEnum.financeColors[financeStatus] }}>
          {PermitFinanceStatus[financeStatus]}
        </Typography>
      ),
      width: '150px'
    },
    {
      title: 'Client Status',
      dataIndex: 'clientStatus',
      key: 'clientStatus',
      render: (clientStatus: number) => (
        <Typography style={{ color: statusEnum.clientColors[clientStatus] }}>
          {PermitClientStatus[clientStatus]}
        </Typography>
      ),
      width: '150px'
    },
  ];

  return (
    <>
      {readPermit === true && (
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

      {permitFiles?.open && (
        <ViewPermitFiles
          id={permitFiles.id}
          open={permitFiles.open}
          onClose={() => setPermitFiles({ open: false, id: 0 })}
        />
      )}
    </>
  )
}
export default ProjectPermits;