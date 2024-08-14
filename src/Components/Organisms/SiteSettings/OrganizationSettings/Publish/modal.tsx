import { Form, message, Upload, UploadFile, UploadProps } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
	CustomModal,
	CustomInput,
	CustomButton,
	HandleServerErrors,
	CustomErrorAlert,
} from "../../../../Atoms";
import { errorHandler } from "../../../../../helpers";
import Skeletons from "../../../Skeletons";
import {
	getOrganizationData,
} from "../../../../../Redux/Reducers/OrganizationReducer/action";
import { dispatchType } from "../../../../../Redux/Reducers/commonTypes";
// import { OrganizationDocumentsTypes } from "../../../../../helpers/commonEnums";
import { OrganizationModule } from "../../../../../Modules/Organization";
import { OrganizationResponseObject } from "../../../../../Modules/Organization/types";
import api, { BASE_URL } from '.././../../../../services/axiosInstance'
import styles from "../../Common/styles.module.scss";
import ComponentStyles from "./styles.module.scss";
import { OrgCreditsPackageModule } from "../../../../../Modules/OrganizationCreditPackage";

interface PublishOrgModalProps {
	openModal: boolean;
	onCancel: () => void;
	recordId: number;
	modalType: "publish" | "suspend" | "freeCredit" | "creditPackage" | "viewDocuments";
}

