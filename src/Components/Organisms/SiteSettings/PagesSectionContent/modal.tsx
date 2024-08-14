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
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { HandleServerErrors } from "../../../../Components/Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { PropTypes } from "../../Common/common-types";
import { CountryModule } from "../../../../Modules/Country";
import { CountryTypes } from "../../../../Modules/Country/types";
import { PagesSectionContentModule } from "../../../../Modules/PagesSectionContent";
import { PagesSectionContentResponseObject } from "../../../../Modules/PagesSectionContent/types";
import { PagesSectionModule } from "../../../../Modules/PagesSection";
import { PagesSectionType } from "../../../../Modules/PagesSection/types";
import { useSearchParams } from "react-router-dom";
import { PagesContentPermissionsEnum } from "../../../../Modules/PagesSectionContent/permissions";

interface PagesSectionContentModalProps extends PropTypes {
	record: number;
	permissions: { [key in PagesContentPermissionsEnum]: boolean };
}

export const SitePagesSectionContentModal = (props: PagesSectionContentModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: { createSitePagesContent, updateSitePagesContent }
	} = props;
	const [form] = Form.useForm();

	const module = useMemo(() => new PagesSectionContentModule(), []);
	const countryModule = useMemo(() => new CountryModule(), []);
	const pagesSectionModule = useMemo(() => new PagesSectionModule(), [])

	const [recordData, setRecordData] = useState<Partial<PagesSectionContentResponseObject>>();
	const [countries, setCountries] = useState<CountryTypes[]>([]);
	const [pagesSectionData, setPagesSectionData] = useState<PagesSectionType[]>([]);
	const [searchParams] = useSearchParams();
	let sectionId = searchParams.get('sectionId') as string;
	if (sectionId) {
		form.setFieldsValue({ pageSectionId: sectionId })
	}

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
		countryModule.getAllRecords().then((res) => {
			if (res.data && res.data.data) {
				setCountries(res.data.data);
			}
		});
	}, [countryModule]);

	const getPagesSectionData = useCallback(() => {
		pagesSectionModule.getAllRecords().then((res) => {
			if (res.data && res.data.data) {
				setPagesSectionData(res.data.data)
			}
		})
	}, [pagesSectionModule])

	useEffect(() => {
		if (type === "edit") {
			setRecordData({ loading: true });
			// fetch data by slug or id
			getDataBySlug();
			// fetch the countries
			getCountryList();
			getPagesSectionData()
		} else {
			// fetch the countries
			getCountryList();
			getPagesSectionData()
			form.resetFields();
		}
	}, [
		openModal, type, form, getDataBySlug,
		getCountryList, getPagesSectionData
	]);

	const onFinish = (formValues: any) => {
		setRecordData({ ...recordData, buttonLoading: true });
		const formData = new FormData();
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

		switch (type) {
			case "edit": {
				if (updateSitePagesContent === true) {
					module.updateRecord(formData, recordData?.data.id).then((res) => {
						reloadTableData();
						onCancel();
						setRecordData((prev) => ({ ...prev, loading: false }));
					}).catch((err) => {
						handleErrors(err);
						setRecordData((prev) => ({ ...prev, loading: false }));
					});
				} else {
					setRecordData((prev) => ({ ...prev, loading: false }));
					message.error("You don't have permission to update this record");
				}
				break;
			}
			case "new": {
				if (createSitePagesContent === true) {
					module.createRecord(formData).then((res) => {
						reloadTableData();
						onCancel();
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					}).catch((err) => {
						handleErrors(err);
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					});
				} else {
					setRecordData((prev) => ({ ...prev, loading: false }));
					message.error("You don't have permission to create this record");
				}
				break;
			}
		}
	};

	return (
		<CustomModal
			visible={openModal}
			size="900px"
			closable={true}
			onCancel={onCancel}
			titleText={type === "edit" ? "Edit Section Content" : "Add New Content"}
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

						<Form.Item
							name="pageSectionId"
							rules={[{ required: true, message: "Please select a page section" }]}
						>
							<CustomSelect
								label={"Page Section"}
								placeholder="Please select a section"
								defaultValue={(sectionId) ? sectionId : ""}
								options={pagesSectionData?.map((section) => ({
									label: section.title,
									value: section.id.toString(),
								}))}
								asterisk
							/>
						</Form.Item>
					</div>

					<Localization title="Page Content"
						formName="translations"
						description
						highlight
						form={form}
						defaultValue={recordData?.data?.localization}
					/>

					<div>
						<div>
							<Form.Item name="imageAlt" rules={[{ required: false }]}>
								<CustomInput
									size="w100"
									label={"Image Alt Text"}
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
							<Form.Item name="order" rules={[{ required: false }]}>
								<CustomInput
									size="w100"
									label={"Order"}
									type="text"
								/>
							</Form.Item>
							{/* <Form.Item name="isDefault">
							<CustomSelect
								label={"isDefault"}
								options={[
									{ value: 1, label: "Yes" },
									{ value: 0, label: "No" },
								]}
							/>
						</Form.Item> */}

						</div>
						<ImageUploader
							name="image"
							defaultFileList={
								type === "edit" &&
								recordData &&
								recordData.data?.image && [
									{
										uid: recordData.data?.id,
										name: (recordData.data?.image) ? "..." + recordData.data?.image.substr(recordData.data.image.length - 20, recordData.data.image.length) : "",
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
