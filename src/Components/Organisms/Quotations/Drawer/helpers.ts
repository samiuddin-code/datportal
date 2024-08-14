import { formatCurrency } from "@helpers/common";
import { Milestone, QuotationItemColumnsTypes } from "./types";

/** Date preset options for the date picker */
export const datePresets = [7, 14, 30, 60, 90]

/** Quotation Item Columns */
export const quotationItemColumns: QuotationItemColumnsTypes[] = [
  { title: "Products", key: "title", span: 3, style: {} },
  { title: "Title", key: "title", span: 6, style: {} },
  { title: "Quantity", key: "quantity", span: 2, style: {} },
  { title: "Unit Amount", key: "unitAmount", span: 3, style: {} },
  { title: "Account", key: "account", span: 4, style: {} },
  { title: "Tax Rate", key: "tax", span: 2, style: {} },
  { title: "Unit Total", key: "unitTotal", span: 3, style: { textAlign: "center" } },
  { title: "Actions", key: "actions", span: 1, style: {} },
]

/** Initial Milestone Value for the form */
export const initialMilestoneValue = Array<Partial<Milestone>>(3).fill({
  title: '', amount: 0, requirePayment: false, quantity: 1,
});

/** Get the total amount for a milestone */
export const getLineTotal = (quantity: number | null, amount: number | null) => {
  if (!quantity || !amount) {
    return formatCurrency(0);
  }

  return formatCurrency(quantity * amount);
}