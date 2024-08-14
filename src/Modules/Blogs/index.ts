import apiInstance from "../../services/axiosInstance";
import { FormDataHeader } from "../Common/config";
import { BlogsTypes } from "./types";

export class BlogsModule {
	private readonly endPoint = "blogs";

	createRecord = (data: FormData | BlogsTypes) => {
		return apiInstance.post(this.endPoint + "/", data, { headers: FormDataHeader });
	};

	getAllRecords = (queryData?: any) => {
		return apiInstance.get(this.endPoint, { params: queryData });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}?all=true`);
	};

	getAllPublishedRecords = () => {
		return apiInstance.get(`${this.endPoint}/find-published`);
	};

	getRecordByOneSlug = (slug: string) => {
		return apiInstance.get(`${this.endPoint}/findOneBySlug/${slug}`);
	}

	updateRecord = (data: FormData | Partial<BlogsTypes>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data, { headers: FormDataHeader });
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	updateRecordByStatus = (id: number, status: number) => {
		return apiInstance.post(`${this.endPoint}/changeStatus/${id}`, {
			status
		});
	}

	verifyAndPublish = (data: FormData | Partial<BlogsTypes>, id: number) => {
		return apiInstance.post(`${this.endPoint}/verifyAndPublish/${id}`, data, { headers: FormDataHeader });
	}

	updateSEOById = (id: number, data: { seoTitle: string; seoDescription: string }) => {
		return apiInstance.post(`${this.endPoint}/update-seo/${id}`, data);
	}

	// Blog Images
	getAllImages = (id: number) => {
		return apiInstance.get(`${this.endPoint}/getBlogImages/${id}`);
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
