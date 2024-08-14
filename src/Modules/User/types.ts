import { DepartmentType } from "@modules/Department/types";
import { APIResponseObject } from "../Common/common.interface";
import { OrganizationType } from "@modules/Organization/types";
import { VisibilityType } from "../Roles/types";
import { TypeFromEnumValues } from "@helpers/common";

export type UserCountryAccess_GET = {
	countryId: number;
	isDefault: number;
};

export type UserTypes = {
	id: number;
	uuid: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	phoneCode: string;
	phone: string;
	profile: string;
	status: number;
	userSignupSource: string;
	Department: DepartmentType;
	Organization: OrganizationType;
	userRole: { Role: Role; }[]
	roles: { ids: number[]; slugs: string[]; }
	addedDate: string;
	modifiedDate: string;
	deletedDate: string;
	addedBy: number;
	modifiedBy: number;
	deletedBy: number;
	isDeleted: boolean;
	isPublished: boolean;
	managerId: number;
	Manager: Manager;
	dateOfJoining: string;
	lastWorkingDate: string;
	enableRemoteCheckin?: boolean;
	_count: {
		AssetAllocation: number;
		Employees: number;
	}
};

export interface Manager {
	id: number;
	uuid: string;
	firstName: string;
	lastName: string;
	email: string;
	profile: string;
	phone: string;
	phoneCode: string;
}

export type Role = {
	id: number;
	title: string;
	slug: string;
	description: string | null;
	visibility: VisibilityType;
	organizationId: number | null;
	addedDate: Date;
	modifiedDate: Date | null;
	deletedDate: Date | null;
	addedBy: number | null;
	modifiedBy: number | null;
	deletedBy: number | null;
	isDeleted: boolean;
	isPublished: boolean;
};

export type YallahDashboardTypes = {
	leads: number;
	activePackages: number;
	activeUsers: number;
	verifiedAgents: number;
	reviews: number;
	creditsHistory: CreditsHistory;
	organization: number;
	transaction: Transaction;
	property: {
		_count: number;
		status: number
	}[];
}

export type CreditsHistory = {
	_sum: { creditsUsed: number };
}

export type Transaction = {
	_sum: { amount: number }
}

export type CreditsHistoryTypes = {
	"residential-for-sale": number;
	"commercial-for-rent": number;
	"residential-for-rent": number;
	"commercial-for-sale": number;
	total: number;
}

export enum UserStatus {
	"active" = 1,
	"suspended" = 2,
}

/** Active User Types */
export type ActiveUserTypes = {
	id: number;
	userAgent: string;
	userIP: string;
	user: UserTypes;
}
export type UserDocumentTypes = {
	id: number;
	title: string;
	file: string;
	documentType: string;
	mimeType: string;
	addedDate: Date;
	userId: number;
	addedById: number;
	AddedBy: AddedBy;
}

export interface AddedBy {
	id: number;
	uuid: string;
	firstName: string;
	lastName: string;
	email: string;
	profile: string;
	phone: string;
	phoneCode: string;
}

export interface UserDetailsType {
	id: number;
	uuid: string;
	firstName: string;
	lastName: string;
	phoneCode: string;
	email: string;
	phone: string;
	address: string;
	preferences: string;
	profile: string;
	phoneVerified: boolean;
	emailVerified: boolean;
	whatsapp: string;
	UserMeta: UserMeta[];
	status: number;
	departmentId: number;
	designation: string;
	AddedBy: AddedBy;
	Department: DepartmentType;
	organizationId: number;
	Organization: OrganizationType;
	managerId: number;
	Manager: Manager;
	Salary: SalaryType[];
	UserDocuments: UserDocumentTypes[];
	isPublished: boolean;
	AssetAllocation: AssetAllocation[];
}
export interface AssetAllocation {
	label: string;
	id: number;
	CompanyAsset: CompanyAsset;
}

export interface CompanyAsset {
	id: number;
	assetName: string;
	type: number;
	code: string;
	assetDetail: string;
}
export interface Manager {
	id: number;
	uuid: string;
	firstName: string;
	lastName: string;
	email: string;
	profile: string;
	phone: string;
	phoneCode: string;
}
export interface UserMeta {
	id: number;
	key: string;
	value: string;
	userId: number;
}
export interface SalaryType {
	id: number;
	userId: number;
	amount: number;
	startDate: Date;
	endDate: Date;
	isActive: boolean;
	addedDate: Date;
}

export type UserQueryTypes = {
	email: string;
	phone: string;
	status: TypeFromEnumValues<typeof UserStatus>;
	fromDate: string;
	toDate: string;
	isPublished: boolean;
	name: string;
	organizationId: number;
	departmentId: number;
	userType: number
	ids: number[]
	roleIds: number[]
	roleSlugs: string[]
	departmentSlug: string
	sortOrder: string;
	sortByField: string;
	page: number;
	perPage: number;
}

// User Response Types
export type UserResponseObject = APIResponseObject & { data: UserTypes };
export type UserResponseArray = APIResponseObject & { data: Array<UserTypes> };

// Active User Response Types
export type ActiveUserResponseObject = APIResponseObject & { data: ActiveUserTypes };
export type ActiveUserResponseArray = APIResponseObject & { data: Array<ActiveUserTypes> };

