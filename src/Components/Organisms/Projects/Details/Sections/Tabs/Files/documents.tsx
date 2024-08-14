import type { FC } from 'react';
import { FileTextOutlined } from '@ant-design/icons';
import { ProjectResourceTypes } from '@modules/Project/types';
import { PROTECTED_RESOURCE_BASE_URL } from '@helpers/constants';
import TokenService from '@services/tokenService';
import styles from './styles.module.scss';

interface DocumentsCardProps {
  data: ProjectResourceTypes[]
}

const DocumentsCard: FC<DocumentsCardProps> = ({ data }) => {
  const access_token = TokenService.getLocalAccessToken();

  return (
    <div className={styles.documents}>
      {data.map((item) => (
        <a
          key={`document-${item.id}`}
          className={styles.documents_content}
          href={`${PROTECTED_RESOURCE_BASE_URL}${item.path}?authKey=${access_token}`}
          target='_blank'
          title={item.title}
          rel='noreferrer'
        >
          <FileTextOutlined style={{ fontSize: "20px" }} />
          <p className={styles.documents_content_title}>
            {item.title}
          </p>
        </a>
      ))}
    </div>
  );
}
export default DocumentsCard;