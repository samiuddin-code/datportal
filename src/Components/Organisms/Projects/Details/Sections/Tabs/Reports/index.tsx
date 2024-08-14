import { useMemo, type FC } from 'react';
import { Collapse } from 'antd';
import SharedFilesReport from './shared-files';
import { useFetchData } from 'hooks';
import { ProjectModule } from '@modules/Project';
import { SharedFilesReportTypes } from '@modules/Project/types';

const { Panel } = Collapse;

interface ReportTabProps {
  projectId: number;
}

const ReportTab: FC<ReportTabProps> = ({ projectId }) => {
  const module = useMemo(() => new ProjectModule(), []);

  const { data, loading } = useFetchData<SharedFilesReportTypes[]>({
    method: () => module.sharedFiles(projectId)
  })

  return (
    <div>
      <Collapse defaultActiveKey={['sharedFiles']} expandIconPosition='end'>
        <Panel header="Shared Files" key="sharedFiles">
          <SharedFilesReport data={data!} loading={loading} />
        </Panel>
      </Collapse>
    </div>
  );
}
export default ReportTab;