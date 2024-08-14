import { useEffect, useCallback, useMemo, useState } from "react";
import { Form, message } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton,
	ImageUploader,
	CustomSelect,
} from "../../../Atoms";
import styles from "../../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { BiometricsBulkUploadJobModule } from "../../../../Modules/BulkUploadFormat/Job";
import {
	//BulkUploadJobTypes,
	PropertyBulkUploadJobResponseObject
} from "../../../../Modules/BulkUploadFormat/Job/types";
import { PropTypes } from "../../Common/common-types";
import { useDebounce } from "../../../../helpers/useDebounce";
import { OrganizationType } from "../../../../Modules/Organization/types";
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { BulkUploadFormatTypes } from "../../../../Modules/BulkUploadFormat/Format/types";
import { BulkUploadFormatModule } from "../../../../Modules/BulkUploadFormat/Format";
import { BulkUploadJobPermissionsEnum } from "../../../../Modules/BulkUploadFormat/Job/permissions";

interface BulkUploadJobModalProps extends PropTypes {
	record: number;
	permissions: { [key in BulkUploadJobPermissionsEnum]: boolean };
}

export const SitePropertyBulkUploadJobModal = (props: BulkUploadJobModalProps) => {
	const {
		openModal, onCancel, type, record, reloadTableData,
		permissions: { createBiometricsJob, updateBiometricsJob }
	} = props;
	const [form] = Form.useForm();
	const module = useMemo(() => new BiometricsBulkUploadJobModule(), []);
	const uploadFormatModule = useMemo(() => new BulkUploadFormatModule(), []);

	const [recordData, setRecordData] = useState<Partial<PropertyBulkUploadJobResponseObject>>();
	const [uploadFormats, setUploadFormats] = useState<BulkUploadFormatTypes[]>([]);

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

	// on finish for the form
	const onFinish = (formValues: any) => {
		setRecordData({ ...recordData, buttonLoading: true });
		const formData = new FormData();
		if (type === "new") {
			const excludeFields = ["file"];
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

		}

		switch (type) {
			case "edit": {
				if (updateBiometricsJob === true) {
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
					message.error("You don't have permission to update bulk upload job");
				}
				break;
			}
			case "new": {
				if (createBiometricsJob === true) {
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
					message.error("You don't have permission to create bulk upload job");
				}
				break;
			}
		}
	};

	const getUploadFormats = useCallback(() => {
		uploadFormatModule.getAllPublishedRecords().then((res) => {
			setUploadFormats(res?.data?.data)
		}).catch((err) => {
			message.error(err.response.data.message)
		})
	}, [uploadFormatModule])

	// get data by id for edit
	const getDataBySlug = useCallback(() => {
		setRecordData({ loading: true });
		module.getRecordById(record).then((res) => {
			const organization = res?.data?.data?.organization as OrganizationType;
			const data = res?.data?.data

			setRecordData({ ...res.data, loading: false });
			form.setFieldsValue({
				...data,
				organizationId: organization?.id,
			});
		}).catch((err) => {
			handleErrors(err);
		});
	}, [form, record, module]);

	useEffect(() => {
		if (type === "edit") {
			getDataBySlug();
			// get the upload formats
			getUploadFormats();
		} else {
			form.resetFields();
			// get the upload formats
			getUploadFormats();
		}
	}, [type, form]);

	return (
		<CustomModal
			visible={openModal}
			closable={true}
			onCancel={onCancel}
			titleText={type === "edit" ? "Edit Bulk Upload Job" : "Add New Bulk Upload Job"}
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
							name="title"
							rules={[
								{
									required: true,
									message: "Please add a title"
								}
							]}
						>
							<CustomInput
								size="w100"
								label={"Title"}
								asterisk
								type="text"
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item
							name="uploadFormatId"
							rules={[
								{
									required: true,
									message: "Please add upload format id"
								}
							]}
						>
							<CustomSelect
								label={"Upload Format"}
								asterisk
								options={uploadFormats?.map((item) => ({
									label: item?.title,
									value: item?.id
								}))}
							/>
						</Form.Item>
					</div>

					{type === "new" && (
						<ImageUploader
							name="file"
							// accept only json file
							accept=".json,.xlsx,.csv"
						/>
					)}

					{type === "edit" && (
						<div className="flex flex-col">
							<label className="font-size-normal">File:</label>
							<a
								href={`${RESOURCE_BASE_URL}${recordData?.data?.file}`}
								target="_blank"
								rel="noopener noreferrer"
								className="color-blue-yp font-size-normal"
							>
								{recordData?.data?.file?.split("public/bulk-upload/")?.pop()}
							</a>
						</div>
					)}

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
