import { Form, message } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton,
	CustomSelect,
} from "../../../Atoms";
import styles from "../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useMemo, useState } from "react";
import { HandleServerErrors } from "../../../../Components/Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { CurrencyModule } from "../../../../Modules/Currency";
import { CurrencyResponseObject, CurrencyTypes } from "../../../../Modules/Currency/types";
import { PropTypes } from "../../Common/common-types";
import { CurrencyPermissionsEnum } from "../../../../Modules/Currency/permissions";

interface CurrencyModalProps extends PropTypes {
	record: number;
	permissions: { [key in CurrencyPermissionsEnum]: boolean };
}

export const SiteCurrencyModal = (props: CurrencyModalProps) => {
	const { openModal, onCancel, type, record,
		reloadTableData, permissions: { createCurrency, updateCurrency }
	} = props;
	const [form] = Form.useForm();
	const module = useMemo(() => new CurrencyModule(), []);
	const [recordData, setRecordData] = useState<Partial<CurrencyResponseObject>>();

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

	const onFinish = (formValues: CurrencyTypes) => {
		setRecordData({ ...recordData, buttonLoading: true });

		switch (type) {
			case "new": {
				if (createCurrency === true) {
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
					message.error("You don't have permission to create a new record");
				}
				break;
			}
			case "edit": {
				if (updateCurrency === true) {
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
			titleText={type === "edit" ? "Edit Currency" : "Add New Currency"}
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
						<Form.Item name="name" rules={[{ required: true, message: "Please add currency name" }]}>
							<CustomInput
								size="w100"
								label={"Name"}
								asterisk
								type="text"
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item name="code" rules={[{ required: true, message: "Please add currency code" }]}>
							<CustomInput
								size="w100"
								label={"Code"}
								asterisk
								type="text"
							/>
						</Form.Item>
						<Form.Item name="rate" rules={[{ required: true, message: "Please add currency rate" }]}>
							<CustomInput
								size="w100"
								label={"Rate"}
								asterisk
								type="text"
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item name="symbol" rules={[{ required: true, message: "Please add currency symbol" }]}>
							<CustomInput
								size="w100"
								label={"Symbol"}
								asterisk
								type="text"
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

					<div>

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
