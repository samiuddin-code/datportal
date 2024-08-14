import { Form } from "antd";
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
import { getLanguageData } from "../../../../Redux/Reducers/LanguageReducer/action";
import { dispatchType } from "../../../../Redux/Reducers/commonTypes";

export const LanguageModal = (props: propsTrype) => {
	const { openModal, onCancel, onFinish, buttonLoading, initialValues, type } = props;
	const dispatch = useDispatch<dispatchType>();
	const [form] = Form.useForm();

	const { addLanguageData, singleLanguageData, editLanguageData } = useSelector(
		(state: RootState) => state.languageReducer
	);

	const errorData = type === "new" ? addLanguageData.errorData : editLanguageData.errorData;

	useEffect(() => {
		if (type === "edit") {
			form.setFieldsValue({
				...singleLanguageData.data,
				isPublished: singleLanguageData.data?.isPublished,
			});
		} else {
			form.resetFields();
		}
	}, [type, form, singleLanguageData]);

	useEffect(() => {
		if (type === "edit") {
			dispatch(getLanguageData(initialValues.id));
		}
	}, [dispatch, initialValues.id, type]);

	return (
		<CustomModal
			visible={openModal}
			onCancel={onCancel}
			titleText={type === "edit" ? "Edit Language" : "Add Language"}
			showFooter={false}
		>
			{singleLanguageData.loading ? (
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
									message: "Please add language name",
								},
							]}
						>
							<CustomInput size="w100" label={"Name"} asterisk type="text" />
						</Form.Item>
						<Form.Item
							name="nativeName"
							rules={[{ required: true, message: "Please add  native name" }]}
						>
							<CustomInput size="w100" label={"Native Name"} asterisk type="text" />
						</Form.Item>
					</div>
					<div>
						<Form.Item
							name="code"
							rules={[
								{
									required: true,
									message: "Please add iso code",
								},
							]}
						>
							<CustomInput size="w100" label={"ISO Code"} asterisk type="text" />
						</Form.Item>
						<Form.Item name="isPublished">
							<CustomSelect
								label={"Published"}
								options={[
									{ value: true, label: "Yes" },
									{ value: false, label: "No" },
								]}
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
