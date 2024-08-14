import { forwardRef } from 'react';
import { Input, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { TextAreaProps } from 'antd/lib/input';
import styles from "./input.module.scss";

const { TextArea } = Input;

interface CustomTextAreaProps extends TextAreaProps {
  label?: string;
  hint?: string;
  asterisk?: boolean;
  helperText?: string;
}

const CustomTextArea = forwardRef<HTMLTextAreaElement, CustomTextAreaProps>((props, ref) => {
  const {
    label, hint, asterisk, helperText, className, ...rest
  } = props;

  return (
    <>
      {label ? (
        <label className={styles.labelWrap}>
          <span>{label}</span>
          {hint ? (
            <Tooltip title={hint}>
              <InfoCircleOutlined />
            </Tooltip>
          ) : null}
          {asterisk ? <span className={styles.asterisk}>*</span> : null}
        </label>
      ) : null}
      <TextArea
        ref={ref} {...rest}
        className={`${styles["inpt"]} ${className}`}
      />
      {helperText ? (
        <small className={styles.helperText}>{helperText}</small>
      ) : null}
    </>
  );
})
CustomTextArea.defaultProps = {
  autoSize: { minRows: 4 },
  placeholder: "Enter text here",
  asterisk: false,
  hint: "",
}

export default CustomTextArea;