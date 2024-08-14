import { Form } from "antd";
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
import { PagesResponseObject } from "../../../../Modules/Pages/types";
import { PropTypes } from "../../Common/common-types";
import { CountryModule } from "../../../../Modules/Country";
import { CountryTypes } from "../../../../Modules/Country/types";
import { PagesModule } from "../../../../Modules/Pages";

export const SitePagesModal = (props: PropTypes & { record: number }) => {
	const { openModal, onCancel, type, record, reloadTableData } = props;
	const [form] = Form.useForm();

	const module = useMemo(() => new PagesModule(), []);
	const countryModule = useMemo(() => new CountryModule(), []);

	const [recordData, setRecordData] = useState<Partial<PagesResponseObject>>();
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

	const getCountryList = useCallback(() => {
		if (type !== "seo") {
			countryModule.getAllRecords().then((res) => {
				if (res.data && res.data.data) {
					setCountries(res.data.data);
				}
			});
		}
	}, [countryModule, type]);

	useEffect(() => {
		if (type === "edit") {
			setRecordData({ loading: true });
			// fetch data by slug or id
			getDataBySlug();
			// fetch the countries
			getCountryList();
		} else if (type === "seo") {
			// fetch data by slug or id
			getDataBySlug();
		} else {
			// fetch the countries
			getCountryList();
			form.resetFields();
		}
	}, [openModal, type, form, getDataBySlug, getCountryList]);

	// const handleSlugChange = ({ target }: any) => {
	// 	let slug = slugifyString(target.value);
	// 	form.setFieldsValue({ slug: slug });
	// };

	const onFinish = (formValues: any) => {
		setRecordData({ ...recordData, buttonLoading: true });
		const formData = new FormData();
		if (type !== "seo") {
			const excludeFields = ["image", "translations"];
			Object.entries(formValues).forEach((ele: any) => {
				if (!excludeFields.includes(ele[0])) {
					formData.append(ele[0], ele[1]);
				}
			});

			if (
				formValues["image"] &&
				typeof formValues["image"] !== "string" &&
				formValues["image"]["fileList"].length > 0
			) {
				formData.append("image", formValues["image"]["fileList"][0]["originFileObj"]);
			}

			if (formValues.translations) {
				formValues.translations.forEach(
					(item: { language: string; title: string; highlight: string; description: string }, index: number) => {
						formData.append(`translations[${index + 1}][language]`, item.language);
						formData.append(`translations[${index + 1}][title]`, item.title);
						formData.append(`translations[${index + 1}][highlight]`, item.highlight);
						formData.append(`translations[${index + 1}][description]`, item.description);
					}
				);
			}
		}

		switch (type) {
			case "new": {
				module.createRecord(formData).then((res) => {
					reloadTableData();
					onCancel();
					setRecordData((prev) => ({ ...prev, buttonLoading: false }));
				}).catch((err) => {
					handleErrors(err);
					setRecordData((prev) => ({ ...prev, buttonLoading: false }));
				});
				break;
			}
			case "edit": {
				module.updateRecord(formData, recordData?.data.id).then((res) => {
					reloadTableData();
					onCancel();
					setRecordData((prev) => ({ ...prev, loading: false }));
				}).catch((err) => {
					handleErrors(err);
					setRecordData((prev) => ({ ...prev, loading: false }));
				});
				break;
			}
			case "seo": {
				module.updateSEOById(record, {
					seoTitle: formValues?.seoTitle,
					seoDescription: formValues?.seoDescription,
				}).then((res) => {
					reloadTableData();
					onCancel();
					setRecordData((prev) => ({ ...prev, loading: false }));
				}).catch((err) => {
					handleErrors(err);
					setRecordData((prev) => ({ ...prev, loading: false }));
				});
				break;
			}
		}
	};

	return (
		<CustomModal
			visible={openModal}
			size={type === "seo" ? "700px" : "900px"}
			closable={true}
			onCancel={onCancel}
			titleText={type === "new" ? "Add New Page" : type === "edit" ? "Edit Page" : "SEO"}
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

					{(type === "new" || type === "edit") && (
						<>
							<div>
								<Form.Item name="slug" rules={[{ required: true, message: "Please add a slug" }]}>
									<CustomInput
										// onChange={handleSlugChange}
										size="w100"
										label={"Property Listing URL"}
										asterisk
										type="text"
										prefix={"https://yallahproperty.ae/en/"}
										placeHolder="Enter page link"
										hint="residential-for-rent/all/uae"
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
							</div>

							<Localization
								title="Page"
								formName="translations"
								description
								highlight form={form}
								defaultValue={recordData?.data?.localization}
							/>

							<div>
								<Form.Item name="imageAlt" rules={[{ required: false }]}>
									<CustomInput
										size="w100"
										label={"Image Alt Text"}
										type="text"
									/>
								</Form.Item>
							</div>
							<div>
								<ImageUploader
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
						</>
					)}

					{type === "seo" && (
						<>
							<div>
								<Form.Item name="seoTitle" rules={[{ required: true, message: "Please add SEO Title" }]}>
									<CustomInput
										size="w100"
										label={"Title"}
										type="text"
										asterisk
									/>
								</Form.Item>
							</div>

							<div>
								<Form.Item name="seoDescription" rules={[{ required: true, message: "Please add SEO Description" }]}>
									{/** 
									 * The below checks is there because it is a work around to get
									 *  default Seo Description value to show in the text area.
									  */}
									{recordData?.data?.seoDescription ? (
										<CustomInput
											size="w100"
											label={"Description"}
											type="textArea"
											asterisk
											defaultValue={recordData?.data?.seoDescription}
										/>
									) : recordData?.data ? (
										<CustomInput
											size="w100"
											label={"Description"}
											type="textArea"
											asterisk
										/>
									) : (
										<Skeletons items={1} fullWidth />
									)}
								</Form.Item>
							</div>
						</>
					)}

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
