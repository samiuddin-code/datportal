import { useState } from "react";
import { message, Popconfirm, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { CompanyAssetModule } from "../../../../Modules/CompanyAsset";
import { CompanyAssetPermissionsEnum } from "../../../../Modules/CompanyAsset/permissions";
import { CompanyAssetType } from "@modules/CompanyAsset/types";
import { APIResponseObject } from "@modules/Common/common.interface";

interface _ActionComponentProps extends ActionComponentProps {
	record: CompanyAssetType,
	permissions: { [key in CompanyAssetPermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deleteCompanyAsset }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = new CompanyAssetModule();

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteCompanyAsset === false) {
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

export default function TableComponent(props: TableProps & { tableData: CompanyAssetType[], meta: APIResponseObject["meta"], filters: any }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData, meta, filters } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in CompanyAssetPermissionsEnum]: boolean };

	const module = new CompanyAssetModule();


	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (text: string, record: {}, index: number) => index + 1,
			width: "5%",
		},
		{
			title: "Name",
			dataIndex: "assetName",
			key: "assetName",
			render: (text: string, record: any) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{record.assetName}
				</Typography>
			),
		},
		{
			title: "Detail",
			dataIndex: "assetDetail",
			key: "assetDetail",
			render: (text: string, record: CompanyAssetType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{text}
					</Typography>
				</>
			),
		},
		{
			title: "Code",
			dataIndex: "code",
			key: "code",
			render: (text: string, record: CompanyAssetType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{text}
					</Typography>
				</>
			),
		},
		{
			title: "Quantity",
			dataIndex: "quantity",
			key: "quantity",
			render: (text: string, record: CompanyAssetType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{text}
					</Typography>
				</>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: CompanyAssetType) => (
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
				scroll={{ x: 991 }}
				loading={tableLoading}
				rowKey={(record: CompanyAssetType) => `project-type-${record.id}`}
				pagination={{
					current: meta?.page,
					total: meta?.total,
					hideOnSinglePage: true,
					pageSize: meta?.perPage,
					onChange(page, pageSize) {
						reloadTableData({ ...filters, page: page, perPage: pageSize })
					},
				}}
			/>
		</div>
	);
}
