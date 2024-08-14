import { GetResponseTypes } from "@modules/Common/common.interface";
import apiInstance from "../../services/axiosInstance";
import { RoleTypes } from "./types";

export class RolesModule {
	private readonly endPoint = "role";

	getAllRecords = <Type extends GetResponseTypes<RoleTypes[]>>(query?: Type['query']) => {
		return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}?all=true`);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	createRecord = (data: RoleTypes) => {
		return apiInstance.post(this.endPoint + "/", data);
	};

	updateRecord = (data: Partial<RoleTypes>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data);
	};

	/** Add Elements to Role
 * @param {number} id - The id of the Role
 * @param {number[]} data.elementIds - The ids of the Elements
 */
	addElements = (data: { elementIds: number[] }, id: number) => {
		return apiInstance.post(`${this.endPoint}/addDashboardElement/${id}`, data);
	}

	/**
	 * Remove Elements from Role
	 * @param {number} id - The id of the Role
	 * @param {number[]} data.elementIds - The ids of the Elements
	 */
	removeElements = (data: { elementIds: number[] }, id: number) => {
		return apiInstance.post(`${this.endPoint}/removeDashboardElement/${id}`, data);
	}
}
