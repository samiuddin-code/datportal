import { useMemo, useState } from "react";
import { message, Popconfirm, Table, Typography as AntdTypography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { PagesSectionModule } from "../../../../Modules/PagesSection";
import { PagesSectionType } from "../../../../Modules/PagesSection/types";
import { Switch } from "../../../Atoms/Switch";
import { PagesSectionPermissionsEnum } from "../../../../Modules/PagesSection/permissions";
import { PagesContentPermissionsEnum } from "../../../../Modules/PagesSectionContent/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
const { Paragraph } = AntdTypography;

type PermissionsType = {
	[key in PagesSectionPermissionsEnum]: boolean
} & {
	[PagesContentPermissionsEnum.READ]: boolean;
};

interface _ActionComponentProps extends ActionComponentProps {
	record: PagesSectionType;
	permissions: PermissionsType
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deleteSitePagesSection }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new PagesSectionModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteSitePagesSection === false) {
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

export default function TableComponent(props: TableProps & { tableData: PagesSectionType[] }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as PermissionsType;
	const { updateSitePagesSection, readSitePagesContent } = permissions

	const module = new PagesSectionModule();
	const onIsPublishedChange = (checked: boolean, recordId: number) => {
		return module.updateRecord({ isPublished: checked }, recordId);
	};
	const onHasMultipleItemsChange = (checked: boolean, recordId: number) => {
		if (checked) {
			return module.allowMultiples(recordId);
		} else {
			return module.disallowMultiples(recordId);
		}
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
			dataIndex: "title",
			key: "title",
			render: (text: string, record: PagesSectionType) => {
				return <>
					<h3 className="mb-0 font-size-normal">{text}</h3>
					<Paragraph
						title={record.slug}
						ellipsis={{
							rows: 1,
							expandable: false,
						}}
						copyable={{ text: record.slug }}
						className="font-size-sm color-dark-sub mb-0"
					>
						{record.slug}
					</Paragraph>
					<p className="mb-0 font-size-sm color-dark-sub">{record?.description}</p>
				</>
			},
		},
		{
			title: "Pages Content",
			key: "pageContent",
			render: (_checked: boolean, record: PagesSectionType) => (
				<>
					{readSitePagesContent === true ? (
						<a
							href={`/siteSettings/pages-section/content?sectionId=${record.id}`}
							target="_blank"
							rel="noreferrer"
						>
							Manage Content
						</a>
					) : null}
				</>
			),
		},
		{
			title: "Allow Multiple Content",
			dataIndex: "hasMultipleItems",
			key: "hasMultipleItems",
			render: (checked: boolean, record: PagesSectionType) => (
				<Switch
					checked={checked}
					onChange={onHasMultipleItemsChange}
					recordId={record.id}
					allowChange={updateSitePagesSection}
				/>
			),
		},
		{
			title: "Published",
			dataIndex: "isPublished",
			key: "isPublished",
			render: (checked: boolean | undefined, record: PagesSectionType) => (
				<Switch
					checked={checked}
					onChange={onIsPublishedChange}
					recordId={record.id}
					allowChange={updateSitePagesSection}
				/>
			),
		},

		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (_text: string, record: PagesSectionType) => (
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
				rowKey={(record: PagesSectionType) => `site-pages-section-${record.id}`}
			/>
		</div>
	);
}
