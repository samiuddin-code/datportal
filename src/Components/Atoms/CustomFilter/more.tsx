import { FC, useState } from 'react';
import { Card, Dropdown, Space, Checkbox } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import styles from './styles.module.scss';

interface MoreCustomFiltersProps {
  options: { label: string; value: string; }[]
  value: CheckboxValueType[]
  onChange: (value: CheckboxValueType[]) => void
}

const MoreCustomFilters: FC<MoreCustomFiltersProps> = ({ options, onChange, value }) => {
  const [visible, setVisible] = useState<boolean>(false);

  const overlay = (
    <Card>
      <div className='pa-3'>
        <Checkbox.Group
          className={styles.checkboxGroup}
          options={options}
          onChange={(value) => {
            onChange(value);
            setVisible(false);
          }}
          value={value}
        />
      </div>
    </Card>
  );

  return (
    <div>
      <Dropdown
        trigger={['click']} open={visible}
        onOpenChange={(visible) => setVisible(visible)}
        dropdownRender={() => overlay}
      >
        <div className={styles.label}>
          <Space>
            <span>More Filters</span>
            <DownOutlined />
          </Space>
        </div>
      </Dropdown>
    </div>
  );
}
export default MoreCustomFilters;