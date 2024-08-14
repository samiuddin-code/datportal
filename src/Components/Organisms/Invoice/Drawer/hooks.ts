import { useEffect, useMemo, useState } from "react";
import { FormInstance, message } from "antd";
import { handleError } from "@helpers/common";
import {
  AddOrRemoveItemProps,
  InvoiceDrawerFormType, InvoiceItemsTypes, MilestoneType, UseCalculateTotalProps, UseCheckForDuplicateInvoiceNumberProps,
  UseGetOptionsProps, UseInvoiceNumberProps, UseMarkAsSentProps, UseMilestoneSelectionProps, UseMilestoneSelectionReturnType, UseSearchProjectProps,
  UseSubmitInvoiceProps
} from "./types";
import { useFetchData } from "hooks";
import { BrandingThemeType } from "@modules/BrandingTheme/types";
import { ProductType } from "@modules/Product/types";
import { AccountType } from "@modules/Account/types";
import { TaxRateType } from "@modules/TaxRate/types";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { Milestone } from "@organisms/Quotations/Drawer/types";
import { TaxRateModule } from "@modules/TaxRate";

/** Generates a unique invoice number */
export const useInvoiceNumber = (props: UseInvoiceNumberProps) => {
  const { type, module, form } = props;
  const [invoiceNumber, setInvoiceNumber] = useState("");

  useMemo(() => {
    if (type === "create") {
      const { prepareUniqueInvoiceNumber } = module;
      prepareUniqueInvoiceNumber().then((res) => {
        const data = res?.data?.data;
        const invoiceNumber = data?.invoiceNumber;
        setInvoiceNumber(invoiceNumber);
        form.setFieldValue("invoiceNumber", invoiceNumber)
      }).catch((err) => {
        const errorMessage = handleError(err);
        message.error(errorMessage || "Something went wrong");
      })
    }
    return invoiceNumber
  }, [type])

  return invoiceNumber;
}

/** Checks if the invoice number already exists */
export const useCheckForDuplicateInvoiceNumber = (props: UseCheckForDuplicateInvoiceNumberProps) => {
  const { type, module, previewData, form, invoiceNumber } = props;

  useEffect(() => {
    if ((type === "create" || type === "edit") && invoiceNumber) {
      const { checkForDuplicacy } = module;
      const params = {
        invoiceNumber,
        excludeId: type === "edit" ? previewData?.id : undefined
      }
      checkForDuplicacy(params).then((res) => {
        const { isDuplicate } = res?.data?.data;
        if (isDuplicate) {
          form.setFields([{
            name: 'invoiceNumber',
            warnings: isDuplicate ? ['Invoice number already exists'] : []
          }]);
        }
      }).catch((err) => {
        const errorMessage = handleError(err);
        message.error(errorMessage || "Something went wrong");
      })
    }
  }, [type, previewData, invoiceNumber])
}


/** Calculate the total amount of the Invoice */
export const useCalculateTotal = (props: UseCalculateTotalProps) => {
  const { form, setTotal, taxRateData: tData } = props;
  let taxRateData: typeof tData = tData;
  const calculateTotal = async () => {
    const invoiceItems: InvoiceDrawerFormType['invoiceItems'] = form.getFieldValue('invoiceItems');

    if (!taxRateData) {
      let taxRateModule = new TaxRateModule();
      let response = await taxRateModule.getAllRecords();
      taxRateData = response.data.data;
    }

    // calculate the unit total
    const vatData = new Map<number, { title: string, vatRate: number, totalVat: number }>();
    let totalVATAmount = 0;
    let subtotal = 0;
    invoiceItems.forEach((item) => {
      // remove the decimal places from the quantity and keep only the whole number
      const amount = Number(item?.amount);
      const quantity = Math.trunc(item?.quantity || 0);
      const lineTotal = amount * quantity;
      subtotal += lineTotal;
      let taxRateId = item.taxRateId;
      if (taxRateId && taxRateData && lineTotal > 0) {
        let taxData = taxRateData.find((item) => item.id === taxRateId);
        if (taxData && taxData.rate > 0) {
          let existingVat = vatData.get(taxRateId);
          let totalVat = (existingVat) ? existingVat.totalVat : 0;
          let lineTax = (taxData.rate / 100) * lineTotal
          totalVat += lineTax;
          totalVATAmount += lineTax;

          vatData.set(taxRateId, { title: taxData.title, vatRate: taxData.rate, totalVat });
        }
      }
    })

    const total = subtotal + totalVATAmount;
    setTotal({ subtotal, total, vatData })
  }


  return calculateTotal;
}

/** Search for projects */
export const useProjectSearch = (props: UseSearchProjectProps) => {
  const { projectModule, setProjects, debouncedProjectSearchTerm } = props;

  const { getRecordsInList } = projectModule;

  /** Make API Call to fetch the projects */
  const fetchProjects = ({ title, ids }: { title?: string; ids?: number[] } = {}) => {
    getRecordsInList({ title, ids }).then((res) => {
      const { data } = res?.data
      setProjects((prev) => {
        // if the data is already present in the state, then don't add it again
        const filteredData = data?.filter((item) => {
          return !prev?.data?.find((prevItem) => prevItem.id === item.id);
        });
        // add the new data to the existing data
        return { data: [...prev.data, ...filteredData], loading: false };
      })
    }).catch((err) => {
      const errorMessage = handleError(err)
      message.error(errorMessage || "Something went wrong, please try again later.")
    })
  }

  /** Prepare the search term and make the API call */
  const onProjectSearch = () => {
    if (debouncedProjectSearchTerm) {
      setProjects((prev) => ({ ...prev, loading: true }));

      fetchProjects({ title: debouncedProjectSearchTerm });
    }
  }

  return { onProjectSearch, fetchProjects }
}

