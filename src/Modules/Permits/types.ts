import { TypeFromEnumValues } from "@helpers/common";
import { PermitClientStatus, PermitFinanceStatus } from "@helpers/commonEnums";
import { AuthoritiesType } from "@modules/Authorities/types";
import { ProjectTypes } from "@modules/Project/types";
import { UserTypes } from "@modules/User/types";

export type PermitsType = {
    id: number
    clientId: number,
    projectId: number,
    authorityId: number,
    title: string,
    remarks: string,
    financeStatus: TypeFromEnumValues<typeof PermitFinanceStatus>,
    clientStatus: TypeFromEnumValues<typeof PermitClientStatus>,
    approvedDate: string,
    expiryDate: string,
    addedDate: string,
    modifiedDate: string,
    addedById: number,
    modifiedById: number
    isDeleted: boolean;
    Resources: ResourceTypes[];
    Project: ProjectTypes;
    AddedBy: UserTypes
    Client: ClientTypes
    Authority: AuthoritiesType
    _count: {
        Resources: number;
    }
};

export type ResourceTypes = {
    id: number;
    uuid: string;
    documentType: string;
    title: string;
    file: string;
    fileType: string;
    fileSize: number;
    name: string;
    path: string;
    description: string;
    order: number;
    comments: string;
    visibility: string;
    projectId: number;
    taskId: number;
    projectConversationId: number;
    isTemp: boolean;
    status: number;
    isDeleted: boolean;
    isDefault: boolean;
    isProcessing: boolean;
    backgroundId: number;
    addedDate: string;
    modifiedDate: string;
    deletedDate: string;
    addedById: number;
    modifiedById: number;
    deletedById: number;
    permitId: number;
}

export type PermitsQueryType = {
    financeStatus: TypeFromEnumValues<typeof PermitFinanceStatus>,
    clientStatus: TypeFromEnumValues<typeof PermitClientStatus>,
    fromDate: string,
    toDate: string,
    projectId: number,
    clientId: number,
    authorityId: number,
    onlyActive: boolean,
    onlyExpired: boolean,
}