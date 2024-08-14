import { DashboardElementType } from "@modules/DashboardElement/types";
import { APIResponseObject } from "../Common/common.interface";

export const Visibility = {
    coreSystemLevel: "coreSystemLevel",
    global: "global",
    organization: "organization",
};

export type VisibilityType = typeof Visibility[keyof typeof Visibility];

export type RoleTypes = {
    id: number;
    title: string;
    slug: string;
    description: string;
    addedDate: Date;
    modifiedDate: Date;
    deletedDate: Date;
    addedById: number;
    modifiedById: number;
    deletedById: number;
    isDeleted: boolean;
    isPublished: boolean;
    DashboardElements: {
        dashboardElementId:number,
        order: number,
        roleId:number,
        DashboardElement: DashboardElementType
    }[];
};

export type RoleResponseObject = APIResponseObject & { data: RoleTypes };
export type RoleResponseArray = APIResponseObject & { data: Array<RoleTypes> };
