import { FC, FocusEventHandler, MouseEventHandler } from "react";
import { Button, DatePicker, DatePickerProps } from "antd";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";
import styles from "./style.module.scss";

interface EditableDatePickerProps {
    onBlur: FocusEventHandler<HTMLDivElement>
    onMouseDown: MouseEventHandler<any>;
    onChange: DatePickerProps['onChange'];
    defaultValue: any
}

const EditableDatePicker: FC<EditableDatePickerProps> = (props) => {
    const { onBlur, onChange, onMouseDown, defaultValue, ...rest } = props

    return (
        <div onBlur={onBlur} className={styles.updateTitle}>
            <DatePicker
                onChange={onChange}
                defaultValue={defaultValue}
                autoFocus
                clearIcon={false}
                defaultOpen
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

export default EditableDatePicker;