import { DatePicker, Form, Input, message } from "antd";
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
import { PayrollCyclePermissionsEnum } from "@modules/PayrollCycle/permissions";
import { PayrollCycleModule } from "@modules/PayrollCycle";

interface PayrollCycleModalProps extends PropTypes {
    record: number;
    permissions: { [key in PayrollCyclePermissionsEnum]: boolean };
}

export const PayrollCycleModal = (props: PayrollCycleModalProps) => {
    const {
        openModal, onCancel, type, record,
        reloadTableData, permissions: { createPayrollCycle }
    } = props;
    const [form] = Form.useForm();
    const module = new PayrollCycleModule();
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
        switch (type) {
			case "new": {
				if (createPayrollCycle === true) {
					module.createRecord(formValues).then((res) => {
						reloadTableData();
						onCancel();
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					}).catch((err) => {
						handleErrors(err);
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					});
				} else {
					setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					message.error("You don't have permission to create this record");
				}
				break;
			}
		}
    };

    return (
        <CustomModal
            visible={openModal}
            closable={true}
            onCancel={onCancel}
            titleText={"Add Payroll Cycle"}
            showFooter={false}
        >
            {recordData?.loading ? (
                <Skeletons items={3} />
            ) : (
                <Form className={styles.form} onFinish={onFinish} form={form}
                layout='vertical'
                >
                    {recordData?.error && (
                        <CustomErrorAlert
                            description={recordData?.error}
                            isClosable
                            onClose={handleAlertClose}
                        />
                    )}
                    <div>
                        	<label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-dark-main)', width: '100%', display:'block' }}>
							From Date
							<span style={{ color: 'var(--color-red-yp)' }}> *</span>
							<Form.Item name="fromDate" rules={[{ required: true, message: "Please select date " }]}>
								<DatePicker
									style={{ borderRadius: '0.25rem', borderWidth: 2, width: '100%', borderColor: 'var(--color-border)' }}
								/>
							</Form.Item>
						</label>
                    </div>

                    <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-dark-main)', width: '100%', display:'block' }}>
							To Date
							<span style={{ color: 'var(--color-red-yp)' }}> *</span>
							<Form.Item name="toDate" rules={[{ required: true, message: "Please select date " }]}
                            help={<small>Note: Total days in the cycle is used to calculate per day salary</small>}
                            >
								<DatePicker
									style={{ borderRadius: '0.25rem', borderWidth: 2, width: '100%', borderColor: 'var(--color-border)' }}
								/>
							</Form.Item>
						</label>
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
                            {type === "edit" ? "Edit Payroll Cycle" : "Add Payroll Cycle"}
                        </CustomButton>
                    </div>
                </Form>
            )}
        </CustomModal>
    );
};
