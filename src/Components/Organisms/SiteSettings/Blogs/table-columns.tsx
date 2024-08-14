import { Key, useMemo, useState } from "react";
import { Popconfirm, Table, Image, Typography as AntdTypography, message, Card, Dropdown, Space } from "antd";
import { DeleteOutlined, DownOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import componentStyles from "./styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { FRONT_END_URL, RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { BlogsTypes } from "../../../../Modules/Blogs/types";
import { BlogsModule } from "../../../../Modules/Blogs";
import { convertDate } from "../../../../helpers/dateHandler";
import { BlogsStatus } from "../../../../helpers/commonEnums";
import { GIcon, ImageIcon, ViewIcon } from "../../../Icons";
import { RootState } from "../../../../Redux/store";
import { useSelector } from "react-redux";
import TokenService from "../../../../services/tokenService";
import { BlogsPermissionsEnum } from "../../../../Modules/Blogs/permissions";
const { Paragraph } = AntdTypography;

type _ActionComponentProps = {
	record: BlogsTypes,
	onSeoIconClick: (data: BlogsTypes) => void,
	onImageClick: (data: BlogsTypes) => void,
	permissions: { [key in BlogsPermissionsEnum]: boolean },
}

const ActionComponent = (props: _ActionComponentProps & ActionComponentProps) => {
	const { record, onEditIconClick, reloadTableData,
		onSeoIconClick, onImageClick, permissions: {
			deleteBlogs,
		},
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new BlogsModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteBlogs === false) {
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

type StatusDropdownProps = {
	status: number;
	recordId: Key;
	reloadTableData: () => void;
	verifyAndPublishBlogs: boolean;
	changeBlogsStatus: boolean;
}

/** Status Dropdown */
const StatusDropdown = (props: StatusDropdownProps) => {
	const {
		status, recordId, reloadTableData,
		changeBlogsStatus, verifyAndPublishBlogs
	} = props

	const [messageApi, contextHolder] = message.useMessage();

	const module = useMemo(() => new BlogsModule(), []);

	const openMessage = (data: {
		key: string;
		type: "success" | "error" | "info" | "warning" | "loading";
		content: string
	}) => {
		messageApi.open({
			key: data.key,
			type: data.type,
			content: data.content,
			duration: data.type === "loading" ? 0 : 2,
		});
	};

	// controls the dropdown visibility
	const [visible, setVisible] = useState<boolean>(false);

	// handle dropdown menu visibility change event
	const onVisibleChange = (flag: boolean) => {
		setVisible(flag);
	};

	const onStatusChange = (_status: number) => {
		if (recordId && changeBlogsStatus === true) {
			openMessage({
				key: "update",
				type: "loading",
				content: "Updating..."
			});

			module.updateRecordByStatus(Number(recordId), _status).then((res) => {
				if (res?.data?.data) {
					openMessage({
						key: "update",
						type: "success",
						content: res?.data?.message
					});
					setVisible(!visible)

					reloadTableData()
				}
			}).catch((err) => {
				openMessage({
					key: "update",
					type: "error",
					content: err?.response?.data?.message
				});
			});
		} else {
			openMessage({
				key: "update",
				type: "error",
				content: "You don't have permission to change status"
			});
		}
	}

	const onPublishChange = (_status: number) => {
		if (recordId && verifyAndPublishBlogs === true) {
			openMessage({
				key: "publish",
				type: "loading",
				content: "Publishing..."
			});

			module.verifyAndPublish({ status: _status }, Number(recordId)).then((res) => {
				if (res?.data?.data) {
					openMessage({
						key: "publish",
						type: "success",
						content: res?.data?.message
					});
					setVisible(!visible)

					reloadTableData()
				}
			}).catch((err) => {
				openMessage({
					key: "publish",
					type: "error",
					content: err?.response?.data?.message
				});
			});
		} else {
			openMessage({
				key: "publish",
				type: "error",
				content: "You don't have permission to publish"
			});
		}
	}

	const overlay = (
		<Card className={`${componentStyles.overlay} pa-2`}>
			{contextHolder}
			{Object.entries(BlogsStatus).map(([key, value]) => {
				return (
					<div
						key={`blogs-status-${key}`}
						className={componentStyles.overlay_item}
						onClick={() => {
							if (changeBlogsStatus) {
								const selectedStatus = Number(value)
								if (status !== selectedStatus) {
									if (value === BlogsStatus["Verified & Published"]) {
										onPublishChange(selectedStatus)
									} else {
										onStatusChange(selectedStatus)
									}
								}
							}
						}}
					>
						<span className={(status === Number(value)) ? componentStyles.disabledButton : ""}>{key}</span>
					</div>
				)
			})}
		</Card>
	)

	return (
		<div>
			<Dropdown
				dropdownRender={() => overlay}
				trigger={changeBlogsStatus === true ? ["click"] : []}
				open={changeBlogsStatus === true ? visible : false}
				onOpenChange={onVisibleChange}
				className={componentStyles.dropdown}
			>
				<div>
					<Space>
						{Object.entries(BlogsStatus).map(([key, value]) => {
							return value === String(status) && key
						})}

						{changeBlogsStatus === true && <DownOutlined />}
					</Space>
				</div>
			</Dropdown>
		</div>
	);
}

export default function TableComponent(props: TableProps & {
	tableData: BlogsTypes[],
	onSeoIconClick: (record: BlogsTypes) => void,
	onImageClick: (record: BlogsTypes) => void,
}) {
	const {
		tableData, tableLoading, onEditIconClick, reloadTableData,
		onSeoIconClick, onImageClick
	} = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in BlogsPermissionsEnum]: boolean };

	const {
		//createBlogs, updateBlogs, deleteBlogs, readBlogs,
		changeBlogsStatus, verifyAndPublishBlogs,
		//updateBlogsSEO,
	} = permissions;

	// access token
	const access_token = TokenService.getLocalAccessToken();

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
			dataIndex: "description",
			key: "description",
			render: (text: string, record: BlogsTypes) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{record.localization[0].title}
					</Typography>

					{/**if blog status is verified and published then show the blog link else show the preview link */}
					{record.status === 4 ? (
						<a
							href={`${FRONT_END_URL}/en/blogs/${record.blogsCategory?.slug}/${record.slug}`}
							target={'_blank'}
							rel="noreferrer"
						>
							<Paragraph
								ellipsis={{ rows: 1, expandable: false, }}
								title={record.localization[0].title}
								className="font-size-xs color-light-800 mt-1"
							>
								{record.slug}
							</Paragraph>
						</a>
					) : (
						<a
							href={`${FRONT_END_URL}/en/blogs/preview/${record.id}?access_token=${access_token}`}
							target={'_blank'}
							rel="noreferrer"
							title={`Preview ${record.localization[0].title}`}
							className="d-flex font-size-xs color-light-800 mt-1"
						>
							Preview Blog <ViewIcon className="my-auto ml-1" />
						</a>
					)}
				</>
			),
		},
		{
			title: "Category",
			dataIndex: "blogsCategory",
			key: "blogsCategory",
			render: (blogsCategory: string, record: BlogsTypes) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{record?.blogsCategory?.localization[0]?.title}
				</Typography>
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
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status: number, record: BlogsTypes) => (
				<StatusDropdown
					recordId={record.id}
					status={status}
					reloadTableData={reloadTableData}
					verifyAndPublishBlogs={verifyAndPublishBlogs}
					changeBlogsStatus={changeBlogsStatus}
				/>
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
					onImageClick={onImageClick}
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
				rowKey={(record: BlogsTypes) => `site-blogs-${record.id}`}
			/>
		</div>
	);
}
