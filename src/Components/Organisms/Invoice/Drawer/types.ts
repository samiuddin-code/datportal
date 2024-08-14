import { CSSProperties, Dispatch, SetStateAction } from "react";
import { AccountModule } from "@modules/Account";
import { BrandingThemeModule } from "@modules/BrandingTheme";
import { InvoiceModule } from "@modules/Invoice";
import { InvoicePermissionsEnum } from "@modules/Invoice/permissions";
import { InvoiceTypes } from "@modules/Invoice/types";
import { ProductModule } from "@modules/Product";
import { QuotationMilestone, QuotationTypes } from "@modules/Quotation/types"
import { TaxRateModule } from "@modules/TaxRate";
import { FormInstance } from "antd";
import { Moment } from "moment";
import { TaxRateType } from "@modules/TaxRate/types";
import { ProjectModule } from "@modules/Project";
import { CheckboxChangeEvent } from "antd/es/checkbox";

export type PermissionsType = { [key in InvoicePermissionsEnum]: boolean }

export interface InvoiceDrawerProps {
  /** The drawer state */
  drawer: InvoiceDrawerTypes
  /** The function to set the drawer state */
  setDrawer: Dispatch<SetStateAction<InvoiceDrawerTypes>>
  /** The permissions of the user */
  permissions: PermissionsType
  /** Function to refresh the data */
  onRefresh: <QueryType = any>(query?: QueryType) => void
}

export type TotalTypes = {
  subtotal: number,
  vatData?: Map<number, {
    title: string;
    vatRate: number;
    totalVat: number;
  }>
  total: number
}

export type SearchedResultTypes<T = any> = {
  data: T[]
  loading: boolean
}

export type InvoiceItemsTypes = {
  title: string;
  amount: number | null;
  quantity?: number;
  id?: number | string;
  productId: number
  accountId: number
  taxRateId: number
}

export type InvoiceDrawerFormType = {
  title: string
  projectId: number
  type: number
  invoiceItems: InvoiceItemsTypes[]
  file: any
  milestoneIds: number[]
  hasSupervisionCharge: boolean
  quotationId: number
  issueDate: Moment | undefined
  expiryDate: Moment | undefined
}

export type InvoiceDrawerTypes = {
  /** Drawer type */
  type: "create" | "preview" | "edit";
  /** Drawer open state */
  open: boolean;
  /** Invoice Id */
  id?: number;
  /** Selected Quotation */
  quotation?: QuotationTypes
  /** Project Id */
  projectId?: number;
}

export type UseInvoiceNumberProps = {
  type: InvoiceDrawerTypes['type'];
  previewData: InvoiceTypes;
  module: InvoiceModule;
  form: FormInstance<InvoiceDrawerFormType>
}

export type UseCheckForDuplicateInvoiceNumberProps = {
  invoiceNumber: string;
} & UseInvoiceNumberProps

export type UnitTotalType = { [key: number]: number; }

export type UseCalculateTotalProps = {
  taxRateData: TaxRateType[]
  form: FormInstance<InvoiceDrawerFormType>
  setTotal: Dispatch<SetStateAction<TotalTypes>>
}

export type UseSearchProjectProps = {
  debouncedProjectSearchTerm: string
  setProjects: Dispatch<SetStateAction<SearchedResultTypes>>
  projectModule: ProjectModule
}

export type UseMarkAsSentProps = {
  module: InvoiceModule
  permissions: PermissionsType
  onRefresh: InvoiceDrawerProps['onRefresh']
  successCallback: () => void
}

export type UseSubmitInvoiceProps = {
  module: InvoiceModule
  previewData: InvoiceTypes
  permissions: PermissionsType
  onRefresh: InvoiceDrawerProps['onRefresh']
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
  type: InvoiceDrawerTypes['type']
}

export type ExpiryDateType = {
  type: "7_days" | "15_days" | "30_days" | "45_days" | "90_days" | "custom"
  date: Moment | undefined
}

export type InvoiceItemColumnsTypes = {
  title: string;
  key: string;
  span: number;
  style: CSSProperties;
}

export type MilestoneType = {
  id: number;
  title: string;
  amount: number;
  quantity?: number;
}

type SelectedMilestonesType = {
  ids: number[];
  completedIds: number[];
}

export type AddOrRemoveItemProps = {
  id: number
  milestone: MilestoneType | undefined
  isChecked: boolean
  defaultValue: InvoiceItemsTypes[]
}

export type UseMilestoneSelectionReturnType = {
  checkUncheck: (id: number, isChecked: boolean) => void;
  checkUncheckSupervision: (event: CheckboxChangeEvent) => void;
}

export type UseMilestoneSelectionProps = {
  form: FormInstance<InvoiceDrawerFormType>
  QuotationMilestone: QuotationMilestone[]
  quotation: QuotationTypes
  selectedMilestones: SelectedMilestonesType
  setSelectedMilestones: Dispatch<SetStateAction<SelectedMilestonesType>>
  setChecked: Dispatch<SetStateAction<boolean>>
  onCalculateTotal: () => void
}