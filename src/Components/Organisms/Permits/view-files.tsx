import { useMemo, type FC } from 'react';
import { Drawer, Image, Skeleton, Tooltip, Typography } from 'antd';
import { APPLICATION_RESOURCE_BASE_URL, PROTECTED_RESOURCE_BASE_URL } from "@helpers/constants";
import { useConditionFetchData } from 'hooks';
import { PermitsModule } from '@modules/Permits';
import { PermitsType } from '@modules/Permits/types';
import styles from './styles.module.scss';
import TokenService from '@services/tokenService';
import { ExternalIcon } from '@icons/external';

const { Text } = Typography;

interface ViewPermitFilesProps {
  open: boolean
  onClose: () => void
  id: number
}

const ViewPermitFiles: FC<ViewPermitFilesProps> = (props) => {
  const { onClose, open, id } = props;
  const module = useMemo(() => new PermitsModule(), []);
  const access_token = TokenService.getLocalAccessToken();

  const { data, loading } = useConditionFetchData<PermitsType>({
    method: () => module.getRecordById(id),
    condition: (!!id && open && id > 0),
  })

  return (
    <Drawer
      open={open} onClose={onClose}
      width={window.innerWidth > 500 ? 500 : "100%"}
      title={`${data?.title} Files`}
      placement="right" destroyOnClose
      bodyStyle={{ padding: "0px 25px" }}
    >
      {loading ? <Skeleton active /> : (
        <>
          {data?.Resources?.map((item, idx) => (
            <div key={idx} className={styles.permitFiles}>
              {item.fileType?.includes('image') ? (
                <Image
                  src={`${PROTECTED_RESOURCE_BASE_URL}${item.path}?authKey=${access_token}`}
                  alt={item.title} width={100} height={70}
                  style={{ borderRadius: 5, objectFit: 'cover' }}
                />
              ) : (
                <Image
                  src='/images/doc.png' alt={`Document-${idx}`}
                  width={100} height={70} preview={false}
                  style={{ objectFit: 'contain' }}
                />
              )}

              <Text ellipsis={{ tooltip: item.title }}>
                {item.title || item.name}
              </Text>

              {!item.fileType?.includes('image') && (
                <Tooltip title="View Document">
                  <a
                    href={`${APPLICATION_RESOURCE_BASE_URL}${item.path}`}
                    target="_blank" rel="noreferrer"
                  >
                    <ExternalIcon />
                  </a>
                </Tooltip>
              )}
            </div>
          ))}
        </>
      )}
    </Drawer>
  );
}
export default ViewPermitFiles