import type { FC, ReactNode } from 'react';
import { Avatar, Popover, PopoverProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { UserTypes } from '@modules/User/types';
import { RESOURCE_BASE_URL } from '@helpers/constants';
import { EnvelopeIcon, PhoneIcon } from '@icons/';
import styles from './styles.module.scss';
import { ClientType } from '@modules/Client/types';

type ClientProps = {
  type: 'client'
  /** Client object to be displayed in popover */
  client: ClientType
  user?: never
}

type UserProps = {
  type: 'user'
  /** User object to be displayed in popover */
  user: UserTypes
  client?: never
}

type UserPopoverProps = PopoverProps & {
  /** Extra element to be displayed in popover */
  extra?: ReactNode
} & (ClientProps | UserProps)

const UserPopover: FC<UserPopoverProps> = (props) => {
  const { user, children, extra, client, type } = props;

  return (
    <Popover
      placement="left" showArrow={false} {...props}
      overlayStyle={{ padding: 0, }}
      overlayInnerStyle={{ padding: 0, borderRadius: "0.3rem" }}
      content={
        <div className={styles.user_popover}>
          <div className={styles.user_popover_background} />
          <Avatar
            size={64}
            src={`${RESOURCE_BASE_URL}${type === 'client' ? client?.logo : user?.profile}`}
            icon={<UserOutlined />}
            className={styles.user_popover_avatar}
          />
          <div className={styles.user_popover_content}>
            <p className={styles.user_popover_content_name}>
              {type === 'client' ? client?.name : `${user?.firstName} ${user?.lastName}`}
            </p>

            <a
              className={styles.user_popover_content_email}
              href={`mailto:${type === 'client' ? client?.email : user?.email}`}
            >
              <EnvelopeIcon width={18} height={18} />
              {type === 'client' ? client?.email : user?.email}
            </a>

            {type === 'user' ? (
              <>
                {user?.phone && (
                  <a
                    className={styles.user_popover_content_phone}
                    href={`tel:${user?.phoneCode}${user?.phone}`}
                  >
                    <PhoneIcon width={18} height={18} />
                    {`+${user?.phoneCode || "971"}${user?.phone}`}
                  </a>
                )}
              </>
            ) : (
              <>
                {client?.phone && (
                  <a
                    className={styles.user_popover_content_phone}
                    href={`tel:${client?.phoneCode}${client?.phone}`}
                  >
                    <PhoneIcon width={18} height={18} />
                    {`+${client?.phoneCode || "971"}${client?.phone}`}
                  </a>
                )}
              </>
            )}

            {extra && (
              <div className={styles.user_popover_content_extra}>
                {extra}
              </div>
            )}
          </div>
        </div>
      }
    >
      {children}
    </Popover>
  );
}
export default UserPopover;