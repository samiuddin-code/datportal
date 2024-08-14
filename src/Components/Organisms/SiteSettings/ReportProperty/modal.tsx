import { Form, message } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton,
} from "../../../Atoms";
import styles from "../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useMemo, useState } from "react";
import { HandleServerErrors } from "../../../../Components/Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { PropTypes } from "../../Common/common-types";
import { PropertyReportPermissionsEnum } from "../../../../Modules/PropertyReport/permissions";
import { PropertyReportTypeResponseObject, PropertyReportTypes } from "../../../../Modules/PropertyReport/types";
import { PropertyReportModule } from "../../../../Modules/PropertyReport";

interface ReportPropertyModalProps extends PropTypes {
	record: number;
	permissions: { [key in PropertyReportPermissionsEnum]: boolean };
}

export const ReportPropertyModal = (props: ReportPropertyModalProps) => {
	const { openModal, onCancel, type, record,
		reloadTableData, permissions: { updateReportProperty }
	} = props;
	const [form] = Form.useForm();
	const module = useMemo(() => new PropertyReportModule(), []);
	const [recordData, setRecordData] = useState<Partial<PropertyReportTypeResponseObject>>();

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
	}, [openModal, type, form, getDataBySlug]);

	const onFinish = (formValues: PropertyReportTypes) => {
		setRecordData({ ...recordData, buttonLoading: true });

		switch (type) {
			case "edit": {
				if (updateReportProperty === true) {
					module.updateRecord(formValues, recordData?.data.id).then((res) => {
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
		}
	};

	return (
		<CustomModal
			visible={openModal}
			closable={true}
			onCancel={onCancel}
			titleText={type === "edit" ? "Edit Report Property" : "Add Report Property"}
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
							name="reason"
							rules={[{ required: true, message: "Please add reason" }]}
						>
							<CustomInput
								size="w100"
								label={"Reason"}
								asterisk
								type="textArea"
								defaultValue={recordData?.data.reason}
							/>
						</Form.Item>
					</div>
					<div>
						<Form.Item name="comments" rules={[{ required: true, message: "Please add comments" }]}>
							<CustomInput
								size="w100"
								label={"Comments"}
								asterisk
								type="textArea"
								defaultValue={recordData?.data.comments}
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
