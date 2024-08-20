import { CSSProperties, Dispatch, SetStateAction } from "react"
import { FormInstance } from "antd"
import { Moment } from "moment"
import { SupervisionPaymentSchedule } from "@helpers/commonEnums"
import { AccountModule } from "@modules/Account"
import { BrandingThemeModule } from "@modules/BrandingTheme"
import { ProductModule } from "@modules/Product"
import { ProjectModule } from "@modules/Project"
import { QuotationModule } from "@modules/Quotation"
import { QuotationPermissionsEnum } from "@modules/Quotation/permissions"
import { QuotationTypes } from "@modules/Quotation/types"
import { TaxRateModule } from "@modules/TaxRate"
import { XeroModule } from "@modules/Xero"
import { TaxRateType } from "@modules/TaxRate/types"
import { BrandingThemeType } from "@modules/BrandingTheme/types"
import { ProductType } from "@modules/Product/types"
import { AccountType } from "@modules/Account/types"
import { NewProjectModalTypes } from "../status"

type PermissionsType = { [key in QuotationPermissionsEnum]: boolean }

export interface QuotationDrawerProps {
  
  /** The drawer state */
  drawer: QuotationDrawerTypes
  /** The function to set the drawer state */
  setDrawer: Dispatch<SetStateAction<QuotationDrawerTypes>>
  /** The permissions of the user */
  permissions: PermissionsType
  /** Function to refresh the data */
  onRefresh: <QueryType = any>(query?: QueryType) => void
  /** New project modal state */
  setNewProject?: Dispatch<SetStateAction<NewProjectModalTypes>>
}

export type SearchedResultTypes<T = any> = {
  data: T[]
  loading: boolean
}

export type TotalTypes = {
  subtotal: number;
  vatData?: Map<number, {
    title: string;
    vatRate: number;
    totalVat: number;
  }>
  total: number;
  supervisionMonthlyCharge: number
}

export type CreateOrReviseType = {
  callback: () => void
  extra?: { revisedQuotationReferenceId: number, leadId: number }
}

export type PullFromXeroType = {
  init: boolean
  quoteNumber: string
  loading: boolean
  data: any
  xeroTenantId: string
}

// Supervision Payment Schedule Label Type
export type SupervisionLabelType = keyof typeof SupervisionPaymentSchedule

export type QuotationDrawerFormType = {
  submissionById?: number | null;
  leadId: number
  totalAmount: number
  hasSupervision: boolean
  supervisionMonthlyCharge: number
  supervisionPaymentSchedule?: number
  scopeOfWork: string
  paymentTerms: string
  milestone: Milestone[]
  type: number
  file: any
  quoteNumber: string
  brandingThemeId: number
  clientId: number
  issueDate: Moment | undefined
  expiryDate: Moment | undefined
}

export type Milestone = {
  title: string
  amount: number
  quantity: number
  productId: number
  accountId: number
  taxRateId: number
  requirePayment: boolean
}

export type QuotationDrawerTypes = {
  /**Drawer type */
  type: "create" | "preview" | "edit" | "revise"
  /**Drawer visibility */
  open: boolean;
  /**Lead Id */
  leadId?: number;
  /**Quotation Id */
  quoteId?: number;
  /**Submission Id */
  submissionById?: number | null;
}

export type UseQuoteNumberProps = {
  type: QuotationDrawerTypes['type'];
  previewData: QuotationTypes;
  module: QuotationModule;
  form: FormInstance<QuotationDrawerFormType>
  drawer: QuotationDrawerTypes
}

export type UseCheckForDuplicateQuoteNumberProps = {
  quoteNumber: string;
} & UseQuoteNumberProps

export type UsePullFromXeroProps = {
  xeroModule: XeroModule;
  pullFromXero: Partial<PullFromXeroType>;
  setPreviewData: Dispatch<SetStateAction<QuotationTypes | undefined>>
  setDrawer: QuotationDrawerProps['setDrawer'];
  setPullFromXero: Dispatch<SetStateAction<Partial<PullFromXeroType>>>;
}

export type UnitTotalType = { [key: number]: number; }

export type UseCalculateTotalProps = {
  taxRateData: TaxRateType[]
  form: FormInstance<QuotationDrawerFormType>
  setTotal: Dispatch<SetStateAction<TotalTypes>>
}

export type UseSearchProjectProps = {
  debouncedProjectSearchTerm: string
  setProjects: Dispatch<SetStateAction<SearchedResultTypes>>
  projectModule: ProjectModule
}

export type UseMarkAsSentProps = {
  module: QuotationModule
  permissions: PermissionsType
  onRefresh: QuotationDrawerProps['onRefresh']
  successCallback: () => void
}

export type UseSubmitQuotationProps = {
  module: QuotationModule
  previewData: QuotationTypes
  permissions: PermissionsType
  onRefresh: QuotationDrawerProps['onRefresh']
  successCallback: () => void
  setIsLoading: Dispatch<SetStateAction<boolean>>
}

export type UseGetOptionsProps = {
  modules: {
    brandingThemeModule: BrandingThemeModule
    productModule: ProductModule,
    accountModule: AccountModule,
    taxRateModule: TaxRateModule
  }
  type: QuotationDrawerTypes['type'],
  leadId?: number
}

export type GetOptionsType = {
  brandingThemeData: BrandingThemeType[] | null,
  productData: ProductType[] | null,
  accountData: AccountType[] | null,
  taxRateData: TaxRateType[] | null,
}

export type ExpiryDateType = {
  type: "7_days" | "15_days" | "30_days" | "45_days" | "90_days" | "custom"
  date: Moment | undefined
}

export type QuotationItemColumnsTypes = {
  title: string;
  key: string;
  span: number;
  style: CSSProperties;
}