import { Menu, Dropdown, Tag } from "antd";
import { DownOutlined } from "@ant-design/icons";
import styles from "./styles.module.scss";
import { AppProps } from "./dropdown";

const DropDown = (props: AppProps) => {
	const { type, tagType, items, children, trigger, weight, size, color, lineHeight, showArrow, ...rest } = props;
	const menu = <Menu items={items} className={type === "tag" ? styles.menuTag : ""} />;
	const styledClassName = `font-weight-${weight} font-size-${size} color-${color} line-height-${lineHeight}`;
	return (
		<Dropdown dropdownRender={() => menu} {...rest} className={styledClassName} trigger={trigger}>
			{type === "tag" ? (
				<Tag color={tagType} className={styles.dropdownTag}>
					{children}
					{showArrow ? <DownOutlined /> : null}
				</Tag>
			) : (
				<span className={styles.dropdownText}>
					{children}
					{showArrow ? <DownOutlined /> : null}
				</span>
			)}
		</Dropdown>
	);
};
DropDown.defaultProps = {
	size: "normal",
	weight: "normal",
	color: "light-100",
	lineHeight: "1",
	trigger: ["click"],
	type: "normal",
	tagType: "success",
	showArrow: true,
};
export default DropDown;
