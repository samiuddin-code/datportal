import { SliderMarks } from "antd/lib/slider";

export enum CountriesIdEnum {
	"in" = "2",
	"ae" = "1",
}

/**
 * Yallah Super Admin Emails List (For Super Admins)
 */
export const SuperAdminEmails = [
	"root@datconsultancy.com",
]

export const SUPER_ADMIN = "SUPER-ADMIN";
export const YALLAH_USERS = "YALLAH-USERS";
export const DLD_ADMIN = "DLD-ADMIN";
export const TEST_PHONE = "509826068";
export const defaultCountry = {
	id: 1,
	isoCode: "AE",
};
export enum SupportedLanguages {
	"english" = "en", // English
	"arabic" = "ar", // Arabic
	"nepali" = "ne", // Nepali
	"hindi" = "hi", // Hindi
}
export const SYSTEM_DEFAULT_LANGUAGE = SupportedLanguages.english;

export enum USER_SIGNUP_SOURCE_TYPES {
	"google" = "google",
	"apple" = "apple",
	"email" = "email",
	"phone" = "phone",
	"organization" = "organization",
	"yallahAdmins" = "yallahAdmins",
}

export enum LocationTypesEnum {
	"State" = "state",
	//"City" = "city",
	"Community" = "community",
	"Sub Community" = "subCommunity",
	"Building" = "building",
}

export enum LocationTypesMapWithVariables {
	"stateId" = "state",
	"cityId" = "city",
	"communityId" = "community",
	"subCommunityId" = "subCommunity",
}

export enum LocationTypesLevels {
	"country" = 0,
	"state" = 1,
	"city" = 2,
	"community" = 3,
	"subCommunity" = 4,
	"building" = 5,
}

export type LocationTypesAttributes = {
	stateId: boolean;
	cityId: boolean;
	communityId: boolean;
	subCommunityId: boolean;
};

export type LocationFieldsBasedOnTypes = {
	[k in keyof LocationTypesAttributes]: LocationTypesAttributes;
};

export const LocationRequiredFieldsBasedOnTypes: LocationFieldsBasedOnTypes = {
	'stateId': {
		stateId: false,
		cityId: false,
		communityId: false,
		subCommunityId: false,
	},
	'cityId': {
		stateId: true,
		cityId: false,
		communityId: false,
		subCommunityId: false,
	},
	'communityId': {
		stateId: true,
		cityId: false,
		communityId: false,
		subCommunityId: false,
	},
	'subCommunityId': {
		stateId: true,
		cityId: true,
		communityId: true,
		subCommunityId: false,
	},
};

export enum UserStatus {
	"active" = "1",
	"suspended" = "2",
}

export enum SMSSenderIdType {
	"Promotional" = "P",
	"Transactional" = "T",
}

export enum CreditsTransactionType {
	"debit" = 1,
	"hold" = 2,
	"credit" = 3,
	"refund" = 4,
	"upgrade" = 5,
	"renew" = 6
}

export enum TransactionType {
	"in" = 1,
	"out" = 2
}
export enum TransactionTypeString {
	"in" = "1",
	"out" = "2"
}

export enum BlogsCategory {
	"Blog" = "1",
	"News" = "2"
}

export enum BlogsStatus {
	"Not Published, Verification Required" = "1",
	"Modification Required" = "2",
	"Requested for Verification" = "3",
	"Verified & Published" = "4"
}

export enum BlogsCategoryStatus {
	"Not Published, Verification Required" = "1",
	"Modification Required" = "2",
	"Requested for Verification" = "3",
	"Verified & Published" = "4"
}

export enum PagesStatus {
	"Not Published, Verification Required" = "1",
	"Modification Required" = "2",
	"Requested for Verification" = "3",
	"Verified & Published" = "4"
}

export enum LeadsStatus {
	"New" = 1,
	"In Progress" = 2,
	"Unqualified" = 3,
	"Confirmed" = 4,
	"Canceled" = 5,
	"Invalid Request" = 6,
	"Spam" = 7,
}

export enum LeadsStatusOptions {
	"Unqualified" = LeadsStatus.Unqualified,
	"Canceled" = LeadsStatus.Canceled,
	"Invalid Request" = LeadsStatus["Invalid Request"],
	"Spam" = LeadsStatus.Spam
}

type ManageNotificationsSubscriptionsType = {
	title: string,
	description: string,
	type: "app" | "email" | "desktop" | "mobile"
}

export const manageNotificationsSubscriptions: ManageNotificationsSubscriptionsType[] = [
	{
		title: 'Email',
		description: 'Get notified via your DAT Consultancy registered email id',
		type: 'email'
	},
	{
		title: 'Desktop Notification',
		description: 'Get notified in your browser directly',
		type: 'desktop'
	}
]

