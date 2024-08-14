import apiInstance from "../../services/axiosInstance";
import { FormDataHeader } from "../Common/config";
import { SitePagesType } from "./types";

export class SitePagesModule {
	private readonly endPoint = "site-pages";

	createRecord = (data: FormData | SitePagesType) => {
		return apiInstance.post(this.endPoint + "/", data);
	};

	getAllRecords = (queryData?: any) => {
		return apiInstance.get(this.endPoint, { params: queryData });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}?all=true`);
	};

	updateRecord = (data: FormData | Partial<SitePagesType>, id: number) => {
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

	deleteMultiple = (pageId: number, sectionIds: string[]) => {
		return apiInstance.delete(`${this.endPoint}/removeMultipleSectionFromPage`, {
			params: {
				pageId: pageId,
				sectionIds: sectionIds
			}
		});
	};
}
