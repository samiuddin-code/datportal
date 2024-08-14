import { useMemo, useState } from "react";
import { Popconfirm, Table, Image, Typography as AntdTypography, Badge, Card, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { PromotionTypes } from "../../../../Modules/Promotion/types";
import { PromotionModule } from "../../../../Modules/Promotion";
import { convertDate } from "../../../../helpers/dateHandler";
import { capitalize } from "../../../../helpers/common";
import { Switch } from "../../../Atoms/Switch";
import { CalenderIcon } from "../../../Icons";
import { CustomButton } from "../../../Atoms";
// import { PromotionStatus } from "../../../../helpers/commonEnums";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { PromotionPermissionsEnum } from "../../../../Modules/Promotion/permissions";
const { Paragraph } = AntdTypography;


interface _ActionComponentProps extends ActionComponentProps {
	record: PromotionTypes,
	permissions: { [key in PromotionPermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deletePromotion }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new PromotionModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deletePromotion === false) {
			message.error("You don't have permission to delete this record, please contact your admin.");
			setActionState({
				...actionState,
				openPopConfirm: false,
			});
			return;
		}

		module.deleteRecord(record.id).then((res) => {
			setActionState({
				...actionState,
				openPopConfirm: false,
				confirmLoading: false,
			});
			reloadTableData();
		}).catch((err) => {
			setActionState({
				...actionState,
				confirmLoading: false,
			});
		});
	};

	const showPopconfirm = () => {
		setActionState({
			...actionState,
			openPopConfirm: true,
		});
	};

	return (
		<div className={styles.actions}>
			<span onClick={() => onEditIconClick(record)}>
				<img src="/images/editicon.svg" alt="" />
			</span>
			<Popconfirm
				open={actionState.openPopConfirm}
				placement="top"
				title="Are you sure?"
				onConfirm={handleDelete}
				onCancel={() => setActionState({ ...actionState, openPopConfirm: false })}
				okButtonProps={{ loading: actionState.confirmLoading }}
				okText="Yes"
				cancelText="No"
				onOpenChange={(visible) => {
					if (!visible) {
						setActionState({ ...actionState, openPopConfirm: false });
					}
				}}
			>
				<DeleteOutlined className={styles.bg__red} onClick={showPopconfirm} />
			</Popconfirm>
		</div>
	);
};

