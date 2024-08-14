import { Empty, Select } from "antd";
import { selectProps } from "./select";
import styles from "./styles.module.scss";

const CustomSelect = (props: selectProps) => {
  const {
    options, placeholder, label, mode, asterisk,
    onChange, onSearch, className, helperText,
    ...rest
  } = props;

  return (
    <div className={`${styles.selectwrap} ${className}`}>
      <label className={styles.label}>
        {label}
        {asterisk ? <span className={styles.asterisk}>*</span> : null}
      </label>
      <Select
        {...rest}
        mode={mode} className={styles.select}
        allowClear showSearch onSearch={onSearch}
        onChange={onChange} placeholder={placeholder}
        optionFilterProp="label"
        filterOption={(input, option) => {
          let label;
          // if option.label is array, then get the first element of the array and convert it to lowercase
          if (Array.isArray(option?.label)) {
            label = option?.label[0]?.toLowerCase();
          } else {
            label = option?.label?.toLowerCase();
          }
          // if label is undefined, then return false
          if (!label) return false;
          // if label is not undefined, then return the result of the comparison
          return label.includes(input?.toLowerCase());
        }}
        options={options} dropdownStyle={{ zIndex: 99999 }}
        notFoundContent={
          <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            imageStyle={{ height: 60 }}
            description={<span>No data found, please modify your search term</span>}
          />
        }
      />
      {helperText ? <small className={styles.helperText}>{helperText}</small> : null}
    </div>
  );
};
CustomSelect.defaultProps = {
  options: [],
  placeholder: "Select an item",
  label: "",
  mode: undefined,
  asterisk: false,
  maxTagCount: 1,
};
export default CustomSelect;
