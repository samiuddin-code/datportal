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
import { slugifyString } from "../../../../helpers/common";
import { HandleServerErrors } from "../../../../Components/Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { AmenityModule } from "../../../../Modules/Amenity";
import { AmenityResponseObject } from "../../../../Modules/Amenity/types";
import { PropTypes } from "../../Common/common-types";
import { AmenityPermissionsEnum } from "../../../../Modules/Amenity/permissions";

interface AmenityModalProps extends PropTypes {
	record: number;
	permissions: { [key in AmenityPermissionsEnum]: boolean };
}

export const SiteAmenityModal = (props: AmenityModalProps) => {
	const { openModal, onCancel, type, record,
		reloadTableData, permissions: {
			updateAmenity,
			createAmenity,
		}
	} = props;

	const [form] = Form.useForm();
	const module = useMemo(() => new AmenityModule(), []);
	const [recordData, setRecordData] = useState<Partial<AmenityResponseObject>>({
		loading: false
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

	const handleSlugChange = ({ target }: any) => {
		let slug = slugifyString(target.value);
		form.setFieldsValue({ slug: slug });
	};

	const onFinish = (formValues: any) => {
		setRecordData({ ...recordData, buttonLoading: true });
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
			formValues.translations.forEach(
				(item: { language: string; title: string }, index: number) => {
					formData.append(`translations[${index + 1}][language]`, item.language);
					formData.append(`translations[${index + 1}][title]`, item.title);
				}
			);
		}

		switch (type) {
			case "edit": {
				if (updateAmenity === true) {
					module.updateRecord(formData, recordData?.data.id).then((res) => {
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
				if (createAmenity === true) {
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
					message.error("You don't have permission to create a new record");
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
			titleText={type === "edit" ? "Edit Amenity" : "Add New Amenity"}
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
						<Form.Item name="slug" rules={[{ required: true, message: "Please add a slug" }]}>
							<CustomInput
								onChange={handleSlugChange}
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

						<Form.Item name="abbreviation">
							<CustomInput
								size="w100"
								label={"Abbreviation"}
								type="text"
								placeHolder="Enter abbreviation"
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item name="acronyms">
							<CustomInput
								size="w100"
								label={"Acronyms"}
								type="text"
								placeHolder="Enter acronyms"
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
