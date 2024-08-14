import { ProjectPermissionsEnum } from "@modules/Project/permissions";
import { RolePermissionsEnum } from "@modules/Roles/permissions";
import { SitePagesPermissionsEnum } from "@modules/SitePages/permissions";
import { TaskPermissionsEnum } from "@modules/Task/permissions";
import { LeadsPermissionsEnum } from "@modules/Leads/permissions";
import { EnquiryPermissionsEnum } from "@modules/Enquiry/permissions";
import { QuotationPermissionsEnum } from "@modules/Quotation/permissions";
import { InvoicePermissionsEnum } from "@modules/Invoice/permissions";
import { ClientPermissionsEnum } from "@modules/Client/permissions";
import { CompanyAssetPermissionsEnum } from "@modules/CompanyAsset/permissions";
import { ReimbursementPermissionsEnum } from "@modules/Reimbursement/permissions";
import { CarReservationPermissionsEnum } from "@modules/CarReservation/permissions";
import { LeaveRequestPermissionsEnum } from "@modules/LeaveRequest/permissions";
import { CashAdvancePermissionsEnum } from "@modules/CashAdvance/permissions";
import { BiometricsPermissionSet } from "@modules/Biometrics/permissions";
import { AttendancePermissionSet } from "@modules/Attendance/permissions";
import { NotificationPermissionsEnum } from "@modules/Notification/permissions";
import { PermitsPermissionsEnum } from "@modules/Permits/permissions";
import { TransactionsPermissionsEnum } from "@modules/Transactions/permissions";
import { PayrollCyclePermissionsEnum } from "@modules/PayrollCycle/permissions";
import { PayrollPermissionsEnum } from "@modules/Payroll/permissions";
import { XeroPermissionsEnum } from "@modules/Xero/permissions";
import { ProductPermissionsEnum } from "@modules/Product/permissions";
import { BrandingThemePermissionsEnum } from "@modules/BrandingTheme/permissions";
import { AccountPermissionsEnum } from "@modules/Account/permissions";
import { TaxRatePermissionsEnum } from "@modules/TaxRate/permissions";
import { PublicHolidayPermissionSet } from "@modules/PublicHoliday/permissions";

export enum UserPermissionsEnum {
    "CREATE" = "createUser",
    "UPDATE" = "updateUser",
    "DELETE" = "deleteUser",
    "READ" = "readUser",
    "READ_AUTH_TOKENS_ISSUED" = "readAuthTokensIssued",
    "ADD_USER_ROLE" = "addUserRole",
    "ADD_USER_COUNTRY" = "addUserCountry",
    "MANAGE_ALL" = "manageAllUser",
    "REMOVE_USER_COUNTRY" = "removeUserCountry",
    "LOGIN_AS_OTHER_USER" = "loginAsOtherUser"
}

/** Dashboard Permissions */
export const dashboardPermissionsSet = [
    UserPermissionsEnum.MANAGE_ALL,
    ProjectPermissionsEnum.READ,
    TaskPermissionsEnum.READ,
    TaskPermissionsEnum.CREATE,
    RolePermissionsEnum.READ,
    SitePagesPermissionsEnum.READ,
    LeadsPermissionsEnum.READ,
    EnquiryPermissionsEnum.READ,
    QuotationPermissionsEnum.READ,
    InvoicePermissionsEnum.READ,
    ClientPermissionsEnum.READ,
    CompanyAssetPermissionsEnum.READ,
    ReimbursementPermissionsEnum.HR_APPROVAL,
    ReimbursementPermissionsEnum.FINANCE_APPROVAL,
    CarReservationPermissionsEnum.HR_APPROVAL,
    LeaveRequestPermissionsEnum.HR_APPROVAL,
    LeaveRequestPermissionsEnum.PROJECT_MANAGER_APPROVAL,
    CashAdvancePermissionsEnum.HR_APPROVAL,
    CashAdvancePermissionsEnum.FINANCE_APPROVAL,
    BiometricsPermissionSet.READ,
    AttendancePermissionSet.READ,
    NotificationPermissionsEnum.READ,
    PermitsPermissionsEnum.READ,
    TransactionsPermissionsEnum.READ,
    PayrollCyclePermissionsEnum.READ,
    PayrollPermissionsEnum.READ,
    TaskPermissionsEnum.TECH_SUPPORT,
    XeroPermissionsEnum.LOGIN,
    ProductPermissionsEnum.READ,
    BrandingThemePermissionsEnum.READ,
    AccountPermissionsEnum.READ,
    TaxRatePermissionsEnum.READ,
    PublicHolidayPermissionSet.READ
];

type DashboardPermissionsSetType = typeof dashboardPermissionsSet[number];

export type UserDashboardPermissionsType = {
    [key in DashboardPermissionsSetType]: boolean
};