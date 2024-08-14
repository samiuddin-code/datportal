import apiInstance from "../../services/axiosInstance";
import { FormDataHeader } from "../Common/config";
import { PermissionsType } from "./types";

export class PermissionsModule {
	private readonly endPoint = "permissions";

	getAllRecords = () => {
		return apiInstance.get(this.endPoint);
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}`);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	createRecord = (data: FormData | PermissionsType) => {
		return apiInstance.post(this.endPoint + "/", data, { headers: FormDataHeader });
	};

	updateRecord = (data: FormData | Partial<PermissionsType>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data, { headers: FormDataHeader });
	};

	getRolePermissions = (roleId: number) => {
		return apiInstance.get(`${this.endPoint}/getRolePermissions/${roleId}`);
	};

	getRolePermissionsByModuleId = (roleId: number, moduleId: number) => {
		return apiInstance.get(`${this.endPoint}/getRolePermissions/${roleId}/${moduleId}`);
	};

	grantPrivilegesToRole = (data: { roleId: number; permissionIds: number[] }) => {
		return apiInstance.post(`${this.endPoint}/grantPrivilegesToRole`, data);
	};

	revokePrivilegesFromRole = (data: { roleId: number; permissionIds: number[] }) => {
		return apiInstance.post(`${this.endPoint}/revokePrivilegesFromRole`, data);
	};
}
