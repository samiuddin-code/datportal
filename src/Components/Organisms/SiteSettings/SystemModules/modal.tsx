import { Form, Upload, UploadProps } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton,
	CustomSelect,
} from "../../../Atoms";
import { propsTrype } from "./settings";
import styles from "./styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { getSystemModulesData } from "../../../../Redux/Reducers/SystemModulesReducer/action";
import { dispatchType } from "../../../../Redux/Reducers/commonTypes";
// import { errorHandler } from "../../../../helpers";

export const SystemModulesModal = (props: propsTrype) => {
	const { openModal, onCancel, onFinish, buttonLoading, initialValues, type } = props;
	const dispatch = useDispatch<dispatchType>();
	const [form] = Form.useForm();

	const uploadProps: UploadProps = {
		name: "file",
		listType: "picture",
		multiple: false,
		beforeUpload: () => false,
		maxCount: 1,
	};

	const { addSystemModuleData, singleSystemModuleData, editSystemModuleData } = useSelector(
		(state: RootState) => state.systemModulesReducer
	);

	const errorData = type === "new" ? addSystemModuleData.errorData : editSystemModuleData.errorData;

	useEffect(() => {
		if (type === "edit") {
			form.setFieldsValue({
				...singleSystemModuleData.data,
				isMenuItem: singleSystemModuleData.data?.isMenuItem,
			});
		} else {
			form.resetFields();
		}
	}, [type, form, singleSystemModuleData]);

	useEffect(() => {
		if (type === "edit") {
			dispatch(getSystemModulesData(initialValues.id));
		}
	}, [dispatch, initialValues.id, type]);

	return (
		<CustomModal
			visible={openModal}
			onCancel={onCancel}
			titleText={type === "edit" ? "Edit System Module" : "Add System Module"}
			showFooter={false}
		>
			{singleSystemModuleData.loading ? (
				<Skeletons items={4} />
			) : (
				<Form className={styles.form} onFinish={onFinish} form={form}>
					{errorData?.statusCode ? (
						<CustomErrorAlert description={errorData?.message} isClosable />
					) : null}

					<div>
						<Form.Item
							name="name"
							rules={[
								{
									required: true,
									message: "Please add system module name",
								},
							]}
						>
							<CustomInput size="w100" label={"Name"} asterisk type="text" />
						</Form.Item>

						<Form.Item name="slug" rules={[{ required: true, message: "Please add a slug" }]}>
							<CustomInput size="w100" label={"Slug"} asterisk type="text" />
						</Form.Item>
					</div>
					<div>
						<Form.Item name="url" rules={[{ required: false, message: "Please add a url" }]}>
							<CustomInput size="w100" label={"URL"} type="text" />
						</Form.Item>
						<Form.Item name="order" rules={[{ required: true, message: "Please add order" }]}>
							<CustomInput size="w100" label={"Order"} asterisk type="number" />
						</Form.Item>
					</div>
					<div>
						<Form.Item
							name="description"
							rules={[
								{
									required: false,
									message: "Please add a description",
								},
							]}
						>
							<CustomInput size="w100" label={"Description"} type="text" />
						</Form.Item>

						<Form.Item name="isMenuItem">
							<CustomSelect
								label={"Menu Item"}
								options={[
									{ value: true, label: "Yes" },
									{ value: false, label: "No" },
								]}
							/>
						</Form.Item>
					</div>
					<div>
						<Form.Item name="icon">
							<Upload.Dragger {...uploadProps}>
								<p className="ant-upload-drag-icon">
									<img src="/images/picture.svg" alt="" />
								</p>
								<p className="ant-upload-hint">Drag image here or click to upload</p>
							</Upload.Dragger>
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
							loading={buttonLoading}
						>
							Submit
						</CustomButton>
					</div>
				</Form>
			)}
		</CustomModal>
	);
};
