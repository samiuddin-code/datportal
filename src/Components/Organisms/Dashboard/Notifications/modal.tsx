import { Form, InputNumber, Select, Switch, message, Image, Empty, Radio, DatePicker } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton,
	CustomSelect,
	ImageUploader
} from "../../../Atoms";
import styles from "../../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useMemo, useState } from "react";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { PropTypes } from "../../Common/common-types";
import { useDebounce } from "@helpers/useDebounce";
import { UserModule } from "@modules/User";
import { UserTypes } from "@modules/User/types";
import moment from "moment";
import { NotificationModule } from "@modules/Notification";
import { NotificationTypesResponseObject } from "@modules/Notification/types";
import { NotificationPermissionsEnum } from "@modules/Notification/permissions";
import { NotificationType } from "@helpers/commonEnums";
import { capitalize } from "@helpers/common";
import { DepartmentType } from "@modules/Department/types";
import { DepartmentModule } from "@modules/Department";

interface NotificationModalProps extends PropTypes {
	record: number;
	permissions: { [key in NotificationPermissionsEnum]: boolean };
}

export const NotificationModal = (props: NotificationModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: {
			createNotification
		}
	} = props;
	const [form] = Form.useForm();
	const module = new NotificationModule();
	const [recordData, setRecordData] = useState<Partial<NotificationTypesResponseObject>>();
	const [notificationType, setNotificationType] = useState<keyof typeof NotificationType>("broadcast");
	//user search
	const [searchTermUser, setSearchTermUser] = useState("");
	const debouncedSearchTermUser = useDebounce(searchTermUser, 500);
	const [users, setUsers] = useState<UserTypes[]>([]);
	const userModule = useMemo(() => new UserModule(), []);
	const onUserSearch = useCallback(() => {
		if (debouncedSearchTermUser) {
			userModule.getAllRecords({ name: debouncedSearchTermUser }).then((res) => {
				setUsers((prev) => {
					// if the data is already present in the state, then don't add it again
					const filteredData = res?.data?.data?.filter((item: UserTypes) => {
						return !prev?.find((prevItem) => prevItem.id === item.id);
					});
					// add the new data to the existing data
					return [...prev, ...filteredData];
				})
			}).catch((err) => {
				message.error(err.response.data.message)
			})
		}
	}, [debouncedSearchTermUser])
	useEffect(() => {
		onUserSearch()
	}, [onUserSearch])

	//department
	const [searchTermDepartment, setSearchTermDepartment] = useState("");
	const debouncedSearchTermDepartment = useDebounce(searchTermDepartment, 500);
	const [departments, setDepartments] = useState<DepartmentType[]>([]);
	const departmentModule = useMemo(() => new DepartmentModule(), []);

	const onDepartmentSearch = useCallback(() => {
		if (debouncedSearchTermDepartment || departments.length === 0) {
			departmentModule.getAllPublishedRecords({ name: debouncedSearchTermDepartment }).then((res) => {

				setDepartments((prev) => {
					// if the data is already present in the state, then don't add it again
					const filteredData = res?.data?.data?.filter((item: DepartmentType) => {
						return !prev?.find((prevItem) => prevItem.id === item.id);
					});
					// add the new data to the existing data
					return [...prev, ...filteredData];
				})
			}).catch((err) => {
				message.error(err.response.data.message)
			})
		}
	}, [debouncedSearchTermDepartment])
	useEffect(() => {
		onDepartmentSearch()
	}, [onDepartmentSearch])

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

	useEffect(() => {
		form.resetFields();
	}, []);


	const onFinish = (formValues: any) => {
		console.log('here', formValues)
		// setRecordData({ ...recordData, buttonLoading: true });
		const formData = new FormData();
		const excludeFields = ["file", "type", "userIds"];
		Object.entries(formValues).forEach((ele: any) => {
			if (!excludeFields.includes(ele[0])) {
				formData.append(ele[0], ele[1]);
			}
		});

		if (
			formValues["file"] &&
			typeof formValues["file"] !== "string" &&
			formValues["file"]["fileList"].length > 0
		) {
			formData.append("file", formValues["file"]["fileList"][0]["originFileObj"]);
		}
		formData.append("type", notificationType)
		if (formValues.userIds) {
			let userIds: Array<any> = form.getFieldValue("userIds")[0];
			userIds.forEach((ele, index) => {
				formData.append("userIds[" + index + "]", ele)
			})
		}

		if (createNotification === true) {
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
			message.error("You don't have permission to create this record");
		}
	};

	return (
		<CustomModal
			visible={openModal}
			closable={true}
			onCancel={onCancel}
			titleText={"Add New Announcement"}
			showFooter={false}
		>
			{recordData?.loading ? (
				<Skeletons items={3} />
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
						<Form.Item name="type">
							<CustomSelect
								asterisk
								label={"Announcement Type"}
								options={Object.keys(NotificationType).map(key => ({
									label: capitalize(key),
									value: key
								}))}
								defaultValue={"broadcast"}
								placeholder="Select Announcement Type"
								onChange={(val) => setNotificationType(val as NotificationType)}
							/>
						</Form.Item>

					</div>
					{notificationType === "user" && <div>
						<Form.Item
							name="userIds"
							rules={[
								{ required: true, message: "Please select an employee" },
							]}
						>
							<label className={"font-size-sm"}>
								Employee  <span className='color-red-yp'>*</span>
							</label>

							<Select
								mode="multiple"
								allowClear
								style={{ width: "100%" }}
								placeholder="Search for the employee"
								className="selectAntdCustom"
								onChange={(value) => form.setFieldsValue({ userIds: [value] })}
								showSearch
								onSearch={(value) => setSearchTermUser(value)}
								optionFilterProp="label"
								options={users?.map((item) => {
									return {
										label: item.firstName + " " + item.lastName,
										value: item.id,
									}
								})}
								notFoundContent={
									<Empty
										image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
										imageStyle={{
											height: 100,
										}}
										description={
											<span>
												No data found, Please search for the employee
											</span>
										}
									/>
								}
							/>
						</Form.Item>
					</div>}
					{notificationType === "department" && <div>
						<Form.Item
							name="departmentId"
							rules={[
								{ required: true, message: "Please select a department" },
							]}
						>
							<label className={"font-size-sm"}>
								Department  <span className='color-red-yp'>*</span>
							</label>

							<Select
								allowClear
								style={{ width: "100%" }}
								defaultValue={recordData?.data?.Department?.id}
								placeholder="Search for the department"
								className="selectAntdCustom"
								onChange={(value) => form.setFieldsValue({ departmentId: value })}
								showSearch
								onSearch={(value) => setSearchTermDepartment(value)}
								optionFilterProp="label"
								options={departments?.map((item) => {
									return {
										label: item.title,
										value: item.id,
									}
								})}
								notFoundContent={
									<Empty
										image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
										imageStyle={{
											height: 100,
										}}
										description={
											<span>
												No data found, Please search for the department
											</span>
										}
									/>
								}
							/>
						</Form.Item>

					</div>}
					<div>
						<Form.Item name={'message'} rules={[{ required: true, message: "Please provide message" }]}>
							<CustomInput
								asterisk
								size="w100"
								label={"Message"}
								type="textArea"
								autoSize={{ minRows: 2 }}
								placeHolder="Enter message" />
						</Form.Item>
					</div>
					<div>
						<ImageUploader name="file" required={false} />
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
							Add Announcement
						</CustomButton>
					</div>
				</Form>
			)}
		</CustomModal>
	);
};
