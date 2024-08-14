import { useCallback, useMemo } from "react";
import { message, Popconfirm, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import { Switch } from "../../../Atoms/Switch";
import styles from "./styles.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { tableProps } from "./settings";
import { dispatchType } from "../../../../Redux/Reducers/commonTypes";
import { Language, SET_LANGUAGE_DATA } from "../../../../Redux/Reducers/LanguageReducer/types";
import { LanguageModule } from "../../../../Modules/Language";
import { LanguagePermissionsEnum } from "../../../../Modules/Language/permissions";
import { RootState } from "../../../../Redux/store";

type ActionComponentProps = {
	record: any
	openModal: any
	permissions: { [key in LanguagePermissionsEnum]: boolean }
};

const ActionComponent = (props: ActionComponentProps) => {
	const { record, openModal, permissions: { deleteLanguage } } = props;
	const module = useMemo(() => new LanguageModule(), []);

	const dispatch = useDispatch<dispatchType>();

	const onDelete = useCallback((id: number) => {
		if (deleteLanguage === false) {
			message.error("You don't have permission to delete this record, please contact your admin.");
			return;
		}

		module.deleteRecord(id).then((res) => {
			if (res && res.data) {
				module.getAllRecords().then((res) => {
					if (res && res.data) {
						dispatch({
							type: SET_LANGUAGE_DATA,
							payload: { loading: false, data: res?.data?.data }
						});
					}
				});
			}
		});
	}, [dispatch, module]);

	return (
		<div className={styles.actions}>
			<span onClick={() => openModal(record)}>
				<img src="/images/editicon.svg" alt="" />
			</span>
			<Popconfirm
				placement="top"
				title={"Are you sure?"}
				onConfirm={() => onDelete(record.id)}
				okText={"Yes"}
				cancelText={"No"}
			>
				<DeleteOutlined className={styles.bg__red} />
			</Popconfirm>
		</div>
	);
};

export default function TableComponent(props: tableProps) {
	const { tableData, tableLoading, openModal } = props;

	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in LanguagePermissionsEnum]: boolean };

	const module = new LanguageModule();
	const onIsPublishedChange = async (checked: boolean, recordId: number) => {
		let res = await module.updateRecord({ isPublished: checked }, recordId);
		return res;
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
			title: "Name",
			dataIndex: "name",
			key: "name",
			render: (text: string) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{text}
				</Typography>
			),
		},
		{
			title: "ISO Code",
			dataIndex: "code",
			key: "code",
			render: (text: string) => (
				<Typography color="dark-sub" size="sm">
					{text}
				</Typography>
			),
		},
		{
			title: "Native Name",
			dataIndex: "nativeName",
			key: "nativeName",
			render: (text: string) => (
				<Typography color="dark-sub" size="sm">
					{text}
				</Typography>
			),
		},
		{
			title: "Published",
			dataIndex: "isPublished",
			key: "isPublished",
			render: (checked: boolean, record: Language) => (
				<Switch checked={checked} onChange={onIsPublishedChange} recordId={record.id} />
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: {}) => (
				<ActionComponent
					record={record}
					openModal={openModal}
					permissions={permissions}
				/>
			),
		},
	];

	return (
		<Table
			sticky
			dataSource={tableData}
			columns={columns}
			pagination={false}
			loading={tableLoading}
			rowKey={(record: Language) => `language-${record.id}`}
		/>
	);
}
