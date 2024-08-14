import { Form } from "antd";
import {
	CustomInput,
	CustomModal,
	CustomErrorAlert,
	CustomButton,
	CustomSelect,
} from "../../../Atoms";
import { propsTrype } from "./areaUnitSettings";
import styles from "./styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { getAreaUnitData } from "../../../../Redux/Reducers/AreaUnitReducer/action";
import { dispatchType } from "../../../../Redux/Reducers/commonTypes";

export const AreaUnitModal = (props: propsTrype) => {
	const {
		openModal, onCancel, onFinish, buttonLoading,
		initialValues, type,
	} = props;
	const dispatch = useDispatch<dispatchType>();
	const [form] = Form.useForm();
	const { addAreaUnitData, singleAreaUnitData, editAreaUnitData } = useSelector(
		(state: RootState) => state.areaUnitReducer
	);

	const errorData = type === "new" ? addAreaUnitData.errorData : editAreaUnitData.errorData;

	useEffect(() => {
		if (type === "edit") {
			form.setFieldsValue({
				...singleAreaUnitData.data,
				isPublished: singleAreaUnitData.data?.isPublished,
			});
		} else {
			form.resetFields();
		}
	}, [type, form, singleAreaUnitData]);

	useEffect(() => {
		if (type === "edit") {
			dispatch(getAreaUnitData(initialValues.id));
		}
	}, [dispatch, initialValues.id, type]);

	return (
		<CustomModal
			visible={openModal}
			onCancel={onCancel}
			titleText={type === "edit" ? "Edit Area Unit" : "Add Area Unit"}
			showFooter={false}
		>
			{singleAreaUnitData.loading ? (
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
									message: "Please add area unit name",
								},
							]}
						>
							<CustomInput size="w100" label={"Name"} asterisk type="text" />
						</Form.Item>
						<Form.Item name="symbol" rules={[{ required: true, message: "Please add  a symbol" }]}>
							<CustomInput size="w100" label={"Symbol"} asterisk type="text" />
						</Form.Item>
					</div>
					<div>
						<Form.Item
							name="rate"
							rules={[
								{
									required: true,
									message: "Please add a rate",
								},
							]}
						>
							<CustomInput size="w100" label={"Rate"} asterisk type="text" />
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
