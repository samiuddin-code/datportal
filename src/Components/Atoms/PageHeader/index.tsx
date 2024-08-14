import { FC, MouseEventHandler, ReactNode } from "react";
import { Tooltip } from 'antd';
import { PlusOutlined } from "@ant-design/icons";
import BreadCrumbs from "../BreadCrumbs";
import CustomButton from "../Button";
import Typography from "../Headings";
import styles from "./styles.module.scss";

interface PageHeaderProps {
	heading: string;
	buttonText?: string;
	onButtonClick?: () => void | MouseEventHandler<HTMLButtonElement>;
	buttonLoading?: boolean;
	filters?: ReactNode;
	breadCrumbData?: Array<{ isLink: boolean; text: string; path?: string }>;
	showAdd?: boolean,
	buttonDisable?: boolean;
	buttonTooltip?: string | null;
	buttonWithoutIcon?: boolean
	buttonWithIcon?: boolean
	buttonIcon?: ReactNode,
	excelExport?: ReactNode,
	children?: ReactNode
	/** Used to position children in header */
	positionChildren?: "same-line" | "new-line"
}

const PageHeader: FC<PageHeaderProps> = (props) => {
	const {
		heading, buttonText, onButtonClick,
		buttonLoading, filters, breadCrumbData,
		showAdd, buttonDisable, buttonTooltip,
		buttonWithoutIcon, buttonWithIcon,
		buttonIcon, excelExport, children,
		positionChildren = "same-line"
	} = props

	return (
		<div className={styles.bodyWrap}>
			<div className={styles.braedCrumbSection}>
				<BreadCrumbs data={breadCrumbData} />
			</div>
			<div className={styles.headingSection}>
				<Typography type="h1" size="lg" color="dark-main" weight="bold" className="my-auto">
					{heading}
				</Typography>

				<div className="ml-3 my-auto mr-auto">
					{positionChildren === "same-line" && children}
				</div>

				{/**Excel Export Data */}
				{excelExport && (
					<div className="d-flex align-center">{excelExport}</div>
				)}

				{/** Button With Plus Icon */}
				{(showAdd && buttonText) && (
					<>
						{buttonTooltip ? (
							<Tooltip title={buttonTooltip}>
								<CustomButton
									type="primary"
									size="sm"
									fontSize="sm"
									onClick={onButtonClick}
									loading={buttonLoading}
									disabled={buttonDisable}
								>
									<PlusOutlined />
									{buttonText}
								</CustomButton>
							</Tooltip>
						) : (
							<CustomButton
								type="primary"
								size="sm"
								fontSize="sm"
								onClick={onButtonClick}
								loading={buttonLoading}
								disabled={buttonDisable}
							>
								<PlusOutlined />
								{buttonText}
							</CustomButton>
						)}
					</>
				)}

				{/** Button Without Icon */}
				{buttonWithoutIcon && (
					<>
						{buttonTooltip ? (
							<Tooltip title={buttonTooltip}>
								<span className={styles.tooltipButton}>Refund Credits</span>
							</Tooltip>
						) : (
							<CustomButton
								type="primary"
								size="sm"
								fontSize="sm"
								onClick={onButtonClick}
								loading={buttonLoading}
								disabled={buttonDisable}
							>
								{buttonText}
							</CustomButton>
						)}
					</>
				)}
				{/** Button With Icon */}
				{buttonWithIcon && (
					<>
						{buttonTooltip ? (
							<Tooltip title={buttonTooltip}>
								<CustomButton
									type="primary"
									size="sm"
									fontSize="sm"
									onClick={onButtonClick}
									loading={buttonLoading}
									disabled={buttonDisable}
								>
									{buttonIcon}
									{buttonText}
								</CustomButton>
							</Tooltip>
						) : (
							<CustomButton
								type="primary"
								size="sm"
								fontSize="sm"
								onClick={onButtonClick}
								loading={buttonLoading}
								disabled={buttonDisable}
							>
								{buttonIcon}
								{buttonText}
							</CustomButton>
						)}
					</>
				)}
			</div>
			{positionChildren === "new-line" && (
				<section>{children}</section>
			)}
			<div className={styles.filterWrapper}>
				<div className={styles.filterSection}>{filters}</div>
			</div>
		</div>
	);
};
export default PageHeader;
