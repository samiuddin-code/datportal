import { Form, message } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton,
	CustomSelect,
	Localization
} from "../../../Atoms";
import styles from "../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useMemo, useState } from "react";
import { slugifyString } from "../../../../helpers/common";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { FAQCategoryModule } from "../../../../Modules/FAQCategory";
import { FAQCategoryTypesResponseObject } from "../../../../Modules/FAQCategory/types";
import { PropTypes } from "../../Common/common-types";
import { FAQCategoryPermissionsEnum } from "../../../../Modules/FAQCategory/permissions";

interface FAQCategoryModalProps extends PropTypes {
	record: number;
	permissions: { [key in FAQCategoryPermissionsEnum]: boolean };
}

export const SiteFAQCategoryModal = (props: FAQCategoryModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: { createFaqsCategory, updateFaqsCategory }
	} = props;
	const [form] = Form.useForm();
	const module = useMemo(() => new FAQCategoryModule(), []);
	const [recordData, setRecordData] = useState<Partial<FAQCategoryTypesResponseObject>>();
	const [faqsCategory, setFaqsCategory] = useState({
		data: [],
		loading: false
	})

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
				});
				setRecordData({ ...res.data, loading: false });
			}
		}).catch((err) => {
			handleErrors(err);
		});
	}, [form, record, module]);

	useEffect(() => {
		module.getAllRecords({ isRoot: true }).then(res => {
			setFaqsCategory({ ...faqsCategory, data: res.data?.data, loading: false })
		})
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

	const onFinish = (formValues: any, closeModal: boolean = true) => {
		setRecordData({ ...recordData, buttonLoading: true });
		switch (type) {
			case "edit": {
				if (updateFaqsCategory === true) {
					module.updateRecord(formValues, recordData?.data.id).then((res) => {
						if (closeModal) {
							onCancel();
						}
						reloadTableData();
						form.resetFields();
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
				if (createFaqsCategory === true) {
					module.createRecord(formValues).then((res) => {
						if (closeModal) {
							onCancel();
						}
						reloadTableData();
						form.resetFields();
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

	const handleFormSubmit = () => {
		form.validateFields().then((values) => {
			onFinish(values, false);
		}).catch((errorInfo) => {
		});
	};

	return (
		<CustomModal
			visible={openModal}
			closable={true}
			onCancel={onCancel}
			titleText={type === "edit" ? "Edit FAQ Category" : "Add New FAQ Category"}
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
						<Form.Item name="parentId">
							<CustomSelect
								label={"Select Parent"}
								options={faqsCategory.data.map((ele: any) => {
									return {
										label: ele?.title,
										value: ele?.id
									}
								})}
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
					<div>
						<Form.Item name="description" rules={[{ required: true, message: "Please add a description" }]}>
							<CustomInput
								size="w100"
								label={"Description"}
								asterisk
								type="textArea"
							/>
						</Form.Item>
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
						{
							type !== 'edit' ?
								<CustomButton
									type="primary"
									size="normal"
									fontSize="sm"
									htmlType="button"
									onClick={handleFormSubmit}
									loading={recordData?.buttonLoading}
								>
									Submit &amp; Add More
								</CustomButton>
								: ''
						}
						<CustomButton
							type="primary"
							size="normal"
							fontSize="sm"
							htmlType="submit"
							loading={recordData?.buttonLoading}
						>
							Submit &amp; Exit
						</CustomButton>
					</div>
				</Form>
			)}
		</CustomModal>
	);
};
