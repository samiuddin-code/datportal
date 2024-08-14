import { UserTypes } from "@modules/User/types";
import { APIResponseObject } from "../Common/common.interface";

export type NotificationTypes = {
    id: number
    slug: string
    icon: string
    message: string
    link: string
    addedDate: Date
    modifiedDate: Date
    type: string
    isActive: boolean
    Subscribers: { User: UserTypes }[]
    Department: {
        title: string
    }
    file: string
}

export type NotificationTypesResponseObject = APIResponseObject & { data: NotificationTypes };
export type NotificationTypesResponseArray = APIResponseObject & { data: Array<NotificationTypes> };