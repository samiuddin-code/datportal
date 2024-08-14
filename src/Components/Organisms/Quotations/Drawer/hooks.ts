import { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { handleError } from "@helpers/common";
import {
  UseCheckForDuplicateQuoteNumberProps, UsePullFromXeroProps, UseQuoteNumberProps,
  UseCalculateTotalProps, QuotationDrawerFormType, UseSearchProjectProps,
  UseMarkAsSentProps, UseSubmitQuotationProps, UseGetOptionsProps, GetOptionsType
} from "./types";
import { TaxRateType } from "@modules/TaxRate/types";
import { TaxRateModule } from "@modules/TaxRate";

/** Generates a unique quote number for the quotation */
export const useQuoteNumber = (props: UseQuoteNumberProps) => {
  const { type, previewData, module, form, drawer } = props;
  const [quoteNumber, setQuoteNumber] = useState("");

  useMemo(() => {
    if (type === "create" || type === "revise") {
      const { prepareUniqueQuoteNumber } = module;
      const params = {
        revisionId: type === "revise" ? previewData?.id : undefined,
        leadId: (drawer?.leadId) ? drawer.leadId : undefined
      }
      prepareUniqueQuoteNumber(params).then((res) => {
        const data = res?.data?.data;
        const quoteNumber = data?.quoteNumber;
        setQuoteNumber(quoteNumber);
        form.setFieldValue("quoteNumber", quoteNumber)
      }).catch((err) => {
        const errorMessage = handleError(err);
        message.error(errorMessage || "Something went wrong");
      })
    }
  }, [type, previewData])

  return quoteNumber;
}

/** Checks if the quote number already exists */
export const useCheckForDuplicateQuoteNumber = (props: UseCheckForDuplicateQuoteNumberProps) => {
  const { type, previewData, module, form, quoteNumber } = props;

  useEffect(() => {
    if ((type === "create" || type === "revise" || type === "edit") && quoteNumber) {
      const { checkForDuplicacy } = module;
      const params = {
        quoteNumber,
        excludeId: type === "edit" ? previewData?.id : undefined
      }
      checkForDuplicacy(params).then((res) => {
        const { isDuplicate } = res?.data?.data;
        if (isDuplicate) {
          form.setFields([{
            name: 'quoteNumber',
            warnings: isDuplicate ? ["Quote Number already exists"] : []
          }]);
        }
      }).catch((err) => {
        const errorMessage = handleError(err);
        message.error(errorMessage || "Something went wrong");
      })
    }
  }, [type, previewData, quoteNumber])
}

/** Pulls the data from Xero */
export const usePullFromXero = (props: UsePullFromXeroProps) => {
  const {
    xeroModule, setPreviewData, setDrawer, setPullFromXero, pullFromXero
  } = props;

  const onPullFromXero = () => {
    setPullFromXero((prev) => ({ ...prev, loading: true }))
    const { getQuotes } = xeroModule;
    const { quoteNumber, xeroTenantId } = pullFromXero;
    getQuotes({ quoteNumber, tenantId: xeroTenantId }).then((res) => {
      const data = res?.data?.data;

      setPreviewData(data);
      setDrawer((prev) => ({ ...prev, type: "preview", quoteId: data?.id }));
    }).catch((err) => {
      const errorMessage = handleError(err);
      message.error(errorMessage || "Something went wrong");
    }).finally(() => {
      setPullFromXero((prev) => ({ ...prev, loading: false }))
    })
  }

  return onPullFromXero;
}

/** Calculate the total amount of the quotation */
export const useCalculateTotal = (props: UseCalculateTotalProps) => {
  const { form, setTotal, taxRateData: tData } = props;
  let taxRateData: TaxRateType[] | undefined = tData;
  const calculateTotal = async () => {
    const supervisionMonthlyCharge: number = form.getFieldValue('supervisionMonthlyCharge') || 0;
    const milestone: QuotationDrawerFormType['milestone'] = form.getFieldValue('milestone');

    if (!taxRateData) {
      let taxRateModule = new TaxRateModule();
      let response = await taxRateModule.getAllRecords();
      taxRateData = response.data.data;
    }
    // calculate the unit total
    const vatData = new Map<number, { title: string, vatRate: number, totalVat: number }>();
    let totalVATAmount = 0;
    let subtotal = 0;
    milestone.forEach((item) => {
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
    setTotal({ subtotal, total, vatData, supervisionMonthlyCharge })
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

/** Mark the quotation as sent */
export const useMarkAsSent = (props: UseMarkAsSentProps) => {
  const { permissions, module, onRefresh, successCallback } = props;
  const markAsSent = (id: number) => {
    if (permissions?.updateQuotation === true) {
      module.markAsSent(id).then((res) => {
        message.success(res?.data?.message || "Quotation marked as sent successfully");
        onRefresh();
        successCallback();
      }).catch((err) => {
        const errorMessage = handleError(err);
        message.error(errorMessage || "Something went wrong");
      })
    } else {
      message.error("You don't have permission to mark quotation as sent");
    }
  }

  return markAsSent;
}

/** Submit the quotation */
export const useSubmitQuotation = (props: UseSubmitQuotationProps) => {
  const {
    permissions, module, onRefresh, successCallback, setIsLoading, previewData
  } = props;

  const onSubmitQuotation = () => {
    if (!previewData?.id) return message.error("Quotation not found");

    if (permissions?.submitQuotation === true) {
      const { submitQuotation } = module;
      submitQuotation(previewData?.id).then(() => {
        message.success("Quotation submitted successfully");
        onRefresh();
        successCallback()
      }).catch((err) => {
        const errMessage = handleError(err)
        message.error(errMessage || "Something went wrong");
      }).finally(() => {
        setIsLoading(false);
      })
    } else {
      message.error("You don't have permission to submit quotation");
    }
  }

  return onSubmitQuotation;
}

/** Used to Get Options from API */
export const useGetOptions = (props: UseGetOptionsProps) => {
  const { modules, type, leadId } = props;
  const {
    brandingThemeModule, productModule, accountModule, taxRateModule
  } = modules

  const [options, setOptions] = useState<GetOptionsType>({
    brandingThemeData: null,
    productData: null,
    accountData: null,
    taxRateData: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taxRateResult, brandingThemeResult, productResult, accountResult] = await Promise.allSettled([
          taxRateModule.getAllRecords({leadId: (leadId) ? leadId : undefined}),
          brandingThemeModule.getAllRecords(),
          productModule.getAllRecords(),
          accountModule.getAllRecords({leadId: (leadId) ? leadId : undefined}),
        ])
        const taxRateData = taxRateResult.status === 'fulfilled' ? taxRateResult.value.data.data : null;
        const brandingThemeData = brandingThemeResult.status === 'fulfilled' ? brandingThemeResult.value.data.data : null;
        const productData = productResult.status === 'fulfilled' ? productResult.value.data.data : null;
        const accountData = accountResult.status === 'fulfilled' ? accountResult.value.data.data : null;
        setOptions({
          brandingThemeData,
          productData,
          accountData,
          taxRateData,
        });
      } catch (error) {
        console.error(error, "Error in fetching options for quotation drawer");
      }
    };
    fetchData();
  }, [brandingThemeModule, productModule, accountModule, taxRateModule]);

  return options;
};