import { GetResponseTypes } from "@modules/Common/common.interface";
import apiInstance from "@services/axiosInstance";
import { ProjectStateType } from "./types";




export class ProjectStateModule {
	private readonly endPoint = "project-state";

	getAllRecords = <Type extends GetResponseTypes<ProjectStateType[]>>(query?: Type['query']) => {
		return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
	};

	getPublishedRecords = <Type extends GetResponseTypes<ProjectStateType[]>>(query?: Type['query']) => {
		return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/find-published`, { params: query });
	};

	getAllStates = <Type extends GetResponseTypes<ProjectStateType[]>>(query?: Type['query']) => {
		return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/find-published-states`);
	};

	getRecordById = (id: number) => {
		return apiInstance.get(this.endPoint + "/" + id);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(this.endPoint + "/" + id);
	};

	createRecord = (data: FormData | Partial<ProjectStateType>) => {
		return apiInstance.post(this.endPoint, data);
	};

	updateRecord = (data: FormData | Partial<ProjectStateType>, id: number) => {
		return apiInstance.patch(this.endPoint + "/" + id, data);
	};
}