import { Popconfirm, message } from 'antd';
import { FC, ReactNode, useCallback, useState } from 'react';
import CustomSelect from '../Select';
// import { ManualActionScore } from '../../../helpers/commonEnums';
import CustomInput from '../Input';

interface ManualActionProps {
    children: ReactNode;
    onConfirm: (data: { value: string; message: string; }) => void
}

const ManualAction: FC<ManualActionProps> = ({ children, onConfirm }) => {
    const [value, setValue] = useState<string>("");
    const [manualActionMessage, setManualActionMessage] = useState<string>("");

    // Validate the input fields before confirming the action
    const validate = useCallback(() => {
        if (!value) {
            message.error("Please select a value");
            return false
        }
        if (!manualActionMessage) {
            message.error("Please enter a message");
            return false
        }
        return true
    }, [value, manualActionMessage])

    return (
        <Popconfirm
            title={
                <div>
                    <p>Manual Action</p>
                    <CustomSelect
                        options={[]}
                        onChange={(value: string) => setValue(value)}
                        placeholder="Select an option"
                        value={value}
                        label="Value"
                    />
                    <label className="mt-6">Message</label>
                    <CustomInput
                        type="textArea"
                        onChange={(e: any) => setManualActionMessage(e.target.value)}
                        className="mt-1"
                        placeHolder="Enter message"
                        value={manualActionMessage}
                    />
                </div>
            }
            okText="Save"
            cancelText="Cancel"
            placement="left"
            onConfirm={() => {
                if (validate()) {
                    onConfirm({
                        value: value,
                        message: manualActionMessage
                    })
                }
            }}
        >
            {children}
        </Popconfirm>
    );
}
export default ManualAction;