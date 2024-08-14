import React from "react";
import { AppProps } from "./headings";

const Typography = (props: AppProps) => {
	const { weight, size, color, lineHeight, type, children, asterisk, className, onClick, style, title } = props;
	const styledClassName = `font-weight-${weight} font-size-${size} color-${color} line-height-${lineHeight} margin-none`;
	switch (type) {
		case "h1":
			return (
				<h1
					className={`${styledClassName} ${className}`}
					onClick={onClick}
					style={style}
					title={title}
				>
					{children}
					{asterisk ? <span className="color-red-yp">*</span> : null}
				</h1>
			);
		case "h5":
			return (
				<h5
					className={`${styledClassName} ${className}`}
					onClick={onClick}
					style={style}
					title={title}
				>
					{children}
					{asterisk ? <span className="color-red-yp">*</span> : null}
				</h5>
			);
		case "p":
			return (
				<p
					className={`${styledClassName} ${className}`}
					onClick={onClick}
					style={style}
					title={title}
				>
					{children}
					{asterisk ? <span className="color-red-yp">*</span> : null}
				</p>
			);
		case "label":
			return (
				<label
					className={`${styledClassName} ${className}`}
					onClick={onClick}
					style={style}
					title={title}
				>
					{children}
					{asterisk ? <span className="color-red-yp">*</span> : null}
				</label>
			);
		case "span":
			return (
				<span
					className={`${styledClassName} ${className}`}
					onClick={onClick}
					style={style}
					title={title}
				>
					{children}
					{asterisk ? <span className="color-red-yp">*</span> : null}
				</span>
			);
		default:
			return (
				<h3
					className={`${styledClassName} ${className}`}
					onClick={onClick}
					style={style}
					title={title}
				>
					{children}
					{asterisk ? <span className="color-red-yp">*</span> : null}
				</h3>
			);
	}
};
Typography.defaultProps = {
	size: "normal",
	type: "h3",
	weight: "normal",
	color: "light-100",
	lineHeight: "1",
	asterisk: false,
};
export default Typography;