export default function TableComponent(props: TableProps & {
	tableData: PromotionTypes[],
	onManageClick: (record: PromotionTypes, type: "credit" | "package") => void
}) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData, onManageClick } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in PromotionPermissionsEnum]: boolean };

	const module = new PromotionModule();
	const today = new Date();
	const onIsPublishedChange = (checked: boolean, recordId: number) => {
		return module.updateRecord({ isPublished: checked }, recordId);
	};

	/** Get the status of the promotion based on the start and end date
	 * @param {Date} validFrom start date of the promotion
	 * @param {Date} validTo end date of the promotion
	 * @returns {string} status of the promotion
	 */
	const promoCodeStatus = (validFrom: string, validTo: string): string => {
		const currentTime = today.getTime()
		const validToTime = new Date(validTo).getTime()
		const validFromTime = new Date(validFrom).getTime()

		if (validToTime >= currentTime && currentTime >= validFromTime) {
			return "active"
		} else if (validFromTime >= currentTime) {
			return "upcoming"
		} else {
			return "expired"
		}
	}

	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (text: string, record: {}, index: number) => index + 1,
			width: "5%",
		},
		{
			title: "Title",
			dataIndex: "localization",
			key: "localization",
			render: (localization: PromotionTypes['localization'], record: PromotionTypes) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{localization[0].title}
					</Typography>

					<Paragraph
						ellipsis={{ rows: 3, expandable: true, symbol: "view description" }}
						title={localization[0].title}
						className="font-size-xs color-light-800 mt-1"
					>
						<div dangerouslySetInnerHTML={{ __html: localization[0].description }}>
						</div>
					</Paragraph>

					<div className="d-flex">
						<CalenderIcon className="mr-1" width={16} height={16} />
						<span className="font-size-xs color-dark-sub my-auto">
							{convertDate(record?.addedDate, "M dd,yy")}
						</span>
					</div>
				</>
			),
			width: "12%",
		},
		{
			title: "Discount",
			dataIndex: "discountType",
			key: "discountType",
			render: (discountType: string, record: PromotionTypes) => (
				<>
					<Typography color="dark-sub" size="sm">
						{`Type: ${capitalize(discountType)}`}
					</Typography>
					<Typography color="dark-sub" size="sm" className="mt-1">
						{`value: ${record.value}`}
					</Typography>
				</>
			),
		},
		{
			title: "Promo",
			dataIndex: "promoCode",
			key: "promoCode",
			render: (promoCode: string, record: PromotionTypes) => (
				<>
					<Paragraph
						ellipsis={{ rows: 2, expandable: false }}
						copyable={{ text: promoCode }}
						className="font-size-sm color-dark-sub mt-1 mb-1"
					>
						{`Promo Code: ${promoCode}`}
					</Paragraph>

					<Typography color="dark-sub" size="sm">
						{`Valid From: ${convertDate(record.validFrom, "dd M,yy")}`}
					</Typography>

					<Typography color="dark-sub" size="sm" className="mt-1">
						{`Valid Till: ${convertDate(record.validTo, "dd M,yy")}`}
					</Typography>

					<div>
						{/* {promoCodeStatus(record.validFrom, record.validTo) === PromotionStatus['active'] && (
							<Badge
								status="success"
								text="Active"
								className="mt-1"
							/>
						)}

						{promoCodeStatus(record.validFrom, record.validTo) === PromotionStatus["upcoming"] && (
							<Badge
								status="warning"
								text="Upcoming"
								className="mt-1"
							/>
						)}

						{promoCodeStatus(record.validFrom, record.validTo) === PromotionStatus['expired'] && (
							<Badge
								status="error"
								text="Expired"
								className="mt-1"
							/>
						)} */}
					</div>
				</>
			),
			width: "15%",
		},
		{
			title: "Packages",
			dataIndex: "packages",
			key: "packages",
			render: (packages: string, record: PromotionTypes) => (
				<>
					{/**Credit Package */}
					<Card
						size="small"
						title={
							<div className="d-flex justify-space-between">
								<h5 className="color-dark-main">Credit Package</h5>
								<CustomButton
									size="xs"
									type="plain_underlined"
									onClick={() => { onManageClick(record, "credit") }}
									disabled={permissions.updatePromotion === false}
								>
									Manage
								</CustomButton>
							</div>
						}
					>
						{record?.creditPackagePromotions?.length > 0 ? record?.creditPackagePromotions?.map((item, index) => (
							<div key={`creditPackagePromotions-${index}`} className="mb-1">
								<Typography color="dark-sub" size="sm" >
									{`${item?.creditPackage?.localization[0]?.title}`}
								</Typography>
							</div>
						)) : (
							<>
								<div className="font-size-xs color-dark-sub text-center">No Packages</div>
							</>
						)}
					</Card>

					{/** Package Promotion */}
					<Card
						size="small"
						title={
							<div className="d-flex justify-space-between">
								<h5 className="color-dark-main">Package</h5>
								<CustomButton
									size="xs"
									type="plain_underlined"
									onClick={() => { onManageClick(record, "package") }}
									disabled={permissions.updatePromotion === false}
								>
									Manage
								</CustomButton>
							</div>
						}
						className={"mt-2"}
					>
						{record?.packagePromotions?.length > 0 ? record?.packagePromotions?.map((item, index) => (
							<div key={`packagePromotions-${index}`} className="mb-1">
								<Typography color="dark-sub" size="sm" >
									{`${item?.package?.localization[0]?.title}`}
								</Typography>
							</div>
						)) : (
							<>
								<div className="font-size-xs color-dark-sub text-center">No Packages</div>
							</>
						)}
					</Card>
				</>
			),
			width: "25%",
		},
		{
			title: "Limit",
			dataIndex: "limit",
			key: "limit",
			render: (limit: number) => (
				<Typography color="dark-sub" size="normal">
					{limit}
				</Typography>
			),
			className: "text-center"
		},
		{
			title: "Image",
			dataIndex: "image",
			key: "image",
			render: (image: string) => image ? (
				<Image
					width={50}
					height={50}
					src={`${RESOURCE_BASE_URL}${image}`}
					alt={'Promotion Image'}
					preview={false}
					rootClassName="object-fit-contain"
				/>
			) : (
				<></>
			),
		},
		{
			title: "Published",
			dataIndex: "isPublished",
			key: "isPublished",
			render: (checked: boolean | undefined, record: PromotionTypes) => (
				<Switch
					checked={checked}
					onChange={onIsPublishedChange}
					recordId={record.id}
					allowChange={permissions.updatePromotion}
				/>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: PromotionTypes) => (
				<ActionComponent
					record={record}
					onEditIconClick={onEditIconClick}
					reloadTableData={reloadTableData}
					permissions={permissions}
				/>
			),
		},
	];

	return (
		<div className={styles.antdTableWrapper}>
			<Table
				sticky
				dataSource={tableData}
				columns={columns}
				pagination={false}
				scroll={{ x: 991 }}
				loading={tableLoading}
				rowKey={(record: PromotionTypes) => `site-promotion-${record.id}`}
			/>
		</div>
	);
}
