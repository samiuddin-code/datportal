import { FC, useState } from "react";
import { Form } from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import Typography from "../Headings";
import CustomSelect from "../Select";
import CustomInput from "../Input";
import CustomButton from "../Button";
// import { PriceTypesEnum } from "../../../helpers/commonEnums";
import styles from "./styles.module.scss";
import { handleNumberChange } from "../../../helpers/common";

interface PricePaymentInfoProps {
	title: string;
	form: any;
	formName: string;
}

const PricePaymentInfo: FC<PricePaymentInfoProps> = ({ title, form, formName }) => {
	const [selectedItem, setSelectedItem] = useState<string[]>([])

	return (
		<div className={styles.addLanguagesWrap}>
			<Typography color="dark-main" weight="bold">
				{title}
			</Typography>

			<Form.List
				name={formName}
			// initialValue={[
			// 	{
			// 		priceType: PriceTypesEnum.monthly,
			// 		price: "",
			// 	},
			// ]}
			>
				{(fields, { add, remove }) => (
					<div className="mt-2">
						{fields.map(({ key, name, ...restField }) => (
							<div className={styles.addLanguages} key={key}>
								<div>
									<Form.Item
										{...restField}
										name={[name, "price"]}
										rules={[
											{
												required: true,
												message: "Missing Price",
											},
										]}
									>
										<CustomInput
											size="w100"
											label={"Price"}
											asterisk
											placeHolder="Add a price"
											onChange={(event: any) => {
												const params = {
													event: event,
													form: form,
													formName: formName,
													isArray: true,
													arrayFields: {
														index: name,
														name: "price",
													}
												};
												handleNumberChange(params);
											}}
										/>
									</Form.Item>
									<Form.Item
										{...restField}
										name={[name, "priceTypeSlug"]}
										rules={[
											{
												required: true,
												message: "Missing Price Type",
											},
										]}
									>
										<CustomSelect
											asterisk
											label={"Price type"}
											placeholder="Select price type"
											//disabled={name === 0}
											// on select, add the value to the selected item array
											onChange={(value) => {
												setSelectedItem([...selectedItem, value])
											}}
										// options={
										// 	name === 0
										// 		? Object.entries(PriceTypesEnum).map(([key, value]) => ({
										// 			label: value,
										// 			value: key,
										// 		}))
										// 		:
										// 		// remove the selected item from the options
										// 		Object.entries(PriceTypesEnum).map(([key, value]) => ({
										// 			label: value,
										// 			value: key,
										// 		}))
										// 	//.filter((item) => !selectedItem.includes(item.value))

										// }
										/>
									</Form.Item>

									<CustomButton
										onClick={() => remove(name)}
										type="primary"
										size="normal"
										fontSize="sm"
										disabled={name === 0 ? true : false}
									>
										<CloseOutlined />
									</CustomButton>
								</div>
							</div>
						))}
						{/* <CustomButton
							disabled={Object.keys(PriceTypesEnum).length <= fields.length}
							type="primary"
							size="xs"
							fontSize="xs"
							onClick={() => add()}
						>
							<PlusOutlined /> Add a price type
						</CustomButton> */}
					</div>
				)}
			</Form.List>
		</div>
	);
};

export default PricePaymentInfo;
