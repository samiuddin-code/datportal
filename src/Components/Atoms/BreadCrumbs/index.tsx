import { propTypes } from "./breadcrumbs";

import { Breadcrumb } from "antd";
import React from "react";

const BreadCrumbs = (props: propTypes) => {
	const { separator, data } = props;
	return (
		<Breadcrumb separator={separator}>
			{data.map((item, index) =>
				item.isLink ? (
					<Breadcrumb.Item key={"bread-crumb__" + index} href={item.path}>
						{item.text}
					</Breadcrumb.Item>
				) : (
					<Breadcrumb.Item key={"bread-crumb__" + index}>
						{item.text}
					</Breadcrumb.Item>
				)
			)}
		</Breadcrumb>
	);
};
BreadCrumbs.defaultProps = {
	separator: "/",
	data: [],
};
export default BreadCrumbs;
