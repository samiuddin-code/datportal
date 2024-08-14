import { Empty, Form, message, Select, InputNumber } from "antd";
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
import { UserModule } from "../../../../Modules/User";
import { UserCountryAccess_GET, UserResponseObject } from "../../../../Modules/User/types";
import { CountryModule } from "../../../../Modules/Country";
import { PropTypes } from "../../Common/common-types";
import { useDebounce } from "../../../../helpers/useDebounce";
import { OrganizationType } from "../../../../Modules/Organization/types";
import { OrganizationModule } from "../../../../Modules/Organization";
import { CountryTypes } from "../../../../Modules/Country/types";
import { RoleTypes } from "../../../../Modules/Roles/types";
import { RolesModule } from "../../../../Modules/Roles";
import { UserPermissionsEnum } from "../../../../Modules/User/permissions";

const { Option } = Select;

interface SiteUserModalProps extends PropTypes {
	record: number;
	permissions: { [key in UserPermissionsEnum]: boolean };
}

export const SiteUserModal = (props: SiteUserModalProps) => {
	const {
		openModal, onCancel, type, record, reloadTableData,
		permissions: { createUser, updateUser }
	} = props;
	const [form] = Form.useForm();
	const module = useMemo(() => new UserModule(), []);

	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 500);
	const [organization, setOrganization] = useState<OrganizationType[]>([]);
	const orgModule = useMemo(() => new OrganizationModule(), []);
	const countryModule = useMemo(() => new CountryModule(), []);
	const rolesModule = useMemo(() => new RolesModule(), []);

	const [recordData, setRecordData] = useState<Partial<UserResponseObject>>();
	const [countries, setCountries] = useState<CountryTypes[]>([]);
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

	// Get the locations data from the api when the user searches for a location
	const onOrgSearch = useCallback(() => {
		if (debouncedSearchTerm) {
			orgModule.findPublished({ name: debouncedSearchTerm }).then((res) => {

				setOrganization((prev) => {
					// if the data is already present in the state, then don't add it again
					const filteredData = res?.data?.data?.filter((item: OrganizationType) => {
						return !prev?.find((prevItem) => prevItem.id === item.id);
					});
					// add the new data to the existing data
					return [...prev, ...filteredData];
				})
			}).catch((err) => {
				message.error(err.response.data.message)
			})
		}
	}, [orgModule, debouncedSearchTerm])

	useEffect(() => {
		onOrgSearch()
	}, [onOrgSearch])

	const handleAlertClose = () => {
		setRecordData({ ...recordData, error: "" });
	};

	// Get data for the selected record from the api and set it in the form
	const getDataBySlug = useCallback(() => {
		module.getRecordById(record).then((res) => {
			const organization = res?.data?.data?.organization as OrganizationType;

			if (res.data && res.data.data) {
				form.setFieldsValue({
					...res.data.data,
					translations: res.data.data.localization,
					isPublished: res.data.data.isPublished,
					userCountryList: res.data.data?.userCountryList
						?.map((item: UserCountryAccess_GET) => item.countryId)
						.join(","),
					organizationId: organization?.id,
				});
				setRecordData({ ...res.data, loading: false });
			}

			// get the organization data from the api
			if (organization) {
				orgModule.getRecordById(organization.id).then((res) => {
					setOrganization([res?.data?.data])
				}).catch((err) => {
					message.error(err.response.data.message)
				})
			}
		}).catch((err) => {
			handleErrors(err);
		});

	}, [form, record, module, orgModule]);

	const getRoles = useCallback(() => {
		if (type === "edit" || type === "seo") return;

		rolesModule.getAllRecords().then((res) => {
			if (res.data && res.data?.data) {
				setRoles(res.data?.data);
			}
		}).catch((err) => {
			handleErrors(err);
		});
	}, [rolesModule, type]);

	const getCountryList = useCallback(() => {
		countryModule.getAvailableRecords().then((res) => {
			if (res.data && res.data.data) {
				setCountries(res.data.data);
			}
		});
	}, [countryModule]);

	useEffect(() => {
		if (type === "edit") {
			setRecordData({ loading: true });
			// fetch data by slug or id
			getDataBySlug();
			// fetch the countries
			getCountryList();
		} else {
			// fetch the countries
			getCountryList();
			form.resetFields();
			getRoles();
		}
	}, [openModal, type, form, getDataBySlug, getCountryList, getRoles]);

	const onFinish = (formValues: any) => {
		/** 
		* save the role ids in a variable and delete it from the formValues
		* so that it doesn't get sent to the server as a part of the form 
		* data when creating a new user
		* */
		const roleIds: number[] = formValues.roleIds
		delete formValues.roleIds;

		// set default value for displayOrgContact
		if (formValues.displayOrgContact === undefined) {
			formValues.displayOrgContact = false;
		}

		setRecordData({ ...recordData, buttonLoading: true });
		const formData = new FormData();
		const excludeFields = ["profile", "translations"];
		Object.entries(formValues).forEach((ele: any) => {
			if (!excludeFields.includes(ele[0])) {
				formData.append(ele[0], ele[1]);
			}
		});

		if (
			formValues["profile"] &&
			typeof formValues["profile"] !== "string" &&
			formValues["profile"]["fileList"].length > 0
		) {
			formData.append("profile", formValues["profile"]["fileList"][0]["originFileObj"]);
		}

		if (formValues.translations) {
			formValues.translations.forEach(
				(item: { language: string; title: string }, index: number) => {
					formData.append(`translations[${index + 1}][language]`, item.language);
					formData.append(`translations[${index + 1}][title]`, item.title);
				}
			);
		}

		//TODO: Fix phone and phone code input group

		formData.append('phoneCode', "971")

		switch (type) {
			case "edit": {
				if (updateUser === true) {
					module.updateRecord(formData, recordData?.data?.id).then((res) => {
						reloadTableData();
						onCancel();
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					}).catch((err) => {
						handleErrors(err);
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					});
				} else {
					setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					message.error("You don't have permission to update this user");
				}
				break;
			}
			case "new": {
				if (createUser === true) {
					module.createRecord(formData).then(async (res) => {
						// user id
						const id = res.data?.data?.id;
						await module.addRoles({ roleIds: roleIds }, id).then((res) => {
							reloadTableData();
							onCancel();
							setRecordData((prev) => ({ ...prev, buttonLoading: false }));
						}).catch((err) => {
							handleErrors(err);
							setRecordData((prev) => ({ ...prev, buttonLoading: false }));
						})
					}).catch((err) => {
						handleErrors(err);
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					});
				} else {
					setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					message.error("You don't have permission to create a new user");
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
			titleText={type === "edit" ? "Edit User" : "Add New User"}
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
						<Form.Item
							name="organizationId"
							rules={[
								{ required: true, message: "Please select an organization" },
							]}
						>
							<label className={"font-size-sm"}>
								Organization  <span className='color-red-yp'>*</span>
							</label>

							<Select
								allowClear
								style={{ width: "100%" }}
								defaultValue={recordData?.data?.Organization?.id}
								placeholder="Search for the organization"
								className="selectAntdCustom"
								onChange={(value) => form.setFieldsValue({ organizationId: value })}
								showSearch
								onSearch={(value) => setSearchTerm(value)}
								optionFilterProp="label"
								options={organization?.map((item) => {
									return {
										label: item.name,
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
												No data found, Please search for the organization
											</span>
										}
									/>
								}
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item
							name="firstName"
							rules={[
								{ required: type === "new" ? true : false, message: "Please add first name" },
							]}
						>
							<CustomInput size="w100" label={"First Name"} asterisk={type === "new"} type="text" />
						</Form.Item>

						<Form.Item
							name="lastName"
							rules={[{ required: type === "new" ? true : false, message: "Please add last name" }]}
						>
							<CustomInput size="w100" label={"Last Name"} asterisk={type === "new"} type="text" />
						</Form.Item>
					</div>

					<div>
						<Form.Item
							name="email"
							rules={[
								{ required: type === "new" ? true : false, message: "Please add email" },
								{ type: "email", message: "Please add valid email" },
							]}
						>
							<CustomInput size="w100" label={"Email"} asterisk={type === "new"} type="email" />
						</Form.Item>

						{type === "new" && (
							<Form.Item
								name="password"
								rules={[
									{ required: true, message: "Please add password" },
									{ min: 6, message: "Password must be at least 6 characters" },
								]}
							>
								<CustomInput size="w100" label={"Password"} asterisk type="password" />
							</Form.Item>
						)}
					</div>

					<div>
						<div>
							<label className={"font-size-sm"}>
								Phone  <span className='color-red-yp'>*</span>
								<Form.Item
									name="phone"
									rules={[{ required: true, message: "Please add phone" }]}
								>
									<InputNumber
										type={"number"}
										addonBefore={
											<Select
												style={{ width: 98 }}
												placeholder="Select phone code"
												defaultValue={type === "new" ? "971" : recordData?.data?.phoneCode || "971"}
											>
												{countries?.map((item) => {
													return (
														<Option
															value={item.phoneCode}
														>
															<span>{item.flag}</span>
															<span className="ml-1">{`${item.phoneCode}`}</span>
														</Option>
													)
												})}
											</Select>
										}
										placeholder="Enter phone number"
										defaultValue={type === "new" ? "" : recordData?.data?.phone}
										controls={false}
									/>
								</Form.Item>
							</label>
						</div>

						<Form.Item
							name="address"
							rules={[{ required: type === "new" ? true : false, message: "Please add address" }]}
						>
							<CustomInput size="w100" label={"Address"} asterisk={type === "new"} type="text" />
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

						<Form.Item name="preferences">
							<div className="pt-1">
								<CustomInput label={"Preferences"} type="text" size="w100" />
							</div>
						</Form.Item>
					</div>

					{
						//TODO: User Country List
					}
					{/* <div>
						<Form.Item name="userCountryList">
							<label className={"font-size-sm"}>Country</label>
							<Select
								mode="multiple"
								allowClear
								style={{ width: "100%" }}
								placeholder="Please select"
								className="selectAntdCustom"
								options={countries?.map((country) => ({
									label: country.name,
									value: country.id,
								}))}
							/>
						</Form.Item>
					</div> */}

					{type === "new" && (
						<div>
							<Form.Item
								name="roleIds"
								rules={[{
									required: true,
									message: "Please select at least one role"
								}]}
							>
								<label className={"font-size-sm"}>
									Select Roles <span className="color-red-yp">*</span>
								</label>
								<Select
									mode="multiple"
									allowClear
									style={{ width: "100%" }}
									placeholder="Please select at least one role"
									className="selectAntdCustom"
									onChange={(value) => form.setFieldsValue({ roleIds: value })}
									showSearch
									optionFilterProp="label"
									options={roles.map((role) => ({
										label: role?.title,
										value: role?.id,
									}))}
								/>

								<p className='mb-0'>
									<small className="color-dark-main">
										Select roles for this user!. You can select multiple roles.
									</small>
								</p>
							</Form.Item>
						</div>
					)}

					<div>
						<Form.Item name="whatsapp">
							<CustomInput
								label="WhatsApp Number"
								placeHolder="Enter WhatsApp Number"
								size="w100"
							/>
						</Form.Item>

						<Form.Item name="displayOrgContact">
							<CustomSelect
								label={"Display Organization Contact"}
								options={[
									{ value: true, label: "Yes" },
									{ value: false, label: "No" },
								]}
								placeholder="Select Display Organization Contact"
								defaultValue={false}
							/>
							<p className='mb-0'>
								<small className="color-dark-main">
									If you select yes, your organization contact will be displayed on your profile on Yallah agent page and agent properties.
								</small>
							</p>
						</Form.Item>
					</div>

					<div>
						<ImageUploader
							name="profile"
							defaultFileList={
								type === "edit" &&
								recordData &&
								recordData.data?.profile && [
									{
										uid: recordData.data?.id,
										name: recordData.data?.profile,
										status: "done",
										url: RESOURCE_BASE_URL + recordData.data?.profile,
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
			)
			}
		</CustomModal >
	);
};
