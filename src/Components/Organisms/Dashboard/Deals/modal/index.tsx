import { useCallback, useEffect, useMemo, useState } from "react";
import { Empty, Form, message, Progress, Select, Skeleton, Upload } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton,
	CustomSelect,
} from "../../../../Atoms";
import styles from "../../../Common/styles.module.scss";
import componentStyles from '../styles.module.scss'
import Skeletons from "../../../Skeletons";
import { HandleServerErrors } from "../../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../../helpers";
import { PropTypes } from "../../../Common/common-types";
import { PropertyDealPermissionsEnum } from "../../../../../Modules/Properties/permissions";
import { PropertiesModule, PropertyDealsModule } from "../../../../../Modules/Properties";
import { PropertiesType, PropertyDealResponseObject, PropertyDealTypes } from "../../../../../Modules/Properties/types";
import api from "../../../../../services/axiosInstance";
import { RcFile } from "antd/lib/upload";
import { useDebounce } from "../../../../../helpers/useDebounce";
import { TabKeysEnum } from "../types";
import { AxiosProgressEvent } from "axios";

interface DealsModalProps extends PropTypes {
	permissions: { [key in PropertyDealPermissionsEnum]: boolean }
	record: PropertyDealTypes;
	tabKey: keyof typeof TabKeysEnum;
}

interface FileListProps extends RcFile {
	url: string;
}

