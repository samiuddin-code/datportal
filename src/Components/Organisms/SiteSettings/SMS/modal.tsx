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
import { SMSModule } from "../../../../Modules/SMS";
import { SMSResponseObject, SMSTypes } from "../../../../Modules/SMS/types";
import { PropTypes } from "../../Common/common-types";
import { CountryTypes } from "../../../../Modules/Country/types";
import { CountryModule } from "../../../../Modules/Country";
import { validLink } from "../../../../helpers/common";
import { SMSSenderIdType } from "../../../../helpers/commonEnums";
import { SMSPermissionsEnum } from "../../../../Modules/SMS/permissions";

interface SMSModalProps extends PropTypes {
	record: number;
	permissions: { [key in SMSPermissionsEnum]: boolean };
}

export const SiteSMSModal = (props: SMSModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: { createSMS, updateSMS }
	} = props;
	const [form] = Form.useForm();

	const countryModule = useMemo(() => new CountryModule(), []);
	const module = useMemo(() => new SMSModule(), []);

	const [countries, setCountries] = useState<CountryTypes[]>([]);
	const [recordData, setRecordData] = useState<Partial<SMSResponseObject>>();

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
					isPublished: res.data.data.isPublished,
					test: res.data.data.test
				});
				setRecordData({ ...res.data, loading: false });
			}
		}).catch((err) => {
			handleErrors(err);
		});
	}, [form, record, module]);

	const getCountryList = useCallback(() => {
		countryModule.getAllRecords().then((res) => {
			if (res.data && res.data.data) {
				setCountries(res.data.data);
			}
		});
	}, [countryModule]);

	useEffect(() => {
		if (type === "edit") {
			setRecordData({ loading: true });
			// fetch data by slug or id
			getDataBySlug();
			// fetch the countries
			getCountryList();
		} else {
			// fetch the countries
			getCountryList();
			form.resetFields();
		}
	}, [openModal, type, form, getDataBySlug, getCountryList]);

	const onFinish = (formValues: SMSTypes) => {
		setRecordData({ ...recordData, buttonLoading: true });

		const gateway = validLink(formValues.gateway)

		switch (type) {
			case "edit": {
				if (updateSMS === true) {
					module.updateRecord({ ...formValues, gateway: gateway }, recordData?.data.id)
						.then((res) => {
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
				if (createSMS === true) {
					module.createRecord({ ...formValues, gateway: gateway! }).then((res) => {
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
			}
		}
	};

	return (
		<CustomModal
			visible={openModal}
			closable={true}
			onCancel={onCancel}
			titleText={type === "edit" ? "Edit SMS Config" : "Add New SMS Config"}
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
						<Form.Item name="title" rules={[{ required: true, message: "Please add SMS config title" }]}>
							<CustomInput
								size="w100"
								label={"Title"}
								asterisk
								type="text"
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item name="slug" rules={[{ required: true, message: "Please select SMS config slug" }]}>
							<CustomSelect
								label={"Slug"}
								placeholder="Please select a slug"
								options={[]}
								asterisk
							/>
						</Form.Item>
						<Form.Item name="gateway" rules={[{ required: true, message: "Please add SMS gateway url " }]}>
							<CustomInput
								size="w100"
								label={"SMS Gateway"}
								asterisk
								type="text"
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item name="senderId" rules={[{ required: true, message: "Please add sender id" }]}>
							<CustomInput
								size="w100"
								label={"Sender ID"}
								asterisk
								type="text"
							/>
						</Form.Item>

						<Form.Item name="senderIdType" rules={[{ required: true, message: "Please select sender id type" }]}>
							<CustomSelect
								label={"Sender Id Type"}
								options={Object.entries(SMSSenderIdType).map(([key, value]) => ({
									label: key,
									value: value,
								}))}
								asterisk
							/>
						</Form.Item>
					</div>
					<div>
						<Form.Item name="appId" rules={[{ required: true, message: "Please add app id" }]}>
							<CustomInput
								size="w100"
								label={"App ID"}
								asterisk
								type="text"
							/>
						</Form.Item>
						<Form.Item name="appPassword" rules={[{ required: true, message: "Please add app password" }]}>
							<CustomInput
								size="w100"
								label={"App Password"}
								asterisk
								type="text"
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item
							name="countryId"
							rules={[{ required: true, message: "Please Select a country!" }]}
						>
							<CustomSelect
								label={"Country"}
								placeholder="Please select country"
								options={countries?.map((country) => ({
									label: country.name,
									value: country.id,
								}))}
								asterisk
							/>
						</Form.Item>

						<Form.Item name="priority" rules={[{ required: true, message: "Please add priority" }]}>
							<CustomInput
								size="w100"
								label={"Priority"}
								asterisk
								type="text"
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item name="test">
							<CustomSelect
								label={"Test"}
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
