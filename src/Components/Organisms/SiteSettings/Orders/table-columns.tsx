import { Table, Tag } from "antd";
import Typography from "../../../Atoms/Headings";
import styles from "../../Common/styles.module.scss";
import { TableProps } from "../../Common/common-types";
import { OrganizationCreditPackageTypes } from "../../../../Modules/OrganizationCreditPackage/types";
import { convertDate } from "../../../../helpers/dateHandler";
// import { OrganizationCreditPackageStatus } from "../../../../helpers/commonEnums";
// import Componentstyles from './styles.module.scss'
// import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { formatCurrency } from "@helpers/common";

// const ActionComponent = (props: { record: Role } & ActionComponentProps) => {
// 	const { record, onEditIconClick, reloadTableData } = props;

// 	const [actionState, setActionState] = useState({
// 		confirmLoading: false,
// 		openPopConfirm: false,
// 	});
// 	const module = useMemo(() => new RolesModule(), []);

// 	const handleDelete = () => {
// 		setActionState({
// 			...actionState,
// 			confirmLoading: true,
// 		});

// 		module
// 			.deleteRecord(record.id)
// 			.then((res) => {
// 				setActionState({
// 					...actionState,
// 					openPopConfirm: false,
// 					confirmLoading: false,
// 				});
// 				reloadTableData();
// 			})
// 			.catch((err) => {
// 				setActionState({
// 					...actionState,
// 					confirmLoading: false,
// 				});
// 			});
// 	};

// 	const showPopconfirm = () => {
// 		setActionState({
// 			...actionState,
// 			openPopConfirm: true,
// 		});
// 	};

// 	return (
// 		<div className={styles.actions}>
// 			<span onClick={() => onEditIconClick(record)}>
// 				<img src="/images/editicon.svg" alt="" />
// 			</span>
// 			<Popconfirm
// 				visible={actionState.openPopConfirm}
// 				placement="top"
// 				title="Are you sure?"
// 				onConfirm={handleDelete}
// 				onCancel={() => setActionState({ ...actionState, openPopConfirm: false })}
// 				okButtonProps={{ loading: actionState.confirmLoading }}
// 				okText="Yes"
// 				cancelText="No"
// 			>
// 				<DeleteOutlined className={styles.bg__red} onClick={showPopconfirm} />
// 			</Popconfirm>
// 		</div>
// 	);
// };

export default function TableComponent(props: TableProps & { tableData: OrganizationCreditPackageTypes[] }) {
	const { tableData, tableLoading } = props;

	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (text: string, record: {}, index: number) => index + 1,
			width: "60px",
		},
		{
			title: "Organization",
			dataIndex: "organization",
			key: "organization",
			render: (organization: OrganizationCreditPackageTypes['organization']) => (
				<div>
					<div className="d-flex">
						{
							//TODO: uncomment this when logo is available
						}
						{/* <img
							src={`${RESOURCE_BASE_URL}${organization?.logo}`}
							alt="organization"
							style={{
								width: "20px",
								height: "20px",
								borderRadius: "100%",
								objectFit: "cover",
							}}
						/> */}

						<div className="ml-2 my-auto">
							<Typography color="dark-sub" size="xs">
								{`${organization?.name}`}
							</Typography>
						</div>
					</div>
				</div>
			),
		},
		{
			title: "Package",
			dataIndex: "package",
			key: "package",
			render: (text: string, record: OrganizationCreditPackageTypes) => (
				<Typography color="dark-main" size="sm">
					{`${record.creditPackage.localization.map((item) => item.title)}`}
				</Typography>
			),
		},
		{
			title: "Amount Paid",
			dataIndex: "amount",
			key: "amount",
			render: (amount: number, record: OrganizationCreditPackageTypes) => (
				<Typography color="dark-sub" size="sm">
					{formatCurrency(amount)}
				</Typography>
			),
		},
		{
			title: "Credits",
			dataIndex: "credits",
			key: "credits",
			render: (credits: string, record: OrganizationCreditPackageTypes) => (
				<Typography color="dark-sub" size="sm">
					{`${credits} credits ${record.creditPackage.packageType === 'monthly' ? '/per month' : ''}`}
				</Typography>
			),
		},
		{
			title: "Date Added",
			dataIndex: "addedDate",
			key: "addedDate",
			render: (addedDate: string) => (
				<Typography color="dark-sub" size="sm">
					{convertDate(addedDate, "dd M,yy")}
				</Typography>
			),
		},
		{
			title: "Expiry Date",
			dataIndex: "expiresAt",
			key: "expiresAt",
			render: (expiresAt: string) => (
				<Typography color="dark-sub" size="sm">
					{convertDate(expiresAt, "dd M,yy")}
				</Typography>
			),
		},
		{
			title: "Status",
			className: 'text-center',
			dataIndex: "status",
			key: "status",
			render: (status: number) => (
				<div className="text-center">
					{/** if status is active or topup, show the green status with the status name from the status enums */}
					{/* {(status === 2 || status === 6) && (
						<Tag className={Componentstyles.success}>
							{OrganizationCreditPackageStatus[status]}
						</Tag>
					)}

					{status === 1 && (
						<Tag color="#ffcc00">{`${OrganizationCreditPackageStatus[status]}`}</Tag>
					)} */}

					{/** if status is refunded or expired, show the red status with the status name from the status enums */}
					{/* {(status === 4 || status === 5) && (
						<Tag color="#cc3300">{`${OrganizationCreditPackageStatus[status]}`}</Tag>
					)} */}

					{/** if status is requestForRefund show the warning color */}
					{status === 3 && (
						<Tag color="#ffcc00">refund request</Tag>
					)}
				</div>
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
				rowKey={(record: OrganizationCreditPackageTypes) => `CreditsPackage-${record.id}`}
			/>
		</div>
	);
}
