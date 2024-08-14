import { Form, message } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton,
	CustomSelect,
	Localization,
} from "../../../Atoms";
import styles from "../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useMemo, useState } from "react";
import { HandleServerErrors } from "../../../../Components/Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { PropTypes } from "../../Common/common-types";
import { slugifyString } from "../../../../helpers/common";
import { AlertsTypeModule } from "../../../../Modules/AlertsType";
import { AlertsTypeResponseObject, AlertsTypes } from "../../../../Modules/AlertsType/types";
import { AlertsTypePermissionsEnum } from "../../../../Modules/AlertsType/permissions";
import CustomTextArea from "@atoms/Input/textarea";

interface AlertsTypeModalProps extends PropTypes {
	record: number;
	permissions: { [key in AlertsTypePermissionsEnum]: boolean };
}

export const SiteAlertsTypeModal = (props: AlertsTypeModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: {
			updateAlertsType,
			createAlertsType,
		}
	} = props;

	const [form] = Form.useForm();
	const module = useMemo(() => new AlertsTypeModule(), []);

	const [recordData, setRecordData] = useState<Partial<AlertsTypeResponseObject>>();

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

	const handleSlugChange = ({ target }: any) => {
		let slug = slugifyString(target.value);
		form.setFieldsValue({ slug: slug });
	};

	const getDataByID = useCallback(() => {
		module.getRecordById(record).then((res) => {
			if (res.data && res.data.data) {
				form.setFieldsValue({
					...res.data.data,
					translations: res.data.data.localization,
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
			// fetch data by id
			getDataByID();
		} else {
			form.resetFields();
		}
	}, [openModal, type, form, getDataByID]);

	const onFinish = (formValues: AlertsTypes) => {
		switch (type) {
			case "edit": {
				if (updateAlertsType === true) {
					setRecordData({ ...recordData, buttonLoading: true });
					module.updateRecord({ ...formValues }, recordData?.data.id).then((res) => {
						reloadTableData();
						onCancel();
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					}).catch((err) => {
						handleErrors(err);
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					});
				} else {
					message.error("You don't have permission to update this record");
				}
				break;
			}
			case "new": {
				if (createAlertsType === true) {
					setRecordData({ ...recordData, buttonLoading: true });
					module.createRecord(formValues).then((res) => {
						reloadTableData();
						onCancel();
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					}).catch((err) => {
						handleErrors(err);
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					});
				} else {
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
			titleText={type === "edit" ? "Edit Alerts Type" : "Add New Alerts Type"}
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
							rules={[{ required: true, message: "Please add title" }]}
						>
							<CustomInput
								size="w100" label={"Title"}
								asterisk type="text"
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item
							name="description"
							rules={[{ required: true, message: "Please add description" }]}
						>
							<CustomTextArea label={"Description"} asterisk />
						</Form.Item>
					</div>

					<div>
						<Form.Item name="slug"
							rules={[{ required: true, message: "Please add slug" }]}
						>
							<CustomInput
								size="w100"
								label={"Slug"}
								asterisk
								type="text"
								onChange={handleSlugChange}
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item name="forAdminpanel">
							<CustomSelect
								label={"For Admin Panel"}
								options={[
									{ value: true, label: "Yes" },
									{ value: false, label: "No" },
								]}
							/>
						</Form.Item>

						<Form.Item name="isPublished">
							<CustomSelect
								label={"Published"}
								options={[
									{ value: true, label: "Yes" },
									{ value: false, label: "No" },
								]}
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
