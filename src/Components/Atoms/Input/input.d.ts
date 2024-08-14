import React, { StyleHTMLAttributes } from "react";

export type AppProps = {
	children?: string;
	size: "sm" | "md" | "lg" | "xl" | "w100";
	type: "text" | "password" | "textArea" | "number" | "email" | "phone" | "url" | "color"
	label?: string | JSX.Element;
	lableType: "floatingLabel" | "normalLabel";
	placeHolder: string;
	icon?: React.ReactElement;
	onChange: React.ChangeEventHandler<HTMLInputElement> | ChangeEventHandler<HTMLTextAreaElement>;
	asterisk: boolean;
	hint: string;
	rows?: number;
	maxLength?: number;
	showCount: boolean;
	suffix?: string | React.ReactElement;
	prefix?: string | React.ReactElement;
	allowClear?: boolean;
	value?: string | number;
	defaultValue?: string | number;
	disabled?: boolean;
	className?: string;
	addonBefore?: React.ReactNode;
	addonAfter?: React.ReactNode;
	name?: string;
	helperText?: string;
	autoSize?: Object;
	onClick?: React.MouseEventHandler<HTMLElement>;
	style?: React.CSSProperties
};
