import { Form, Switch, message } from "antd";
import {
	CustomInput, CustomModal, CustomErrorAlert, CustomButton
} from "@atoms/";
import styles from "../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useState } from "react";
import { slugifyString } from "@helpers/common";
import { HandleServerErrors } from "@atoms/ServerErrorHandler";
import { errorHandler } from "@helpers/";
import { ProjectStateModule } from "@modules/ProjectState";
import { ProjectStateResponseObject } from "@modules/ProjectState/types";
import { PropTypes } from "../../Common/common-types";
import { ProjectStatePermissionsEnum } from "@modules/ProjectState/permissions";

interface ProjectStateModalProps extends PropTypes {
	record: number;
	permissions: { [key in ProjectStatePermissionsEnum]: boolean };
}

export const ProjectStateModal = (props: ProjectStateModalProps) => {
	const {
		openModal, onCancel, type, record, reloadTableData,
		permissions: { createProjectState, updateProjectState }
	} = props;
	const [form] = Form.useForm();
	const module = new ProjectStateModule()
	const [recordData, setRecordData] = useState<Partial<ProjectStateResponseObject>>();

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
		setRecordData({ ...recordData, loading: true });
		module.getRecordById(record).then((res) => {
			if (res.data && res.data.data) {
				form.setFieldsValue({
					translations: res.data.data.localization,
					...res.data.data,
					isPublished: res.data.data.isPublished,
					shouldCloseProject: res.data.data.shouldCloseProject,
					status: res.data.data.status,
					bgColor: res.data.data.bgColor,
					textColor: res.data.data.textColor,
				});
			}
		}).catch((err) => {
			handleErrors(err);
		}).finally(() => {
			setRecordData({ ...recordData, loading: false });
		});
	}, [form, record]);

	useEffect(() => {
		if (type === "edit") {
			getDataBySlug();
		} else {
			form.resetFields();
		}
	}, [type]);

	const handleSlugChange = ({ target }: any) => {
		let slug = slugifyString(target.value);
		form.setFieldsValue({ slug: slug });
	};

	const onFinish = (formValues: any) => {
		console.log(formValues)
		setRecordData({ ...recordData, buttonLoading: true });

		switch (type) {
			case "edit": {
				if (updateProjectState === true) {
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
				if (createProjectState === true) {
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
							<CustomInput onChange={handleSlugChange} size="w100" label={"Title"} asterisk type="text" placeHolder="Enter project state" />
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
						<Form.Item name="order" rules={[{ required: true, message: "Please add order" }]}>
							<CustomInput
								size="w100"
								label={"Order"}
								asterisk
								type="number"
							/>
						</Form.Item>
					</div>
					<div>
						<Form.Item name="bgColor" rules={[{ required: true, message: "Please add a background color" }]}>
							<CustomInput
								label={"Background Color"}
								asterisk
								type="color"
								defaultValue={form.getFieldValue("bgColor")}
							/>
						</Form.Item>
						<Form.Item name="textColor" rules={[{ required: true, message: "Please add a text color" }]}>
							<CustomInput
								label={"Text Color"}
								asterisk
								type="color"
								defaultValue={form.getFieldValue("textColor")}
							/>
						</Form.Item>
					</div>
					<div>
						<Form.Item name="status" label="Status" >
							<Switch checkedChildren="Active" unCheckedChildren="Inactive" defaultChecked={form.getFieldValue("status")} />
						</Form.Item>
						<Form.Item name="shouldCloseProject" label="Should close project" >
							<Switch checkedChildren="Yes" unCheckedChildren="No" defaultChecked={form.getFieldValue("shouldCloseProject")}  />
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
