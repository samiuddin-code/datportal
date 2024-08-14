import { Form, Switch, message } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton
} from "../../../Atoms";
import styles from "../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useState } from "react";
import { slugifyString } from "../../../../helpers/common";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { ProjectComponentsModule } from "../../../../Modules/ProjectComponents";
import { ProjectComponentsResponseObject } from "../../../../Modules/ProjectComponents/types";
import { PropTypes } from "../../Common/common-types";
import { ProjectComponentsPermissionsEnum } from "../../../../Modules/ProjectComponents/permissions";

interface ProjectComponentsModalProps extends PropTypes {
	record: number;
	permissions: { [key in ProjectComponentsPermissionsEnum]: boolean };
}

export const ProjectComponentsModal = (props: ProjectComponentsModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: {
			createProjectComponent, updateProjectComponent
		}
	} = props;
	const [form] = Form.useForm();
	const module = new ProjectComponentsModule()
	const [recordData, setRecordData] = useState<Partial<ProjectComponentsResponseObject>>();

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
				console.log(res.data.data)
				form.setFieldsValue({
					translations: res.data.data.localization,
					...res.data.data,
					isPublished: res.data.data.isPublished,
				});
				// setRecordData({ ...res.data, loading: false });
			}
		}).catch((err) => {
			handleErrors(err);
		});
	}, [form, record, module]);

	useEffect(() => {
		if (type === "edit") {
			// setRecordData({ loading: true });
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

		switch (type) {
			case "edit": {
				if (updateProjectComponent === true) {
					module.updateRecord(formValues, record).then((res) => {
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
				if (createProjectComponent === true) {
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
			titleText={type === "edit" ? "Edit Project State" : "Add New Project State"}
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
						<Form.Item name="title" rules={[{ required: true, message: "Please add a title" }]}>
							<CustomInput size="w100" label={"Title"} asterisk type="text" placeHolder="Enter project state" />
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
						<Form.Item name="status" label="Status" >
							<Switch checkedChildren="Active" unCheckedChildren="Inactive" defaultChecked />
						</Form.Item>
					</div>
					<div className="d-flex justify-end">
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
							{type === "edit" ? "Edit Project State" : "Add Project State"}
						</CustomButton>
					</div>
				</Form>
			)}
		</CustomModal>
	);
};
