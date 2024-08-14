import { ClientType } from "@modules/Client/types";
import { ProjectDocumentsTypes, ProjectFileTypes } from "@helpers/commonEnums";
import { APIResponseObject } from "../Common/common.interface";
import { DepartmentType } from "../Department/types";
import { OrganizationType } from "../Organization/types";
import { ProjectStateType } from "../ProjectState/types";
import { ProjectEnableStatesType } from "../ProjectEnableStates/types";
import { UserTypes } from "../User/types";
import { QuotationTypes } from "@modules/Quotation/types";

export type ProjectTypes = {
  id: number;
  title: string;
  slug: string;
  startDate: string
  endDate: string;
  priority: number
  referenceNumber: string;
  ProjectState: ProjectStateType;
  ProjectEnableStates: ProjectEnableStatesType[]; 
  addedDate: string;
  ProjectMembers: ProjectMember[];
  ProjectType: DepartmentType;
  Client: ClientType;
  SubmissionBy: OrganizationType;
  ProjectHoldBy?: UserTypes;
  ProjectClient: {
    Client: ClientType;
    isRepresentative: boolean;
    clientId: number;
  }[]
  submissionById: number;
  clientId: number;
  projectTypeId: number;
  leadId: number;
  instructions: string;
  projectFilesLink: string;
  isExtended: boolean;
  reasonOfExtension: string;
  projectStateId: number;
  isDeleted: boolean;
  isClosed: boolean;
  onHold: boolean;
  comment: string;
  addedById: number;
  modifiedById: number;
  deletedById: number;
  modifiedDate: string;
  deletedDate: string;
  Quotation: QuotationTypes[];
  _count: CountType;
  FinanceReport: FinanceReportTypes
  xeroReference: string;
}

/** Auto Create Project from Approved Quotation */
export type AutoCreateFromApprovedQuotationTypes = {
  title: string;
  quoteId: number;
  instructions?: string;
  startDate?: string;
  endDate?: string;
  submissionById?: number;
  xeroReference?: string;
}

export interface CountType {
  Resources: number;
  ProjectConversation: number;
}

export interface ProjectMember {
  projectRole: number;
  userId: number;
  User: UserTypes;
}


export type UpdateProjectMemberType = {
  projectId: number;
  clientRepresentativeId: number;
  projectInchargeId: number[];
  supportEngineersId: number[],
  clients: number[]
}

export type ProjectQueryTypes = {
  ids: number[]
  title: string;
  slug: string;
  quoteNumber: string;
  projectStateSlugs: string[];
  clientId: number;
  isClosed: boolean;
  fromDate: string;
  toDate: string;
  userIds: number[];
  projectRole: number;
  // sortOrder: string;
  // sortByField: string;
}

export type ProjectResourceTypes = {
  id: number;
  uuid: string;
  documentType: keyof typeof ProjectDocumentsTypes;
  title: string;
  file: string;
  fileType: string;
  name: string;
  path: string;
  description: string;
  order: number;
  comments: string;
  visibility: string;
  projectId: number;
  taskId: number;
  isTemp: boolean;
  status: number;
  isDeleted: boolean;
  isDefault: boolean;
  isProcessing: boolean;
  backgroundId: number;
  addedDate: string
  modifiedDate: string;
  deletedDate: string;
  AddedBy: UserTypes;
  modifiedBy: number;
  deletedBy: number;
}

export type ProjectConversationTypes = {
  id: number;
  projectId: number
  message: string;
  userId: number;
  User: UserTypes;
  isDeleted: boolean;
  isPrivate: boolean;
  addedDate: string;
  modifiedDate: string;
  Media: ProjectConversationMediaTypes[];
  Project: ProjectTypes;
  unreadConversationCount?: number
}

export type ProjectConversationQueryTypes = ProjectResourceQueryTypes & { projectId: number }

export type ProjectConversationMediaTypes = {
  id: number;
  uuid: string;
  file: string;
  name: string;
  path: string;
  fileType: string;
  addedDate: string;
  AddedBy: UserTypes;
}


export type ProjectListConversationTypes = {
  message: string;
  addedDate: string;
  mediaCount: number;
}

export type ProjectListForChatTypes = {
  id: number;
  title: string;
  slug: string;
  referenceNumber: string;
  onHold: boolean;
  ProjectMembers: ProjectMember[];
  ProjectConversation: ProjectListConversationTypes;
  unreadConversationCount: number;
}

export type ProjectResourceQueryTypes = {
  fromDate: string;
  toDate: string;
  fileName: string;
  projectId: number;
  projectDocumentsTypes: keyof typeof ProjectDocumentsTypes;
  fileType: keyof typeof ProjectFileTypes;
  sharedToClient: boolean;
  perPage: number;
  page: number;
}

export type ShareProjectFileTypes = {
  fileIds: number[],
  projectId: number,
  shareInEmail: boolean,
}

export type FinanceReportTypes = {
  projectEstimate: number;
  invoicedAmount: number;
  invoicedPercentage: number;
  timeAndExpensesAmount: number;
  toBeInvoicedAmount: number;
  toBeInvoicedAmountPercentage: number;
  invoiceToCollectPayment: number;
  governmentFeesToCollect: number;
  permitExpiringThisMonth: number;
}

export type SharedFilesReportTypes = {
  batchNumber: number;
  sharedDate: string;
  sharedFiles: ProjectResourceTypes[];
}

export type ProjectResponseObject = APIResponseObject & { data: ProjectTypes };
export type ProjectResponseArray = APIResponseObject & { data: Array<ProjectTypes> };