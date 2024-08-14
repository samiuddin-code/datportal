import { useEffect, useCallback, useMemo, useState } from "react";
import { Form, message } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton,
	CustomSelect,
	Localization,
} from "../../../Atoms";
import styles from "../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { slugifyString } from "../../../../helpers/common";
import { HandleServerErrors } from "../../../../Components/Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { LocationModule } from "../../../../Modules/Location";
import { CountryModule } from "../../../../Modules/Country";
import { CountryTypes } from "../../../../Modules/Country/types";
import { LocationType, LocationTypeResponseObject } from "../../../../Modules/Location/types";
import { PropTypes } from "../../Common/common-types";
import { LocationTypesEnum } from "../../../../helpers/commonEnums";
import { useDebounce } from "../../../../helpers/useDebounce";
import { LocationPermissionsEnum } from "../../../../Modules/Location/permissions";

interface LocationModalProps extends PropTypes {
	record: number;
	permissions: { [key in LocationPermissionsEnum]: boolean };
}

interface ExtraFieldsForLocationTypeTypes {
	[key: string]: {
		label: string;
		name: string;
		type: LocationTypesEnum;
	}[];
}

const extraFieldsForLocationType: ExtraFieldsForLocationTypeTypes = {
	community: [
		{
			label: "State",
			name: "stateId",
			type: LocationTypesEnum.State
		},
	],
	subCommunity: [
		{
			label: "State",
			name: "stateId",
			type: LocationTypesEnum.State
		},
		{
			label: "Community",
			name: "communityId",
			type: LocationTypesEnum.Community
		},
	],
	building: [
		{
			label: "State",
			name: "stateId",
			type: LocationTypesEnum.State
		},
		{
			label: "Community",
			name: "communityId",
			type: LocationTypesEnum.Community
		},
		{
			label: "Sub Community",
			name: "subCommunityId",
			type: LocationTypesEnum["Sub Community"]
		},
	],
};

