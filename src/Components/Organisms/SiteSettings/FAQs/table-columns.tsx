import { useMemo, useState } from "react";
import { message, Popconfirm, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import { Typography as AntdTypography } from "antd";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { FAQTypes } from "../../../../Modules/FAQs/types";
import { Switch } from "../../../Atoms/Switch";
import { FAQModule } from "../../../../Modules/FAQs";
import { FAQPermissionsEnum } from "../../../../Modules/FAQs/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { ImageIcon } from "@icons/image";
const { Paragraph } = AntdTypography;

interface _ActionComponentProps extends ActionComponentProps {
	record: FAQTypes;
	permissions: { [key in FAQPermissionsEnum]: boolean };
	onImageClick: (data: FAQTypes) => void,
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData, onImageClick,
		permissions: { deleteFaqs }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new FAQModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteFaqs === false) {
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
			<span onClick={() => onImageClick(record)}>
				<ImageIcon color="#fff" />
			</span>
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
	tableData: FAQTypes[],
	onImageClick: (data: FAQTypes) => void,
}) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData, onImageClick } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in FAQPermissionsEnum]: boolean };

	const module = new FAQModule();

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
			dataIndex: "title",
			key: "title",
			render: (title: string, record: FAQTypes) => (
				<>
					<p className="font-size-sm font-weight-bold color-dark-main">
						{record.title}
					</p>
					{/* <div
						dangerouslySetInnerHTML={{ __html: record.description }}
						className="font-size-sm color-dark-main">
					</div> */}
				</>
			),
		},
		{
			title: "Slug",
			dataIndex: "slug",
			key: "slug",
			render: (slug: string, record: FAQTypes) => (
				<p className="font-size-sm font-weight-bold color-dark-main">
					{slug}
				</p>
			),
		},
		{
			title: "Published",
			dataIndex: "isPublished",
			key: "isPublished",
			render: (checked: boolean | undefined, record: FAQTypes) => (
				<Switch checked={checked} onChange={onIsPublishedChange} recordId={record.id} />
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
					onImageClick={onImageClick}
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
