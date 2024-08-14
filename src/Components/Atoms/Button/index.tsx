import React from "react";
import style from "./button.module.scss";
import { Button } from "antd";
import { AppProps } from "./button";

const CustomButton = (props: AppProps) => {
	const { loading, htmlType, size, fontSize, weight, type, onClick, className, children, ...rest } = props;
	return (
		<Button
			{...rest}
			loading={loading}
			htmlType={htmlType}
			className={`${style["btn"]} ${style[size]} ${style[type]} font-weight-${weight} font-size-${fontSize} ${className}`}
			onClick={onClick}
			disabled={loading || rest.disabled}
			style={{ ...rest.style }}
		>
			{children}
		</Button>
	);
};

CustomButton.defaultProps = {
	size: "sm",
	type: "secondary",
	htmlType: "button",
	fontSize: "normal",
	weight: "normal",
	onClick: () => { },
	loading: false,
};
export default CustomButton;
