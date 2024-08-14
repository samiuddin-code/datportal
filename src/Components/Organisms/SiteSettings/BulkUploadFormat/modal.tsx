import { useEffect, useCallback, useMemo, useState } from "react";
import { Form, message } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton,
} from "../../../Atoms";
import styles from "../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { BulkUploadFormatModule } from "../../../../Modules/BulkUploadFormat/Format";
import {
	//BulkUploadFormatTypes,
	BulkUploadFormatResponseObject, BulkUploadFormatTypes
} from "../../../../Modules/BulkUploadFormat/Format/types";
import { PropTypes } from "../../Common/common-types";
import { BulkUploadFormatPermissionsEnum } from "../../../../Modules/BulkUploadFormat/Format/permissions";

interface BulkUploadFormatModalProps extends PropTypes {
	record: number;
	permissions: { [key in BulkUploadFormatPermissionsEnum]: boolean };
}

export const SiteBulkUploadFormatModal = (props: BulkUploadFormatModalProps) => {
	const {
		openModal, onCancel, type, record, reloadTableData,
		permissions: { createBulkUploadFormat, updateBulkUploadFormat }
	} = props;
	const [form] = Form.useForm();
	const module = useMemo(() => new BulkUploadFormatModule(), []);

	const [recordData, setRecordData] = useState<Partial<BulkUploadFormatResponseObject>>();

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

	// on finish for the form
	const onFinish = (formValues: any) => {
		setRecordData({ ...recordData, buttonLoading: true });

		switch (type) {
			case "edit": {
				if (updateBulkUploadFormat === true) {
					module.updateRecord(formValues, recordData?.data?.id).then((res) => {
						reloadTableData();
						onCancel();
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					}).catch((err) => {
						handleErrors(err);
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					});
				} else {
					setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					message.error("You don't have permission to update bulk upload format")
				}
				break;
			}
			case "new": {
				if (createBulkUploadFormat === true) {
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
					message.error("You don't have permission to create bulk upload format")
				}
				break;
			}
		};
	}
	// get data by id for edit
	const getDataBySlug = useCallback(() => {
		setRecordData({ loading: true });
		module.getRecordById(record).then((res) => {
			const data = res?.data?.data as BulkUploadFormatTypes
			if (res.data && data) {
				form.setFieldsValue({
					...data,
					format: JSON.stringify(data?.format),
					sample: JSON.stringify(data?.sample),
				});
				setRecordData({ ...res.data, loading: false });
			}
		}).catch((err) => {
			handleErrors(err);
		});
	}, [form, record, module]);

	useEffect(() => {
		if (type === "edit") {
			getDataBySlug();
		} else {
			form.resetFields();
		}
	}, [type, form, getDataBySlug]);

	return (
		<CustomModal
			visible={openModal}
			closable={true}
			onCancel={onCancel}
			titleText={type === "edit" ? "Edit Bulk Upload Format " : "Add New Bulk Upload Format"}
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
						<Form.Item
							name="title"
							rules={[
								{
									required: true,
									message: "Please add a title"
								}
							]}
						>
							<CustomInput
								size="w100"
								label={"Title"}
								asterisk
								type="text"
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item
							name="comment"
							rules={[
								{
									required: false,
									message: "Please add a comment"
								}
							]}
						>
							<CustomInput
								size="w100"
								label={"Comment"}
								type="text"
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item
							name="format"
							rules={[
								{
									validator: (rule, value) => {
										if (value) {
											try {
												JSON.parse(value);
												return Promise.resolve();
											} catch (e) {
												return Promise.reject("Please enter a valid JSON");
											}
										}
										rule.required = true;
										rule.message = "Please add a format";
										return Promise.reject(rule.message);
									}
								},
							]}
						>
							<CustomInput
								size="w100"
								label={"Format"}
								asterisk
								type="textArea"
								defaultValue={JSON.stringify(recordData?.data?.format, null, 2)}
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item
							name="sample"
							rules={[
								{
									validator: (rule, value) => {
										if (value) {
											try {
												JSON.parse(value);
												return Promise.resolve();
											} catch (e) {
												return Promise.reject("Please enter a valid JSON");
											}
										}
										rule.required = true;
										rule.message = "Please add a sample";
										return Promise.reject(rule.message);
									}
								},
							]}
						>
							<CustomInput
								size="w100"
								label={"Sample"}
								asterisk
								type="textArea"
								defaultValue={JSON.stringify(recordData?.data?.sample, null, 2)}
							/>
						</Form.Item>
					</div>

					<div className={styles.footer}>
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
							Submit
						</CustomButton>
					</div>
				</Form>
			)}
		</CustomModal>
	);
};
