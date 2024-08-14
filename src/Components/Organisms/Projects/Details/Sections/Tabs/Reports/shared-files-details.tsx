import type { FC } from 'react';
import { Avatar, Drawer, Image, Tooltip, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { PROTECTED_RESOURCE_BASE_URL, RESOURCE_BASE_URL } from '@helpers/constants';
import { SharedFilesReportTypes } from '@modules/Project/types';
import TokenService from '@services/tokenService';
import { ProjectDocumentsTypes } from '@helpers/commonEnums';
import styles from './styles.module.scss';

const { Text } = Typography;

interface SharedFilesDetailsProps {
  open: boolean
  onClose: () => void
  data: SharedFilesReportTypes['sharedFiles']
  batchNumber: SharedFilesReportTypes['batchNumber']
}

const SharedFilesDetails: FC<SharedFilesDetailsProps> = (props) => {
  const { onClose, open, data, batchNumber } = props;
  const access_token = TokenService.getLocalAccessToken();
  return (
    <Drawer
      open={open} onClose={onClose}
      width={window.innerWidth > 500 ? 500 : "100%"}
      title={`Shared Files with batch number ${batchNumber}`}
      placement="right" destroyOnClose
      bodyStyle={{ padding: "0px 25px" }}
    >
      {data?.map((item, idx) => (
        <div key={idx} className={styles.sharedFiles}>
          {item.fileType?.includes('image') ? (
            <Image
              src={`${PROTECTED_RESOURCE_BASE_URL}${item.path}?authKey=${access_token}`}
              alt={item.title}
              width={100} height={70}
              style={{ borderRadius: 5, objectFit: 'cover' }}
              preview={false}
            />
          ) : (
            <Image
              src='/images/doc.png' alt={`Document-${idx}`}
              width={100} height={70} preview={false}
              style={{ objectFit: 'contain' }}
            />
          )}

          <div className={styles.sharedFiles__details}>
            <Text ellipsis={{ tooltip: item.title }}>{item.title}</Text>
            <Text ellipsis={{ tooltip: item.documentType }}>
              {ProjectDocumentsTypes[item.documentType]}
            </Text>
            <Tooltip title={`${item?.AddedBy?.firstName} ${item?.AddedBy?.lastName}`}>
              <Avatar
                icon={<UserOutlined />} size="small"
                src={`${RESOURCE_BASE_URL}${item?.AddedBy?.profile}`}
              />
            </Tooltip>
          </div>
        </div>
      ))}
    </Drawer>
  );
}
export default SharedFilesDetails;