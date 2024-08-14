import { DatePicker, Form, Switch, message } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton
} from "../../../Atoms";
import styles from "../../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useState } from "react";
import { slugifyString } from "../../../../helpers/common";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { PublicHolidayModule } from "../../../../Modules/PublicHoliday";
import { CreatePublicHolidayType, PublicHolidayResponseObject, PublicHolidayType } from "../../../../Modules/PublicHoliday/types";
import { PropTypes } from "../../Common/common-types";
import { PublicHolidayPermissionSet } from "../../../../Modules/PublicHoliday/permissions";
import moment from "moment";
import { convertDate, getDifferenceInDays } from "@helpers/dateHandler";
const { RangePicker } = DatePicker;

interface PublicHolidayModalProps extends PropTypes {
	record: number;
	permissions: { [key in PublicHolidayPermissionSet]: boolean };
}

export const PublicHolidayModal = (props: PublicHolidayModalProps) => {
	const {
		openModal, onCancel, type, record,
		reloadTableData, permissions: {
			createPublicHoliday, updatePublicHoliday
		}
	} = props;
	const [form] = Form.useForm();
	const module = new PublicHolidayModule()
	const [recordData, setRecordData] = useState<Partial<PublicHolidayResponseObject>>();

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
					date: moment(res.data?.data?.date)
				});
				// setRecordData({ ...res.data, loading: false });
			}
		}).catch((err) => {
			handleErrors(err);
		});
	}, [form, record, module]);

	useEffect(() => {
		if (type === "edit") {
			// setRecordData({ loading: true });
			getDataBySlug();
		} else {
			form.resetFields();
		}
	}, [openModal, type, form, getDataBySlug]);


	const onFinish = (formValues: any) => {
		// setRecordData({ ...recordData, buttonLoading: true });

		switch (type) {
			// case "edit": {
			// 	if (createPublicHoliday === true) {
			// 		module.updateRecord(formValues, record).then((res) => {
			// 			reloadTableData();
			// 			onCancel();
			// 			setRecordData((prev) => ({ ...prev, buttonLoading: false }));
			// 		}).catch((err) => {
			// 			handleErrors(err);
			// 			setRecordData((prev) => ({ ...prev, buttonLoading: false }));
			// 		});
			// 	} else {
			// 		setRecordData((prev) => ({ ...prev, buttonLoading: false }));
			// 		message.error("You don't have permission to update this record");
			// 	}
			// 	break;
			// }
			case "new": {
				if (updatePublicHoliday === true) {
					let allDates : string[] = [];
					let d1 = formValues?.dateRange[0]["_d"];
					let d2 = formValues?.dateRange[1]["_d"];
					console.log(formValues.dateRange);
					let daysDifference = getDifferenceInDays(d1, d2);
					if(Math.abs(daysDifference) > 365){
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
						message.error("Could not submit the data. Date range is larger than 365 days");
						return;
					}

					let startDate = new Date(d1);
					let endDate = new Date(d2);
					while(startDate <= endDate){
						let dt = startDate.toISOString();
						if(dt && !allDates.includes(dt)){
							allDates.push(dt);
						}
						startDate.setDate(startDate.getDate() + 1);
					}

					let createDto : CreatePublicHolidayType = {
						title: formValues.title,
						dates: allDates
					}

					if(allDates.length === 0){
						setRecordData((prev) => ({ ...prev, buttonLoading: false }));
						message.error("Please choose at least one date");
						return;
					}
					module.createRecord(createDto).then((res) => {
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
			titleText={type === "edit" ? "Edit Public Holiday" : "Add New Public Holiday"}
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
							<CustomInput size="w100" label={"Title"} asterisk type="text" placeHolder="Enter Title" />
						</Form.Item>
					</div>
					<div>
						<Form.Item name="dateRange" rules={[{ required: true, message: "Please choose date range" }]}>
							<RangePicker style={{ width: '100%' }} />
						</Form.Item>
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
							{type === "edit" ? "Edit Public Holiday" : "Add Public Holiday"}
						</CustomButton>
					</div>
				</Form>
			)}
		</CustomModal>
	);
};
