import apiInstance from "../../services/axiosInstance";
import { FormDataHeader } from "../Common/config";
import { StaticPageSEOType } from "./types";

export class StaticPageSEOModule {
	private readonly endPoint = "static-page-seo";

	createRecord = (data: FormData | StaticPageSEOType) => {
		return apiInstance.post(this.endPoint + "/", data, { headers: FormDataHeader });
	};

	getAllPublishedRecords = () => {
		return apiInstance.get(this.endPoint + "/find-published");
	};

	getAllRecords = (queryData?: { sitePageId?: number, perPage?: number, page?: number }) => {
		return apiInstance.get(this.endPoint, { params: queryData });
	};

	getRecordBySlug = (slug: string) => {
		return apiInstance.get(`${this.endPoint}/${slug}`);
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/findById/${id}`);
	};

	updateRecord = (data: FormData | Partial<StaticPageSEOType>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data, { headers: FormDataHeader });
	};

	makeDefault = (id: number) => {
		return apiInstance.patch(`${this.endPoint}/make-default/${id}`);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};
}
