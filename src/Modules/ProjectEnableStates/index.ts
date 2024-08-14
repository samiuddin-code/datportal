import { GetResponseTypes } from "@modules/Common/common.interface";
import apiInstance from "@services/axiosInstance";
import { ProjectEnableStatesType } from "./types";



export class ProjectEnableStatesModule {
  private readonly endPoint = "project-enable-states";

  getAllRecords = <Type extends GetResponseTypes<ProjectEnableStatesType[]>>(query?: Type['query']) => {
    return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
  };

  getByProjectId = (projectId: number) => {
    return apiInstance.get(this.endPoint + "/by-project/" + projectId);
  };

  createRecordStates = (data: { projectStateIds: number[] }, projectId: number) => {
    return apiInstance.post(`${this.endPoint}/updateProjectStates`, { ...data, projectId });
  };

  deleteRecord = (data: { projectStateIds: number[] }, projectId: number) => {
    return apiInstance.delete(`${this.endPoint}/remove`, { data: { ...data, projectId } });
  };
}
