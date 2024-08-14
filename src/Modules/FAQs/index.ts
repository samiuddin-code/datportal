import { FormDataHeader } from "@modules/Common/config";
import apiInstance from "../../services/axiosInstance";
import { FAQTypes, FAQ_API_QUERY_TYPES } from "./types";

export class FAQModule {
	private readonly endPoint = "faqs";

	getAllRecords = (query?: any) => {
		return apiInstance.get(this.endPoint, { params: query });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}?all=true`);
	};

	getAllPublishedRecords = (queryData?: Partial<FAQ_API_QUERY_TYPES>) => {
		return apiInstance.get(`${this.endPoint}/find-published`, { params: queryData });
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

	// Faqs Images
	getAllImages = (id: number) => {
		return apiInstance.get(`${this.endPoint}/getFaqsImages/${id}`);
	}

	// Upload Images
	uploadImages = (data: FormData) => {
		return apiInstance.post(`${this.endPoint}/uploadImages`, data, { headers: FormDataHeader });
	}

	// Remove Images
	removeImages = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/removeImages/${id}`);
	}
}
