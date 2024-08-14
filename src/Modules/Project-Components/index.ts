import apiInstance, { BASE_URL } from "../../services/axiosInstance";
import { FormDataHeader } from "../Common/config";
import { ProjectComponentType } from "./types";

export class ProjectComponentModule {
	private readonly endPoint = "project-components";

	getAllRecords = (queryData?: any) => {
		return apiInstance.get<{ data: ProjectComponentType[] }>(this.endPoint, { params: queryData });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(this.endPoint + "/" + id);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(this.endPoint + "/" + id);
	};

	createRecord = (data: FormData | ProjectComponentType) => {
		return apiInstance.post(this.endPoint, data);
	};

	updateRecord = (data: FormData | Partial<ProjectComponentType>, id: number) => {
		return apiInstance.patch(this.endPoint + "/" + id, data, { headers: FormDataHeader });
	};

	/** Find all published records */
	findPublishedRecords = () => {
		return apiInstance.get(this.endPoint + "/find-published");
	}

	/**
	 * Find record by slug
	 * @param slug - slug of the record
	 */
	findBySlug = (slug: string) => {
		return apiInstance.get(BASE_URL + this.endPoint + "/find-by-slug/" + slug);
	}
}