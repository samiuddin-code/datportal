import { Input, InputNumber, Tooltip } from "antd";
import styles from "./input.module.scss";
import { UnlockOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { AppProps } from "./input";

const passwordPrefix = (
	<span className={styles.prefixIcon}>
		<UnlockOutlined />
	</span>
);

const CustomInput = (props: AppProps) => {
	const {
		style,
		children,
		size,
		type,
		label,
		lableType,
		placeHolder,
		icon,
		onChange,
		asterisk,
		hint,
		showCount,
		disabled,
		className,
		defaultValue,
		value,
		name,
		prefix = "",
		helperText,
		autoSize,
		...rest
	} = props;

	return (
		<>
			{label ? (
				<label className={styles.labelWrap}>
					<span>{label}</span>
					{hint ? (
						<Tooltip title={hint}>
							<InfoCircleOutlined />
						</Tooltip>
					) : null}
					{asterisk ? <span className={styles.asterisk}>*</span> : null}
				</label>
			) : null}
			{type === "password" ? (
				<Input.Password
					onChange={onChange}
					{...rest}
					showCount={showCount}
					disabled={disabled}
					prefix={passwordPrefix}
					placeholder={placeHolder}
					className={`${styles["inpt"]} ${styles[size]} ${styles[type]} ${className}`}
					autoComplete={"false"}
					style={style}
					name={name}
				/>
			) : type === "textArea" ? (
				<Input.TextArea
					onChange={onChange}
					disabled={disabled}
					showCount={showCount}
					placeholder={placeHolder}
					className={`${styles["inpt"]} ${className}`}
					autoSize={autoSize || { minRows: 2 }}
					defaultValue={defaultValue}
					name={name}
					style={style}
					{...rest}
				/>
			) : type === "number" ? (
				<InputNumber
					onChange={onChange}
					{...rest}
					disabled={disabled}
					prefix={icon ? <span className={styles.prefixIcon}>{icon}</span> : null}
					placeholder={placeHolder}
					className={`${styles["inpt"]} ${styles[size]} ${styles[type]} ${className}`}
					defaultValue={defaultValue}
					style={style}
					name={name}
				/>
			) : type === "color" ? (
				<Input
					onChange={onChange}
					{...rest}
					type="color"
					disabled={disabled}
					defaultValue={defaultValue}
					prefix={icon ? <span className={styles.prefixIcon}>{icon}</span> : null}
					placeholder={placeHolder}
					style={style}
					name={name}
				/>
			) : (
				<Input
					onChange={onChange}
					{...rest}
					value={value}
					disabled={disabled}
					prefix={icon ? <span className={styles.prefixIcon}>{icon}</span> : prefix}
					placeholder={placeHolder}
					className={`${styles["inpt"]} ${styles[size]} ${styles[type]} ${className}`}
					defaultValue={defaultValue}
					style={style}
					name={name}
				/>
			)}
			{helperText ? (
				<small className={styles.helperText}>{helperText}</small>
			) : null}
		</>
	);
};
CustomInput.defaultProps = {
	size: "md",
	type: "text",
	lableType: "normalLabel",
	placeHolder: "Enter Value",
	onChange: () => { },
	asterisk: false,
	hint: "",
	showCount: false,
	disabled: false,
};
export default CustomInput;
