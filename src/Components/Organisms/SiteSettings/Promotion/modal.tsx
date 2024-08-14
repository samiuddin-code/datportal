import { Form, DatePicker, message } from "antd";
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
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { PromotionResponseObject } from "../../../../Modules/Promotion/types";
import { PropTypes } from "../../Common/common-types";
import { CountryModule } from "../../../../Modules/Country";
import { CountryTypes } from "../../../../Modules/Country/types";
import { PromotionModule } from "../../../../Modules/Promotion";
import moment from "moment";
import { PackageModule } from "../../../../Modules/Package";
import { CreditsPackageModule } from "../../../../Modules/CreditsPackage";
import { PackageTypes } from "../../../../Modules/Package/types";
import { CreditsPackageTypes } from "../../../../Modules/CreditsPackage/types";
// import { PromotionDiscountType } from "../../../../helpers/commonEnums";
import { capitalize } from "../../../../helpers/common";
import { PromotionPermissionsEnum } from "../../../../Modules/Promotion/permissions";
const { RangePicker } = DatePicker;

interface PromotionModalProps extends PropTypes {
	record: number;
	permissions: { [key in PromotionPermissionsEnum]: boolean };
}

export const SitePromotionModal = (props: PromotionModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: { createPromotion, updatePromotion }
	} = props;
	const [form] = Form.useForm();

	const module = useMemo(() => new PromotionModule(), []);
	const countryModule = useMemo(() => new CountryModule(), []);
	const packageModule = useMemo(() => new PackageModule(), []);
	const creditPackageModule = useMemo(() => new CreditsPackageModule(), []);

	const [recordData, setRecordData] = useState<Partial<PromotionResponseObject>>();
	const [countries, setCountries] = useState<CountryTypes[]>([]);
	const [packages, setPackages] = useState<PackageTypes[]>([]);
	const [creditPackages, setCreditPackages] = useState<CreditsPackageTypes[]>([]);
	const [date, setDate] = useState<{ validFrom: string; validTo: string }>({
		validFrom: "",
		validTo: ""
	});

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
					translations: res.data?.data?.localization,
					isPublished: res.data?.data?.isPublished,
					date: [moment(res.data?.data?.validFrom), moment(res.data?.data?.validTo)],
					packagesId: res.data?.data?.packagePromotions?.map((item: { packageId: number }) => item.packageId),
					creditPackagesId: res.data?.data?.creditPackagePromotions?.map((item: { creditPackageId: number }) => item.creditPackageId),
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

	const getPackages = useCallback(() => {
		packageModule.getAllRecords().then((res) => {
			if (res.data && res.data.data) {
				setPackages(res.data.data);
			}
		});
	}, [packageModule]);

	const getCreditPackages = useCallback(() => {
		creditPackageModule.getAllPublished().then((res) => {
			if (res.data && res.data.data) {
				setCreditPackages(res.data.data);
			}
		});
	}, [creditPackageModule]);

	useEffect(() => {
		if (type === "edit") {
			setRecordData({ loading: true });
			// fetch data by slug or id
			getDataBySlug();
			// fetch the countries
			getCountryList();
			// fetch the packages
			getPackages();
			// fetch the credit packages
			getCreditPackages();
		} else {
			// fetch the countries
			getCountryList();
			// fetch the packages
			getPackages();
			// fetch the credit packages
			getCreditPackages();
			form.resetFields();
		}
	}, [
		openModal, type, form, getDataBySlug,
		getCountryList, getCreditPackages, getPackages
	]);

	const onFinish = (formValues: any) => {
		setRecordData({ ...recordData, buttonLoading: true });
		const formData = new FormData();

		const excludeFields = ["image", "translations", "packagesId", "creditPackagesId"];
		Object.entries(formValues).forEach((ele: any) => {
			if (!excludeFields.includes(ele[0])) {
				formData.append(ele[0], ele[1]);
			}
		});

		// remove the date field from the form data and add the validFrom and validTo fields
		if (formValues.date) {
			formData.delete("date");
			if (date.validFrom || date.validTo) {
				formData.append("validFrom", date?.validFrom);
				formData.append("validTo", date?.validTo);
			}
		}

		// credit packages is an array of ids
		if (formValues.creditPackagesId) {
			formValues.creditPackagesId.forEach((item: number, index: number) => {
				formData.append(`creditPackagesId[${index}]`, item.toString());
			});
		}

		// packages is an array of ids
		if (formValues.packagesId) {
			formValues.packagesId.forEach((item: number, index: number) => {
				formData.append(`packagesId[${index}]`, item.toString());
			});
		}

		if (
			formValues["image"] &&
			typeof formValues["image"] !== "string" &&
			formValues["image"]["fileList"].length > 0
		) {
			formData.append("image", formValues["image"]["fileList"][0]["originFileObj"]);
		}

		if (formValues.translations) {
			formValues.translations.forEach((item: { language: string; title: string; description: string }, index: number) => {
				formData.append(`translations[${index + 1}][language]`, item.language);
				formData.append(`translations[${index + 1}][title]`, item.title);
				formData.append(`translations[${index + 1}][description]`, item.description);
			});
		}

		switch (type) {
			case "edit": {
				if (updatePromotion) {
					module.updateRecord(formData, recordData?.data.id).then((res) => {
						reloadTableData();
						onCancel();
						setRecordData((prev) => ({
							...prev,
							loading: false,
							buttonLoading: false
						}));
					}).catch((err) => {
						handleErrors(err);
						setRecordData((prev) => ({
							...prev,
							loading: false,
							buttonLoading: false
						}));
					});
				} else {
					setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					message.error("You don't have permission to update this record");
				}
				break;
			}
			case "new": {
				if (createPromotion === true) {
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
			titleText={type === "edit" ? "Edit Promotion" : "Add New Promotion"}
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
							name="discountType"
							rules={[{ required: true, message: "Please Select a discount type" }]}
						>
							<CustomSelect
								label={"Discount Type"}
								asterisk
								placeholder="Please Select a discount type"
								options={Object.entries([])?.map(([key, value]) => ({
									label: capitalize(key),
									value: value,
								}))}
							/>
						</Form.Item>

						<Form.Item name="value" rules={[{ required: true, message: "Please enter value" }]}>
							<CustomInput
								size="w100"
								label={"Value"}
								type="text"
								asterisk
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item name="promoCode" rules={[{ required: true, message: "Please enter promo code" }]}>
							<CustomInput
								size="w100"
								label={"Promo Code"}
								type="text"
								asterisk
							/>
						</Form.Item>

						<Form.Item name="limit" rules={[{ required: true, message: "Please enter limit" }]}>
							<CustomInput
								size="w100"
								label={"Limit"}
								type="text"
								asterisk
							/>
						</Form.Item>
					</div>

					{type === "new" && (
						<div>
							<Form.Item
								name="packagesId"
							>
								<CustomSelect
									label={"Package"}
									mode="multiple"
									placeholder="Please select a package"
									options={packages?.map((_package) => ({
										label: _package.localization[0].title,
										value: _package.id,
									}))}
								/>
							</Form.Item>
							<Form.Item
								name="creditPackagesId"

							>
								<CustomSelect
									label={"Credit Package"}
									mode="multiple"
									placeholder="Please select a credit package"
									options={creditPackages?.map((_package) => ({
										label: _package.localization[0].title,
										value: _package.id,
									}))}
								/>
							</Form.Item>
						</div>
					)}

					<div>
						<Form.Item
							name="date"
							rules={[{ required: true, message: "Please select date" }]}
						>
							<label className={styles.label}>
								Date (Valid From  Valid To) <span className={"color-red-yp"}>*</span>
							</label>
							<RangePicker
								// onchange event handler
								onChange={(date) => {
									form.setFieldsValue({
										date: date
									});

									const validFrom = moment(date && date[0]?.toDate()).toISOString();
									const validTo = moment(date && date[1]?.toDate()).toISOString();

									setDate({
										validFrom: validFrom,
										validTo: validTo
									})
								}}
								placeholder={["Valid From", "Valid To"]}
								className="w-100"
								defaultValue={type === "edit" ? [
									moment(recordData?.data?.validFrom),
									moment(recordData?.data.validTo)
								] : [] as any}
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

					<Localization
						title="Promotion"
						formName="translations"
						description
						form={form}
						defaultValue={recordData?.data?.localization}
					/>

					<div>
						<ImageUploader
							title="Image"
							name="image"
							defaultFileList={
								type === "edit" &&
								recordData &&
								recordData.data?.image && [
									{
										uid: recordData.data?.id,
										name: recordData.data?.image,
										status: "done",
										url: RESOURCE_BASE_URL + recordData.data?.image,
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
