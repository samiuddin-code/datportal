import { Table, Image, Popconfirm, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { CreditsPackageTypes } from "../../../../Modules/CreditsPackage/types";
import { convertDate } from "../../../../helpers/dateHandler";
import { CountryTypes } from "../../../../Modules/Country/types";
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { Switch } from "../../../Atoms/Switch";
import { CreditsPackageModule } from "../../../../Modules/CreditsPackage";
import { useMemo, useState } from "react";
import { CreditPackagePermissionsEnum } from "../../../../Modules/CreditsPackage/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";

interface _ActionComponentProps extends ActionComponentProps {
	record: CreditsPackageTypes,
	permissions: { [key in CreditPackagePermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deletePackage }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new CreditsPackageModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deletePackage === false) {
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

export default function TableComponent(props: TableProps & { tableData: CreditsPackageTypes[] }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in CreditPackagePermissionsEnum]: boolean };

	const module = new CreditsPackageModule();

	const onIsPublishedChange = (checked: boolean, recordId: number) => {
		return module.updateRecord({ isPublished: checked }, recordId);
	};

	const onIsAutoRenewChange = (checked: boolean, recordId: number) => {
		return module.updateRecord({ autoRenew: checked }, recordId);
	};

	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (text: string, record: {}, index: number) => index + 1,
			width: "60px",
		},
		{
			title: "Package",
			dataIndex: "localization",
			key: "localization",
			render: (localization: CreditsPackageTypes["localization"], record: CreditsPackageTypes) => (
				<>
					<Typography color="dark-main" size="normal" weight="bold">
						{localization[0]?.title}
					</Typography>

					<Typography color="dark-main" size="xs">
						{`Description: ${localization[0]?.description}`}
					</Typography>

					<Typography color="dark-main" size="xs">
						{`Type: ${record.packageType}`}
					</Typography>
				</>
			),
		},
		{
			title: "Credits",
			dataIndex: "credits",
			key: "credits",
			render: (credits: number) => (
				<Typography color="dark-main" size="sm">
					{credits}
				</Typography>
			),
		},
		{
			title: "Amount",
			dataIndex: "amount",
			key: "amount",
			render: (amount: number) => (
				<Typography color="dark-main" size="sm">
					{amount}
				</Typography>
			),
		},
		{
			title: "Icon",
			dataIndex: "icon",
			key: "icon",
			render: (icon: string) =>
				icon ? (
					<Image
						width={50}
						height={50}
						src={`${RESOURCE_BASE_URL}${icon}`}
						preview={false}
						rootClassName="object-fit-cover"
						style={{
							borderRadius: "100%",
						}}
					/>
				) : (
					<></>
				),
		},
		{
			title: "Country",
			dataIndex: "country",
			key: "country",
			render: (country: Partial<CountryTypes>) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{country.name}
				</Typography>
			),
		},
		{
			title: "Published",
			dataIndex: "isPublished",
			key: "isPublished",
			render: (checked: boolean, record: CreditsPackageTypes) => (
				<Switch
					checked={checked}
					onChange={onIsPublishedChange}
					recordId={record.id}
					allowChange={permissions.updatePackage}
				/>
			),
		},
		{
			title: "Auto Renew",
			dataIndex: "autoRenew",
			key: "autoRenew",
			render: (checked: boolean, record: CreditsPackageTypes) => (
				<Switch
					checked={checked}
					onChange={onIsAutoRenewChange}
					recordId={record.id}
					allowChange={permissions.updatePackage}
				/>
			),
		},
		{
			title: "Date Added",
			dataIndex: "addedDate",
			key: "addedDate",
			render: (addedDate: string | number | Date) => {
				return (
					<Typography color="dark-sub" size="sm">
						{convertDate(addedDate, "dd M,yy-t")}
					</Typography>
				);
			},
			width: "200px",
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: CreditsPackageTypes) => (
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
				loading={tableLoading}
				rowKey={(record: CreditsPackageTypes) => `credits-rate-${record.id}`}
			/>
		</div>
	);
}
