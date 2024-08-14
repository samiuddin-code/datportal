import { useEffect, useState } from "react";
import { ClientModal } from "./modal";
import TableComponent from "./table-columns";
import { ClientType } from "../../../../Modules/Client/types";
import { CustomFilter, PageHeader } from "../../../Atoms";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { Input, message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { ClientPermissionsEnum } from "../../../../Modules/Client/permissions";
import { ClientModule } from "../../../../Modules/Client";
import Layout from "@templates/Layout";
import { ClientsType } from "@helpers/commonEnums";
import { useFetchData } from "hooks";
import { capitalize, getPermissionSlugs } from "@helpers/common";
import { useDebounce } from "@helpers/useDebounce";

const breadCrumbsData = [
	{
		text: "Home",
		isLink: true,
		path: "/",
	},
	{
		isLink: false,
		text: "Clients",
	},
];

function Clients() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(ClientPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in ClientPermissionsEnum]: boolean };
	const { readClient, createClient, updateClient } = permissions;
	const [filters, setFilters] = useState<{ name?: string, type?: ClientsType, email?: string, phone?: string, page: number, perPage: number }>({
		name: undefined,
		type: undefined,
		email: undefined,
		phone: undefined,
		page: 1,
		perPage: 10
	})
	const debouncedName = useDebounce(filters.name, 500);
	useEffect(() => {
		onRefresh(filters)
	}, [debouncedName])

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new ClientModule();

	const { data, onRefresh, setData, loading, meta } = useFetchData<ClientType[]>({
		method: module.getAllRecords,
		initialQuery: { ...filters }
	});

	const onCancelClick = () => {
		if (createClient === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};


	const onEditIconClick = (record: ClientType) => {
		if (updateClient === false) {
			message.error("You don't have permission to update this record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			editType: "edit",
			recordId: record.id,
			openModal: true,
		});
	};


	return (
		<Layout permissionSlug={permissionSlug}>
			<PageHeader
				heading="Clients"
				buttonText="Add Client"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createClient === true ? true : false}
				filters={
					<div >
						<div>
							<Input
								type="input"
								placeholder="Name"
								name="name"
								onChange={(event) => {
									const _temp = { ...filters, name: event.target.value };
									setFilters(_temp);
								}}
								value={filters.name}
								allowClear
								style={{
									border: '1.5px solid var(--color-border)',
									borderRadius: '0.25rem'
								}}
								prefix={<img style={{ padding: '0rem 0.5rem' }} src="/images/searchIcon.svg" alt="" />}
							/>
						</div>
						<div>
							<CustomFilter
								type="email"
								label="Email"
								name="email"
								withSearch={false}
								onChange={(event) => {
									const _temp = { ...filters, email: event.target.value };
									setFilters(_temp);
								}}
								value={filters.email}
								onReset={() => {
									const _temp = { ...filters, email: undefined };
									setFilters(_temp);
									onRefresh(_temp);
								}}
								onUpdate={() => onRefresh(filters)}
							/>
						</div>
						<div>
							<CustomFilter
								type="input"
								label="Phone"
								name="phone"
								withSearch={false}
								onChange={(event) => {
									const _temp = { ...filters, phone: event.target.value };
									setFilters(_temp);
								}}
								value={filters.phone}
								onReset={() => {
									const _temp = { ...filters, phone: undefined };
									setFilters(_temp);
									onRefresh(_temp);
								}}
								onUpdate={() => onRefresh(filters)}
							/>
						</div>
						<div>
							<CustomFilter
								type="radio"
								label="Type"
								name="type"
								withSearch={false}
								options={Object.entries(ClientsType).map(([key, value]) => {
									return {
										label: capitalize(key),
										value: value,
									}
								})}
								onChange={(event) => {
									const _temp = { ...filters, type: event.target.value };
									setFilters(_temp);
								}}
								value={filters.type}
								onReset={() => {
									const _temp = { ...filters, type: undefined };
									setFilters(_temp);
									onRefresh(_temp);
								}}
								onUpdate={() => onRefresh(filters)}
							/>
						</div>
					</div>
				}
			/>
			{readClient === true && (
				<TableComponent
					tableData={data!}
					tableLoading={loading}
					onEditIconClick={onEditIconClick}
					reloadTableData={onRefresh}
					meta={meta}
					filters={filters}
				/>
			)}
			{readClient === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}

			{currentEditType.openModal && (
				<ClientModal
					record={currentEditType.recordId}
					type={currentEditType.editType}
					reloadTableData={() => onRefresh()}
					onCancel={onCancelClick}
					openModal={currentEditType.openModal}
					permissions={permissions}
				/>
			)}
		</Layout>
	);
}
export default Clients;
