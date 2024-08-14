import { useMemo, useState } from "react";
import { message, Popconfirm, Table, Typography as AntdTypography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { Switch } from "../../../Atoms/Switch";
import { SitePagesModule } from "../../../../Modules/SitePages";
import { SitePagesType } from "../../../../Modules/SitePages/types";
import { GIcon } from "../../../Icons";
import { Link } from "react-router-dom";
import { SitePagesPermissionsEnum } from "../../../../Modules/SiteSettings/permissions";
import { PagesSectionPermissionsEnum } from "../../../../Modules/PagesSection/permissions";
import { StaticPageSEOPermissionsEnum } from "../../../../Modules/StaticPageSEO/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
const { Paragraph } = AntdTypography;

type PermissionsType = {
	[key in SitePagesPermissionsEnum]: boolean
} & {
	[PagesSectionPermissionsEnum.UPDATE]: boolean;
	[PagesSectionPermissionsEnum.READ]: boolean;
	[PagesSectionPermissionsEnum.CREATE]: boolean;
	[StaticPageSEOPermissionsEnum.READ]: boolean;
}

interface _ActionComponentProps extends ActionComponentProps {
	record: SitePagesType,
	permissions: PermissionsType
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deleteSitePages, readStaticPageSEO }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new SitePagesModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteSitePages === false) {
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
			{readStaticPageSEO === true && (
				<span>
					<Link to={`/siteSettings/static-page-seo?pageId=${record.id}`}>
						<GIcon />
					</Link>
				</span>
			)}
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

export default function TableComponent(props: TableProps & { tableData: SitePagesType[], onManageSectionClick: (data: any) => void; }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData, onManageSectionClick } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as PermissionsType;
	const { updateSitePages, updateSitePagesSection } = permissions;

	const module = new SitePagesModule();

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
			render: (text: string, record: SitePagesType) => {
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
			title: "Sections",
			dataIndex: "pageSectionRelation",
			key: "pageSectionRelation",
			render: (pageSectionRelation: any, record: SitePagesType) => {
				if (pageSectionRelation.length === 0) {
					return <div className="font-size-sm color-dark-sub">No Sections Added</div>
				} else {
					return pageSectionRelation.map((ele: any) => {
						return <div className="font-size-sm"> -&gt; {ele?.pageSection?.title}</div>
					})
				}
			},
		},
		{
			title: "Pages Content",
			key: "pageContent",
			render: (_checked: boolean, record: SitePagesType) => (
				<>
					{updateSitePagesSection === true ? (
						<div
							className="cursor-pointer"
							onClick={(event) => onManageSectionClick(record)}
						>
							Manage Page Section
						</div>
					) : null}
				</>
			),
		},
		{
			title: "Published",
			dataIndex: "isPublished",
			key: "isPublished",
			render: (checked: boolean, record: SitePagesType) => (
				<Switch
					checked={checked}
					onChange={onIsPublishedChange}
					recordId={record.id}
					allowChange={updateSitePages === true}
				/>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: SitePagesType) => (
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
				rowKey={(record: SitePagesType) => `site-pages-${record.id}`}
			/>
		</div>
	);
}
