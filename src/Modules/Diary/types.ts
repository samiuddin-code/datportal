import { APIResponseObject } from "../Common/common.interface";
import { ProjectTypes } from "../Project/types";
import { UserTypes } from "../User/types";

export type DiaryType = {
    id: number;
    taskTypeId: number;
    remarks: string;
    noOfHours: number;
    projectId: number;
    userId: number;
    isPublished: boolean;
    isDeleted: boolean;
    addedDate: Date;
    modifiedDate: Date;
    project: ProjectTypes;
    taskType: ProjectTypes;
    user: UserTypes
};

export type DiaryTypeResponseObject = APIResponseObject & { data: DiaryType };
export type DiaryTypeResponseArray = APIResponseObject & { data: Array<DiaryType> };