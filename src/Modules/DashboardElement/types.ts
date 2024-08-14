import { ProjectTypes } from "@modules/Project/types";
import { APIResponseObject } from "../Common/common.interface";
import { ProjectStateType } from "@modules/ProjectState/types";
import { ProjectTypeType } from "@modules/ProjectType/types";
import { TaskType } from "@modules/Task/types";
import { NotificationTypes } from "@modules/Notification/types";

export type DashboardElementType = {
    id: number
    title: string
    slug: string
    isPublished: boolean
    isDeleted: boolean
};


export interface ContentType {
    all_tasks:                           ContentTask;
    notification:                        ContentNotification;
    active_projects:                     ContentProject;
    on_hold_projects:                    ContentProject;
    active_leads:                        ContentStat;
    closed_projects:                     ContentProject;
    ready_for_submission:                ContentProject;
    delayed_projects:                    ContentProject;
    new_project:                         ContentProject;
    pending_project_as_project_incharge: ContentStat;
    pending_project_as_support_engineer: ContentStat;
    active_quotations: ContentStat;
    pending_invoices: ContentStat;
    active_enquiries: ContentStat;
    active_reimbursement: ContentStat;
    active_leave_request: ContentStat;
    permits_expiring: ContentStat;
    government_fees_to_collect: ContentStat;
    active_cash_advance_request: ContentStat;
    active_employees: ContentStat;
    close_out_projects: ContentProject;
    approved_projects: ContentProject;
}

export interface ContentTask {
    fetchFromAPI: boolean;
    data:         TaskType[];
}
export interface ContentProject {
    fetchFromAPI: boolean;
    data:         ProjectTypes[];
}
export interface ContentNotification {
    fetchFromAPI: boolean;
    data:         NotificationTypes[];
}
export interface ContentStat {
    fetchFromAPI: boolean;
    data:         number;
}


export type DashboardElementResponseObject = APIResponseObject & { data: DashboardElementType };
export type DashboardElementResponseArray = APIResponseObject & {
    data: Array<DashboardElementType>;
};