export const DealsModal = (props: DealsModalProps) => {
	const {
		openModal, onCancel, type, reloadTableData, record, tabKey,
		permissions: { createPropertyDeals, updatePropertyDeals }
	} = props;
	const [form] = Form.useForm();

	const [fileList, setFileList] = useState<FileListProps[]>([]);
	const [upload, setUpload] = useState<{
		status: "active" | "success" | "exception" | "normal";
		progress: number;
	}>({ status: "normal", progress: 0 });
	const [showPreview, setShowPreview] = useState(false);
	const [publishType, setPublishType] = useState<"draft" | "publish">('draft')
	const [buttonLoading, setButtonLoading] = useState<{ publish: boolean; draft: boolean; }>({
		publish: false,
		draft: false,
	});
	const [uploadedData, setUploadedData] = useState<PropertyDealTypes>();
	const [properties, setProperties] = useState<{
		data: PropertiesType[];
		loading: boolean;
	}>({
		data: [],
		loading: false,
	});

	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	// property deals module
	const module = useMemo(() => new PropertyDealsModule(), []);
	// properties module
	const propertiesModule = useMemo(() => new PropertiesModule(), [])

	const [recordData, setRecordData] = useState<Partial<PropertyDealResponseObject>>();

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

	const handleAlertClose = () => setRecordData({ ...recordData, error: "" });

	// Get the locations data from the api when the user searches for a location
	const onPropertySearch = useCallback(() => {
		if (debouncedSearchTerm) {
			propertiesModule.getAllRecords({ title: debouncedSearchTerm }).then((res) => {
				setProperties((prev) => {
					const data = res.data.data as PropertiesType[]
					// if the data is already present in the state, then don't add it again
					const filteredData = data.filter((item) => {
						return !prev.data.some((prevItem) => prevItem.id === item.id)
					})

					return {
						...prev,
						data: [...prev.data, ...filteredData],
						loading: false,
					}
				})
			}).catch((err) => {
				message.error(err.response.data.message || "Something went wrong while fetching the properties")
				setProperties((prev) => ({ ...prev, loading: false }));
			})
		}
	}, [debouncedSearchTerm])

	useEffect(() => {
		onPropertySearch()
	}, [onPropertySearch])

	// Get data for the selected record from the api and set it in the form
	const getPropertyById = useCallback(() => {
		if (record.propertyId) {
			propertiesModule.getRecordById(record.propertyId).then((res) => {
				const property = res?.data?.data as PropertiesType;

				setProperties((prev) => {
					// if the data is already present in the state, then don't add it again
					const filteredData = prev.data?.filter((item) => {
						return item.id !== property.id;
					});
					// add the new data to the existing data
					return {
						...prev,
						data: [property, ...filteredData],
						loading: false,
					}
				})
				form.setFieldsValue({
					propertyId: property.id,
				});
			}).catch((err) => {
				message.error(err.response.data.message || "Something went wrong")
			})
		} else {
			form.setFieldsValue({ propertyId: undefined });
		}
	}, [record.id, form])

	// State to disable submit button
	const isButtonDisabled = useMemo(() => {
		if (type === "new" && !uploadedData) return true;
		if (type === "edit" && !record) return true;
		return false;
	}, [type, uploadedData, record])

	const handleUploadChange = (info: any) => {
		if (createPropertyDeals === true) {
			let fileList = [...info.fileList];
			fileList = fileList.slice(-1); // limit file count to 1
			fileList = fileList.map((file) => {
				if (file.response) {
					// create object URL for uploaded file
					file.url = URL.createObjectURL(file.originFileObj);
				}
				return file;
			});
			setFileList(fileList);
		} else {
			message.error("You don't have permission to create deals, please contact your admin");
		}
	};

	const uploadMedia = async (options: any) => {
		if (createPropertyDeals === true) {
			const { onSuccess, onError, file } = options;
			const fmData = new FormData();
			const config = {
				headers: { "content-type": "multipart/form-data" },
			};
			fmData.append("media", file);

			setUpload({ status: "active", progress: 0 });

			const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
				const { loaded, total } = progressEvent;
				let percent = 0;
				if (total !== null && total !== undefined) {
					percent = Math.floor((loaded * 100) / total);
				}
				setUpload({ status: "active", progress: percent });
			};

			try {
				// after 2 seconds, show the preview
				setTimeout(() => {
					if (upload.status !== "exception") {
						setShowPreview(true);
					}
				}, 2000);

				const res = await api.post("property-deals", fmData, {
					onUploadProgress,
					...config,
				});

				setUploadedData(res.data?.data);
				onSuccess("ok");
				setUpload({ status: "success", progress: 100 })
				setRecordData({ ...recordData, error: "" });
			} catch (err) {
				onError({ err });
				handleErrors(err);
				setUpload({ status: "exception", progress: 0 })
				setShowPreview(false);
			}
		} else {
			message.error("You don't have permission to create deals, please contact your admin");
		}
	};

	const onFinish = (formValues: any) => {
		switch (type) {
			case "new": {
				if (createPropertyDeals === true) {
					const finalValues = {
						...formValues,
						isPublished: publishType === "draft" ? false : true
					}
					const recordId = uploadedData?.id as number;

					setButtonLoading({ ...buttonLoading, [publishType]: true })

					module.updateRecord(finalValues, recordId).then((res) => {
						if (res.data && res.data.data) {
							message.success("Deal created successfully");
							reloadTableData();
							onCancel();
						} else {
							message.error("Error creating deal");
						}
					}).catch((err) => {
						setButtonLoading({ ...buttonLoading, [publishType]: false })
						handleErrors(err);
					})
				} else {
					message.error("You don't have permission to create deals, please contact your admin");
				}
				break;
			}
			case "edit": {
				if (updatePropertyDeals === true) {
					const finalValues = {
						...formValues,
						isPublished: publishType === "draft" ? false : true
					}
					setButtonLoading({ ...buttonLoading, [publishType]: true })

					module.updateRecord(finalValues, record.id).then((res) => {
						if (res.data && res.data.data) {
							message.success("Deal updated successfully");
							reloadTableData();
							onCancel();
						} else {
							message.error("Error updating deal");
						}
					}).catch((err) => {
						setButtonLoading({ ...buttonLoading, [publishType]: false })
						handleErrors(err);
					})
				} else {
					message.error("You don't have permission to update deals, please contact your admin");
				}
				break;
			}
		}
	};

	// Get text for the action button
	const ActionText = useMemo(() => {
		let text = "";
		if (type === "new") {
			text = "Publish";
		} else if (type === "edit" && tabKey === "expired") {
			text = "Repost";
		} else {
			text = "Update";
		}
		return text;
	}, [type])

	useEffect(() => {
		if (record && type === "edit") {
			form.setFieldsValue(record);
			// fetch property by id
			getPropertyById();
		} else {
			form.resetFields();
		}
	}, [record, form, type, getPropertyById]);

	return (
		<CustomModal
			visible={openModal}
			closable={true}
			onCancel={onCancel}
			titleText={type === "edit" ? "Edit Deal" : "Add Deal"}
			showFooter={false}
		>
			{recordData?.loading ? <Skeletons items={5} fullWidth /> : (
				<Form className={styles.form} onFinish={onFinish} form={form}>
					{recordData?.error && (
						<CustomErrorAlert
							description={recordData?.error}
							onClose={handleAlertClose}
							isClosable
						/>
					)}
					{/**
					 *  if form type is new and showPreview is false or upload status is 
					 * exception (error) then show the upload component else hide it
					 */}
					{((type === "new" && showPreview === false) || upload.status === "exception") && (
						<Upload.Dragger
							accept="image/*,video/*"
							className={componentStyles.dragger}
							name="file"
							customRequest={uploadMedia}
							onChange={(info) => handleUploadChange(info)}
							disabled={(showPreview && upload.status === "exception") ? true : false}
							fileList={fileList}
							// Prevents upload if createPropertyDeals permissions is false
							beforeUpload={() => createPropertyDeals === true ? true : false}
						>
							<p className="ant-upload-hint">
								Drag media here or click to upload media
							</p>
							<div className={componentStyles.numberOfUploads}>
								<p>{`${fileList.length}/1`}</p>
								<ul style={{ paddingLeft: "15px", marginBottom: 0 }}>
									<li>
										Only *.jpeg, *.jpg, *.png, *.mp4, *.mov, *.3gp files are allowed
									</li>
									<li>
										Maximum image file size is 5MB
									</li>
									<li>
										Maximum video file size is 100MB
									</li>
									<li>
										Maximum video duration is 1 minute. Longer videos will be trimmed
									</li>
								</ul>
							</div>
						</Upload.Dragger>
					)}

					{upload.progress > 0 && (
						<Progress
							percent={upload.progress}
							status={upload.status}
							showInfo={false}
							className={componentStyles.uploadProgress}
						/>
					)}

					{upload.status !== "exception" && (
						<>
							<div className={componentStyles.mediaPreviewContainer}>
								{(showPreview && (type === "new")) && (
									<div className={componentStyles.mediaPreview}>
										{fileList.map((file) => (
											<div key={file.uid} className={componentStyles.mediaItem}>
												{file.type.includes("image") ? (
													<img
														src={file.url} alt="preview" width={200}
														height={250} style={{ objectFit: "cover" }}
													/>
												) : (
													<video src={file.url} controls width={200} height={250} />
												)}
											</div>
										))}
									</div>
								)}

								{/**
								 * if form type is edit and show preview is false, show the media preview or
								 * if form type is new and show preview is true, show the media preview
								 */}
								{((!showPreview && type === "edit") || (showPreview && type === "new")) && (
									<>
										<div className={componentStyles.mediaDetails}>
											<div>
												<Form.Item
													name="propertyId"
													rules={[
														{
															required: publishType === "draft" ? false : true,
															message: "Please select a property"
														}
													]}
													style={{ marginTop: 10 }}
												>
													<label className={"font-size-sm"}>
														Property  {publishType === "publish" && <span className='color-red-yp'>*</span>}
													</label>

													<Select
														allowClear
														style={{ width: "100%" }}
														defaultValue={record?.propertyId}
														placeholder="Search for a property"
														className="selectAntdCustom"
														onChange={(value) => form.setFieldsValue({ propertyId: value })}
														showSearch
														onSearch={(value) => setSearchTerm(value)}
														optionFilterProp="label"
														options={properties?.data?.map((item) => {
															return {
																label: item.localization[0].title,
																value: item.id,
															}
														})}
														notFoundContent={properties?.loading === true ? <Skeleton /> : (
															<Empty
																image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
																imageStyle={{ height: 100 }}
																description={<span>No data found, Please search for a property</span>}
															/>
														)}
													/>
												</Form.Item>
											</div>
											<div>
												<Form.Item name="caption">
													<CustomInput
														type="textArea"
														label="Caption"
														placeHolder="Caption"
														size="w100"
														rows={3}
														autoSize={{ minRows: 3 }}
													/>
												</Form.Item>
											</div>

											<div>
												<Form.Item name="discountType">
													<CustomSelect
														label={"Discount Type"}
														options={[
															{ value: "flat", label: "Flat" },
															{ value: "percentage", label: "Percentage" },
														]}
													/>
												</Form.Item>
												<Form.Item name="value">
													<CustomInput
														label="Discount Value"
														type="text"
														placeHolder="Discount Value"
														size="w100"
													/>
												</Form.Item>
											</div>
										</div>
									</>
								)}
							</div>

							{/** if the form type is new and showPreview is true then show the footer buttons
							 * or if the form type is edit and show preview is false then show the footer buttons
							 * */}
							{((!showPreview && type === "edit") || (showPreview && type === "new")) && (
								<div className={styles.footer}>
									{/** If form type is new or edit and tabKey is draft then show save as draft button */}
									{(type === "new" || (type === "edit" && tabKey === "draft")) && (
										<CustomButton
											type="outlined"
											size="normal"
											fontSize="sm"
											htmlType={"submit"}
											loading={buttonLoading.draft}
											disabled={isButtonDisabled}
											onClick={() => setPublishType("draft")}
										>
											Save as draft
										</CustomButton>
									)}

									<CustomButton
										type="primary"
										size="normal"
										fontSize="sm"
										htmlType={"submit"}
										loading={buttonLoading.publish}
										disabled={isButtonDisabled}
										onClick={() => setPublishType("publish")}
									>
										{ActionText}
									</CustomButton>
								</div>
							)}
						</>
					)}
				</Form>
			)}
		</CustomModal >
	);
};
