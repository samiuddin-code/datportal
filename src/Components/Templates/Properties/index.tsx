import BreadCrumbs from "../../Atoms/BreadCrumbs";
import Typography from "../../Atoms/Headings";
import Layout from "../Layout";
import { propType } from "./properties";
import styles from "./styles.module.scss";

function PropertiesTemplate(props: propType) {
	const {
		heading,
		currentCrumb,
		// onButtonClick,
		children,
		// buttonLoading,
		table,
		filters,
		pagination,
	} = props;
	const breadCrumbData = [
		{ isLink: true, text: "Home", path: "/" },
		{ isLink: true, text: "Properties", path: "/properties?type=allProperties" },
		{ isLink: false, text: currentCrumb },
	];
	return (
		<Layout>
			<div className={styles.bodyWrap}>
				<div className={styles.braedCrumbSection}>
					<BreadCrumbs data={breadCrumbData} />
				</div>
				{heading ? (
					<div className={styles.headingSection}>
						<Typography type="h1" size="lg" color="dark-main" weight="bold">
							{heading}
						</Typography>
						{/* <CustomButton
            type="primary"
            size="sm"
            fontSize="sm"
            onClick={onButtonClick}
            loading={buttonLoading}
          >
            <PlusOutlined />
            {buttonText}
          </CustomButton> */}
					</div>
				) : null}
				{filters ? <div className={styles.filterSection}>{filters}</div> : null}
				{table ? <div className={styles.tableSection}>{table}</div> : null}
				{pagination ? <div className={styles.paginationSection}>{pagination}</div> : null}
				{children ? <div className={styles.childSection}>{children}</div> : null}
			</div>
		</Layout>
	);
}
PropertiesTemplate.defaultProps = {
	children: undefined,
	currentCrumb: "All Properties",
	heading: "",
	tableData: [],
	columns: [],
	onButtonClick: () => { },
	tableLoading: false,
	buttonLoading: false,
	table: undefined,
	filters: undefined,
	pagination: undefined,
};
export default PropertiesTemplate;
