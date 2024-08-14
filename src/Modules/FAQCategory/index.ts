import apiInstance from "../../services/axiosInstance";
import { FAQTypes } from "../FAQs/types";
import { FaqsCategoryParamsTypes } from "./types";

export class FAQCategoryModule {
	private readonly endPoint = "faqs-category";

	getAllRecords = (params: FaqsCategoryParamsTypes = {}) => {
		return apiInstance.get(this.endPoint, { params: params });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}?all=true`);
	};

	getAllPublishedRecords = () => {
		return apiInstance.get(`${this.endPoint}/find-published`);
	};


	getRecordBySlug = (slug: string) => {
		return apiInstance.get(`${this.endPoint}/find-by-slug/${slug}`);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	createRecord = (data: FAQTypes) => {
		return apiInstance.post(this.endPoint + "/", data);
	};

	updateRecord = (data: Partial<FAQTypes>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data);
	};
}
