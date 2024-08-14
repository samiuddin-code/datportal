import { QuotationDrawerTypes } from "@organisms/Quotations/Drawer/types";
import { useState } from "react"

/**
 * This hook is used to manage the state of the quotation drawer
 * @example
 * const { drawer, setDrawer } = useQuotationDrawer()
 */
export const useQuotationDrawer = () => {
  const defaultState: QuotationDrawerTypes = {
    open: false, leadId: 0, submissionById: null, type: "create"
  }
  // Invoice Drawer
  const [drawer, setDrawer] = useState<QuotationDrawerTypes>(defaultState);

  return { drawer, setDrawer }
}