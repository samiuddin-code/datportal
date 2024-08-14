import { useState, type FC } from 'react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { SharedFilesReportTypes } from '@modules/Project/types';
import { Typography } from '@atoms/';
import { convertDate } from '@helpers/dateHandler';
import SharedFilesDetails from './shared-files-details';

interface SharedFilesReportProps {
  data: SharedFilesReportTypes[]
  loading: boolean
}

type SharedFilesModalTypes = {
  open: boolean
  data: SharedFilesReportTypes['sharedFiles']
  batchNumber: SharedFilesReportTypes['batchNumber']
}

const SharedFilesReport: FC<SharedFilesReportProps> = ({ data, loading }) => {
  const [sharedFiles, setSharedFiles] = useState<SharedFilesModalTypes>()

  const columns: ColumnsType<SharedFilesReportTypes> = [
    {
      title: <Typography color="dark-sub" weight='semi'>Batch No.</Typography>,
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      render: (batchNumber: number) => (
        <Typography color="dark-sub">
          {batchNumber}
        </Typography>
      ),
    },
    {
      title: <Typography color="dark-sub" weight='semi'>Total Files</Typography>,
      dataIndex: 'sharedFiles',
      key: 'sharedFiles',
      render: (sharedFiles: SharedFilesReportTypes['sharedFiles'], record) => (
        <Typography
          color="dark-sub" className='text-underline cursor-pointer'
          onClick={() => setSharedFiles({ open: true, data: sharedFiles, batchNumber: record.batchNumber })}
        >
          {`${sharedFiles?.length} Files`}
        </Typography>
      ),
    },
    {
      title: <Typography color="dark-sub" weight='semi'>Date Shared</Typography>,
      dataIndex: 'sharedDate',
      key: 'sharedDate',
      render: (sharedDate: SharedFilesReportTypes['sharedDate']) => (
        <Typography color="dark-sub">
          {convertDate(sharedDate, "dd M,yy-t")}
        </Typography>
      ),
    }
  ];
  return (
    <>
      <Table
        dataSource={data} columns={columns}
        pagination={false} loading={loading}
        rowKey='batchNumber'
        onHeaderRow={(_columns, _index) => {
          return {
            style: { backgroundColor: 'var(--color-light)' }
          };
        }}
      />

      {sharedFiles?.open && (
        <SharedFilesDetails
          open={sharedFiles?.open} batchNumber={sharedFiles?.batchNumber}
          onClose={() => setSharedFiles({ open: false, data: [], batchNumber: 0 })}
          data={sharedFiles?.data}
        />
      )}
    </>
  );
}
export default SharedFilesReport;