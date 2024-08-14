import { useState } from "react"
import { InvoiceDrawerTypes } from "@organisms/Invoice/Drawer/types"

/**
 * This hook is used to manage the state of the invoice drawer
 * @example
 * const { drawer, setDrawer } = useInvoiceDrawer()
 */
export const useInvoiceDrawer = () => {
  const defaultState: InvoiceDrawerTypes = {
    open: false, id: 0, quotation: undefined, type: "create"
  }
  // Invoice Drawer
  const [drawer, setDrawer] = useState<InvoiceDrawerTypes>(defaultState);

  return { drawer, setDrawer }
}