import { useCallback } from "react";
import { message, Popconfirm, Switch, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "./styles.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { tableProps } from "./areaUnitSettings";
import { RootState } from "../../../../Redux/store";
import {
	deleteAreaUnit,
	editAreaUnitDataAction,
	getAreaUnitData,
} from "../../../../Redux/Reducers/AreaUnitReducer/action";
import { dispatchType } from "../../../../Redux/Reducers/commonTypes";
import { AreaUnit } from "../../../../Redux/Reducers/AreaUnitReducer/types";
import { AreaUnitsPermissionsEnum } from "../../../../Modules/AreaUnits/permissions";

interface ActionComponentProps {
	record: any
	openModal: (e: React.MouseEvent<HTMLElement>) => void;
	permissions: { [key in AreaUnitsPermissionsEnum]: boolean };
}

const ActionComponent = (props: ActionComponentProps) => {
	const { record, openModal, permissions: {
		deleteAreaUnit: deletePermission,
		updateAreaUnit: updatePermission,
	} } = props;

	const dispatch = useDispatch<dispatchType>();

	const onDelete = useCallback((id: number) => {
		if (deletePermission === false) {
			message.error("You don't have permission to delete this record, please contact your admin.");
			return;
		}
		return dispatch(deleteAreaUnit(id, () => dispatch(getAreaUnitData())));
	}, [dispatch]);

	const openEditModal = () => {
		if (updatePermission === false) {
			message.error("You don't have permission to edit this record, please contact your admin.");
			return;
		}
		openModal(record)
	};

	return (
		<div className={styles.actions}>
			<span onClick={openEditModal}>
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
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in AreaUnitsPermissionsEnum]: boolean };

	const { tableData, tableLoading, openModal } = props;
	const dispatch = useDispatch<dispatchType>();

	const { editAreaUnitData } = useSelector((state: RootState) => state.areaUnitReducer);

	const onPublishChange = (checked: boolean, record: AreaUnit) => {
		if (permissions.updateAreaUnit === false) {
			message.error("You don't have permission to edit this record, please contact your admin.");
			return;
		}
		dispatch(
			editAreaUnitDataAction({ isPublished: checked ? true : false }, record, () => {
				dispatch(getAreaUnitData());
			})
		);
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
			title: "Symbol",
			dataIndex: "symbol",
			key: "symbol",
			render: (text: string) => (
				<Typography color="dark-sub" size="sm">
					{text}
				</Typography>
			),
		},
		{
			title: "Rate",
			dataIndex: "rate",
			key: "rate",
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
			render: (checked: boolean, record: AreaUnit) => (
				<Switch
					checked={checked}
					onChange={(_checked) => onPublishChange(_checked, record)}
					loading={editAreaUnitData.loading}
				/>
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
			rowKey={(record: AreaUnit) => `area-unit-${record.id}`}
		/>
	);
}
