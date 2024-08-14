import { Form, message } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton,
	CustomSelect,
	ImageUploader,
} from "../../../Atoms";
import styles from "../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useMemo, useState } from "react";
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { HandleServerErrors } from "../../../../Components/Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { PropTypes } from "../../Common/common-types";
import { useSearchParams } from "react-router-dom";
import { PermissionsModule } from "../../../../Modules/Permissions";
import { SystemModulesModule } from "../../../../Modules/SystemModules";
import { PermissionsResponseObject } from "../../../../Modules/Permissions/types";
import { SystemModulesType } from "../../../../Modules/SystemModules/types";
import { PermissionPermissionsEnum } from "../../../../Modules/Permissions/permissions";

interface SystemModulePermissionModalProps extends PropTypes {
	record: number;
	permissions: { [key in PermissionPermissionsEnum]: boolean };
}

export const SystemModulePermissionModal = (props: SystemModulePermissionModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: { createPermissions, updatePermissions }
	} = props;
	const [form] = Form.useForm();

	const module = useMemo(() => new SystemModulesModule(), []);
	const permissionModule = useMemo(() => new PermissionsModule(), [])

	const [recordData, setRecordData] = useState<Partial<PermissionsResponseObject>>();
	const [systemModuleData, setSystemModuleData] = useState<SystemModulesType[]>([]);
	const [searchParams] = useSearchParams();
	let moduleId = searchParams.get('moduleId') as string;
	if (moduleId) {
		form.setFieldsValue({ moduleId: moduleId })
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
		permissionModule.getRecordById(record).then((res) => {
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
	}, [form, record, module, permissionModule]);

	const getsystemModuleData = useCallback(() => {
		module.getAllRecords().then((res) => {
			if (res.data && res.data.data) {
				setSystemModuleData(res.data.data)
			}
		})
	}, [module])

	useEffect(() => {
		if (type === "edit") {
			setRecordData({ loading: true });
			// fetch data by slug or id
			getDataBySlug();
			// fetch the countries
			getsystemModuleData()
		} else {
			// fetch the countries
			getsystemModuleData()
			form.resetFields(["name", "action"]);
			form.setFieldsValue({ order: 99 })
		}
	}, [openModal, type, form]);

	const onFinish = (formValues: any, closeModal: boolean = true) => {
		setRecordData({ ...recordData, buttonLoading: true });
		const formData = new FormData();
		const excludeFields = ["icon"];
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


		switch (type) {
			case "edit": {
				if (updatePermissions === true) {
					permissionModule.updateRecord(formData, recordData?.data.id)
						.then((res) => {
							reloadTableData();
							if (closeModal) {
								onCancel();
							}
							message.success("Permission edited successfully");
							setRecordData((prev) => ({ ...prev, buttonLoading: false }));
						})
						.catch((err) => {
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
				if (createPermissions === true) {
					permissionModule.createRecord(formData).then((res) => {
						reloadTableData();
						if (closeModal) {
							onCancel();
						} else {
							form.resetFields(['action', 'name']);
						}
						message.success("Permission added successfully");
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
		};
	}

	const handleFormSubmit = () => {
		form.validateFields()
			.then((values) => {
				onFinish(values, false);
			})
			.catch((errorInfo) => {
			});
	};

	return (
		<CustomModal
			visible={openModal}
			size="900px"
			closable={true}
			onCancel={onCancel}
			titleText={type === "edit" ? "Edit Module Permission" : "Add New Permission"}
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
						<Form.Item name="name" rules={[{ required: true, message: "Please add a name" }]}>
							<CustomInput size="w100" label={"Name"} asterisk type="text" />
						</Form.Item>
						<Form.Item name="action" rules={[{ required: true, message: "Please add an action" }]}>
							<CustomInput size="w100" label={"Action"} asterisk type="text" />
						</Form.Item>
					</div>

					<div>

						<Form.Item
							name="moduleId"
							rules={[{ required: true, message: "Please select a module" }]}
						>
							<CustomSelect
								label={"System Module"}
								placeholder="Please select a section"
								defaultValue={(moduleId) ? moduleId : ""}
								options={systemModuleData?.map((section) => ({
									label: section.name,
									value: section.id.toString(),
								}))}
								asterisk
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item name="url" rules={[{ required: false, message: "Please add a url" }]}>
							<CustomInput size="w100" label={"URL"} type="text" />
						</Form.Item>
						<Form.Item name="order" rules={[{ required: true, message: "Please add order" }]}>
							<CustomInput size="w100" defaultValue={(form.getFieldValue("order") ? form.getFieldValue("order") : 99)} label={"Order"} asterisk type="number" />
						</Form.Item>
					</div>

					<div>
						<Form.Item name="isMenuItem">
							<CustomSelect
								label={"Menu Item?"}
								defaultValue="true"
								options={[
									{ value: true, label: "Yes" },
									{ value: false, label: "No" },
								]}
							/>
						</Form.Item>

						<Form.Item name="visibility">
							<CustomSelect
								label={"Visibility"}
								defaultValue="system"
								options={[
									{ value: "organization", label: "Organization" },
									{ value: "system", label: "System" },
								]}
							/>
						</Form.Item>

					</div>
					<div>
						<Form.Item
							name="description"
							rules={[
								{
									required: false,
									message: "Please add a description",
								},
							]}
						>
							<CustomInput size="w100" label={"Description"} type="textArea" />
						</Form.Item>

						<div>
							<p className="mb-0">&nbsp;</p>
							<ImageUploader
								name="icon"
								defaultFileList={
									type === "edit" &&
									recordData &&
									recordData.data?.icon && [
										{
											uid: recordData.data?.id,
											name: (recordData.data?.icon) ? "..." + recordData.data?.icon.substr(recordData.data.icon.length - 20, recordData.data.icon.length) : "",
											status: "done",
											url: RESOURCE_BASE_URL + recordData.data?.icon,
										},
									]
								}
							/>
						</div>
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
							Submit
						</CustomButton>
					</div>
				</Form>
			)}
		</CustomModal>
	);
};
