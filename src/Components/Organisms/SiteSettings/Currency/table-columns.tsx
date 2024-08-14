import { useMemo, useState } from "react";
import { message, Popconfirm, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { CurrencyTypes } from "../../../../Modules/Currency/types";
import { Switch } from "../../../Atoms/Switch";
import { CurrencyModule } from "../../../../Modules/Currency";
import { CurrencyPermissionsEnum } from "../../../../Modules/Currency/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";

interface _ActionComponentProps extends ActionComponentProps {
	record: CurrencyTypes,
	permissions: { [key in CurrencyPermissionsEnum]: boolean };
}
const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deleteCurrency }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new CurrencyModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteCurrency === false) {
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

export default function TableComponent(props: TableProps & { tableData: CurrencyTypes[] }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in CurrencyPermissionsEnum]: boolean };

	const module = new CurrencyModule();

	const onIsPublishedChange = (checked: boolean, recordId: number) => {
		return module.updateRecord({ isPublished: checked }, recordId);
	};

	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (text: string, record: {}, index: number) => index + 1,
			width: "6%",
		},
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			render: (name: string) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{name}
				</Typography>
			),
		},
		{
			title: "Code",
			dataIndex: "code",
			key: "code",
			render: (code: string) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{code}
				</Typography>
			),
		},
		{
			title: "Symbol",
			dataIndex: "symbol",
			key: "symbol",
			render: (symbol: string) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{symbol}
				</Typography>
			),
		},
		{
			title: "Rate",
			dataIndex: "rate",
			key: "rate",
			render: (rate: number) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{rate}
				</Typography>
			),
		},
		{
			title: "Published",
			dataIndex: "isPublished",
			key: "isPublished",
			render: (checked: boolean | undefined, record: CurrencyTypes) => (
				<Switch
					checked={checked}
					onChange={onIsPublishedChange}
					recordId={record.id}
					allowChange={permissions.updateCurrency}
				/>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: CurrencyTypes) => (
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
				rowKey={(record: CurrencyTypes) => `site-currency-${record.id}`}
			/>
		</div>
	);
}
