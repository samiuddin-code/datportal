import { FC, FocusEventHandler, MouseEventHandler } from "react";
import { Button, Input, } from "antd";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";
import { TextAreaProps } from "antd/lib/input";
import styles from "./style.module.scss";

const { TextArea } = Input;

type EditableTextareaProps = TextAreaProps & {
  onBlur: FocusEventHandler<HTMLDivElement>
  onMouseDown: MouseEventHandler<any>;
}

const EditableTextarea: FC<EditableTextareaProps> = (props) => {
  const { onBlur, onChange, onMouseDown, defaultValue, ...rest } = props

  return (
    <div onBlur={onBlur} className={styles.updateTitle}>
      <TextArea
        rows={6}
        bordered={false}
        className={styles.textArea}
        defaultValue={defaultValue}
        onChange={onChange}
        autoFocus
        {...rest}
      />
      <div className={styles.buttonWrap}>
        <Button
          type="default" onMouseDown={onMouseDown}
          icon={<CheckOutlined style={{ fontSize: 10 }} />}
        />
        <Button
          type="default"
          icon={<CloseOutlined style={{ fontSize: 10 }} />}
        />
      </div>
    </div>
  )
}

export default EditableTextarea;