export const DefaultAlertSettings = {
	desktop: true,
	mobile: false,
	email: true,
	app: true
}

export enum MatchOperator {
	"Equals" = "equals",
	"Less Than Or Equal To" = "lte",
	"Greater Than Or Equal To" = "gte",
}

// Token Types Enum
export enum TokenTypes {
	"accessToken" = "Access Token",
	"refreshToken" = "Refresh Token",
	"signuptoken" = "Sign Up Token",
	"emailSignupToken" = "Email Sign Up Token",
	"phoneSignupToken" = "Phone Sign Up Token",
	"resetPasswordToken" = "Reset Password Token",
	"changeUserPhoneEmailToken" = "Change User Phone Email Token",
}

export enum PriorityEnum {
	"High" = "1",
	"Medium" = "2",
	"Normal" = "3",
}

export const taskColumnLabels = {
	1: "To Do",
	2: "In Progress",
	3: "Done"
};
export const techSupportColumnLabels = {
	1: "Open",
	2: "In Progress",
	3: "Closed"
};
export const taskColumnLabelsColors = {
	1: "#a0a0a0",
	2: "#42526e",
	3: "#137749",
};

export const taskPriority = {
	1: { title: "High", color: "#bf0000" },
	2: { title: "Medium", color: "#e3a005" },
	3: { title: "Normal", color: "#a0a0a0" },
}


export enum ProjectRoleEnum {
	projectIncharge = 1,
	supportEngineers = 2
}

export enum ProjectRoleEnumString {
	"Project Incharge" = "1",
	"Support Engineers" = "2",
}

export enum TaskTypes {
	"Assigned Task" = "assignedTask",
	"My Task" = "myTask"
}

export enum TaskSort {
	"Added Date" = "addedDate",
	"Priority" = "priority",
	"Order" = "order",
	"Task End Date" = "taskEndOn"
}

/** Types of documents for project */
export enum ProjectDocumentsTypes {
	drawings = "Drawings",
	requirement_documents = "Requirement Documents",
	structural_drawings = "Structural Drawings",
	interior_design = "Interior Design",
	invoice = "Invoice",
	government_document = "Government Documents",
	other = "Other"
}

/** File Types */
export enum ProjectFileTypes {
	images_and_pdf = "Images and PDF",
	images_only = "Images Only",
	images_and_videos = "Images and Videos",
	all_files = "All Files",
	json = "JSON",
	images_only_with_svg = "Images Only with SVG",
}

export enum FileVisibilityEnum {
	public = "public",//"Can be viewed by anyone",
	client = "client",// "Can be viewed by clients",
	organization = "organization",//"Can be viewed within the organization",
	self = "self"//"Can be viewed only by the file owner"
}

export enum EnquirySource {
	"manual" = "Manual",
	"whatsapp" = "WhatsApp",
	"dubaiapprovals.com" = "dubaiapprovals.com",
	"abudhabiapprovals.com" = "abudhabiapprovals.com",
	"datconsultancy.com" = "datconsultancy.com",
	"luxedesign.ae" = "luxedesign.ae",
	"phone" = "Phone",
	"email" = "Email",
	"facebook" = "Facebook",
	"tiktok" = "Tik Tok",
	"instagram" = "Instagram",
	"facebook_reels" = "Facebook Reels",
	"linkedIn" = "LinkedIn",
	"twitter" = "Twitter",
	"other" = "Other"
}

export enum EnquiryStatus {
	"Active" = 1,
	"Qualified" = 2,
	"Unqualified" = 3,
	"Spam" = 4,
}

export enum ColorBank {
	"red" = "#e74c3c",
	"green" = "#2ecc71",
	"blue" = "#3498db",
	"yellow" = "#f1c40f",
}

export enum QuotationStatus {
	"New" = 1,
	"Sent" = 2,
	"Confirmed" = 3,
	"Rejected" = 4,
	"Revised" = 5
}

export enum QuotationTypeEnum {
	"Auto" = 1,
	"Manual" = 2
}

export enum InvoiceTypeEnum {
	"Auto" = 1,
	"Manual" = 2
}

export enum LeadTypeEnum {
	company = "1",
	individual = "2"
}

export enum MilestoneStatus {
	/** This status will be chosen when milestone is just created */
	"Not Completed" = 1,
	/** This status will be chosen when milestone is completed */
	"Completed" = 2,
	/** When the invoice is created for the milestone */
	"Invoice Generated" = 3,
	/** When the generated invoice is sent to the client */
	"Invoice Sent" = 4,
	/** When the invoice is marked as paid */
	"Invoice Paid" = 5,
	/** When the invoice is canceled or not paid */
	"Invoice Canceled" = 6
}

