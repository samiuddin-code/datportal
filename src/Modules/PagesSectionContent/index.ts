import apiInstance from "../../services/axiosInstance";
import { FormDataHeader } from "../Common/config";
import { PagesSectionContentType } from "./types";

export class PagesSectionContentModule {
	private readonly endPoint = "site-pages-content";
	createRecord = (data: FormData | PagesSectionContentType) => {
		return apiInstance.post(this.endPoint + "/", data, { headers: FormDataHeader });
	};

	getAllRecords = (queryData?: any) => {
		return apiInstance.get(this.endPoint, { params: queryData });
	};

	getAllRecordsByCategory = (categoryId?: number) => {
		return apiInstance.get(this.endPoint + "/pageContentByCategory/" + categoryId);
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}?all=true`);
	};

	updateRecord = (data: FormData | Partial<PagesSectionContentType>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data, { headers: FormDataHeader });
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};
}
