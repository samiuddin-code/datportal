import { Form, Switch, message } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton
} from "../../../Atoms";
import styles from "../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useState } from "react";
import { handleError, slugifyString } from "../../../../helpers/common";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { WorkingHoursModule } from "../../../../Modules/WorkingHours";
import { WorkingHourResponseObject } from "../../../../Modules/WorkingHours/types";
import { PropTypes } from "../../Common/common-types";
import { WorkingHourPermissionSet } from "../../../../Modules/WorkingHours/permissions";
import { DaysInAWeek } from "./DaysInAWeek";

export const BusinessHours = [
	{
		day: 0,
		name: "sunday",
		open: null,
		close: null,
		closed: true,
	},
	{
		day: 1,
		name: "monday",
		open: '09:00',
		close: '18:00',
		closed: false,
	},
	{
		day: 2,
		name: "tuesday",
		open: '09:00',
		close: '18:00',
		closed: false,
	},
	{
		day: 3,
		name: "wednesday",
		open: '09:00',
		close: '18:00',
		closed: false,
	},
	{
		day: 4,
		name: "thursday",
		open: '09:00',
		close: '18:00',
		closed: false,
	},
	{
		day: 5,
		name: "friday",
		open: '09:00',
		close: '18:00',
		closed: false,
	},
	{
		day: 6,
		name: "saturday",
		open: null,
		close: null,
		closed: true,
	},
]

interface WorkingHourModalProps extends PropTypes {
	record: number;
	permissions: { [key in WorkingHourPermissionSet]: boolean };
}

export const WorkingHourModal = (props: WorkingHourModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: {
			createWorkingHour, updateWorkingHour
		}
	} = props;
	const [form] = Form.useForm();
	const module = new WorkingHoursModule()
	const [recordData, setRecordData] = useState<Partial<WorkingHourResponseObject>>();

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
					openingHours: (res.data?.data && res.data?.data?.hours) ? res.data?.data?.hours : undefined
				});
				setRecordData({ ...res.data, loading: false });
			}
		}).catch((err) => {
			handleErrors(err);
		});
	}, [form]);

	useEffect(() => {
		if (type === "edit") {
			getDataBySlug();
		} else {
			form.resetFields();
		}
	}, [openModal, type]);

	const handleSlugChange = ({ target }: any) => {
		let slug = slugifyString(target.value); 
		form.setFieldsValue({ slug: slug });
	};

	const onFinish = (formValues: any) => {
		setRecordData({ ...recordData, buttonLoading: true });

		switch (type) {
			case "edit": {
				if (updateWorkingHour === true) {
					module.updateRecord(formValues, record).then((res) => {
						reloadTableData();
						onCancel();
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					}).catch((err) => {
						handleErrors(err);
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
						let error = handleError(err);
						message.error(error);
					});
				} else {
					setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					message.error("You don't have permission to update this record");
				}
				break;
			}
			case "new": {
				if (createWorkingHour === true) {
					module.createRecord(formValues).then((res) => {
						reloadTableData();
						onCancel();
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
					}).catch((err) => {
						handleErrors(err);
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
						let error = handleError(err);
						message.error(error);
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
			titleText={type === "edit" ? "Edit Working Hours" : "Add New Working Hour"}
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
							<CustomInput size="w100" label={"Title"} asterisk type="text" placeHolder="Enter title" />
						</Form.Item>
					</div>
					<div>
						<div>
						<label style={{marginBottom: "20px", display: "block", fontWeight: "600", borderBottom: "1px solid #ddd"}}>Opening Hours</label>
					<Form.List
					name="openingHours"
					initialValue={recordData?.data && recordData.data.hours ? recordData.data.hours : BusinessHours}
					// initialValue={BusinessHours}
				>
					{(fields, { add, remove }) => (
						<>
							{fields.map(({ key, name, ...restField }) => {
								return <DaysInAWeek key={key} name={name} record={recordData} formData={form} businessHours={form.getFieldValue("openingHours")} />
							})}
						</>
					)}

				</Form.List>
						</div>
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
							{type === "edit" ? "Edit Working Hours" : "Add Working Hours"}
						</CustomButton>
					</div>
				</Form>
			)}
		</CustomModal>
	);
};
