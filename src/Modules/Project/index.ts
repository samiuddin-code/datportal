import { GetResponseTypes } from "@modules/Common/common.interface";
import apiInstance from "../../services/axiosInstance";
import {
  ProjectConversationTypes, ProjectQueryTypes, ProjectResourceTypes,
  ProjectResourceQueryTypes, ProjectTypes, UpdateProjectMemberType,
  ProjectConversationQueryTypes, ProjectListForChatTypes, ShareProjectFileTypes
} from "./types";


export class ProjectModule {
  private readonly endPoint = "project";

  /**Get All Records
   * @param {any} query - Query Data (Optional)
   */
  getAllRecords = <Type extends GetResponseTypes<ProjectTypes[], ProjectQueryTypes>>(query?: Type['query']) => {
    return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
  };

  /**Get All Records In List
   * @param {any} query - Query Data (Optional)
   */
  getRecordsInList = <Type extends GetResponseTypes<ProjectTypes[], ProjectQueryTypes>>(query?: Type['query']) => {
    return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/project-list`, { params: query });
  };

  

  /**Get By Slug
   * @param {string} slug - Record Slug
   */
  getRecordBySlug = <Type extends GetResponseTypes<ProjectTypes>>(slug: string) => {
    return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/find-by-slug/${slug}`);
  }

  /**Get Record By Id 
   * @param {number} id - Record Id
   */
  getRecordById = <Type extends GetResponseTypes<ProjectTypes>>(id: number) => {
    return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/findEnableStates/${id}`);
  };

  /**Get Record By Id 
   * @param {number} id - Record Id
   */
  getByProjectId = <Type extends GetResponseTypes<ProjectTypes>>(id: number) => {
    return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/findOne/${id}`);
  };
  
   /** Add states to project
	 * @param {number} projectId - The id of the project
	 * @param {number[]} data.projectStateIds - The ids of the states
	 */
   createEnableStates = (data: { projectStateIds: number[] }, projectId: number) => {
    return apiInstance.post(`${this.endPoint}/addProjectStates/${projectId}`, data);
  };

  /**
	 * Remove states from project
	 * @param {number} projectId - The id of the user
	 * @param {number[]} data.projectStateIds - The ids of the roles
	 */
	removeProjectStates = (data: { projectStateIds: number[] }, projectId: number) => {
		return apiInstance.patch(`${this.endPoint}/removeProjectStates/${projectId}`, data);
	}

  /** Get Project Resources
   * @param query - Query Data (Optional)
   * @param {number} query.projectId - Project Id (Required)
  */
  getProjectResources = (query: Partial<ProjectResourceQueryTypes> & { projectId: number }) => {
    return apiInstance.get<{ data: ProjectResourceTypes[] }>(`${this.endPoint}/getProjectResources`, { params: query });
  }

  /**Get Project Conversations
   * @param query - Query Data (Optional)
   * @param {number} query.projectId - Project Id (Required)
   */
  getProjectConversations = <Type extends GetResponseTypes<ProjectConversationTypes[], ProjectConversationQueryTypes>>(query?: Type['query']) => {
    return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/getProjectNotes`, { params: query });
  }

  /**Get Project List For Chat
   * @param query - Query Data (Optional)
   * @param {string} query.title - Project Title (Optional)
   * @param {number} query.id - Project Id (Optional)
   */
  getProjectListForChat = <Type extends GetResponseTypes<ProjectListForChatTypes[], { title?: string; id?: number; }>>(query?: Type['query']) => {
    return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/getProjectForConversation`, { params: query });
  }

  /**Delete Record
   * @param {number} id - Record Id
   */
  deleteRecord = (id: number) => {
    return apiInstance.delete(`${this.endPoint}/${id}`);
  };

  /**Create Record
   * @param {Partial<ProjectTypes>} data - Record Data to be created
   */
  createRecord = (data: Partial<ProjectTypes>) => {
    return apiInstance.post<{ data: ProjectTypes }>(this.endPoint, data);
  };

  /**Add Project Conversations
   * @param {string} data.message - Project Conversation Message
   * @param {number} data.projectId - Project Id
   * @param {boolean} data.isPrivate - Is Private Conversation (Optional)
   */
  addProjectConversation = (data: { message: string; projectId: number; isPrivate?: boolean }) => {
    return apiInstance.post<{ data: ProjectConversationTypes; message: string }>(
      `${this.endPoint}/addProjectNote`, data
    );
  }

  /** Add Project Comment
   * @param {string} data.comment - Project Comment
   * @param {number} data.projectId - Project Id
   */
  addProjectComment = (data: { comment: string; projectId: number }) => {
    return apiInstance.post(`${this.endPoint}/addProjectComment`, data);
  }

  /**Update Record
   * @param {Partial<ProjectTypes>} data - Record Data to be updated
   * @param {number} id - Record Id
   */
  updateRecord = (data: Partial<ProjectTypes>, id: number) => {
    return apiInstance.patch(`${this.endPoint}/update/${id}`, data);
  };

  /**Update Project Status
   * @param {number} data.projectId - Project Id
   * @param {number} data.projectStateId - Project State Id
   */
  updateProjectStatus = (data: { projectId: number; projectStateId: number }) => {
    return apiInstance.patch(`${this.endPoint}/updateProjectStatus`, data);
  }

  /**Update Project Members
   * @param {Partial<UpdateProjectMemberType>} data - Project Member Data
   */
  updateProjectMembers = (data: Partial<UpdateProjectMemberType>) => {
    return apiInstance.patch(`${this.endPoint}/updateProjectMembers`, data);
  }

  /** Update Project Files
   * @param {number} id - File Id
   * @param {string} data.documentType - Document Type
   * @param {string} data.title - Document Title
   */
  updateFiles = (id: number, data: { documentType?: string; title?: string }) => {
    return apiInstance.patch(`${this.endPoint}/updateFiles/${id}`, data);
  }

   /**Remove Project Incharge
   * @param {number} projectId - Project Id
   * @param {number} userId - User Id
   */
   removeProjectIncharges = (projectId: number, userId: number) => {
    return apiInstance.delete(`${this.endPoint}/removeProjectIncharges/${projectId}/${userId}`);
  }

  /**Remove Project Member
   * @param {number} projectId - Project Id
   * @param {number} userId - User Id
   */
  removeProjectMembers = (projectId: number, userId: number) => {
    return apiInstance.delete(`${this.endPoint}/removeProjectMembers/${projectId}/${userId}`);
  }

  /**Remove Project Client
   * @param {number} projectId - Project Id
   * @param {number} clientId - Client Id
   */
  removeProjectClients = (projectId: number, clientId: number) => {
    return apiInstance.delete(`${this.endPoint}/removeProjectClient/${projectId}/${clientId}`);
  }

  /**Remove Project Files
   * @param {number} id - Project Id
   */
  removeProjectFiles = (id: number) => {
    return apiInstance.delete(`${this.endPoint}/removeProjectFiles/${id}`);
  }

  /**Remove Project Conversations
   * @param {number} id - Conversation Id
   */
  removeProjectConversations = (id: number) => {
    return apiInstance.delete(`${this.endPoint}/removeNote/${id}`);
  }

  /**Remove Project Comments
   * @param {number} id - Comment Id
   */
  removeProjectComments = (id: number) => {
    return apiInstance.delete(`${this.endPoint}/removeComment/${id}`);
  }

  /** Hold Project */
  holdProject = (data: { comment: string }, id: number) => {
    return apiInstance.patch(`${this.endPoint}/holdProject/${id}`, data);
  }

  /** Unhold Project */
  unholdProject = (data: { comment: string }, id: number) => {
    return apiInstance.patch(`${this.endPoint}/unholdProject/${id}`, data);
  }

  /** Remove Media From Project Conversation */
  removeMediaFromConversation = (id: number) => {
    return apiInstance.delete(`${this.endPoint}/removeNoteMedia/${id}`);
  }

  /** Share Files */
  shareFiles = (data: Partial<ShareProjectFileTypes>) => {
    return apiInstance.post(`${this.endPoint}/shareFiles`, data);
  }

  /** Shared Files 
   * @param {number} id - Project Id
   */
  sharedFiles = (id: number) => {
    return apiInstance.get(`${this.endPoint}/sharedFiles/${id}`);
  }
}
