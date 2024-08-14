import { Form, message } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton,
	SelectWithSearch,
} from "../../../Atoms";
import styles from "../../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useMemo, useState } from "react";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { TaskResponseObject } from "../../../../Modules/Task/types";
import { ProjectModule } from "../../../../Modules/Project";
import { ProjectTypes } from "../../../../Modules/Project/types";
import { ProjectComponentModule } from "../../../../Modules/Project-Components";
import { ProjectComponentType } from "../../../../Modules/Project-Components/types";
import { DiaryModule } from "../../../../Modules/Diary";
import { DiaryPermissionsEnum } from "../../../../Modules/Diary/permissions";
import { useDebounce } from "../../../../helpers/useDebounce";

interface DiaryModalProps {
	openModal: boolean;
	permissions: { [key in DiaryPermissionsEnum]: boolean };
	onCancel: () => void;
}

export const DiaryModal = (props: DiaryModalProps) => {
	const {
		openModal, onCancel, permissions: {
			createDairy
		}
	} = props;
	const [form] = Form.useForm();
	const [recordData, setRecordData] = useState<Partial<TaskResponseObject>>();
	const projectModule = useMemo(() => new ProjectModule(), []);
	const projectComponentModule = useMemo(() => new ProjectComponentModule(), []);
	const diaryModule = useMemo(() => new DiaryModule(), []);
	// Project Search Term
	const [searchTermProject, setSearchTermProject] = useState("");
	const debouncedSearchTermProject = useDebounce(searchTermProject, 500);
	const [projectOptions, setProjectOptions] = useState<ProjectTypes[]>([])
	// ProjectComponent
	const [projectComponentOptions, setProjectComponentOptions] = useState<ProjectComponentType[]>([])


	// Project Search
	const onProjectSearch = () => {
		if (debouncedSearchTermProject) {
			projectModule.getAllRecords({ title: debouncedSearchTermProject }).then((res) => {

				const { data } = res;

				setProjectOptions((prev) => {
					// if the data is already present in the state, then don't add it again
					const filteredData = data?.data?.filter((item) => {
						return !prev?.find((prevItem) => prevItem.id === item.id);
					});
					// add the new data to the existing data
					return [...prev, ...filteredData];
				})
			}).catch((err) => {
				message.error(err.response.data.message)
			})
		}
	}

	useEffect(() => {
		onProjectSearch()
	}, [debouncedSearchTermProject])

	// Project Component Search
	const onProjectComponentSearch = () => {
		projectComponentModule.getAllRecords()
			.then((res) => {
				setProjectComponentOptions(res.data.data);
			}).catch((err) => {
				message.error(err.response.data.message);
			})
	}

	useEffect(() => {
		onProjectComponentSearch()
	}, [])


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

	const onFinish = (formValues: any) => {
		setRecordData({ ...recordData, buttonLoading: true });
		if (createDairy === true) {
			diaryModule.createRecord({ ...formValues })
				.then((res) => {
					console.log(res.data);
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
			titleText={"Today's Diary"}
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
						{/** Project */}
						<Form.Item
							name="projectId"
							rules={[
								{ required: true, message: "Please select a project" },
							]}
						>
							<SelectWithSearch
								label='Select Project'
								onSearch={(value) => setSearchTermProject(value)}
								options={projectOptions?.map((item) => ({
									label: `${item.referenceNumber} | ${item.title}`,
									value: item.id,
								}))}
								onChange={(value) => form.setFieldsValue({
									projectId: value,
								})}
							/>
						</Form.Item>
					</div>

					<div>
						{/** Task Type */}
						<Form.Item
							name="taskTypeId"
							rules={[
								{ required: true, message: "Please select a task" },
							]}
						>
							<SelectWithSearch
								label='Select Task'
								options={projectComponentOptions?.map((item) => ({
									label: item.title,
									value: item.id,
								}))}
								onChange={(value) => form.setFieldsValue({
									taskTypeId: value,
								})}
								onSearch={() => { }}
							/>
						</Form.Item>
					</div>

					<div>
						<Form.Item name="noOfHours" rules={[{ required: true, message: "Please add number of hours", pattern: new RegExp(/^\d+(\.\d+)?$/) }]}>
							<CustomInput size="w100" label={"Number of hours"} asterisk type="number" placeHolder="Enter Number of hours" />
						</Form.Item>
					</div>


					<div>
						<Form.Item name="remarks">
							<CustomInput
								size="w100"
								label={"Remarks"}
								type="textArea"
							/>
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
							Add Diary
						</CustomButton>
					</div>
				</Form>
			)}
		</CustomModal>
	);
};