const PublishOrgModal = ({
	openModal,
	onCancel,
	recordId,
	modalType,
}: PublishOrgModalProps) => {
	const [form] = Form.useForm();

	// organization module
	const orgModule = useMemo(() => new OrganizationModule(), []);
	// organization credit package module
	const orgCreditPackageModule = useMemo(() => new OrgCreditsPackageModule(), []);

	const dispatch = useDispatch<dispatchType>();

	const [recordData, setRecordData] = useState<Partial<OrganizationResponseObject>>();
	// Publish Type
	const [type, setType] = useState<{ force: boolean, normal: boolean }>({
		force: false,
		normal: true,
	});
	const [documentType, setDocumentType] = useState<string>("");
	const [images, setImages] = useState<UploadFile[]>([]);

	const getOrgData = useCallback(() => {
		if (openModal === true && recordId > 0) {
			setRecordData({ ...recordData, loading: true });

			orgModule.getRecordById(recordId).then((res) => {
				if (res.data && res.data.data) {
					setRecordData({ ...res.data, loading: false });
				}
			}).catch((err) => {
				handleErrors(err);
			});
		}
	}, [orgModule, recordId, openModal]);

	/** Upload Image to server */
	const uploadImage = async (options: any) => {
		const { onSuccess, onError, file } = options;
		const fmData = new FormData();
		const config = {
			headers: { "content-type": "multipart/form-data" },
		};
		fmData.append("file", file);
		fmData.append("organizationId", recordId.toString());
		fmData.append("documentType", documentType);
		try {
			const res = await api.post("organization/upload-organization-files", fmData, config);

			const data = await res.data?.data;
			onSuccess("ok");
			message.success('Image uploaded successfully');

			// clear the upload file list after success upload 
			data && setImages([]);
			if (data) {
				getOrgData();
			}
		} catch (err) {
			onError({ err });
			message.error('Image upload failed');
		}
	};

	const propsForUpload: UploadProps = {
		beforeUpload: file => {
			const isPNG = file.type === 'image/png';
			const isJPG = file.type === 'image/jpeg' || file.type === 'image/jpg';
			const isPDF = file.type === 'application/pdf';
			if (!isPNG && !isJPG && !isPDF) {
				message.error('You can only upload PNG, JPG or PDF file!');
			}

			return isPNG || isJPG || isPDF;
		},
		onChange: info => {
			if (info.file.status === 'done') {
				setImages(info.fileList)
			}
		},
		name: 'file',
		multiple: false,
		maxCount: 1,
		customRequest: uploadImage,
		fileList: images,
		//TODO: remove file from list and delete from server
		// remove file from list and delete from server
		// onRemove: async (file: any) => {
		// 	const { uid } = file;
		// 	const newImages = images?.filter(item => item.uid !== uid);
		// 	setImages(newImages);
		// 	try {
		// 		await api.delete(`organization/delete-organization-file/${uid}`);
		// 	} catch (err) {
		// 		console.log(err);
		// 	}
		// }
	};

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
		getOrgData();
	}, [getOrgData]);

	const onFinish = (
		values: { message?: string, remarks?: string, credit?: string }
	) => {
		switch (modalType) {
			case "publish": {
				const publishData = {
					force: type.force,
					message: values?.message || "",
					// TODO: uncomment sendWelcomeEmail when needed
					//sendWelcomeEmail: false,
				};

				// orgModule.publish(publishData, recordId).then((res) => {
				// 	if (res.data && res.data.data) {
				// 		message.success("Organization published successfully");
				// 		dispatch(getOrganizationData());
				// 		onCancel();
				// 	}
				// }).catch((err) => {
				// 	handleErrors(err);
				// });
				break;
			}
			case "suspend": {
				// orgModule.suspend({ message: values?.message! }, recordId).then((res) => {
				// 	if (res.data && res.data.data) {
				// 		message.success(res.data?.message);
				// 		dispatch(getOrganizationData());
				// 		onCancel();
				// 	}
				// }).catch((err) => {
				// 	handleErrors(err);
				// });
				break;
			}
			case "freeCredit": {
				orgCreditPackageModule.createTopUp({
					organizationId: recordId,
					credits: Number(values?.credit!),
					remarks: values?.remarks!,
				}).then((res) => {
					if (res.data && res.data.data) {
						message.success("Free credit added successfully");
						dispatch(getOrganizationData());
						onCancel();
					}
				}).catch((err) => {
					handleErrors(err);
				});
				break;
			}
		}
	};

	const showTitle = (type: PublishOrgModalProps['modalType']) => {
		switch (type) {
			case "publish":
				return "Publish Organization";
			case "suspend":
				return "Suspend Organization";
			case "freeCredit":
				return "Free Credit";
			case "viewDocuments":
				return "View Documents";
			default:
				return "";
		}
	};

	const showButtonText = (type: PublishOrgModalProps['modalType']) => {
		switch (type) {
			case "publish":
				return "Publish";
			case "suspend":
				return "Suspend";
			default:
				return "Gift Credits"
		}
	};


	const access_token = localStorage.getItem("access_token")

	return (
		<CustomModal
			visible={openModal}
			closable={true}
			onCancel={onCancel}
			titleText={showTitle(modalType)}
			showFooter={false}
		>
			{recordData?.loading ? (
				<Skeletons items={4} fullWidth />
			) : (
				<Form className={styles.form} onFinish={onFinish} form={form}>
					{(recordData?.error && modalType === "publish") && (
						<CustomErrorAlert
							description={`
							${recordData?.error} \n 
							${recordData?.error === "You must upload the attatched documents to publish this organization" ?
									`Document:` : ""}`}
							isClosable
							onClose={handleAlertClose}
						/>
					)}

					{modalType === "freeCredit" && (
						<>
							<div>
								<Form.Item
									name="credit"
									rules={[
										{
											required: true,
											message:
												"Please enter the amount of credit you want to gift this organization.",
										},
									]}
								>
									<CustomInput
										type="text"
										label="Credit"
										asterisk
										placeHolder="Enter credit amount"
										className="w-100"
									/>
								</Form.Item>
							</div>

							<div>
								<Form.Item
									name="remarks"
									rules={[
										{
											required: true,
											message:
												"Please tell us why you want to gift this organization free credits.",
										},
									]}
								>
									<CustomInput
										type="textArea"
										label="Please tell us why you want to gift this organization free credits"
										asterisk
										placeHolder="Please tell us why you want to gift this organization free credits"
									/>
								</Form.Item>
							</div>
						</>
					)}

					{(modalType === "publish" || modalType === "viewDocuments") && (
						<>
							{Object.entries([]).map(([key, value], index) => {
								const document = recordData?.data?.organizationFileManagement?.filter((item: any) => {
									return item.documentType === key
								})

								return (
									<div
										key={`org-documents${index}`}
										className={`${document?.length === 0 ? ComponentStyles.upload : ComponentStyles.view}`}
									>
										<div className={ComponentStyles.item_header}>
											{/* <div className="font-weight-bold">{value}</div> */}

											<div className={styles.uploadBtn}>
												<Upload {...propsForUpload}>
													<CustomButton
														type="outlined"
														onClick={() => {
															setDocumentType(key);
														}}
														size={'xs'}
													>
														Upload
													</CustomButton>
												</Upload>
											</div>
										</div>

										{document && (document?.map((ele: any, ind: number) => (
											<div className={ComponentStyles.view_item} key={`documents-${ind}`}>
												<a
													className="my-auto cursor-pointer text-underline" data-link={ele?.path}
													href={`${BASE_URL}resources/property-resources/${ele.path}?authKey=${access_token}`}
													target="_blank"
													rel="noreferrer"
												>
													{ele.name}
												</a>
											</div>
										)))}
									</div>
								)
							})}

							{type.force === true && (
								<div className="mt-2">
									<Form.Item
										name="message"
										rules={[
											{
												required: true,
												message:
													"Please tell us why you want to force publish this organization.",
											},
										]}
									>
										<CustomInput
											type="textArea"
											label="Please tell us why you want to force publish this organization"
											asterisk
											placeHolder="Please tell us why you want to force publish this organization"
										/>
									</Form.Item>
								</div>
							)}
						</>
					)}

					{modalType === "suspend" && (
						<Form.Item
							name="message"
							rules={[
								{
									required: true,
									message:
										"Please tell us why you want to suspend this organization.",
								},
							]}
						>
							<CustomInput
								type="textArea"
								label="Please tell us why you want to suspend this organization"
								asterisk
								placeHolder="Please tell us why you want to suspend this organization"
							/>
						</Form.Item>
					)}

					<div className={styles.footer}>
						<CustomButton
							size="normal"
							fontSize="sm"
							onClick={onCancel}
							type="plain"
						>
							Cancel
						</CustomButton>

						{modalType === "publish" && (
							<CustomButton
								type="secondary"
								size="normal"
								fontSize="sm"
								htmlType="submit"
								loading={recordData?.buttonLoading}
								onClick={() => {
									setType({ normal: false, force: true })
									// if there is error data, close it 
									recordData?.error && handleAlertClose()
								}}
							>
								Force Publish
							</CustomButton>
						)}

						{modalType !== "viewDocuments" && (
							<CustomButton
								type="primary"
								size="normal"
								fontSize="sm"
								htmlType="submit"
								loading={recordData?.buttonLoading}
								onClick={() => {
									(modalType === "publish") && setType({ normal: true, force: false })
								}}
							>
								{showButtonText(modalType)}
							</CustomButton>
						)}
					</div>
				</Form>
			)}
		</CustomModal >
	);
};

export default PublishOrgModal;
