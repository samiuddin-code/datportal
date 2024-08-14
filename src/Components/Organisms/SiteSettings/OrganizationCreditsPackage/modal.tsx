import { Form, message } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton,
	CustomSelect,
	ImageUploader,
	Localization,
} from "../../../Atoms";
import styles from "../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useMemo, useState } from "react";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { CountryModule } from "../../../../Modules/Country";
import { CountryTypes } from "../../../../Modules/Country/types";
import { PropTypes } from "../../Common/common-types";
import { CreditsPackageModule } from "../../../../Modules/CreditsPackage";
import { CreditsPackageResponseObject } from "../../../../Modules/CreditsPackage/types";
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { handleNumberChange, slugifyString } from "../../../../helpers/common";
import { CreditPackagePermissionsEnum } from "../../../../Modules/CreditsPackage/permissions";

interface CreditPackageModalProps extends PropTypes {
	record: number;
	permissions: { [key in CreditPackagePermissionsEnum]: boolean };
}

export const OrgCreditPackageModal = (props: CreditPackageModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: { createPackage, updatePackage }
	} = props;
	const [form] = Form.useForm();
	// Credits Module
	const module = useMemo(() => new CreditsPackageModule(), []);
	const countryModule = useMemo(() => new CountryModule(), []);

	const [recordData, setRecordData] = useState<Partial<CreditsPackageResponseObject>>();
	const [countries, setCountries] = useState<CountryTypes[]>([]);

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

	const getCountryList = useCallback(() => {
		countryModule.getAllRecords().then((res) => {
			if (res?.data?.data) {
				setCountries(res.data.data);
			}
		});
	}, [countryModule]);

	const getDataById = useCallback(() => {
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
			getDataById();
		} else {
			form.resetFields();
		}
		//get the country list
		getCountryList();
	}, [openModal, type, form, getDataById, getCountryList]);

	const onFinish = (formValues: any) => {
		setRecordData({ ...recordData, buttonLoading: true });
		// convert the country id in formValues to a number
		formValues.countryId = Number(formValues.countryId);

		const formData = new FormData();
		const excludeFields = ["icon", "translations"];
		Object.entries(formValues).forEach((ele: any) => {
			if (!excludeFields.includes(ele[0])) {
				formData.append(ele[0], ele[1]);
			}
		});

		if (
			formValues["icon"] &&
			typeof formValues["icon"] !== "string" &&
			formValues["icon"]["fileList"].length > 0
		) {
			formData.append("icon", formValues["icon"]["fileList"][0]["originFileObj"]);
		}

		if (formValues.translations) {
			formValues.translations.forEach((item: {
				language: string; title: string, description: string
			}, index: number) => {
				formData.append(`translations[${index + 1}][language]`, item.language);
				formData.append(`translations[${index + 1}][title]`, item.title);
				formData.append(`translations[${index + 1}][description]`, item.description);
			});
		}

		switch (type) {
			case "edit": {
				if (updatePackage === true) {
					module.updateRecord(formData, recordData?.data?.id).then((res) => {
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
				if (createPackage === true) {
					module.createRecord(formData).then((res) => {
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
			titleText={type === "edit" ? "Edit Credit Package" : "Add New Credit Package"}
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
							name="credits"
							rules={[{ required: true, message: "Please add credits" }]}
						>
							<CustomInput
								size="w100"
								label={"Credits"}
								asterisk
								onChange={(event: any) => {
									const params = {
										event: event,
										form: form,
										formName: "credits",
									}
									handleNumberChange(params)
								}}
							/>
						</Form.Item>

						<Form.Item
							name="amount"
							rules={[{ required: true, message: "Please add amount" }]}
						>
							<CustomInput
								size="w100"
								label={"Amount"}
								asterisk
								onChange={(event: any) => {
									const params = {
										event: event,
										form: form,
										formName: "amount",
									}
									handleNumberChange(params)
								}}
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item
							name="countryId"
							rules={[{ required: true, message: "Please select a country" }]}
						>
							<CustomSelect
								label={"Country"}
								options={countries?.map((country) => ({
									label: country.name,
									value: country.id,
								}))}
							/>
						</Form.Item>

						<Form.Item
							name="packageType"
							rules={[{ required: true, message: "Please select a package type" }]}
						>
							<CustomSelect
								label={"Package Type"}
								options={[
									{ value: "monthly", label: "Monthly" },
									{ value: "onetime", label: "One Time" },
								]}
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item name="slug" rules={[{ required: true, message: "Please add a slug" }]}>
							<CustomInput
								onChange={(e: any) => {
									let slug = slugifyString(e.target.value);
									form.setFieldsValue({ slug: slug });
								}}
								size="w100"
								label={"Slug"}
								asterisk
								type="text"
							/>
						</Form.Item>
					</div>

					<Localization
						title="Title &amp; Description"
						formName="translations"
						defaultValue={recordData?.data?.localization}
						description
						isRichTextEditor={false}
					/>

					<div>
						<Form.Item name="isPublished">
							<CustomSelect
								label={"Published"}
								options={[
									{ value: true, label: "Yes" },
									{ value: false, label: "No" },
								]}
							/>
						</Form.Item>

						<Form.Item name="autoRenew">
							<CustomSelect
								label={"Auto Renew"}
								options={[
									{ value: true, label: "Yes" },
									{ value: false, label: "No" },
								]}
							/>
						</Form.Item>
					</div>

					<div>
						<ImageUploader
							name="icon"
							defaultFileList={
								type === "edit" &&
								recordData &&
								recordData.data?.icon && [
									{
										uid: recordData.data?.id,
										name: recordData.data?.icon,
										status: "done",
										url: RESOURCE_BASE_URL + recordData.data?.icon,
									},
								]
							}
						/>
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
