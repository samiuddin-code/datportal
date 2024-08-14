import { useMemo, useState } from "react";
import { Popconfirm, Table, Image, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../../Atoms/Headings";
import styles from "../../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../../Common/common-types";
import { RESOURCE_BASE_URL } from "../../../../../helpers/constants";
import { convertDate } from "../../../../../helpers/dateHandler";
// import { StaticPageSEOType } from "../../../../../Modules/SitePages/types";
import { StaticPageSEOType } from "../../../../../Modules/StaticPageSEO/types";
import { Switch } from "../../../../Atoms/Switch";
import { StaticPageSEOModule } from "../../../../../Modules/StaticPageSEO";
import { StaticPageSEOPermissionsEnum } from "../../../../../Modules/StaticPageSEO/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../Redux/store";

interface _ActionComponentProps extends ActionComponentProps {
	record: StaticPageSEOType,
	permissions: { [key in StaticPageSEOPermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deleteStaticPageSEO }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new StaticPageSEOModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteStaticPageSEO === false) {
			message.error("You don't have permission to delete this record, please contact your admin.");
			setActionState({
				...actionState,
				openPopConfirm: false,
			});
			return;
		}

		module.deleteRecord(record.id).then((_res) => {
			setActionState({
				...actionState,
				openPopConfirm: false,
				confirmLoading: false,
			});
			reloadTableData();
		}).catch((_err) => {
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

export default function TableComponent(props: TableProps & { tableData: StaticPageSEOType[] }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in StaticPageSEOPermissionsEnum]: boolean };

	const module = new StaticPageSEOModule();

	const onIsDefaultChange = async (_checked: boolean, recordId: number) => {
		let res = await module.makeDefault(recordId);
		if (res && res?.data?.data) {
			reloadTableData()
		}
		return res;
	};

	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (_text: string, _record: {}, index: number) => index + 1,
			width: "5%",
		},
		{
			title: "Title",
			dataIndex: "seoTitle",
			key: "seoTitle",
			render: (seoTitle: string, record: StaticPageSEOType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{seoTitle}
					</Typography>

					<Typography color="dark-sub" size="xs">
						{record.seoDescription}
					</Typography>
				</>
			),
			width: "30%",
		},
		{
			title: "Image",
			dataIndex: "image",
			key: "image",
			render: (image: string, _record: StaticPageSEOType) => (
				image ? (
					<Image
						width={40}
						height={40}
						src={`${RESOURCE_BASE_URL}${image}`}
						preview={false}
						rootClassName="object-fit-contain"
					/>
				) : (
					<></>
				)
			)
		},
		{
			title: "Date",
			dataIndex: "date",
			key: "date",
			render: (_date: string, record: StaticPageSEOType) => (
				<>
					<Typography color="dark-sub" size="sm">
						{`Added: ${convertDate(record?.addedDate, 'MM dd yy')}`}
					</Typography>
					<Typography color="dark-sub" size="sm">
						{`Modified: ${record?.modifiedDate ? convertDate(record?.modifiedDate, 'MM dd yy') : 'Not Modified'}`}
					</Typography>
				</>
			)
		},
		{
			title: "Default",
			dataIndex: "isDefault",
			key: "isDefault",
			render: (checked: boolean, record: StaticPageSEOType) => (
				<Switch
					checked={checked}
					onChange={onIsDefaultChange}
					recordId={record.id}
					allowChange={permissions.updateStaticPageSEO}
				/>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (_text: string, record: StaticPageSEOType) => (
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
				rowKey={(record: StaticPageSEOType) => `site-static-pages-seo-${record?.id}`}
			/>
		</div>
	);
}
