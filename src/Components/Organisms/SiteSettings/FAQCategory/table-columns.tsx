import { useMemo, useState } from "react";
import { message, Popconfirm, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { FAQTypes } from "../../../../Modules/FAQs/types";
import { Switch } from "../../../Atoms/Switch";
import { FAQCategoryModule } from "../../../../Modules/FAQCategory";
import { FAQCategoryPermissionsEnum } from "../../../../Modules/FAQCategory/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";

interface _ActionComponentProps extends ActionComponentProps {
	record: FAQTypes,
	permissions: { [key in FAQCategoryPermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deleteFaqsCategory }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new FAQCategoryModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteFaqsCategory === false) {
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

export default function TableComponent(props: TableProps & { tableData: FAQTypes[] }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in FAQCategoryPermissionsEnum]: boolean };

	const module = new FAQCategoryModule();

	const onIsPublishedChange = (checked: boolean, recordId: number) => {
		return module.updateRecord({ isPublished: checked }, recordId)
	};

	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (text: string, record: {}, index: number) => index + 1,
			width: "5%",
		},
		// {
		// 	title: "Category - (ID)",
		// 	dataIndex: "category",
		// 	key: "category",
		// 	render: (question: string, record: FAQTypes) => (
		// 		<>
		// 			<Typography color="dark-main" size="sm" weight="bold">
		// 				{`${record.localization[0].title} - ${record.id}`}
		// 			</Typography>

		// 			<div
		// 				className="font-size-xs color-dark-sub dangerouslySetWrap dangerouslySetInnerHTML"
		// 				dangerouslySetInnerHTML={{ __html: record.localization[0].description }}
		// 			></div>
		// 		</>
		// 	),
		// },
		{
			title: "Title",
			dataIndex: "title",
			key: "title",
			render: (title: string, record: FAQTypes) => (
				<>
					<Typography color="dark-main" size="sm">
						{title}
					</Typography>
				</>
			),
		},
		{
			title: "Slug",
			dataIndex: "slug",
			key: "slug",
			render: (slug: string, record: FAQTypes) => (
				<>
					<Typography color="dark-main" size="sm">
						{slug}
					</Typography>
				</>
			),
		},
		// {
		// 	title: "Parent",
		// 	dataIndex: "parent",
		// 	key: "parent",
		// 	render: (parent: FAQTypes, record: FAQTypes) => (
		// 		<>
		// 			<Typography color="dark-main" size="sm">
		// 				{(parent) ? parent.localization[0].title : 'root'}
		// 			</Typography>
		// 		</>
		// 	),
		// },
		{
			title: "Published",
			dataIndex: "isPublished",
			key: "isPublished",
			render: (checked: boolean | undefined, record: FAQTypes) => (
				<Switch
					checked={checked}
					onChange={onIsPublishedChange}
					recordId={record.id}
					allowChange={permissions.updateFaqsCategory}
				/>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: FAQTypes) => (
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
				rowKey={(record: FAQTypes) => `site-faqs-${record.id}`}
			/>
		</div>
	);
}
