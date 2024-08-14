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
import { PaymentGatewayModule } from "../../../../Modules/PaymentGateway";
import { PaymentGatewayResponseObject, PaymentGatewayTypes } from "../../../../Modules/PaymentGateway/types";
import { PropTypes } from "../../Common/common-types";
import { CountryTypes } from "../../../../Modules/Country/types";
import { CountryModule } from "../../../../Modules/Country";
import { slugifyString, validLink } from "../../../../helpers/common";
import { PaymentGatewayPermissionsEnum } from "../../../../Modules/PaymentGateway/permissions";

interface PaymentGatewayModalProps extends PropTypes {
	record: number;
	permissions: { [key in PaymentGatewayPermissionsEnum]: boolean };
}

export const PaymentGateway = (props: PaymentGatewayModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: {
			createPaymentGateway,
			updatePaymentGateway
		}
	} = props;
	const [form] = Form.useForm();

	const countryModule = useMemo(() => new CountryModule(), []);
	const module = useMemo(() => new PaymentGatewayModule(), []);

	const [countries, setCountries] = useState<CountryTypes[]>([]);
	const [recordData, setRecordData] = useState<Partial<PaymentGatewayResponseObject>>();

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

	const handleSlugChange = ({ target }: any) => {
		let slug = slugifyString(target.value);
		form.setFieldsValue({ slug: slug });
	};

	const onFinish = (formValues: PaymentGatewayTypes) => {
		setRecordData({ ...recordData, buttonLoading: true });

		const gatewayURL = validLink(formValues.gatewayURL)

		switch (type) {
			case "edit": {
				if (updatePaymentGateway === true) {
					module.updateRecord({ ...formValues, gatewayURL: gatewayURL }, recordData?.data.id)
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
				if (createPaymentGateway === true) {
					module.createRecord({ ...formValues, gatewayURL: gatewayURL! }).then((res) => {
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
			titleText={type === "edit" ? "Edit Payment Gateway" : "Add New Payment Gateway"}
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
						<Form.Item name="title" rules={[{ required: true, message: "Please add payment gateway title" }]}>
							<CustomInput
								size="w100"
								label={"Title"}
								asterisk
								type="text"
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item name="slug" rules={[{ required: true, message: "Please add payment gateway slug" }]}>
							<CustomInput
								size="w100"
								label={"Slug"}
								asterisk
								type="text"
								onChange={handleSlugChange}
							/>
						</Form.Item>
						<Form.Item name="storeId" rules={[{ required: true, message: "Please add store id" }]}>
							<CustomInput
								size="w100"
								label={"Store Id"}
								asterisk
								type="text"
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item name="gatewayPublicKey" rules={[{ required: true, message: "Please add public key" }]}>
							<CustomInput
								size="w100"
								label={"Public Key"}
								asterisk
								type="text"
							/>
						</Form.Item>
						<Form.Item name="gatewayPrivateKey" rules={[{ required: true, message: "Please add private key" }]}>
							<CustomInput
								size="w100"
								label={"Private Key"}
								asterisk
								type="text"
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item name="gatewayURL" rules={[{ required: true, message: "Please add payment gateway url " }]}>
							<CustomInput
								size="w100"
								label={"Gateway URL"}
								asterisk
								type="text"
							/>
						</Form.Item>

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
