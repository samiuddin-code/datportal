import { ReactNode, type FC } from 'react';
import { Dropdown, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import styles from '../styles.module.scss';

interface CardDropDownProps {
  label: ReactNode
  children: ReactNode
  placement?: "bottomLeft" | "bottomCenter" | "bottomRight" | "topLeft" | "topCenter" | "topRight" | "top" | "bottom"
}

const CardDropDown: FC<CardDropDownProps> = (props) => {
  const {
    label, children, placement
  } = props;

  const overlay = (
    <div className={styles.dropdown}>
      {children}
    </div>
  )

  return (
    <Dropdown
      trigger={['click']} dropdownRender={() => overlay}
      placement={placement}
    >
      <Space className={styles.dropdownTrigger}>
        <span>
          {label}
        </span>
        <DownOutlined />
      </Space>
    </Dropdown>
  );
}
export default CardDropDown;