export enum InvoiceStatus {
	"Generated" = 1,
	"Sent" = 2,
	"Paid" = 3,
	"Canceled" = 4
}

export const MyServices = [
	{
		title: "Reimbursement",
		icon: "/images/my-services/reimbursement.svg",
		link: "/myservices/reimbursement"
	},
	{
		title: "Leave Request",
		icon: "/images/my-services/leave-request.svg",
		link: "/myservices/leave-request"
	},
	{
		title: "Car Reservation Request",
		icon: "/images/my-services/car-reservation-request.svg",
		link: "/myservices/car-reservation-request"
	},
	{
		title: "Cash Advance Request",
		icon: "/images/my-services/cash-advance-request.svg",
		link: "/myservices/cash-advance-request"
	},
	// {
	// 	title: "Clearance",
	// 	icon: "/images/my-services/clearance.svg",
	// 	link: "/myservices/clearance"
	// },
	{
		title: "Tech Support Request",
		icon: "/images/my-services/my-requests.svg",
		link: "/myservices/tech-support-request"
	},
]

export const ActionHR = [
	{ label: 'Approve', value: 2 },
	{ label: 'Reject', value: 3 }
]
export const ActionFinance = [
	{ label: 'Mark as Paid', value: 5 },
	{ label: 'Reject Request', value: 3 }
]
export const ActionLeaveRequest = [
	{ label: 'Approve Request', value: 5 },
	{ label: 'Reject Request', value: 6 },
	{ label: 'Request Modification', value: 3 }
]

export const OrganizationTypes: { [key in 1 | 2 | 3 ]: string } = {
	1: "Main",
	2: "branch",
	3: "partner"
}

export const ReimbursementStatus: { [key in 1 | 2 | 3 | 4 | 5 | 6]: { status: string, color: string } } = {
	1: { status: "submitted", color: "#e67e22" },
	2: { status: "approved by HR", color: "#2ecc71" },
	3: { status: "rejected", color: "#e74c3c" },
	4: { status: "partially approved", color: "#2ecc71" },
	5: { status: "paid / closed", color: "#1e8449" },
	6: { status: "withdrawn", color: "#95a5a6" }
}

export enum SupervisionPaymentSchedule {
	"End of the Month" = 1,
	"Start of the Month" = 2,
	"Quarterly" = 3
}
export const CashAdvanceStatus: { [key in 1 | 2 | 3 | 4 | 5 | 6]: { status: string, color: string } } = {
	1: { status: "submitted", color: "#e67e22" },
	2: { status: "approved by HR", color: "#2ecc71" },
	3: { status: "rejected", color: "#e74c3c" },
	4: { status: "partially_approved", color: "#2ecc71" },
	5: { status: "paid_and_closed", color: "#1e8449" },
	6: { status: "withdrawn", color: "#95a5a6" }
}
export const LeaveRequestStatus: { [key in 1 | 2 | 3 | 4 | 5 | 6 | 7]: { status: string, color: string } } = {
	1: { status: "not yet submitted", color: "#3498db" },
	2: { status: "submitted", color: "#e67e22" },
	3: { status: "request_modification", color: "#f39c12" },
	4: { status: "approved by Manager", color: "#2ecc71" },
	5: { status: "approved", color: "#1e8449" },
	6: { status: "rejected", color: "#e74c3c" },
	7: { status: "withdrawn", color: "#95a5a6" }
}
export const LeaveType: { [key in 1 | 2 | 3 | 4 | 5 | 6 | 7]: string } = {
	1: "annual leave",
	2: "sick leave",
	3: "maternity / parental leave",
	4: "short leave",
	5: "unpaid leave",
	6: "bereavement leave",
	7: "others"
}
export const UserDocumentsTypes = [
	{ label: "Emirates Id", value: "emiratesId" },
	{ label: "Passport", value: "passport" },
	{ label: "Visa", value: "visa" },
	{ label: "Education Certificate", value: "education_certificate" },
	{ label: "Offer Letter", value: "offer_letter" },
	{ label: "Resume", value: "resume" },
	{ label: "Other", value: "other" }
]

export enum ClientsType {
	company = "1",
	individual = "2"
}

export enum CompanyAssetTypeEnum {
	"other" = "1",
	"computer" = "2",
	"sim_card" = "3",
	"mobile" = "4",
	"car" = "5"
}

