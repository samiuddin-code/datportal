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
import { slugifyString } from "../../../../helpers/common";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { PropTypes } from "../../Common/common-types";
import { PagesSectionModule } from "../../../../Modules/PagesSection";
import { PagesSectionResponseObject } from "../../../../Modules/PagesSection/types";
import { PagesSectionPermissionsEnum } from "../../../../Modules/PagesSection/permissions";

interface SitePagesSectionModalProps extends PropTypes {
	record: number;
	permissions: { [key in PagesSectionPermissionsEnum]: boolean };
}

export const SitePagesSectionModal = (props: SitePagesSectionModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: { createSitePagesSection, updateSitePagesSection }
	} = props;
	const [form] = Form.useForm();

	const module = useMemo(() => new PagesSectionModule(), []);

	const [recordData, setRecordData] = useState<Partial<PagesSectionResponseObject>>();


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
			// fetch data by slug or id
			getDataBySlug();
			// fetch the countries

		} else {
			// fetch the countries
			form.resetFields();
		}
	}, [openModal, type, form, getDataBySlug]);

	const handleSlugChange = ({ target }: any) => {
		let slug = slugifyString(target.value);
		form.setFieldsValue({ slug: slug });
	};

	const onFinish = (formValues: any) => {
		setRecordData({ ...recordData, buttonLoading: true });
		const formData = formValues;

		switch (type) {
			case "edit": {
				if (updateSitePagesSection === true) {
					module.updateRecord(formData, recordData?.data.id).then((res) => {
						reloadTableData();
						onCancel();
						setRecordData((prev) => ({ ...prev, loading: false }));
					}).catch((err) => {
						handleErrors(err);
						setRecordData((prev) => ({ ...prev, loading: false }));
					});
				} else {
					setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					message.error("You don't have permission to update this record");
				}
				break;
			}
			case "new": {
				if (createSitePagesSection === true) {
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
					message.error("You don't have permission to create new record");
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
			titleText={type === "edit" ? "Edit Pages Section" : "Add New Pages Section"}
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

						<Form.Item name="title" rules={[{ required: true, message: "Please name a section" }]}>
							<CustomInput
								size="w100"
								label={"Title"}
								asterisk
								type="text"
							/>
						</Form.Item>

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
						<Form.Item name="description" rules={[{ required: false }]}>
							<CustomInput
								size="w100"
								label={"Description"}
								type="textArea"
								defaultValue={recordData?.data?.description}
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