/** Mark the invoice as sent */
export const useMarkAsSent = (props: UseMarkAsSentProps) => {
  const { permissions, module, onRefresh, successCallback } = props;
  const markAsSent = (id: number) => {
    if (permissions?.updateInvoice === true) {
      module.markAsSent(id).then((res) => {
        message.success(res?.data?.message || "Invoice marked as sent successfully");
        onRefresh();
        successCallback();
      }).catch((err) => {
        const errorMessage = handleError(err);
        message.error(errorMessage || "Something went wrong");
      })
    } else {
      message.error("You don't have permission to mark invoice as sent");
    }
  }

  return markAsSent;
}

/** Submit the Invoice */
export const useSubmitInvoice = (props: UseSubmitInvoiceProps) => {
  const {
    permissions, module, onRefresh, successCallback, setIsLoading, previewData
  } = props;

  const onSubmitInvoice = () => {
    if (!previewData?.id) return message.error("Invoice not found");

    if (permissions?.submitInvoice === true) {
      const { submitInvoice } = module;
      submitInvoice(previewData?.id).then(() => {
        message.success("Invoice submitted successfully");
        onRefresh();
        successCallback()
      }).catch((err) => {
        const errMessage = handleError(err)
        message.error(errMessage || "Something went wrong");
      }).finally(() => {
        setIsLoading(false);
      })
    } else {
      message.error("You don't have permission to submit Invoice");
    }
  }

  return onSubmitInvoice;
}

/** Used to Get Options from API */
export const useGetOptions = (props: UseGetOptionsProps) => {
  const { modules, type } = props;
  const {
    brandingThemeModule, productModule, accountModule, taxRateModule
  } = modules

  // get branding theme data
  const { data: brandingThemeData } = useFetchData<BrandingThemeType[]>({
    method: brandingThemeModule.getAllRecords,
  });

  // get product data
  const { data: productData } = useFetchData<ProductType[]>({
    method: productModule.getAllRecords,
  });

  // get account data
  const { data: accountData } = useFetchData<AccountType[]>({
    method: accountModule.getAllRecords,
  });

  // get tax rate data
  const { data: taxRateData } = useFetchData<TaxRateType[]>({
    method: taxRateModule.getAllRecords,
  });
  return { brandingThemeData, productData, accountData, taxRateData }
}

export const useMilestoneSelection = (props: UseMilestoneSelectionProps): UseMilestoneSelectionReturnType => {
  const {
    form, QuotationMilestone, quotation, selectedMilestones, setSelectedMilestones, setChecked, onCalculateTotal
  } = props;

  const addOrRemoveItem = ({ id, milestone, isChecked, defaultValue }: AddOrRemoveItemProps) => {
    const fieldName = "invoiceItems";
    const invoiceItems: InvoiceItemsTypes[] = form.getFieldValue(fieldName);
    let firstItemData: InvoiceItemsTypes = form.getFieldValue([fieldName, 0]);
    let formItems = invoiceItems.filter((item) => item?.id !== milestone?.id);

    if (isChecked) {
      if (milestone) {
        // if the first invoice item is empty, add the first checked milestone to it
        // and if it is not empty, add the checked milestone to the end of the array
        if (invoiceItems.length === 1 && firstItemData?.title === "") {
          form.setFieldsValue({
            [fieldName]: [{
              title: milestone.title,
              amount: milestone.amount,
              id: milestone.id,
              quantity: milestone.quantity || 1
            }]
          });
        } else {
          form.setFieldsValue({
            [fieldName]: [...invoiceItems, {
              title: milestone.title,
              amount: milestone.amount,
              id: milestone.id,
              quantity: milestone.quantity || 1
            }]
          });
        }
      }
    } else {
      let newInvoiceItems = invoiceItems.filter((item) => item?.id !== id);
      if (newInvoiceItems.length === 0) {
        newInvoiceItems.push(...defaultValue);
      }
      form.setFieldsValue({ [fieldName]: newInvoiceItems });
    }

    onCalculateTotal();
  }

  const defaultValue = [{ title: "", amount: null, id: 0, quantity: 1 } as InvoiceItemsTypes];

  const checkUncheck = (id: number, isChecked: boolean) => {
    const milestone = QuotationMilestone?.find((milestone) => milestone.id === id);
    addOrRemoveItem({ id, milestone, isChecked, defaultValue });
    setSelectedMilestones((prev) => ({
      ...prev,
      ids: !isChecked ? prev.ids.filter((milestoneId) => milestoneId !== id) : [...prev.ids, id],
    }));
  }

  const checkUncheckSupervision = (event: CheckboxChangeEvent) => {
    const isChecked = event.target.checked;
    const supervisionData = { title: "Supervision Charge", amount: quotation?.supervisionMonthlyCharge!, id: -100 };
    addOrRemoveItem({ id: -100, milestone: supervisionData, isChecked, defaultValue });
    setChecked(isChecked);
  }

  return { checkUncheck, checkUncheckSupervision }
}