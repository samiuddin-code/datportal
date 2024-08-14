import { useState } from "react";
import { message, Popconfirm, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { Switch } from "../../../Atoms/Switch";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { OrganizationType } from "@modules/Organization/types";
import { OrgPermissionsEnum } from "@modules/Organization/permissions";
import { OrganizationModule } from "@modules/Organization";
import { RESOURCE_BASE_URL } from "@helpers/constants";
import { OrganizationTypes } from "@helpers/commonEnums";
import { APIResponseObject } from "@modules/Common/common.interface";
import openingHourStyles from "./styles.module.scss"

interface _ActionComponentProps extends ActionComponentProps {
	record: OrganizationType,
	permissions: { [key in OrgPermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deleteOrganization }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = new OrganizationModule();

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteOrganization === false) {
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

export default function TableComponent(props: TableProps & { tableData: OrganizationType[], meta: APIResponseObject["meta"], filters: any }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData, meta, filters } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in OrgPermissionsEnum]: boolean };

	const module = new OrganizationModule();
	const onIsPublishedChange = (checked: boolean, recordId: number) => {
		return module.updateRecord({ isPublished: checked }, recordId);
	};

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
			dataIndex: "name",
			key: "name",
			render: (text: string, record: OrganizationType) => (
				<>
				<Typography color="dark-main" size="sm" weight="bold">
					{`${record.organizationCode} - ${text}`}
				</Typography>

				<div className={openingHourStyles.container}>
				{record?.WorkingHours?.hours.map((ele, index) => <div key={"opening-hours" + index + Math.random() * 9999}>
					<div className={openingHourStyles.wrapper}>
						<span className={openingHourStyles.title}>{ele.name}</span>
						{
							(ele.closed) ?
								<span className={openingHourStyles.closed}>Closed</span>
								:
								<>
									<span>{ele.open} - {ele.close}</span>
									<span>{ele.totalHours} hours</span>
								</>
						}
					</div>
				</div>)}
				</div>
				</>

			),
			width: "280px"
		},
		{
			title: "Logo",
			dataIndex: "logo",
			key: "logo",
			render: (text: string, record: OrganizationType) => (
				<img
					width={50}
					height={50}
					src={RESOURCE_BASE_URL + record.logo}
					style={{ objectFit: 'contain' }}
				/>
			),
		},
		{
			title: "Type",
			dataIndex: "type",
			key: "type",
			render: (text: 1 | 2 | 3 ) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{OrganizationTypes[text]}
				</Typography>
			),
		},
		{
			title: "Published",
			dataIndex: "isPublished",
			key: "isPublished",
			render: (checked: boolean | undefined, record: OrganizationType) => (
				<Switch
					checked={checked}
					onChange={onIsPublishedChange}
					recordId={record.id}
					allowChange={permissions.updateOrganization}
				/>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: OrganizationType) => (
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
				pagination={{
					current: meta?.page,
					total: meta?.total,
					hideOnSinglePage: true,
					pageSize: meta?.perPage,
					onChange(page, pageSize) {
						reloadTableData({ ...filters, page: page, perPage: pageSize })
					},
				}}
				scroll={{ x: 991 }}
				loading={tableLoading}
				rowKey={(record: OrganizationType) => `organization-${record.id}`}
			/>
		</div>
	);
}
