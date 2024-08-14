import { useState } from "react";
import { Input, message, Popconfirm, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { AccountType } from "../../../../Modules/Account/types";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { AccountModule } from "../../../../Modules/Account";
import { AccountPermissionsEnum } from "../../../../Modules/Account/permissions";
import { APIResponseObject } from "@modules/Common/common.interface";
import { getTableRowNumber } from "@helpers/common";

interface _ActionComponentProps extends ActionComponentProps {
	record: AccountType,
	permissions: { [key in AccountPermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deleteAccount }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = new AccountModule();

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteAccount === false) {
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

export default function TableComponent(props: TableProps & { tableData: AccountType[], meta: APIResponseObject["meta"], filters: any }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData, meta, filters } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in AccountPermissionsEnum]: boolean };
	const [searchTerm, setSearchTerm] = useState("");
	const [metaT, setMetaT] = useState({
		page: meta?.page || 1,
		perPage: meta?.perPage || 10
	})

	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (_text: string, _record: {}, index: number) => getTableRowNumber(index, metaT),
			width: "60px",
		},
		{
			title: "Title",
			dataIndex: "title",
			key: "title",
			render: (text: string, record: AccountType) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{record.title}
				</Typography>
			),
		},
		{
			title: "Description",
			dataIndex: "description",
			key: "description",
			render: (text: string, record: AccountType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{record?.description || ""}
					</Typography>
				</>
			),
		},

		{
			title: "Account Code",
			dataIndex: "accountCode",
			key: "accountCode",
			render: (text: string, record: AccountType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{record.accountCode}
					</Typography>
				</>
			),
		},
		{
			title: "Expense Claims",
			dataIndex: "showInExpenseClaims",
			key: "showInExpenseClaims",
			render: (text: string, record: AccountType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{record.showInExpenseClaims ? "Yes" : "No"}
					</Typography>
				</>
			),
		},
		{
			title: "Xero Reference",
			dataIndex: "xeroReference",
			key: "xeroReference",
			render: (text: string, record: AccountType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{record.xeroReference}
					</Typography>
				</>
			),
		},
		{
			title: "Xero Type",
			dataIndex: "xeroType",
			key: "xeroType",
			render: (text: string, record: AccountType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{record.xeroType}
					</Typography>
				</>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: AccountType) => (
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
		<div>
			<Input
				type="input"
				placeholder="Search by title"
				onChange={(event) => {
					setSearchTerm(event.target.value);
				}}
				allowClear
				style={{
					border: '1.5px solid var(--color-border)',
					borderRadius: '0.25rem',
					width: '25%',
					marginBottom: '1rem'
				}}
				prefix={<img style={{ padding: '0rem 0.5rem' }} src="/images/searchIcon.svg" alt="" />}
			/>
			<Table
				sticky
				dataSource={tableData?.filter((item: AccountType) => 
					item?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) || item?.accountCode?.toLowerCase()?.includes(searchTerm.toLowerCase()))}
				columns={columns}
				scroll={{ x: 991 }}
				loading={tableLoading}
				rowKey={(record: AccountType) => `Account-${record.id}`}
				pagination={{
					current: meta?.page,
					total: meta?.total,
					hideOnSinglePage: true,
					pageSize: meta?.perPage,
					onChange(page, pageSize) {
						setMetaT({ page: page, perPage: pageSize })
					},
				}}
			/>
		</div>
	);
}
