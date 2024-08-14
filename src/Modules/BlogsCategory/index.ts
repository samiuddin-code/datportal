import apiInstance from "../../services/axiosInstance";
import { BlogsTypes } from "../Blogs/types";
import { FormDataHeader } from "../Common/config";

export class BlogsCategoryModule {
	private readonly endPoint = "blogs-category";

	createRecord = (data: FormData | BlogsTypes) => {
		return apiInstance.post(this.endPoint + "/", data, { headers: FormDataHeader })
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
		return apiInstance.patch(`${this.endPoint}/changeStatus/${id}`, {
			data: { status }
		});
	}

	createVerifyAndPublish = (data: FormData | Partial<BlogsTypes>, id: number) => {
		return apiInstance.post(`${this.endPoint}/verifyAndPublish/${id}`, data, { headers: FormDataHeader });
	}

	updateSEOById = (id: number, data: { seoTitle: string; seoDescription: string }) => {
		return apiInstance.patch(`${this.endPoint}/update-seo/${id}`, data);
	}

	unpublishedRecords = (id: number, status: boolean) => {
		return apiInstance.get(`${this.endPoint}/publish-unpublished/${id}`, {
			data: { status }
		});
	};
}
