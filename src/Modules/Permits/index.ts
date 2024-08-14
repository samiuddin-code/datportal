import { GetResponseTypes } from "@modules/Common/common.interface";
import apiInstance from "../../services/axiosInstance";
import { PermitsType, PermitsQueryType } from "./types";
import { FormDataHeader } from "@modules/Common/config";

export class PermitsModule {
	private readonly endPoint = "permits";

	getAllRecords = <Type extends GetResponseTypes<PermitsType[], PermitsQueryType>>(query?: Type['query']) => {
		return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}`)
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	createRecord = (data: FormData | Partial<PermitsType>) => {
		return apiInstance.post(this.endPoint, data, { headers: FormDataHeader });
	};

	updateRecord = (data: FormData | Partial<PermitsType>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data, { headers: FormDataHeader });
	};
}