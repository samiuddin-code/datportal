import apiInstance from "../../services/axiosInstance";
import { FormDataHeader } from "../Common/config";
import { PagesSectionType } from "./types";

export class PagesSectionModule {
	private readonly endPoint = "site-pages-section";

	createRecord = (data: FormData | PagesSectionType) => {
		return apiInstance.post(this.endPoint + "/", data, { headers: FormDataHeader });
	};

	getAllRecords = (queryData?: any) => {
		return apiInstance.get(this.endPoint, { params: queryData });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}?all=true`);
	};

	updateRecord = (data: FormData | Partial<PagesSectionType>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data, { headers: FormDataHeader });
	};

	allowMultiples = (id: number) => {
		return apiInstance.patch(`${this.endPoint}/allowMultiples/${id}`);
	};
	disallowMultiples = (id: number) => {
		return apiInstance.patch(`${this.endPoint}/disallowMultiples/${id}`);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};
}
