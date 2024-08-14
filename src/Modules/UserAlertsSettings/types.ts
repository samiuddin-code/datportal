import { APIResponseObject } from "../Common/common.interface";

export type UserAlertsSetting = {
    id: number;
    userId: number;
    alertsTypeId: number;
    desktop: boolean;
    mobile: boolean;
    email: boolean;
    app: boolean;
    addedDate: string;
    modifiedDate: string;
}

export type FindAlerts = {
    id: number;
    slug: string;
    isPublished: boolean;
    isDeleted: boolean;
    addedDate: string;
    title: string;
    description: string;
    UserAlertsSetting: UserAlertsSetting[];
}

export type Localization = {
    title: string;
    description: string;
}

export type UserAlertsSettingResponseObject = APIResponseObject & { data: UserAlertsSetting };
export type UserAlertsSettingResponseArray = APIResponseObject & { data: Array<UserAlertsSetting> };