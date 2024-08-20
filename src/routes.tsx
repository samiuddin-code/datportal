import PublicHoliday from "@organisms/Dashboard/PublicHoliday";
import WorkingHours from "@organisms/SiteSettings/WorkingHours";
import DiaryDetail from "Components/Notepad/Notepad";

import { lazy } from "react";

// Loading FallBack Component
const Fallback = lazy(() => import("./Components/Organisms/Fallback"));
const ErrorCode403 = lazy(() => import("./Components/Atoms/ErrorCodes/403"));
const ErrorCode404 = lazy(() => import("./Components/Atoms/ErrorCodes/404"));
const DashboardOverview = lazy(() => import("./Components/Organisms/Dashboard/Overview"));
const Employees = lazy(() => import("./Components/Organisms/Dashboard/Employees"));
const EmployeeDetails = lazy(() => import("./Components/Organisms/Dashboard/EmployeeDetails"));
const AgentRoles = lazy(() => import("./Components/Organisms/Dashboard/Roles"));
const AgentRolesPermission = lazy(() => import("./Components/Organisms/Dashboard/RolePermissions"));
const AgentRolesPermissionView = lazy(() => import("./Components/Organisms/Dashboard/ViewRolePermissions"));
const AgentSavedSearchesView = lazy(() => import("./Components/Organisms/Dashboard/ViewSavedSearches"));
const TaskBoard = lazy(() => import("./Components/Organisms/Dashboard/TaskBoard"));
const SupportBoard = lazy(() => import("./Components/Organisms/Dashboard/SupportBoard"));
const Diary = lazy(() => import("./Components/Organisms/Dashboard/Diary"));
const MyServices = lazy(() => import("./Components/Organisms/Dashboard/MyServices"));
const EmployeeRequests = lazy(() => import("./Components/Organisms/Dashboard/EmployeeRequests"));
const ManageReimbursements = lazy(() => import("./Components/Organisms/Dashboard/EmployeeRequests/ManageReimbursements"));
const ManageLeaveRequests = lazy(() => import("./Components/Organisms/Dashboard/EmployeeRequests/ManageLeaveRequests"));
const ManageCashAdvance = lazy(() => import("./Components/Organisms/Dashboard/EmployeeRequests/ManageCashAdvance"));
const ManageCarReservation = lazy(() => import("./Components/Organisms/Dashboard/EmployeeRequests/ManageCarReservation"));
const Reimbursement = lazy(() => import("./Components/Organisms/Dashboard/MyServices/Reimbursement"));
const CashAdvance = lazy(() => import("./Components/Organisms/Dashboard/MyServices/CashAdvance"));
const LeaveRequest = lazy(() => import("./Components/Organisms/Dashboard/MyServices/LeaveRequest"));
const CarReservation = lazy(() => import("./Components/Organisms/Dashboard/MyServices/CarReservation"));
const TechSupport = lazy(() => import("./Components/Organisms/Dashboard/MyServices/TechSupport"));
const PriceFinder = lazy(() => import("./Components/Organisms/Dashboard/PriceFinder"));
const Leads = lazy(() => import("./Components/Organisms/Leads"));
const Enquiries = lazy(() => import("./Components/Organisms/Enquiries"));
const Quotations = lazy(() => import("./Components/Organisms/Quotations"));
const Invoice = lazy(() => import("./Components/Organisms/Invoice"));
const DealsDashboard = lazy(() => import("./Components/Organisms/Dashboard/Deals"));
const UserRatingDashboard = lazy(() => import("./Components/Organisms/Dashboard/UserRating"));
// Profile Or Account Page Settings
const AccountPage = lazy(() => import("./Components/Organisms/Dashboard/AccountSettings"));
const AllProjects = lazy(() => import("./Components/Organisms/Projects"));
const EditProject = lazy(() => import("./Components/Organisms/Projects/Edit"));
const ProjectDetails = lazy(() => import("./Components/Organisms/Projects/Details"));
const AllConversations = lazy(() => import("./Components/Organisms/Conversations"));
// Site Settings
const SiteMapSettings = lazy(() => import("./Components/Organisms/SiteSettings/SiteMap"));
const TemplatesSiteSettings = lazy(() => import("./Components/Organisms/SiteSettings/Templates"));
const SiteDashboard = lazy(() => import("./Components/Organisms/SiteSettings/Dashboard"));
const CountrySettings = lazy(() => import("./Components/Organisms/SiteSettings/CountrySettings"));
const OrganizationSettings = lazy(() => import("./Components/Organisms/SiteSettings/OrganizationSettings"));
const PackageSettings = lazy(() => import("./Components/Organisms/SiteSettings/PackagesSettings"));
const CreditsRate = lazy(() => import("./Components/Organisms/SiteSettings/CreditsRate"));
const OrgCreditPackageSettings = lazy(() => import("./Components/Organisms/SiteSettings/OrganizationCreditsPackage"));
const AreaUnits = lazy(() => import("./Components/Organisms/SiteSettings/AreaUnits"));
const AlertsTypeSettings = lazy(() => import("./Components/Organisms/SiteSettings/AlertsType"));
const SystemModules = lazy(() => import("./Components/Organisms/SiteSettings/SystemModules"));
const LocationSettings = lazy(() => import("./Components/Organisms/SiteSettings/Location"));
const CurrencySettings = lazy(() => import("./Components/Organisms/SiteSettings/Currency"));
const SMSSettings = lazy(() => import("./Components/Organisms/SiteSettings/SMS"));
const SMSLogs = lazy(() => import("./Components/Organisms/SiteSettings/ViewSMSLogs"));
const SiteActiveUsersList = lazy(() => import("./Components/Organisms/SiteSettings/ViewActiveList"));
const SiteMailLogs = lazy(() => import("./Components/Organisms/SiteSettings/ViewMailLogs"));
const SystemLogs = lazy(() => import("./Components/Organisms/SiteSettings/ViewSystemLogs"));
const WhatsappMessages = lazy(() => import("./Components/Organisms/SiteSettings/ViewWhatsapp"));
const PaymentGatewaySettings = lazy(() => import("./Components/Organisms/SiteSettings/PaymentGateway"));
const PromotionSettings = lazy(() => import("./Components/Organisms/SiteSettings/Promotion"));
const BulkUploadFormatSettings = lazy(() => import("./Components/Organisms/SiteSettings/BulkUploadFormat"));
const BiometricsBulkUploadJobSettings = lazy(() => import("./Components/Organisms/SiteSettings/BiometricsBulkUploadJob"));
const BiometricsBulkUploadJobSettingsDashboard = lazy(() => import("./Components/Organisms/Dashboard/BiometricsBulkUploadJob"));
const ProjectType = lazy(() => import("./Components/Organisms/SiteSettings/ProjectType"));
const Feedback = lazy(() => import("./Components/Organisms/SiteSettings/Feedback"));
const Clients = lazy(() => import("./Components/Organisms/Dashboard/Clients"));
const ClientsDetails = lazy(() => import("./Components/Organisms/Dashboard/Clients/Details"));
const AccountsPage = lazy(() => import("./Components/Organisms/Dashboard/Account"));
const TaxRate = lazy(() => import("./Components/Organisms/Dashboard/TaxRate"));
const Biometrics = lazy(() => import("./Components/Organisms/Dashboard/Biometrics"));
const Notifications = lazy(() => import("./Components/Organisms/Dashboard/Notifications"));
const Attendance = lazy(() => import("./Components/Organisms/Dashboard/Attendance"));
const PayrollCycle = lazy(() => import("./Components/Organisms/Dashboard/PayrollCycle"));
const Payroll = lazy(() => import("./Components/Organisms/Dashboard/Payroll"));
const CompanyAssets = lazy(() => import("./Components/Organisms/Dashboard/CompanyAssets"));
const ProjectState = lazy(() => import("./Components/Organisms/SiteSettings/ProjectState"));
const ProjectComponents = lazy(() => import("./Components/Organisms/SiteSettings/ProjectComponents"));
const Department = lazy(() => import("./Components/Organisms/SiteSettings/Department"));
const Authorities = lazy(() => import("./Components/Organisms/SiteSettings/Authorities"));
const LeaveType = lazy(() => import("./Components/Organisms/SiteSettings/LeaveType"));
const DashboardElement = lazy(() => import("./Components/Organisms/SiteSettings/DashboardElement"));
const SiteAmenities = lazy(() => import("./Components/Organisms/SiteSettings/Amenity"));
const SiteBlogs = lazy(() => import("./Components/Organisms/SiteSettings/Blogs"));
const SiteOrders = lazy(() => import("./Components/Organisms/SiteSettings/Orders"));
const SiteLanguage = lazy(() => import("./Components/Organisms/SiteSettings/Language"));
const SiteBlogsCategory = lazy(() => import("./Components/Organisms/SiteSettings/BlogsCategory"));
const SitePages = lazy(() => import("./Components/Organisms/SiteSettings/SitePages"));
const StaticPageSEOSettings = lazy(() => import("./Components/Organisms/SiteSettings/SitePages/SEO"));
const SitePagesSection = lazy(() => import("./Components/Organisms/SiteSettings/PagesSection"));
const SitePagesSectionContent = lazy(() => import("./Components/Organisms/SiteSettings/PagesSectionContent"));
const SystemModulePermission = lazy(() => import("./Components/Organisms/SiteSettings/SystemModulePermission"));
const SiteSettingsAttendance = lazy(() => import("./Components/Organisms/SiteSettings/Attendance"));
const Pages = lazy(() => import("./Components/Organisms/SiteSettings/Pages"));
const Permits = lazy(() => import("./Components/Organisms/Permits"));
const SiteRoles = lazy(() => import("./Components/Organisms/SiteSettings/Roles"));
const FAQS = lazy(() => import("./Components/Organisms/SiteSettings/FAQs"));
const FAQCategory = lazy(() => import("./Components/Organisms/SiteSettings/FAQCategory"));
const HelpCenter = lazy(() => import("./Components/Organisms/Dashboard/HelpCenter"));
const HelpCenterDetails = lazy(() => import("./Components/Organisms/Dashboard/HelpCenter/Details"));
const FaqDetails = lazy(() => import("./Components/Organisms/Dashboard/HelpCenter/Faq"));
const RolePermissions = lazy(() => import("./Components/Organisms/SiteSettings/RolePermissions"));
const RolePermissionsView = lazy(() => import("./Components/Organisms/SiteSettings/ViewRolePermissions"));
const SiteUserSettings = lazy(() => import("./Components/Organisms/SiteSettings/User"));
const LeadsSettings = lazy(() => import("./Components/Organisms/SiteSettings/Leads"));
// Leads Tracking
const LeadsTrackingSettings = lazy(() => import("./Components/Organisms/SiteSettings/Leads/Tracking"));
const UserRatingSettings = lazy(() => import("./Components/Organisms/SiteSettings/UserRating"));
const Transactions = lazy(() => import("./Components/Organisms/Transactions"));
const SiteCreditsUsageHistory = lazy(() => import("./Components/Organisms/SiteSettings/CreditTransactions/UsageHistory"));
const SiteUserAlerts = lazy(() => import("./Components/Organisms/SiteSettings/ViewUserAlerts"));
const LoginTemplate = lazy(() => import("./Components/Templates/Login"));
const ResetPassword = lazy(() => import("./Components/Templates/ResetPassword"));
const SiteSettingsTemplate = lazy(() => import("./Components/Templates/SiteSettings"));
const CreditsUsageHistory = lazy(() => import('./Components/Organisms/Dashboard/CreditTransactions/UsageHistory'))
const CreditsEligibleRefunds = lazy(() => import('./Components/Organisms/Dashboard/CreditTransactions/EligibleRefunds'))
const ResourcesViewer = lazy(() => import('./Components/Templates/ResourcesViewer'));
const XeroConsentCallback = lazy(() => import('./Components/Organisms/XeroConnection/callback'));
const BrandingTheme = lazy(() => import('./Components/Organisms/BrandingTheme'));
const Product = lazy(() => import('./Components/Organisms/Product'));

