import type { FC } from 'react';
import { ButtonProps, Dropdown, DropDownProps, MenuProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';

type DropdownWithLabelProps = {
  label: string
  items: MenuProps['items']
  showArrow?: boolean
  size?: ButtonProps['size']
} & ButtonProps & DropDownProps

const DropdownWithLabel: FC<DropdownWithLabelProps> = (props) => {
  const {
    label, items, showArrow = true, style, type, ...rest
  } = props
  return (
    <Dropdown.Button
      {...rest}
      icon={showArrow ? (
        <DownOutlined />
      ) : null}
      menu={{ items: props.items }}
      size={props.size || "small"}
      type={type}
      style={{ ...style, fontSize: '12px' }}
      className={styles.dropdownButton}
    >
      {label}
    </Dropdown.Button>
  );
}
export default DropdownWithLabel;