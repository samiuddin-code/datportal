import { Form, message } from "antd";
import {
	CustomModal,
	CustomErrorAlert,
	CustomButton,
	CustomSelect,
	ImageUploader,
	CustomInput,
} from "../../../../Atoms";
import styles from "../../Common/styles.module.scss";
import Skeletons from "../../../Skeletons";
import { useEffect, useCallback, useMemo, useState } from "react";
import { RESOURCE_BASE_URL } from "../../../../../helpers/constants";
import { HandleServerErrors } from "../../../../../Components/Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../../helpers";
import { PropTypes } from "../../Common/common-types";
import { CountryModule } from "../../../../../Modules/Country";
import { CountryTypes } from "../../../../../Modules/Country/types";
import { useSearchParams } from "react-router-dom";
import { StaticPageSEOModule } from "../../../../../Modules/StaticPageSEO";
import { SitePagesModule } from "../../../../../Modules/SitePages";
import { StaticPageSEOResponseObject } from "../../../../../Modules/StaticPageSEO/types";
import { SitePagesType } from "../../../../../Modules/SitePages/types";
import { StaticPageSEOPermissionsEnum } from "../../../../../Modules/StaticPageSEO/permissions";

interface StaticPageSEOModalProps extends PropTypes {
	record: number;
	permissions: { [key in StaticPageSEOPermissionsEnum]: boolean };
}

export const StaticPageSEOModal = (props: StaticPageSEOModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: { createStaticPageSEO, updateStaticPageSEO }
	} = props;
	const [form] = Form.useForm();

	const module = useMemo(() => new StaticPageSEOModule(), []);
	const countryModule = useMemo(() => new CountryModule(), []);
	const sitePagesModule = useMemo(() => new SitePagesModule(), [])

	const [recordData, setRecordData] = useState<Partial<StaticPageSEOResponseObject>>();
	const [countries, setCountries] = useState<CountryTypes[]>([]);
	const [sitePagesData, setSitePagesData] = useState<SitePagesType[]>([]);
	const [searchParams] = useSearchParams();
	let pageId = searchParams.get('pageId') as string;

	if (pageId) {
		form.setFieldsValue({ sitePageId: pageId })
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

	const getDataByID = useCallback(() => {
		module.getRecordById(record).then((res) => {
			if (res.data && res.data.data) {
				form.setFieldsValue({ ...res.data.data })
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

	const getSitePagesData = useCallback(() => {
		sitePagesModule.getAllRecords().then((res) => {
			if (res.data && res.data.data) {
				setSitePagesData(res.data.data)
			}
		})
	}, [sitePagesModule])

	useEffect(() => {
		if (type === "edit") {
			setRecordData({ loading: true });
			// fetch data by slug or id
			getDataByID();
			// fetch the countries
			getCountryList();
			getSitePagesData()
		} else {
			// fetch the countries
			getCountryList();
			getSitePagesData()
			form.resetFields();
		}
	}, [
		openModal, type, form, getDataByID,
		getCountryList, getSitePagesData
	]);

	const onFinish = (formValues: any) => {
		setRecordData({ ...recordData, buttonLoading: true });

		const formData = new FormData();
		const excludeFields = ["image"];
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

		switch (type) {
			case "edit": {
				if (updateStaticPageSEO === true) {
					module.updateRecord(formData, record).then((res) => {
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
				if (createStaticPageSEO === true) {
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
					message.error("You don't have permission to create new record");
				}
				break;
			}
		}
	};

	return (
		<CustomModal
			visible={openModal}
			size="800px"
			closable={true}
			onCancel={onCancel}
			titleText={type === "edit" ? "Edit Static Page SEO" : "Add New SEO"}
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
							name="sitePageId"
							rules={[{ required: true, message: "Please select a page" }]}
						>
							<CustomSelect
								label={"Page"}
								placeholder="Please select a page"
								defaultValue={(pageId) ? pageId : ""}
								options={sitePagesData?.map((page) => ({
									label: page.title,
									value: page.id.toString(),
								}))}
								asterisk
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item name="seoTitle" rules={[{ required: true, message: "Please enter a title" }]}>
							<CustomInput
								size="w100"
								label={"Title"}
								asterisk
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item name="seoDescription" rules={[{ required: true, message: "Please enter a description" }]}>
							<CustomInput
								size="w100"
								label={"Description"}
								type="textArea"
								asterisk
								defaultValue={recordData?.data?.seoDescription}
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
