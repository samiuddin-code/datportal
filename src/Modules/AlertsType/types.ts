import { APIResponseObject } from "../Common/common.interface";

export type AlertsTypes = {
    id: number;
    slug: string;
    forAdminpanel: boolean;
    isPublished: boolean;
    isDeleted: boolean;
    addedDate: string;
    title: string;
    description: string;
    localization: Localization[];
}

export type Localization = {
    title: string;
    description: string;
}

export type AlertsTypeResponseObject = APIResponseObject & { data: AlertsTypes };
export type AlertsTypeResponseArray = APIResponseObject & { data: Array<AlertsTypes> };