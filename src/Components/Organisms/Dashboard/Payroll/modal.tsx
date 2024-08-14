import { Form, message } from "antd";
import {
    CustomInput,
    CustomModal,
    CustomErrorAlert,
    CustomButton
} from "../../../Atoms";
import styles from "../../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useState } from "react";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { PayrollResponseObject } from "../../../../Modules/Payroll/types";
import { PropTypes } from "../../Common/common-types";
import { PayrollPermissionsEnum } from "../../../../Modules/Payroll/permissions";
import { PayrollModule } from "../../../../Modules/Payroll";

interface PayrollModalProps extends PropTypes {
    record: number;
    permissions: { [key in PayrollPermissionsEnum]: boolean };
}

export const PayrollModal = (props: PayrollModalProps) => {
    const {
        openModal, onCancel, type, record,
        reloadTableData, permissions: { updatePayroll }
    } = props;
    const [form] = Form.useForm();
    const module = new PayrollModule();
    const [recordData, setRecordData] = useState<Partial<PayrollResponseObject>>();


    const handleErrors = (err: any) => {
        const error = errorHandler(err);
        if (typeof error.message == "string") {
            setRecordData({ ...recordData, error: error.message });
        } else {
            let errData = HandleServerErrors(error.message, []);
            form.setFields(errData);
            setRecordData({ ...recordData, error: "" });
        }
    };

    const handleAlertClose = () => {
        setRecordData({ ...recordData, error: "" });
    };

    const getDataBySlug = useCallback(() => {
        module.getRecordById(record).then((res) => {
            if (res.data && res.data.data) {
                form.setFieldsValue({
                    ...res.data.data,
                });
                setRecordData({ ...res.data, loading: false });
            }
        }).catch((err) => {
            handleErrors(err);
        });
    }, [form, record, module]);

    useEffect(() => {
        if (type === "edit") {
            setRecordData({ loading: true });
            getDataBySlug();
        } else {
            form.resetFields();
        }
    }, []);

    const onFinish = (formValues: any) => {
        setRecordData({ ...recordData, buttonLoading: true });
        if (updatePayroll === true) {
            module.updateRecord(formValues, record).then((res) => {
                reloadTableData();
                onCancel();
                setRecordData((prev) => ({ ...prev, buttonLoading: false }));
            }).catch((err) => {
                handleErrors(err);
                setRecordData((prev) => ({ ...prev, buttonLoading: false }));
            });
        } else {
            setRecordData((prev) => ({ ...prev, buttonLoading: false }));
            message.error("You don't have permission to update this record");
        }
    };

    return (
        <CustomModal
            visible={openModal}
            closable={true}
            onCancel={onCancel}
            titleText={"Manual Correction"}
            showFooter={false}
        >
            {recordData?.loading ? (
                <Skeletons items={3} />
            ) : (
                <Form className={styles.form} onFinish={onFinish} form={form}>
                    {recordData?.error && (
                        <CustomErrorAlert
                            description={recordData?.error}
                            isClosable
                            onClose={handleAlertClose}
                        />
                    )}
                    <div>
                        <Form.Item name="manualCorrection" rules={[{ required: true, message: "Please add amount" }]}>
                            <CustomInput
                                size="w100"
                                label={"Amount"}
                                type="number"
                                asterisk
                                defaultValue={recordData?.data?.manualCorrection}
                            />
                        </Form.Item>
                    </div>
                    <div>
                        <Form.Item name="note" rules={[{ required: true, message: "Please add a note" }]}>
                            <CustomInput size="w100" label={"Note"} asterisk type="text" placeHolder="Enter note" />
                        </Form.Item>
                    </div>
                    <div className="d-flex justify-end">
                        <CustomButton size="normal" fontSize="sm" onClick={onCancel} type="plain">
                            Cancel
                        </CustomButton>
                        <CustomButton
                            type="primary"
                            size="normal"
                            fontSize="sm"
                            htmlType="submit"
                            loading={recordData?.buttonLoading}
                        >
                            {type === "edit" ? "Edit Asset" : "Add Asset"}
                        </CustomButton>
                    </div>
                </Form>
            )}
        </CustomModal>
    );
};
