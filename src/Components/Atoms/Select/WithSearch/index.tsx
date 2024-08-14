import type { FC, ReactNode } from 'react';
import { Select, SelectProps, Skeleton, Space } from 'antd';
import CustomEmpty from '../../CustomEmpty';

const { Option } = Select;

interface SelectWithSearchProps extends SelectProps {
  label?: string
  options: SelectProps['options']
  onSearch: (value: string) => void
  loading?: boolean
  notFoundDescription?: string
  /** Not found footer */
  notFoundFooter?: ReactNode
  asterisk?: boolean
  customOption?: boolean
  disableOption?: string[]
}

const SelectWithSearch: FC<SelectWithSearchProps> = (props) => {
  const {
    label, notFoundDescription, onChange, onSearch, defaultValue,
    options, asterisk = true, customOption = false, placeholder,
    className, disableOption, loading = false, notFoundFooter,
    onSelect, ...rest
  } = props;

  const notFoundContent = (
    <div style={{ position: 'relative' }}>
      <div style={{ paddingBottom: 25 }}>
        {loading ? (
          <Skeleton active />
        ) : (
          <CustomEmpty
            description={notFoundDescription || `No data found, Please search for ${label}`}
          />
        )}
      </div>

      {!loading && notFoundFooter && (
        <div
          style={{
            position: 'absolute', bottom: 0, width: '100%',
            textAlign: 'center',
          }}
        >
          {notFoundFooter}
        </div>
      )}
    </div>
  );

  return (
    <>
      {label && (
        <label className={"font-size-sm"}>
          {label} {asterisk && <span className='color-red-yp'>*</span>}
        </label>
      )}
      {customOption ? (
        <Select
          {...rest}
          allowClear
          style={{ width: "100%" }}
          placeholder={placeholder || `Search for ${label}`}
          className={`selectAntdCustom ${className}`}
          defaultValue={defaultValue}
          showSearch
          onChange={onChange}
          onSearch={onSearch}
          onSelect={onSelect}
          optionFilterProp="label"
          notFoundContent={notFoundContent}
          dropdownStyle={{ zIndex: 99999999 }}
        >
          {options?.map((option) => (
            <Option
              key={option?.value}
              value={option?.value}
              label={option?.label}
              disabled={disableOption?.includes(option?.value as string)}
            >
              <Space>
                <span role="img" aria-label={option?.value as string}>
                  {option?.icon}
                </span>
                <span>{option?.label}</span>
              </Space>
            </Option>
          ))}
        </Select>
      ) : (
        <Select
          {...rest}
          allowClear
          style={{ width: "100%" }}
          dropdownStyle={{ zIndex: 99999999 }}
          placeholder={placeholder || `Search for ${label}`}
          className="selectAntdCustom"
          defaultValue={defaultValue}
          showSearch
          onChange={onChange}
          onSearch={onSearch}
          optionFilterProp="label"
          options={options}
          notFoundContent={notFoundContent}
          onSelect={onSelect}
        />
      )}
    </>
  );
}

export default SelectWithSearch;