import { APIResponseObject } from "../Common/common.interface";

export type ProjectTypeType = {
    id: number;
    title: string;
    slug: string;
    isDefault: boolean;
    shouldCloseProject: boolean;
    order: number;
    isPublished: boolean;
    isDeleted: boolean;
    addedDate: Date;
};

export type ProjectTypeParamTypes = {
    title: string;
    slug: string;
}

export type ProjectTypeResponseObject = APIResponseObject & { data: ProjectTypeType };
export type ProjectTypeResponseArray = APIResponseObject & {
    data: Array<ProjectTypeType>;
};