export const CarReservationRequestStatus: { [key in 1 | 2 | 3 | 4 | 5]: { status: string, color: string } } = {
	1: { status: "submitted", color: "#e67e22" },
	2: { status: "in_progress", color: "#2ecc71" },
	3: { status: "approved", color: "#1e8449" },
	4: { status: "rejected", color: "#e74c3c" },
	5: { status: "withdrawn", color: "#95a5a6" },
}
export const ActionHRCarReservation = [
	{ label: 'Approve', value: 3 },
	{ label: 'Reject', value: 4 }
]
export enum CarReservationEnum {
	"submitted" = 1,
	"in_progress" = 2,
	"approved" = 3,
	"rejected" = 4,
	"withdrawn" = 5,
}
export enum LeaveRequestEnum {
	"not_yet_submitted" = 1,
	"submitted" = 2,
	"request_modification" = 3,
	"in_progress" = 4,
	"approved" = 5,
	"rejected" = 6,
	"withdrawn" = 7
}
export enum ReimbursementEnum {
	"submitted" = 1,
	"approved" = 2,
	"rejected" = 3,
	"partially approved" = 4,
	"paid / closed" = 5,
	"withdrawn" = 6
}
export enum CashAdvanceEnum {
	"submitted" = 1,
	"approved" = 2,
	"rejected" = 3,
	"partially_approved" = 4,
	"paid_and_closed" = 5,
	"withdrawn" = 6
}
export enum BiometricsEntryType {
	"auto" = "1",
	"manual" = "2",
	"bulk" = "3",
	"forced" = "4"
}
export enum AttendanceEntryType {
	"auto" = 1,
	"manual" = 2
}
export enum AttendancePayType {
	"full" = "1",
	"half_day" = "2",
	"unpaid" = "3"
}
export enum NotificationType {
	"broadcast" = "broadcast",
	"user" = "user",
	"department" = "department"
}
export enum UserMetaKeys {
	"dateOfBirth" = "dateOfBirth",
	"nationality" = "nationality",
	"religion" = "religion",
	"maritalStatus" = "maritalStatus",
	"gender" = "gender",
	"personalNumber" = "personalNumber",
	"personalEmail" = "personalEmail",
	"currentProfession" = "currentProfession",
	"passportNumber" = "passportNumber",
	"passportExpiryDate" = "passportExpiryDate",
	"emergencyContactName" = "emergencyContactName",
	"emergencyContactRelationship" = "emergencyContactRelationship",
	"emergencyContactAddress" = "emergencyContactAddress",
	"emergencyContactNumber" = "emergencyContactNumber",
	"labourCardNumber" = "labourCardNumber"
}

export enum PermitFinanceStatus {
	"Pending Payment" = 1,
	"Paid" = 2,
	"Canceled" = 3
}
export enum PermitClientStatus {
	"To be sent" = 1,
	"Sent" = 2,
}

export enum TransactionStatus {
	"Sent to client" = 1,
	"Pending payment" = 2,
	"Paid" = 3,
	"Canceled" = 4
}

export const marks: SliderMarks = {
	1: '1',
	3: '3',
	6: '6',
	9: '9',
	12: '12',
	15: '15',
	18: '18',
	21: '21',
	24: '24'
};

export enum DashboardElementSlugs {
	"delayed_projects" = "delayed_projects",
	"active_projects" = "active_projects",
	"all_tasks" = "all_tasks",
	"pending_project_as_support_engineer" = "pending_project_as_support_engineer",
	"pending_project_as_project_incharge" = "pending_project_as_project_incharge",
	"new_project" = "new_project",
	"ready_for_submission" = "ready_for_submission",
	"approved_projects" = "approved_projects",
	"close_out_projects" = "close_out_projects",
	"active_employees" = "active_employees",
	"on_hold_projects" = "on_hold_projects",
	"closed_projects" = "closed_projects",
	"notification" = "notification",
	"active_quotations" = "active_quotations",
	"pending_invoices" = "pending_invoices",
	"active_enquiries" = "active_enquiries",
	"active_leads" = "active_leads",
	"active_reimbursement" = "active_reimbursement",
	"active_leave_request" = "active_leave_request",
	"active_cash_advance_request" = "active_cash_advance_request"
}


export enum AttendanceStatus {
    complete = 1,
    incomplete = 2,
    late = 3,
    absent = 4,
    off = 5
}

export const attendanceStatusColor = [
	"var(--color-dark-main)",
	'rgba(255, 140, 0, 1)',
	'rgba(245,188,2, 1)',
	'rgba(247,5,5, 1)',
	"var(--color-dark-main)"
]