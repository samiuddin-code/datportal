import { useMemo, useState } from "react";
import { Popconfirm, Table, Image, Typography as AntdTypography, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { FRONT_END_URL, RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { BlogsTypes } from "../../../../Modules/Blogs/types";
import { BlogsCategoryModule } from "../../../../Modules/BlogsCategory";
import { convertDate } from "../../../../helpers/dateHandler";
import { BlogsStatus } from "../../../../helpers/commonEnums";
import { GIcon } from "../../../Icons";
import { BlogsCategoryPermissionsEnum } from "../../../../Modules/BlogsCategory/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
const { Paragraph } = AntdTypography;

interface _ActionComponentProps extends ActionComponentProps {
	record: BlogsTypes,
	onSeoIconClick: (data: BlogsTypes) => void
	permissions: { [key in BlogsCategoryPermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		onSeoIconClick, permissions: { deleteBlogsCategory }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new BlogsCategoryModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteBlogsCategory === false) {
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
			<span onClick={() => onSeoIconClick(record)}>
				<GIcon />
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

export default function TableComponent(props: TableProps & { tableData: BlogsTypes[], onSeoIconClick: (record: BlogsTypes) => void }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData, onSeoIconClick } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in BlogsCategoryPermissionsEnum]: boolean };

	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (text: string, record: {}, index: number) => index + 1,
			width: "5%",
		},
		{
			title: "Category",
			dataIndex: "description",
			key: "description",
			render: (text: string, record: BlogsTypes) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{record.localization[0].title}
					</Typography>

					{record?.slug ? (
						<a
							href={`${FRONT_END_URL}/en/blogs/${record.slug}`}
							target={'_blank'}
							rel="noreferrer"
							className="d-flex"
						>
							<Paragraph
								ellipsis={{ rows: 1, expandable: false, }}
								title={record.localization[0].title}
								className="font-size-xs color-light-800 mt-1"
							>
								{record.slug}
							</Paragraph>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								height={"15px"}
								width={"15px"}
								className='mt-1 ml-1'
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
								/>
							</svg>
						</a>
					) : (
						""
					)}
				</>
			),
		},
		{
			title: "Country",
			dataIndex: "country",
			key: "country",
			render: (country: string, record: BlogsTypes) => (
				<Typography color="dark-sub" size="sm">
					{record.country.name}
				</Typography>
			),
		},
		{
			title: "Image",
			dataIndex: "image",
			key: "image",
			render: (image: string, record: BlogsTypes) =>
				image ? (
					<Image
						width={50}
						height={50}
						src={`${RESOURCE_BASE_URL}${image}`}
						alt={record.imageAlt}
						preview={false}
						rootClassName="object-fit-contain"
					/>
				) : (
					<></>
				),
		},
		{
			title: "Date",
			dataIndex: "date",
			key: "date",
			render: (date: string, record: BlogsTypes) => (
				<>
					<Typography color="dark-sub" size="sm">
						{`Added: ${convertDate(record.addedDate, 'MM dd yy')}`}
					</Typography>
					<Typography color="dark-sub" size="sm">
						{`Modified: ${record.modifiedDate ? convertDate(record?.modifiedDate, 'MM dd yy') : 'Not Modified'}`}
					</Typography>
				</>
			)
		},
		//TODO: Change Blogs Status
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status: string, record: BlogsTypes) => (
				<Typography color="dark-sub" size="sm">
					{
						Object.entries(BlogsStatus).filter(
							([key, value]) => value === String(status)
						)[0][0]
					}
				</Typography>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: BlogsTypes) => (
				<ActionComponent
					record={record}
					onEditIconClick={onEditIconClick}
					reloadTableData={reloadTableData}
					onSeoIconClick={onSeoIconClick}
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
				rowKey={(record: BlogsTypes) => `site-blogs-category-${record.id}`}
			/>
		</div>
	);
}
