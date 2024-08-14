import { Form, Switch, message } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton,
	CustomSelect
} from "../../../Atoms";
import styles from "../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useState } from "react";
import { slugifyString } from "../../../../helpers/common";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { LeaveTypeModule } from "../../../../Modules/LeaveType";
import { LeaveTypeResponseObject } from "../../../../Modules/LeaveType/types";
import { PropTypes } from "../../Common/common-types";
import { LeaveTypePermissionSet } from "../../../../Modules/LeaveType/permissions";

interface LeaveTypeModalProps extends PropTypes {
	record: number;
	permissions: { [key in LeaveTypePermissionSet]: boolean };
}

export const LeaveTypeModal = (props: LeaveTypeModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: {
			createLeaveType, updateLeaveType
		}
	} = props;
	const [form] = Form.useForm();
	const module = new LeaveTypeModule()
	const [recordData, setRecordData] = useState<Partial<LeaveTypeResponseObject>>();

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
					translations: res.data.data.localization,
					...res.data.data,
					isPublished: res.data.data.isPublished,
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
	}, [openModal, type]);

	const handleSlugChange = ({ target }: any) => {
		let slug = slugifyString(target.value);
		form.setFieldsValue({ slug: slug });
	};

	const onFinish = (formValues: any) => {
		setRecordData({ ...recordData, buttonLoading: true });

		switch (type) {
			case "edit": {
				if (updateLeaveType === true) {
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
				break;
			}
			case "new": {
				if (createLeaveType === true) {
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
			titleText={type === "edit" ? "Edit Leave Type" : "Add New Leave Type"}
			showFooter={false}
		>
			{recordData?.loading ? (
				<Skeletons items={10} />
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
						<Form.Item name="title" rules={[{ required: true, message: "Please add a title" }]}>
							<CustomInput size="w100" label={"Title"} asterisk type="text" placeHolder="Enter Leave Type" onChange={handleSlugChange} />
						</Form.Item>
					</div>
					<div>
						<Form.Item name="slug" rules={[{ required: true, message: "Please add a slug" }]}>
							<CustomInput
								onChange={handleSlugChange}
								size="w100"
								label={"Slug"}
								asterisk
								type="text"
							/>
						</Form.Item>
					</div>
					<div>
						<Form.Item name="isPaid" label="Paid Or Unpaid" >
							<Switch checkedChildren="Paid" defaultChecked={(type === 'edit' ? form.getFieldValue("isPaid") : false)} unCheckedChildren="Unpaid" />
						</Form.Item>
					</div>
					<div>
						<Form.Item name="threshold" rules={[{ required: true, message: "Please add a threshold" }]}>
							<CustomInput
								defaultValue={form.getFieldValue("threshold")}
								size="w100"
								label={"Threshold"}
								asterisk
								type="number"
							/>
						</Form.Item>
					</div>
					<div>
						<Form.Item name="thresholdType">
							<CustomSelect
								label={"Threshold Type"}
								options={[
									{ value: "monthly", label: "Monthly" },
									{ value: "yearly", label: "Yearly" },
								]}
								placeholder="Select Threshold Type"
								onChange={val => form.setFieldValue("thresholdType", val)}
								defaultValue={form.getFieldValue("thresholdType")}
							/>
							<p className='mb-0'>
								<small className="color-dark-main">
									If you select yes, your organization contact will be displayed on your profile on Yallah agent page and agent properties.
								</small>
							</p>
						</Form.Item>
					</div>
					
					<div>
						<Form.Item name="isPublished" label="Status" >
							<Switch checkedChildren="Active" unCheckedChildren="Inactive" defaultChecked={(type === 'edit' ? form.getFieldValue("isPublished") : false)}  />
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
							{type === "edit" ? "Edit Leave Type" : "Add Leave Type"}
						</CustomButton>
					</div>
				</Form>
			)}
		</CustomModal>
	);
};
