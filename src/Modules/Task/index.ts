import apiInstance, { BASE_URL } from "../../services/axiosInstance";
import { GetResponseTypes } from "../Common/common.interface";
import { FormDataHeader } from "../Common/config";
import { TaskQuery, TaskType, UpdateTaskMemberType } from "./types";

export class TaskModule {
  private readonly endPoint = "task";

  getAllRecords = <Type extends GetResponseTypes<TaskType[], TaskQuery>>(query?: Type['query']) => {
    return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, {
      params: {
        sortByField: 'order',
        sortOrder: 'asc',
        perPage: 10,
        ...query
      }
    });
  };

  getTechSupportRequest = <Type extends GetResponseTypes<TaskType[], TaskQuery>>(query?: Type['query']) => {
    return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint + "/techSupport", {
      params: {
        sortByField: 'order',
        sortOrder: 'asc',
        perPage: 10,
        ...query
      }
    });
  };

  getRecordById = (id: number) => {
    return apiInstance.get<{ data: TaskType }>(BASE_URL + this.endPoint + "/findOne/" + id);
  };

  deleteRecord = (id: number) => {
    return apiInstance.delete(BASE_URL + this.endPoint + "/delete/" + id);
  };

  createRecord = (data: FormData | Partial<TaskType>) => {
    return apiInstance.post(BASE_URL + this.endPoint, data);
  };
  uploadFiles = (data: FormData | any) => {
    return apiInstance.post(BASE_URL + this.endPoint + "/uploadTaskFiles", data, {
      headers: FormDataHeader
    });
  };

  updateRecord = (data: Partial<TaskType>, id: number) => {
    return apiInstance.patch(BASE_URL + this.endPoint + "/update/" + id, data);
  };

  /**
   * Update Order
   * @param {number} data.order - Order Number
   * @param {number} id - Record Id
   */
  updateOrder = (data: { order?: number }, id: number) => {
    return apiInstance.patch(BASE_URL + this.endPoint + `/updateOrder/${id}`, data);
  }

  /**Update Task Member
   * @param {Partial<UpdateTaskMemberType>} data - Task Member Data
   */
  updateTaskMembers = (data: Partial<UpdateTaskMemberType>) => {
    return apiInstance.patch(`${this.endPoint}/updateProjectMembers`, data);
  }

  /**Remove Task Member
 * @param {number} taskId - Task Id
 * @param {number} userId - User Id
 */
  removeTaskMembers = (taskId: number, userId: number) => {
    return apiInstance.delete(`${this.endPoint}/removeProjectMembers/${taskId}/${userId}`);
  }

  /**Remove Task File
   * @param {number} id - Task File Id
   */
  removeTaskFile = (id: number) => {
    return apiInstance.delete(`${this.endPoint}/removeFiles/${id}`);
  }
}