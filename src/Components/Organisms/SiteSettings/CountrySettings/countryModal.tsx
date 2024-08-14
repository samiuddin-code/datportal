import { Form, Upload } from "antd";
import CustomInput from "../../../Atoms/Input";
import CustomModal from "../../../Atoms/Modal";
import { propsTrype } from "./countrySettings";
import styles from "./styles.module.scss";
import { UploadChangeParam, UploadFile } from "antd/lib/upload";
import CustomSelect from "../../../Atoms/Select";
import CustomButton from "../../../Atoms/Button";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getLanguageData } from "../../../../Redux/Reducers/LanguageReducer/action";
import { getCurrencyData } from "../../../../Redux/Reducers/currencyReducer/action";
import { getAreaUnitData } from "../../../../Redux/Reducers/AreaUnitReducer/action";
import { RootState } from "../../../../Redux/store";
import { dispatchType } from "../../../../Redux/Reducers/commonTypes";

export const CountryModal = (props: propsTrype) => {
	const { openModal, onCancel, onFinish, buttonLoading, initialValues, type } = props;
	const dispatch = useDispatch<dispatchType>();
	const { currencyDropdown } = useSelector((state: RootState) => state.currencyReducer);
	const { languageDropdown } = useSelector((state: RootState) => state.languageReducer);
	const { areaUnitDropdown } = useSelector((state: RootState) => state.areaUnitReducer);
	const [form] = Form.useForm();
	const onUploadChange = (info: UploadChangeParam<UploadFile>) => {
		info.file.status = "done";
	};
	useEffect(() => {
		dispatch(getLanguageData());
		dispatch(getCurrencyData());
		dispatch(getAreaUnitData());
	}, [dispatch]);
	useEffect(() => {
		type === "edit"
			? form.setFieldsValue({
				...initialValues,
				isPublished: initialValues?.isPublished,
			})
			: form.resetFields();
	}, [form, initialValues, type]);
	return (
		<CustomModal
			visible={openModal}
			onCancel={onCancel}
			titleText={"Add Country"}
			showFooter={false}
		>
			<Form className={styles.form} onFinish={onFinish} form={form}>
				<div>
					<Form.Item
						name="name"
						rules={[
							{
								required: true,
								message: "Please enter the country Name!",
							},
						]}
					>
						<CustomInput size="w100" label={"Name"} asterisk />
					</Form.Item>
				</div>
				<div>
					<Form.Item
						name="isoCode"
						rules={[
							{
								required: true,
								message: "Please enter the ISO Code!",
							},
						]}
					>
						<CustomInput size="w100" label={"ISO Code"} asterisk />
					</Form.Item>
					<Form.Item
						name="shortName"
						rules={[
							{
								required: true,
								message: "Please enter the Short Name!",
							},
						]}
					>
						<CustomInput size="w100" label={"Short Name"} asterisk />
					</Form.Item>
				</div>
				<div>
					<Form.Item
						name="displayName"
						rules={[
							{
								required: true,
								message: "Please enter the Display Name!",
							},
						]}
					>
						<CustomInput size="w100" label={"Display Name"} asterisk />
					</Form.Item>
					<Form.Item
						name="phoneCode"
						rules={[
							{
								required: true,
								message: "Please enter the Phone Code!",
							},
						]}
					>
						<CustomInput size="w100" label={"Phone Code"} asterisk />
					</Form.Item>
				</div>
				<div>
					<Form.Item
						name="flag"
						rules={[
							{
								required: true,
								message: "Please enter the Flag!",
							},
						]}
					>
						<CustomInput size="w100" label={"Flag"} asterisk />
					</Form.Item>
				</div>
				<div>
					<Form.Item name="defaultCurrency">
						<CustomSelect
							label={"Default Currency"}
							options={currencyDropdown}
						/>
					</Form.Item>
					<Form.Item name="defaultLanguage">
						<CustomSelect
							label={"Default Language"}
							options={languageDropdown}
						/>
					</Form.Item>
				</div>
				<div>
					<Form.Item name="enabledLanguages">
						<CustomSelect
							label={"Enabled Languages"}
							mode="multiple"
							options={languageDropdown}
						/>
					</Form.Item>
					<Form.Item name="defaultAreaUnit">
						<CustomSelect
							label={"Default Area Unit"}
							options={areaUnitDropdown}
						/>
					</Form.Item>
				</div>
				<div>
					<Form.Item
						name="isPublished"
						rules={[
							{
								required: true,
								message: "Please select an option!",
							},
						]}
					>
						<CustomSelect
							asterisk
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
		</CustomModal>
	);
};