export const routes = [
	{ path: "/fallback", element: <Fallback /> },
	{ path: "/login", element: <LoginTemplate /> },
	{ path: "/resources/*", element: <ResourcesViewer /> },
	{ path: "/reset-password/:token", element: <ResetPassword /> },      
	
	{ path:"/diary/:id", element:<DiaryDetail	 />},

	/** =====Agent Dashboard Start===== */
	{ path: "/", element: <DashboardOverview /> },
	{ path: "/employees", element: <Employees /> },
	{ path: "/employees/:id", element: <EmployeeDetails /> },
	{ path: "/clients", element: <Clients /> },
	{ path: "/clients/:uuid", element: <ClientsDetails /> },
	{ path: "/account", element: <AccountsPage /> },
	{ path: "/public-holiday", element: <PublicHoliday /> },
	{ path: "/tax-rate", element: <TaxRate /> },
	{ path: "/biometrics", element: <Biometrics /> },
	{ path: "/notifications", element: <Notifications /> },
	{ path: "/attendance", element: <Attendance /> },
	{ path: "/payroll-cycle", element: <PayrollCycle /> },
	{ path: "/payrolls", element: <Payroll /> },
	{ path: "/company-assets", element: <CompanyAssets /> },
	{ path: "/roles", element: <AgentRoles /> },
	{ path: "/roles/permissions", element: <AgentRolesPermission /> },
	{ path: "/roles/permissions/view", element: <AgentRolesPermissionView /> },
	{ path: "/saved-searches", element: <AgentSavedSearchesView /> },
	{ path: "/price-finder", element: <PriceFinder /> },
	{ path: "/deals", element: <DealsDashboard /> },
	{ path: "/leads", element: <Leads /> },
	{ path: "/enquiries", element: <Enquiries /> },
	{ path: "/quotations", element: <Quotations /> },
	{ path: "/invoice", element: <Invoice /> },
	// { path: "/leads/tracking", element: <LeadsDashboardTracking /> },
	{ path: "/user-ratings", element: <UserRatingDashboard /> },
	{ path: "/tasks", element: <TaskBoard /> },
	{ path: "/tech-support", element: <SupportBoard /> },
	{ path: "/biometrics/bulk-upload-job", element: <BiometricsBulkUploadJobSettingsDashboard /> },
	{ path: "/diary", element: <Diary /> },
	{ path: "/employee-requests", element: <EmployeeRequests /> },
	{ path: "/employee-requests/reimbursement-requests", element: <ManageReimbursements /> },
	{ path: "/employee-requests/car-reservation-requests", element: <ManageCarReservation /> },
	{ path: "/employee-requests/leave-requests", element: <ManageLeaveRequests /> },
	{ path: "/leave-requests", element: <ManageLeaveRequests /> },
	{ path: "/employee-requests/cash-advance-requests", element: <ManageCashAdvance /> },
	{ path: "/myservices", element: <MyServices /> },
	{ path: "/myservices/reimbursement", element: <Reimbursement /> },
	{ path: "/myservices/cash-advance-request", element: <CashAdvance /> },
	{ path: "/myservices/leave-request", element: <LeaveRequest /> },
	{ path: "/myservices/car-reservation-request", element: <CarReservation /> },
	{ path: "/myservices/tech-support-request", element: <TechSupport /> },
	{ path: "/profile", element: <AccountPage /> },
	{ path: "/credits/history", element: <CreditsUsageHistory /> },
	{ path: "/credits/refunds", element: <CreditsEligibleRefunds /> },
	{ path: "/xero-connect/callback", element: <XeroConsentCallback /> },
	/** =====Agent Dashboard End===== */
	{ path: "/help-center", element: <HelpCenter /> },
	{ path: "/help-center/:slug", element: <HelpCenterDetails /> },
	{ path: "/help-center/:slug/:slug", element: <FaqDetails /> },

	/** =====Admin Dashboard Start===== */
	{ path: "/siteSettings", element: <SiteDashboard /> },
	{ path: "/siteSettings/credits-rate", element: <CreditsRate /> },
	{ path: "/siteSettings/working-hour", element: <WorkingHours /> },
	{ path: "/siteSettings/org-credit-package", element: <OrgCreditPackageSettings /> },
	{ path: "/siteSettings/country", element: <CountrySettings /> },
	{ path: "/siteSettings/currency", element: <CurrencySettings /> },
	{ path: "/siteSettings/payment-gateway", element: <PaymentGatewaySettings /> },
	{ path: "/siteSettings/area-units", element: <AreaUnits /> },
	{ path: "/siteSettings/language", element: <SiteLanguage /> },
	{ path: "/siteSettings/alerts-type", element: <AlertsTypeSettings /> },
	{ path: "/siteSettings/amenity", element: <SiteAmenities /> },
	{ path: "/siteSettings/blogs", element: <SiteBlogs /> },
	{ path: "/siteSettings/blogs-category", element: <SiteBlogsCategory /> },
	{ path: "/siteSettings/orders", element: <SiteOrders /> },
	{ path: "/siteSettings/credits-history", element: <SiteCreditsUsageHistory /> },
	{ path: "/siteSettings/site-pages", element: <SitePages /> },
	{ path: "/siteSettings/static-page-seo", element: <StaticPageSEOSettings /> },
	{ path: "/siteSettings/pages-section", element: <SitePagesSection /> },
	{ path: "/siteSettings/pages-section/content", element: <SitePagesSectionContent /> },
	{ path: "/siteSettings/pages", element: <Pages /> },
	{ path: "/siteSettings/location", element: <LocationSettings /> },
	{ path: "/siteSettings/faqs", element: <FAQS /> },
	{ path: "/siteSettings/faq-category", element: <FAQCategory /> },
	{ path: "/siteSettings/roles", element: <SiteRoles /> },
	{ path: "/siteSettings/roles/permissions", element: <RolePermissions /> },
	{ path: "/siteSettings/roles/permissions/view", element: <RolePermissionsView /> },
	{ path: "/siteSettings/location", element: <SiteSettingsTemplate /> },
	{ path: "/siteSettings/project-type", element: <ProjectType /> },
	{ path: "/siteSettings/feedback", element: <Feedback /> },
	{ path: "/siteSettings/project-state", element: <ProjectState /> },
	{ path: "/siteSettings/project-components", element: <ProjectComponents /> },
	{ path: "/siteSettings/department", element: <Department /> },
	{ path: "/siteSettings/authorities", element: <Authorities /> },
	{ path: "/siteSettings/leave-type", element: <LeaveType /> },
	{ path: "/siteSettings/dashboard-element", element: <DashboardElement /> },
	{ path: "/siteSettings/bulk-upload-format", element: <BulkUploadFormatSettings /> },
	{ path: "/siteSettings/biometrics-bulk-upload-job", element: <BiometricsBulkUploadJobSettings /> },
	{ path: "/siteSettings/permissions", element: <SiteSettingsTemplate /> },
	{ path: "/siteSettings/promotion", element: <PromotionSettings /> },
	{ path: "/siteSettings/user", element: <SiteUserSettings /> },
	{ path: "/siteSettings/active-users", element: <SiteActiveUsersList /> },
	{ path: "/siteSettings/leads", element: <LeadsSettings /> },
	{ path: "/siteSettings/leads/tracker", element: <LeadsTrackingSettings /> },
	{ path: "/siteSettings/user-ratings", element: <UserRatingSettings /> },
	{ path: "/siteSettings/user-alerts", element: <SiteUserAlerts /> },
	{ path: "/siteSettings/system-modules", element: <SystemModules /> },
	{ path: "/transactions", element: <Transactions /> },
	{ path: "/permits", element: <Permits /> },
	{ path: "/branding-theme", element: <BrandingTheme /> },
	{ path: "/product", element: <Product /> },
	{ path: "/siteSettings/sms", element: <SMSSettings /> },
	{ path: "/siteSettings/sms-logs", element: <SMSLogs /> },
	{ path: "/siteSettings/mail-logs", element: <SiteMailLogs /> },
	{ path: "/siteSettings/system-logs", element: <SystemLogs /> },
	{ path: "/siteSettings/whatsapp", element: <WhatsappMessages /> },
	{ path: "/siteSettings/organization", element: <OrganizationSettings /> },
	{ path: "/siteSettings/packages", element: <PackageSettings /> },
	{ path: "/projects", element: <AllProjects /> },
	{ path: "/projects/edit", element: <EditProject /> },
	{ path: "/projects/:slug", element: <ProjectDetails /> },
	{ path: "/chats", element: <AllConversations /> },
	{ path: "/siteSettings/system-modules/permission", element: <SystemModulePermission /> },
	{ path: "/siteSettings/site-map", element: <SiteMapSettings /> },
	{ path: "/siteSettings/templates", element: <TemplatesSiteSettings /> },
	{ path: "/siteSettings/attendance", element: <SiteSettingsAttendance /> },
	/** 403 - Resource Forbidden */
	{
		path: "/403",
		element: <ErrorCode403
			mainMessage="Resource Forbidden"
			subMessage="You are not authorized to access this page. Please contact your administrator."
		/>
	},
	/** =====Admin Dashboard End===== */
	/** 404 - Not found page */
	{
		path: "*",
		element: <ErrorCode404
			mainMessage="Page Not Found"
			subMessage="The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
		/>
	},
];
