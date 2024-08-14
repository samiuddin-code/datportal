import { FC, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { Checkbox, Form, FormInstance, Input, TimePicker } from "antd";
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { BusinessHours } from "./modal";
import { WorkingHourResponseObject } from "@modules/WorkingHours/types";

type Props = {
    name: number,
    businessHours: Array<typeof BusinessHours[0]>,
    formData: FormInstance,
    record?: Partial<WorkingHourResponseObject>
}

export const DaysInAWeek: FC<Props> = ({ name, businessHours, formData, record }) => {
    const [closed, setClosed] = useState(businessHours[name]?.closed);

    useEffect(() => {
        let isDirty = formData.getFieldValue(["openingHours", name, "closed"]);
        if (isDirty !== closed) {
            setClosed(isDirty);
        }
    }, [record])

    return <div key={"Working-Hours-" + name} className={styles.openingHours}>
        <label style={{ paddingRight: "5px", display: 'inline-block', width: "100px", textTransform: "capitalize" }}>{businessHours[name].name}: </label>
        <Form.Item name={[name, 'day']}>
            <Input type="hidden" />
        </Form.Item>
        <Form.Item name={[name, 'name']}>
            <Input type="hidden" />
        </Form.Item>
        <Form.Item name={[name, 'open']}>
            <Input
                disabled={closed}
                className="w-100"
                placeholder="Opening Time"
                type="time"
            />
        </Form.Item>
        {' - '}
        <Form.Item name={[name, 'close']}>
            <Input
                disabled={closed}
                className="w-100"
                placeholder="Opening Time"
                type="time"
            />
        </Form.Item>
        <Form.Item name={[name, 'closed']}>
            <Checkbox
                style={{ paddingLeft: "10px" }}
                // checked={disabled}
                defaultChecked={closed}
                checked={closed}
                onChange={(e: CheckboxChangeEvent) => {
                    formData.setFieldValue(["openingHours", name, "closed"], e.target.checked)
                    setClosed(e.target.checked)
                }}
            >
                Closed
            </Checkbox>
        </Form.Item>
    </div>
}