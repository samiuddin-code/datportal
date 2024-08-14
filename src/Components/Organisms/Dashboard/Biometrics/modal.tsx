import { Form, InputNumber, Select, Switch, message, Image, Empty, Radio, DatePicker } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton,
	CustomSelect
} from "../../../Atoms";
import styles from "../../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useMemo, useState } from "react";
import { capitalize } from "../../../../helpers/common";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { PropTypes } from "../../Common/common-types";
import { CountryTypes } from "@modules/Country/types";
import { CountryModule } from "@modules/Country";
import { RESOURCE_BASE_URL } from "@helpers/constants";
import { useDebounce } from "@helpers/useDebounce";
import { BiometricsPermissionSet } from "@modules/Biometrics/permissions";
import { BiometricModule } from "@modules/Biometrics";
import { BiometricResponseObject, BiometricType } from "@modules/Biometrics/types";
import { BiometricsEntryType } from "@helpers/commonEnums";
import { UserModule } from "@modules/User";
import { UserTypes } from "@modules/User/types";
import moment from "moment";
const { Option } = Select;

interface BiometricModalProps extends PropTypes {
	record: number;
	permissions: { [key in BiometricsPermissionSet]: boolean };
}

export const BiometricModal = (props: BiometricModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: {
			createBiometrics, updateBiometrics
		}
	} = props;
	const [form] = Form.useForm();
	const module = new BiometricModule();
	const [recordData, setRecordData] = useState<Partial<BiometricResponseObject>>();

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
			const userId = res?.data?.data?.userId;
			if (res.data && res.data.data) {
				form.setFieldsValue({
					...res.data.data,
					userId: userId,
					checkIn: moment(res.data.data.checkIn),
				});
				setRecordData({ ...res.data, loading: false });
				// get the employee data from the api
				if (userId) {
					userModule.getRecordById(userId).then((res) => {
						setUsers([res?.data?.data])
					}).catch((err) => {
						message.error(err.response.data.message)
					})
				}
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
	}, []);


	const onFinish = (formValues: any) => {
		setRecordData({ ...recordData, buttonLoading: true });

		switch (type) {
			case "edit": {
				if (updateBiometrics === true) {
					module.updateRecord({
						...formValues,
						checkIn: formValues.checkIn._d.toISOString()
					}, record).then((res) => {
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
				if (createBiometrics === true) {
					module.createRecord({
						...formValues,
						checkIn: formValues.checkIn._d.toISOString()
					}).then((res) => {
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
			titleText={type === "edit" ? "Edit Biometric" : "Add New Biometric"}
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
						<Form.Item
							name="userId"
							rules={[
								{ required: true, message: "Please select an employee" },
							]}
						>
							<label className={"font-size-sm"}>
								Employee  <span className='color-red-yp'>*</span>
							</label>

							<Select
								allowClear
								style={{ width: "100%" }}
								defaultValue={recordData?.data?.userId}
								placeholder="Search for the employee"
								className="selectAntdCustom"
								onChange={(value) => form.setFieldsValue({ userId: value })}
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
					</div>
					<div>
						<Form.Item name="mode" rules={[
							{ required: true, message: "Please select a mode" },
						]}>
							<CustomSelect
								asterisk
								label={"Mode"}
								options={[
									{ value: "in", label: "Check In" },
									{ value: "out", label: "Check Out" },
								]}
								placeholder="Select Mode"
							/>
						</Form.Item>

					</div>
					<div>
						<label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-dark-main)' }}>
							Date and time
							<span style={{ color: 'var(--color-red-yp)' }}> *</span>
							<Form.Item name="checkIn" rules={[{ required: true, message: "Please select date and time" }]}>
								<DatePicker
								dropdownClassName="hide-disabled-hours"
									showTime
									disabledTime={() => ({
										disabledHours: () => [0, 1, 2, 3, 4, 5, 6],
									})}
									showSecond={false}
									style={{ borderRadius: '0.25rem', borderWidth: 2, width: '100%', borderColor: 'var(--color-border)' }}
								/>
							</Form.Item>
						</label>

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
							{type === "edit" ? "Edit Biometric" : "Add Biometric"}
						</CustomButton>
					</div>
				</Form>
			)}
		</CustomModal>
	);
};