export const SiteLocationModal = (props: LocationModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: { createLocation, updateLocation }
	} = props;
	const [form] = Form.useForm();
	const module = useMemo(() => new LocationModule(), []);
	const countryModule = useMemo(() => new CountryModule(), []);

	const [recordData, setRecordData] = useState<Partial<LocationTypeResponseObject>>();
	const [countries, setCountries] = useState<CountryTypes[]>([]);
	const [selectedLocationType, setSelectedLocationType] = useState<string>("");
	const [selectedIds, setSelectedIds] = useState<{
		state: number;
		community: number;
		subCommunity: number;
	}>({
		state: 0,
		community: 0,
		subCommunity: 0,
	});
	const [stateData, setStateData] = useState<LocationType[]>([]);
	const [communityData, setCommunityData] = useState<LocationType[]>([]);
	const [subCommunityData, setSubCommunityData] = useState<LocationType[]>([]);

	const [searchTerm, setSearchTerm] = useState<{
		state: string;
		community: string;
		subCommunity: string;
	}>({
		state: "",
		community: "",
		subCommunity: "",
	});

	const debouncedStateSearchTerm = useDebounce(searchTerm.state, 500);
	const debouncedCommunitySearchTerm = useDebounce(searchTerm.community, 500);
	const debouncedSubCommunitySearchTerm = useDebounce(searchTerm.subCommunity, 500);

	const options: { [key: string]: LocationType[] } = {
		state: stateData,
		community: communityData,
		subCommunity: subCommunityData,
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

	const handleSlugChange = ({ target }: any) => {
		let slug = slugifyString(target.value);
		form.setFieldsValue({ slug: slug });
	};

	/** get the extra fields for the selected location type and fetch 
	 * the state data if the state field is present  in the extra 
	 * fields and the state data is empty. This is done to avoid fetching
	 * the state data for all the location types
	 * */
	const getLocationTypeFields = useCallback((locationType: string) => {
		const fields = extraFieldsForLocationType[locationType];

		if (fields) {
			// find the state in the fields
			let stateField = fields.find((field) => field.type === LocationTypesEnum.State);

			if (stateField && stateData?.length === 0) {
				// get the state data
				module.getAllRecords({ type: LocationTypesEnum.State }).then((res) => {
					if (res.data && res.data.data) {
						setStateData(res.data.data);
					}
				});
			}
		}
	}, [stateData, module]);

	/** Fetch related data for the selected location type */
	const onLocationTypeSelect = useCallback((value: number, selectedType: string) => {
		// reset community and sub community fields if the state is changed
		if (selectedType === LocationTypesEnum.State && selectedIds.state !== value) {
			form.resetFields(["communityId", "subCommunityId"]);
		}

		// Get location by Id
		module.getAllRecordsByLocationId(value).then((res) => {
			if (res.data && res.data.data) {
				const locationTree = res.data.data?.locationTree
				const selected = res.data.data?.selected

				// set the selected ids from the response
				selected && setSelectedIds({
					state: selected?.state || 0,
					community: selected?.community || 0,
					subCommunity: selected?.subCommunity || 0,
				})

				if (locationTree) {
					const { state, community, subCommunity } = locationTree

					// set the data from the response
					state && setStateData(state)
					community && setCommunityData(community)
					subCommunity && setSubCommunityData(subCommunity)
				}

				// set the selected values in the form if the type is edit
				if (type === "edit") {
					form.setFieldsValue({
						stateId: selected?.state,
						communityId: selected?.community,
						subCommunityId: selected?.subCommunity,
					});
				}
			}
		}).catch((err) => {
			handleErrors(err);
		});
	}, [module, selectedIds.state, form]);

	/**
	 * This function is used to set the location type search term 
	 * base on the selected location type. if the data is already
	 * present in the state then it will not set the search term
	 * to avoid fetching the data again
	 */
	const onSearchEventHandler = useCallback((value: string, selectedType: string) => {
		switch (selectedType) {
			case LocationTypesEnum.State: {
				const filteredStateData = stateData?.filter((item) => {
					const name = item?.localization[0]?.name?.toLowerCase()
					const valueLowerCase = value?.toLowerCase()

					return name?.includes(valueLowerCase)
				})

				if (filteredStateData?.length > 0) {
					return
				}
				setSearchTerm({
					...searchTerm,
					state: value,
				})
				break;
			}
			case LocationTypesEnum.Community: {
				const filteredCommunityData = communityData?.filter((item) => {
					const name = item?.localization[0]?.name?.toLowerCase()
					const valueLowerCase = value?.toLowerCase()

					return name?.includes(valueLowerCase)
				})

				if (filteredCommunityData?.length > 0) {
					return
				}
				setSearchTerm({
					...searchTerm,
					community: value,
				})
				break;
			}
			case LocationTypesEnum["Sub Community"]: {
				const filteredSubCommunityData = subCommunityData?.filter((item) => {
					const name = item?.localization[0]?.name?.toLowerCase()
					const valueLowerCase = value?.toLowerCase()

					return name?.includes(valueLowerCase)
				})

				if (filteredSubCommunityData?.length > 0) {
					return
				}
				setSearchTerm({
					...searchTerm,
					subCommunity: value,
				})
				break;
			}
			default:
				break;
		}
	}, [
		stateData,
		communityData,
		subCommunityData,
		setSearchTerm,
		searchTerm,
	]);

	/** 
	 * This function is used to fetch data for the selected location type 
	 * using the search term and the type. This function is debounced to
	 * avoid multiple api calls as the user types in the search box
	*/
	const onLocationTypesSearch = useCallback(() => {
		// fetch state data
		if (debouncedStateSearchTerm) {
			module.getAllRecords({
				type: LocationTypesEnum.State,
				name: debouncedStateSearchTerm
			}).then((res) => {
				if (res.data && res.data.data) {
					setStateData((prev) => {
						const filteredData = res?.data?.data.filter((item: LocationType) => {
							return !prev.find((prevItem) => prevItem.id === item.id);
						});
						return [...prev, ...filteredData];
					});
				}
			}).catch((err) => {
				handleErrors(err);
			});
		}

		// fetch community data
		if (debouncedCommunitySearchTerm) {
			module.getAllRecords({
				type: LocationTypesEnum.Community,
				name: debouncedCommunitySearchTerm
			}).then((res) => {
				if (res.data && res.data.data) {
					setCommunityData((prev) => {
						const filteredData = res?.data?.data.filter((item: LocationType) => {
							return !prev.find((prevItem) => prevItem.id === item.id);
						});
						return [...prev, ...filteredData];
					});
				}
			}).catch((err) => {
				handleErrors(err);
			});
		}

		// fetch sub community data
		if (debouncedSubCommunitySearchTerm) {
			module.getAllRecords({
				type: LocationTypesEnum["Sub Community"],
				name: debouncedSubCommunitySearchTerm
			}).then((res) => {
				if (res.data && res.data.data) {
					setSubCommunityData((prev) => {
						const filteredData = res?.data?.data.filter((item: LocationType) => {
							return !prev.find((prevItem) => prevItem.id === item.id);
						});
						return [...prev, ...filteredData];
					});
				}
			}).catch((err) => {
				handleErrors(err);
			});
		}
	}, [
		debouncedStateSearchTerm,
		debouncedCommunitySearchTerm,
		debouncedSubCommunitySearchTerm,
		module
	]);

	// on finish for the form
	const onFinish = (formValues: any) => {
		setRecordData({ ...recordData, buttonLoading: true });

		// set default values for boolean fields
		if (formValues?.isPublished === undefined) {
			formValues.isPublished = true;
		}
		if (formValues?.useReferenceField === undefined) {
			formValues.useReferenceField = false;
		}
		if (formValues?.usePathNameProvided === undefined) {
			formValues.usePathNameProvided = false;
		}

		switch (type) {
			case "edit": {
				if (updateLocation === true) {
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
					message.error("You don't have permission to edit this record");
				}
				break;
			}
			case "new": {
				if (createLocation === true) {
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

	// get data by id for edit
	const getDataBySlug = useCallback(() => {
		setRecordData({ loading: true });
		module.getRecordById(record).then((res) => {
			if (res.data && res.data.data) {
				const locationType = res.data.data.type;
				const id = res.data.data.id;

				form.setFieldsValue({
					...res.data.data,
					translations: res.data.data.localization,
					isPublished: res.data.data.isPublished,
					locationType: locationType,
				});
				setRecordData({ ...res.data, loading: false });

				setSelectedLocationType(locationType);
				getLocationTypeFields(locationType);
				onLocationTypeSelect(id, locationType)
			}
		}).catch((err) => {
			handleErrors(err);
		});
	}, [form, record, module]);

	const getCountryList = useCallback(() => {
		countryModule.getAllRecords().then((res) => {
			if (res.data && res.data.data) {
				setCountries(res.data.data);
				form.setFieldsValue({ countryId: res.data.data[0].id });
			}
		});
	}, [countryModule, form]);

	// use effect to fetch the location types
	useEffect(() => {
		onLocationTypesSearch();
	}, [onLocationTypesSearch]);

	useEffect(() => {
		if (type === "edit") {
			getDataBySlug();
			getCountryList();
		} else {
			getCountryList();
			form.resetFields();
		}
	}, [type, form, getDataBySlug, getCountryList]);

	return (
		<CustomModal
			visible={openModal}
			closable={true}
			onCancel={onCancel}
			titleText={type === "edit" ? "Edit Location" : "Add New Location"}
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
							name="countryId"
							rules={[{ required: true, message: "Please select a country" }]}
						>
							<CustomSelect
								label={"Country"}
								asterisk
								options={countries.map((country) => ({
									label: country.name,
									value: country.id
								}))}
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item
							name="locationType"
							rules={[{
								required: true,
								message: "Please select a location type"
							}]}
						>
							<CustomSelect
								label={"Location Type"}
								options={Object.entries(LocationTypesEnum).map(([key, value]) => ({
									label: key,
									value: value,
								}))}
								onChange={(value) => {
									setSelectedLocationType(value);
									getLocationTypeFields(value);
								}}
							/>
						</Form.Item>
					</div>

					{selectedLocationType && extraFieldsForLocationType[selectedLocationType] && (
						<>
							{extraFieldsForLocationType[selectedLocationType].map((field: {
								label: string;
								name: string;
								type: string;
							}, index: number) => (
								<Form.Item
									key={`fieldName-${index}`}
									name={field.name}
									rules={[{ required: true, message: `Please add a ${field.label}` }]}
								>
									<CustomSelect
										label={field.label}
										asterisk
										placeholder={`Select ${field.label} or search for it`}
										onChange={(value) => {
											form.setFieldsValue({
												[field.name]: value,
											});
										}}
										onSearch={(value) => onSearchEventHandler(value, field.type)}
										onSelect={(value) => onLocationTypeSelect(value, field.type)}
										options={options[field.type].map((item: LocationType) => ({
											label: item.localization[0].name,
											value: item.id,
										}))}
									/>
								</Form.Item>
							))}
						</>
					)}

					<Localization
						title="Title &amp; Description"
						formName="translations"
						form={form}
						description
						isRichTextEditor={false}
						forLocation
					/>

					<div>
						<Form.Item
							name="latitude"
							rules={[
								{
									required: true,
									message: "Please add a latitude"
								}
							]}
						>
							<CustomInput
								size="w100"
								label={"Latitude"}
								asterisk
								type="text"
							/>
						</Form.Item>
						<Form.Item
							name="longitude"
							rules={[{
								required: true,
								message: "Please add a longitude"
							}]}
						>
							<CustomInput
								size="w100"
								label={"Longitude"}
								asterisk
								type="text"
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item name="referenceId">
							<CustomInput
								size="w100"
								label={"Reference Id"}
								type="text"
							/>
						</Form.Item>

						<Form.Item name="abbreviation">
							<CustomInput
								size="w100"
								label={"Abbreviation"}
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
								defaultValue={true}
							/>
						</Form.Item>

						<Form.Item name="useReferenceField">
							<CustomSelect
								label={"Do you want to use reference field?"}
								options={[
									{ value: true, label: "Yes" },
									{ value: false, label: "No" },
								]}
								defaultValue={false}
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item name="usePathNameProvided">
							<CustomSelect
								label={"Do you want to use path name provided?"}
								options={[
									{ value: true, label: "Yes" },
									{ value: false, label: "No" },
								]}
								defaultValue={false}
							/>
						</Form.Item>

						<Form.Item
							name="slug"
							rules={[
								{
									required: true,
									message: "Please add a slug"
								}
							]}
						>
							<CustomInput
								size="w100"
								label={"Slug"}
								type="text"
								asterisk
								onChange={handleSlugChange}
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
