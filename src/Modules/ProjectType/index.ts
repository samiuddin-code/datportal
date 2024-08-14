import { GetResponseTypes } from "@modules/Common/common.interface";
import apiInstance from "@services/axiosInstance";
import { ProjectTypeType, ProjectTypeParamTypes } from "./types";

export class ProjectTypeModule {
  private readonly endPoint = "project-type";
  /**Get all project type records
  * @param query - query params
  */
  getAllRecords = <Type extends GetResponseTypes<ProjectTypeType[], ProjectTypeParamTypes>>(query?: Type['query']) => {
    return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
  };
  /**Get all publish project type records
  * @param query - query params
  */
  getPublishRecords = <Type extends GetResponseTypes<ProjectTypeType[], ProjectTypeParamTypes>>(query?: Type['query']) => {
    return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/find-published`, { params: query });
  };

  /**Get project type record by id
  * @param id - project type id
  */
  getRecordById = <Type extends GetResponseTypes<ProjectTypeType>>(id: number) => {
    return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint + "/" + id);
  };

  deleteRecord = (id: number) => {
    return apiInstance.delete(this.endPoint + "/" + id);
  };

  createRecord = (data: FormData | Partial<ProjectTypeType>) => {
    return apiInstance.post(this.endPoint, data);
  };

  updateRecord = (data: FormData | Partial<ProjectTypeType>, id: number) => {
    return apiInstance.patch(this.endPoint + "/" + id, data);
  };
}