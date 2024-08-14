import { useMemo, useState } from "react";
import { Popconfirm, Table, Image, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { convertDate } from "../../../../helpers/dateHandler";
import { PagesSectionContentModule } from "../../../../Modules/PagesSectionContent";
import { PagesContent_TCreateInput, PagesSectionContentType } from "../../../../Modules/PagesSectionContent/types";
import { Switch } from "../../../Atoms/Switch";
import { PagesContentPermissionsEnum } from "../../../../Modules/PagesSectionContent/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";

interface _ActionComponentProps extends ActionComponentProps {
	record: PagesSectionContentType;
	permissions: { [key in PagesContentPermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deleteSitePagesContent }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = useMemo(() => new PagesSectionContentModule(), []);

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteSitePagesContent === false) {
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

export default function TableComponent(props: TableProps & { tableData: PagesSectionContentType[] }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in PagesContentPermissionsEnum]: boolean };

	const module = new PagesSectionContentModule();

	const onIsPublishedChange = (checked: boolean, recordId: number) => {
		return module.updateRecord({ isPublished: checked }, recordId);
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
			dataIndex: "localization",
			key: "localization",
			render: (_localization: PagesContent_TCreateInput[], record: PagesSectionContentType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{record.localization[0].title}
					</Typography>
				</>
			),
		},
		{
			title: "Country",
			dataIndex: "country",
			key: "country",
			render: (_country: string, record: PagesSectionContentType) => (
				<Typography color="dark-sub" size="sm">
					{(record?.country) ? record?.country.name : ""}
				</Typography>
			),
		},
		{
			title: "Image",
			dataIndex: "image",
			key: "image",
			render: (image: string, record: PagesSectionContentType) =>
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
			render: (_date: string, record: PagesSectionContentType) => (
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
			title: "Published",
			dataIndex: "isPublished",
			key: "isPublished",
			render: (checked: boolean | undefined, record: PagesSectionContentType) => (
				<Switch
					checked={checked}
					onChange={onIsPublishedChange}
					recordId={record.id}
					allowChange={permissions.updateSitePagesContent}
				/>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (_text: string, record: PagesSectionContentType) => (
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
				rowKey={(record: PagesSectionContentType) => `site-pages-content-${record.id}`}
			/>
		</div>
	);
}
