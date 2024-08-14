import type { FC } from 'react';
import { Avatar, Typography } from 'antd';
import { ClientType } from '@modules/Client/types';
import styles from './styles.module.scss';
import { RESOURCE_BASE_URL } from '@helpers/constants';
import { UserOutlined } from '@ant-design/icons';
import { EnvelopeIcon, PhoneIcon } from '@icons/';

const { Paragraph } = Typography;

interface ClientDetailsOverviewProps {
  client: ClientType
}

const ClientDetailsOverview: FC<ClientDetailsOverviewProps> = ({ client }) => {
  return (
    <div className={styles.client}>
      <div className={styles.client_background} />
      <Avatar
        size={100}
        src={`${RESOURCE_BASE_URL}${client?.logo}`}
        icon={<UserOutlined />}
        className={styles.client_avatar}
      />
      <div className={styles.client_content}>
        <p className={styles.client_content_name}>
          {client?.name}
        </p>

        {client?.email && (
          <a
            className={styles.client_content_email}
            href={`mailto:${client?.email}`}
          >
            <EnvelopeIcon width={18} height={18} />
            <Paragraph
              ellipsis={{ rows: 1, expandable: false }} copyable={{ text: client?.email }}
              className='mb-1'
            >
              {client?.email}
            </Paragraph>
          </a>
        )}

        {client?.phone && (
          <a
            className={styles.client_content_phone}
            href={`tel:${client?.phoneCode || "971"}${client?.phone}`}
          >
            <PhoneIcon width={18} height={18} />
            <Paragraph
              ellipsis={{ rows: 1, expandable: false }}
              copyable={{ text: `+${client?.phoneCode || "971"}${client?.phone}` }}
              className='mb-1'
            >
              {`+${client?.phoneCode || "971"}${client?.phone}`}
            </Paragraph>
          </a>
        )}
      </div>
    </div>
  );

}
export default ClientDetailsOverview;