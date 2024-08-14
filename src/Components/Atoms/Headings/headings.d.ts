export type AppProps = {
	children?: string | number;
	size: "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "normal" | "xxl" | "xxxl";
	type: "h1" | "h3" | "h5" | "p" | "label" | "span";
	weight: "bolder" | "normal" | "bold" | "light" | "semi";
	color: "dark-main" | "active" | "dark-sub" | "light-100" | "primary-sub" | "primary-main" | "red-yp"
	lineHeight: number;
	asterisk?: boolean;
	className?: string;
	onClick?: () => void;
	style?: React.CSSProperties;
	title?: string
};
