import { FC } from "react";
import { Form } from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import Typography from "../Headings";
import CustomSelect from "../Select";
import CustomInput from "../Input";
import CustomButton from "../Button";
import {
	// defaultLanguage,
	// LanguagesEnum,
	SYSTEM_DEFAULT_LANGUAGE,
} from "../../../helpers/commonEnums";
import styles from "./styles.module.scss";
import { RichTextEditor } from "../RichTextEditor";

interface LocalizationProps {
	form?: any
	formName: string;
	title: string;
	label?: boolean;
	description?: boolean;
	normalDescription?: boolean
	highlight?: boolean;
	isRichTextEditor?: boolean;
	defaultValue?: { [key: string]: string }[];
	forLocation?: boolean;
}

const Localization: FC<LocalizationProps> = ({
	form, formName, title, label, description,
	highlight, isRichTextEditor = true, forLocation
}) => {
	return (
		<div className={styles.addLanguagesWrap}>
			<Typography color="dark-main" weight="bold">
				{title}
			</Typography>

			<Form.List
				name={formName}
				initialValue={[
					{
						language: SYSTEM_DEFAULT_LANGUAGE,
						title: "",
					},
				]}
			>
				{(fields, { add, remove }) => (
					<>
						{fields.map(({ key, name, ...restField }) => (
							<div className={styles.addLanguages} key={key}>
								<div>
									<Form.Item
										{...restField}
										name={[name, "language"]}
										rules={[
											{
												required: true,
												message: "Missing Language",
											},
										]}
									>
										<CustomSelect
											asterisk
											label={"Language"}
											placeholder="Select Language"
											disabled={name === 0}
											options={[]}
										/>
									</Form.Item>
									<Form.Item
										{...restField}
										name={[name, forLocation ? "name" : "title"]}
										rules={[
											{
												required: true,
												message: `Missing ${forLocation ? "Location Name" : "Title"}`,
											},
										]}
									>
										<CustomInput
											size="w100"
											label={forLocation ? "Location Name" : "Title"}
											asterisk
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

								{label && (
									<div className="mt-3">
										<Form.Item
											{...restField}
											name={[name, "label"]}
											rules={[
												{
													required: true,
													message: "Missing label",
												},
											]}
										>
											<CustomInput size="w100" label={"Label"} asterisk />
										</Form.Item>
									</div>
								)}

								{highlight && (
									<div className="mt-3">
										<Form.Item
											{...restField}
											name={[name, "highlight"]}
											rules={[
												{
													required: false,
													message: "Missing highlight",
												},
											]}
										>
											<CustomInput
												size="w100"
												label={"Highlight"}
												asterisk
												type="textArea"
												placeHolder="Please write highlight"
												// defaultValue={defaultValue ? defaultValue[name]?.highlight : ""}
												defaultValue={form?.getFieldValue(['translations', name, 'highlight'])}
											/>
										</Form.Item>
									</div>
								)}

								{description && (
									isRichTextEditor ? (
										<div className="mt-3">
											<RichTextEditor form={form} isArray={true} arrayIndex={name} formName={formName} name='description' />
										</div>
									) : (
										<div className="mt-3">
											<Form.Item
												{...restField}
												name={[name, forLocation ? "pathName" : "description"]}
												rules={[
													{
														required: false,
														message: `Missing ${forLocation ? "path name" : "description"}`,
													},
												]}
											>
												<CustomInput
													size="w100"
													label={forLocation ? "Path Name" : "Description"}
													type="textArea"
													placeHolder="Please write description"
													defaultValue={
														form?.getFieldValue([
															'translations',
															name,
															forLocation ? "pathName" : "description"
														])
													}
												/>
											</Form.Item>
										</div>
									)
								)}
							</div>
						))}
						{/* <CustomButton
							disabled={Object.keys(LanguagesEnum).length <= fields.length}
							type="primary"
							size="xs"
							fontSize="xs"
							onClick={() => add()}
						>
							<PlusOutlined /> Add More
						</CustomButton> */}
					</>
				)}
			</Form.List>
		</div>
	);
};

export default Localization;
