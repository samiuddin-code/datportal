import { Form, InputNumber, message } from "antd";
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
import { HandleServerErrors } from "../../../../Components/Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { RolesModule } from "../../../../Modules/Roles";
import { RoleResponseObject, RoleTypes, Visibility } from "../../../../Modules/Roles/types";
import { PropTypes } from "../../Common/common-types";
import { RolePermissionsEnum } from "../../../../Modules/Roles/permissions";

interface RolesModalProps extends PropTypes {
	record: number;
	permissions: { [key in RolePermissionsEnum]: boolean };
}

export const SiteRolesModal = (props: RolesModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: { createRole, updateRole }
	} = props;
	const [form] = Form.useForm();
	const module = useMemo(() => new RolesModule(), []);
	const [recordData, setRecordData] = useState<Partial<RoleResponseObject>>();
	const [roles, setRoles] = useState<RoleTypes[]>([]);

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
					level: res.data.data.level
				});
				setRecordData({ ...res.data, loading: false });
			}
		}).catch((err) => {
			handleErrors(err);
		});
	}, [form, record, module]);

	const getRoles = useCallback(() => {
		if (type === "edit" || type === "seo") return;

		module.getAllRecords().then((res) => {
			if (res.data && res.data?.data) {
				setRoles(res.data?.data);
			}
		}).catch((err) => {
			handleErrors(err);
		});
	}, [module, type]);

	useEffect(() => {
		if (type === "edit") {
			setRecordData({ loading: true });
			getDataBySlug();
		} else {
			form.resetFields();
			getRoles();
		}
	}, [openModal, type, form, getDataBySlug, getRoles]);

	const handleSlugChange = ({ target }: any) => {
		let slug = slugifyString(target.value);
		form.setFieldsValue({ slug: slug });
	};

	const onFinish = (formValues: any) => {
		setRecordData({ ...recordData, buttonLoading: true });

		switch (type) {
			case "edit": {
				if (updateRole === true) {
					module.updateRecord(formValues, recordData?.data?.id).then((res) => {
						reloadTableData();
						onCancel();
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					}).catch((err) => {
						handleErrors(err);
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					});
				} else {
					setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					message.error("You don't have permission to update this role");
				}
				break;
			}
			case "new": {
				if (createRole === true) {
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
					message.error("You don't have permission to create new role");
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
			titleText={type === "edit" ? "Edit Role" : "Add New Role"}
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
							<CustomInput size="w100" label={"Title"} asterisk type="text" />
						</Form.Item>
						<Form.Item name="slug" rules={[{ required: true, message: "Please add a slug" }]}>
							<CustomInput
								onChange={handleSlugChange}
								size="w100"
								label={"Slug"}
								asterisk
								type="text"
								disabled={
									form.getFieldValue("slug") === "ORG-ADMIN" ||
										form.getFieldValue("slug") === "SUPER-ADMIN"
										? true
										: false
								}
							/>
						</Form.Item>
					</div>

					<div>
						{/* <Form.Item name="visibility">
							<CustomSelect
								label={"Visibility"}
								options={Object.entries(Visibility)
									.filter(([key, value]) => value !== "coreSystemLevel")
									.map(([key, value]) => ({
										label: key,
										value: value,
									}))}
							/>
						</Form.Item> */}
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

					{type === "new" && (
						<div>
							<Form.Item
								name="copyRoleId"
							>
								<CustomSelect
									label={"Copy Permissions From"}
									placeholder={"Select a role to copy permissions from"}
									options={roles?.map((role) => ({
										label: role.title,
										value: role.id,
									}))}
								/>
							</Form.Item>
						</div>
					)}
					<Form.Item name="level" >
						<span className="font-size-sm">Level</span>
						<InputNumber 
						defaultValue={form.getFieldValue("level")} 
						onChange={(value) =>{
							form.setFieldValue("level", value)
						}} 
						style={{width: '100%', borderRadius: '0.25rem', border: '2px solid var(--color-border)'}}
						type="number" />
					</Form.Item>
					<div>
						<Form.Item name="description">
							<CustomInput
								size="w100"
								label={"Description"}
								type="textArea"
								defaultValue={recordData?.data?.description}
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
