import { FC } from 'react';
import { Skeleton, Avatar } from 'antd';
import {
  BellFilled, QuestionCircleFilled, SettingFilled, UserOutlined,
} from "@ant-design/icons";
import { Logo, SideBarLeft } from '@icons/';
import styles from './styles.module.scss';

interface FallbackProps { }

const Fallback: FC<FallbackProps> = () => {
  return (
    <div className={styles.fallback}>
      <div className={styles.fallback__header}>
        <div className={styles.fallback__header__left}>
          <SideBarLeft
            style={{ fontSize: 20, cursor: 'pointer' }}
          />
          <Logo width={60} height={25} />
        </div>

        <div className={styles.fallback__header__right}>
          <BellFilled style={{ cursor: 'pointer' }} />
          <QuestionCircleFilled style={{ cursor: 'pointer' }} />
          <SettingFilled style={{ cursor: 'pointer' }} />
          <Avatar
            size={40} icon={<UserOutlined />}
            style={{
              cursor: 'pointer', backgroundColor: "#137749"
            }}
          />
        </div>
      </div>
      <div className={styles.fallback__content}>
        <div className={styles.fallback__content__sidebar}>
          <Skeleton active avatar paragraph={{ rows: 7 }} />
        </div>
        <div className={styles.fallback__content__main}>
          <Skeleton active paragraph={{ rows: 5 }} />
        </div>
      </div>
    </div>
  );
}
export default Fallback;