import { Form, message } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton,
	CustomSelect,
	Localization,
	RichTextEditor
} from "../../../Atoms";
import styles from "../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useMemo, useState } from "react";
import { slugifyString } from "../../../../helpers/common";
import { HandleServerErrors } from "../../../../Components/Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { FAQModule } from "../../../../Modules/FAQs";
import { FAQCategoryModule } from "../../../../Modules/FAQCategory";
import { FAQTypesResponseObject, FAQTypes } from "../../../../Modules/FAQs/types";
import { PropTypes } from "../../Common/common-types";
import { FAQPermissionsEnum } from "../../../../Modules/FAQs/permissions";

interface FAQModalProps extends PropTypes {
	record: number;
	permissions: { [key in FAQPermissionsEnum]: boolean };
}

export const SiteFAQModal = (props: FAQModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: { createFaqs, updateFaqs }
	} = props;
	const [form] = Form.useForm();

	const module = useMemo(() => new FAQModule(), []);
	const faqCategoryModule = useMemo(() => new FAQCategoryModule(), [])

	const [recordData, setRecordData] = useState<Partial<FAQTypesResponseObject>>();
	const [faqCategory, setFAQCategory] = useState<FAQTypes[]>([])

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
					isPublished: res.data.data.isPublished,
					faqsCategoryId: res.data.data?.faqsCategoryId,
					...res.data.data,
				});
				setRecordData({ ...res.data, loading: false });
			}
		}).catch((err) => {
			handleErrors(err);
		});
	}, [form, record, module]);

	const getFAQCategories = useCallback(() => {
		faqCategoryModule.getAllRecords({ perPage: 100 }).then((res) => {
			if (res.data && res.data.data) {
				setFAQCategory(res.data.data)
			}
		})
	}, [faqCategoryModule])

	useEffect(() => {
		if (type === "edit") {
			setRecordData({ loading: true });
			// fetch data by slug or id
			getDataBySlug();
		} else {
			form.resetFields();
		}
		// fetch the faq categories
		getFAQCategories()
	}, [openModal, type, form, getDataBySlug, getFAQCategories]);

	const handleSlugChange = ({ target }: any) => {
		let slug = slugifyString(target.value);
		form.setFieldsValue({ slug: slug });
	};

	const onFinish = (formValues: any) => {
		setRecordData({ ...recordData, buttonLoading: true });

		switch (type) {
			case "edit": {
				if (updateFaqs === true) {
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
					message.error("You don't have permission to update this record")
				}
				break;
			}
			case "new": {
				if (createFaqs === true) {
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
					message.error("You don't have permission to create this record")
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
			titleText={type === "edit" ? "Edit FAQ" : "Add New FAQ"}
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
						<Form.Item name="faqsCategoryId">
							<CustomSelect
								label={"FAQ Category"}
								placeholder='Please select an FAQ Category'
								options={faqCategory?.map((item) => ({
									label: item?.title,
									value: item.id,
								}))}
							/>
						</Form.Item>
					</div>
					<div>
						<Form.Item name="title" rules={[{ required: true, message: "Please add a title" }]}>
							<CustomInput
								size="w100"
								label={"Title"}
								asterisk
								type="text"
								onChange={handleSlugChange}
							/>
						</Form.Item>
					</div>
					<div className="mt-3">
						<RichTextEditor form={form} name='description' />
					</div>

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
