import { APIResponseObject } from "../Common/common.interface";
import { ProjectTypes } from "../Project/types";
import { UserTypes } from "../User/types";

export type TaskType = {
    id: number;
    uuid: string;
    title: string;
    addedDate: string;
    taskStartFrom: string;
    taskEndOn: string;
    priority: number;
    status: number;
    order: number;
    AddedBy: UserTypes;
    ClosedBy: null;
    TaskMembers: TaskMember[];
    projectId: number;
    _count: Count;
    instructions: string;
    type: 1 | 2
}
export interface TaskDetailType {
    id: number;
    uuid: string;
    projectId: number;
    title: string;
    priority: number;
    order: number;
    instructions: string;
    taskStartFrom: string;
    taskEndOn: string;
    hasExtendedDate: boolean;
    extendedDate: string;
    reasonOfExtension: string;
    addedById: number;
    closedById: number;
    status: number;
    addedDate: string;
    isDeleted: boolean;
    Resources: Resource[];
    addedBy: number;
    ClosedBy: UserTypes;
    Project: ProjectTypes;
    TaskMembers: TaskMember[];
    AddedBy: UserTypes
}

export interface Resource {
    file: string;
    fileType: string;
    path: string;
    name: string;
    id: number;
    uuid: string;
    addedDate: Date;
}

export type TaskQuery = {
    projectId?: number;
    status?: number;
    userIds?: number[];
    type?: "myTask" | "assignedTask",
    taskType?: 1 | 2;
    sortByField?: string;
    sortOrder?: string;
    perPage?: number;
    page?: number;
}

export interface Count {
    Resources: number;
}

export interface TaskMember {
    User: UserTypes;
}


export type UpdateTaskMemberType = {
    taskId: number;
    assignedTo: string[];
}

export type TaskResponseObject = APIResponseObject & { data: TaskType };
export type TaskResponseArray = APIResponseObject & {
    data: Array<TaskType>;
};
