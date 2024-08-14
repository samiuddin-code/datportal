import { useEffect, useState, useMemo, useCallback, FC, FormEvent } from "react";
import { Segmented, message } from "antd";
import { useSelector } from "react-redux";
import Layout from "@templates/Layout";
import { RootState } from "Redux/store";
import { useFetchData, useNewProjectModal, useQuotationDrawer } from "hooks";
import { CustomFilter, CustomInput, ExcelExport, PageHeader, Pagination } from "@atoms/";
import { ErrorCode403 } from "@atoms/ErrorCodes";
import QuotationsCard from "./Card";
import { QuotationPermissionsEnum } from "@modules/Quotation/permissions";
import { InvoicePermissionsEnum } from "@modules/Invoice/permissions";
import { QuotationModule } from "@modules/Quotation";
import { QuotationParams, QuotationTypes } from "@modules/Quotation/types";
import { QueryType } from "@modules/Common/common.interface";
import { ProjectPermissionsEnum } from "@modules/Project/permissions";
import { ProjectTypeModule } from "@modules/ProjectType";
import { ProjectModule } from "@modules/Project";
import { ClientModule } from "@modules/Client";
import { ClientType } from "@modules/Client/types";
import { ProjectTypeType } from "@modules/ProjectType/types";
import { ProjectTypes } from "@modules/Project/types";
import { getPermissionSlugs, handleError, isNumber } from "@helpers/common";
import { convertDate } from "@helpers/dateHandler";
import { useDebounce } from "@helpers/useDebounce";
import { QuotationStatus } from "@helpers/commonEnums";
import QuotationDrawer from "./Drawer";
import { CardShimmer } from "@atoms/CardShimmer";
import { UserModule } from "@modules/User";
import { UserTypes } from "@modules/User/types";

const breadCrumbsData = [
  { text: "Home", isLink: true, path: "/" },
  { isLink: false, text: "Quotations" },
];

type SelectedFiltersTypes = {
  dateRange?: string[];
} & QueryType<QuotationParams>

type QuotationExportType = { [key: string]: string | number | boolean }

type PermissionType = { [key in QuotationPermissionsEnum]: boolean } & {
  [key in InvoicePermissionsEnum]: boolean
} & { [key in ProjectPermissionsEnum]: boolean }

type SearchedResultTypes<T = any> = {
  data: T[]
  loading: boolean
}

const Quotations: FC = () => {
  // available permissions for the properties page
  const permissionSlug = getPermissionSlugs(QuotationPermissionsEnum)
  const invoicePermissionSlug = getPermissionSlugs(InvoicePermissionsEnum)
  const projectPermissionSlug = getPermissionSlugs(ProjectPermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as PermissionType
  const { readQuotation, createQuotation } = permissions;

  const module = useMemo(() => new QuotationModule(), []);
  const projectTypeModule = useMemo(() => new ProjectTypeModule(), []);
  const projectModule = useMemo(() => new ProjectModule(), []);
  const clientModule = useMemo(() => new ClientModule(), []);
  const userModule = useMemo(() => new UserModule(), []);

  // Status Filters
  const statusValues = {
    active: [QuotationStatus.New, QuotationStatus.Sent],
    confirmed: [QuotationStatus.Confirmed],
    rejected: [QuotationStatus.Rejected],
    draft: [QuotationStatus.New],
    revised: [QuotationStatus.Revised]
  }

  const { data, onRefresh, meta, loading } = useFetchData<QuotationTypes[]>({
    method: module.getAllRecords,
    initialQuery: { __status: statusValues.active },
  })

  const { drawer, setDrawer } = useQuotationDrawer()

  const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
    dateRange: [""],
    __status: statusValues.active
  });

  const [reset, setReset] = useState<boolean>(false);
  const [excelData, setExcelData] = useState<QuotationExportType[]>([]);

  // Create Project Modal State
  const { newProject, setNewProject } = useNewProjectModal()

  // Key search
  const [keySearchTerm, setKeySearchTerm] = useState<string | undefined>();
  // Search Debounce
  const debouncedKeySearchTerm = useDebounce(keySearchTerm, 500)

  // client search term
  const [clientTerm, setClientTerm] = useState("");
  // Search Debounce
  const debouncedClientTerm = useDebounce(clientTerm, 500)

  // project type search term
  const [projectTypeTerm, setProjectTypeTerm] = useState("");
  // Search Debounce
  const debouncedProjectTypeTerm = useDebounce(projectTypeTerm, 500)

  // project search term
  const [projectTerm, setProjectTerm] = useState("");
  // Search Debounce
  const debouncedProjectTerm = useDebounce(projectTerm, 500)

  // assigned to search term
  const [assignedToTerm, setAssignedToTerm] = useState("");
  // Search Debounce
  const debouncedAssignedToTerm = useDebounce(assignedToTerm, 500)

  const [clients, setClients] = useState<SearchedResultTypes<ClientType>>({
    data: [], loading: false
  });

  const [projectTypes, setProjectTypes] = useState<SearchedResultTypes<ProjectTypeType>>({
    data: [], loading: false
  });

  const [projects, setProjects] = useState<SearchedResultTypes<ProjectTypes>>({
    data: [], loading: false
  });

  const [assignedTo, setAssignedTo] = useState<SearchedResultTypes<UserTypes>>({
    data: [], loading: false
  });

  // headers for the excel export
  const headers = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
  ]

  const onSelected = (event: any) => {
    const { name, value } = event?.target as { name: keyof SelectedFiltersTypes, value: string | string[] }

    const fieldsNames = ["clientId", "projectTypeId", "projectId", "assignedToId"];

    if (fieldsNames.includes(name)) {
      const isValidNumber = isNumber(value as string);
      if (!isValidNumber) {
        let label: string = "";
        switch (name) {
          case "clientId":
            label = "Client ID"
            break;
          case "projectTypeId":
            label = "Project Type ID"
            break;
          case "projectId":
            label = "Project ID"
            break;
          case "assignedToId":
            label = "Assigned To ID"
            break;
        }
        return message.error(`${label} should be a number`)
      }
    }

    // set the selected value in the state
    setSelectedFilters((prev) => ({ ...prev, [name]: value }))
  }

  const onReset = useCallback((name: keyof SelectedFiltersTypes, value: number | string | string[]) => {
    if (name) {
      setReset(true);
      setSelectedFilters({ ...selectedFilters, [name]: value });
    }
  }, [selectedFilters]);

  const onAddNewClick = () => {
    if (createQuotation === false) {
      message.error("You don't have permission to create new record");
      return;
    }
    setDrawer({ ...drawer, open: true, type: "create" })
  }

  const onSearchChange = (event: FormEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setKeySearchTerm(value)
    onSelected(event)
  }

  const onUpdate = useCallback((query?: QueryType<QuotationParams>) => {
    const fromDateString: string = selectedFilters.dateRange?.[0] || "";
    const toDateString = selectedFilters.dateRange?.[1] || "";
    const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
    const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

    const data: QueryType<QuotationParams> = {
      fromDate: fromDate,
      toDate: toDate,
      __status: selectedFilters.__status || undefined,
      clientId: selectedFilters.clientId || undefined,
      projectTypeId: selectedFilters.projectTypeId || undefined,
      projectId: selectedFilters.projectId || undefined,
      quoteNumber: debouncedKeySearchTerm || undefined,
      assignedToId: selectedFilters.assignedToId || undefined,
      ...query,
    }

    // get the data from the api
    onRefresh(data);
  }, [selectedFilters])

  const onPaginationChange = (page: number, pageSize: number) => onUpdate({ page, perPage: pageSize });

  /** Get the search result for the client */
  const GetSearchClients = useCallback(() => {
    if (debouncedClientTerm) {
      setClients((prev) => ({ ...prev, loading: true }));
      clientModule.findPublished({ name: debouncedClientTerm }).then((res) => {
        const data = res?.data?.data;
        setClients((prev) => {
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
        setClients((prev) => ({ ...prev, loading: false }));
      })
    }
  }, [debouncedClientTerm])

  /** Get the search result for the project type */
  const GetSearchProjectTypes = useCallback(() => {
    if (debouncedProjectTypeTerm) {
      setProjectTypes((prev) => ({ ...prev, loading: true }));
      projectTypeModule.getPublishRecords({ title: debouncedProjectTypeTerm }).then((res) => {
        const data = res?.data?.data;
        setProjectTypes((prev) => {
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
        setProjectTypes((prev) => ({ ...prev, loading: false }));
      })
    }
  }, [debouncedProjectTypeTerm])

  /** Get the search result for the project */
  const GetSearchProjects = useCallback(() => {
    if (debouncedProjectTerm) {
      setProjects((prev) => ({ ...prev, loading: true }));
      projectModule.getAllRecords({ title: debouncedProjectTerm }).then((res) => {
        const data = res?.data?.data;
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
        setProjects((prev) => ({ ...prev, loading: false }));
      })
    }
  }, [debouncedProjectTerm])

  /** Get the search result for the assigned to */
  const GetSearchAssignedTo = useCallback(() => {
    if (debouncedAssignedToTerm) {
      setAssignedTo((prev) => ({ ...prev, loading: true }));
      userModule.getAllRecords({ name: debouncedAssignedToTerm }).then((res) => {
        const data = res?.data?.data;
        setAssignedTo((prev) => {
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
        setAssignedTo((prev) => ({ ...prev, loading: false }));
      })
    }
  }, [debouncedAssignedToTerm])

  useEffect(() => {
    if (reset) {
      onUpdate();
    }
    // after 2 seconds set reset clicked state to false
    const timer = setTimeout(() => {
      setReset(false)
    }, 2000);
    return () => clearTimeout(timer);
  }, [reset, selectedFilters, onUpdate])

  const getExcelData = useCallback(() => {
    if (data && data.length > 0) {
      const _data = data?.map((item) => {
        return {}
      })
      setExcelData(_data);
    }
  }, [data])

  useEffect(() => {
    if (debouncedKeySearchTerm !== undefined) {
      onUpdate({ quoteNumber: debouncedKeySearchTerm })
    } else if (debouncedKeySearchTerm === "") {
      onUpdate({ quoteNumber: undefined });
    }
  }, [debouncedKeySearchTerm])

  useEffect(() => {
    getExcelData();
  }, [getExcelData])

  useEffect(() => {
    GetSearchClients();
  }, [GetSearchClients])

  useEffect(() => {
    GetSearchProjectTypes();
  }, [GetSearchProjectTypes])

  useEffect(() => {
    GetSearchProjects();
  }, [GetSearchProjects])

  useEffect(() => {
    GetSearchAssignedTo();
  }, [GetSearchAssignedTo])

  const segmentedOptions = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Draft", value: "draft" },
    { label: "Revised", value: "revised" },
    { label: "Rejected", value: "rejected" },
  ]

  return (
    <Layout
      permissionSlug={[...permissionSlug, ...invoicePermissionSlug, ...projectPermissionSlug]}
    >
      <PageHeader
        heading="Quotations"
        breadCrumbData={breadCrumbsData}
        showAdd={!!createQuotation}
        buttonText="Add Quotation"
        onButtonClick={onAddNewClick}
        positionChildren="new-line"
        filters={
          readQuotation ? (
            <div>
              <div>
                <CustomInput
                  name='name' placeHolder="Search by quotation id"
                  onChange={onSearchChange}
                  value={keySearchTerm}
                  style={{ maxWidth: 200 }}
                />
              </div>
              <div style={{ overflow: "auto" }}>
                <Segmented
                  size="middle" defaultValue={"active"}
                  options={segmentedOptions.map((item) => {
                    return {
                      ...item,
                      title: item.label,
                      value: item.value
                    }
                  })}
                  style={{ fontSize: "var(--font-size-sm)" }}
                  onChange={(value) => {
                    if (value === "all") {
                      onReset("__status", "")
                      setSelectedFilters((prev) => ({ ...prev, __status: [] }))
                    } else {
                      const _value = value as keyof typeof statusValues;
                      onUpdate({ __status: statusValues[_value] })
                      setSelectedFilters((prev) => ({ ...prev, __status: statusValues[_value] }))
                    }
                  }}
                />
              </div>
              <div>
                <CustomFilter
                  type="radio"
                  label="Client"
                  name="clientId"
                  withSearch={true}
                  options={clients?.data?.map((item) => {
                    return { label: item.name, value: `${item.id}` }
                  })}
                  onChange={onSelected}
                  value={Number(selectedFilters?.clientId) > 0 ? String(selectedFilters?.clientId) : ""}
                  onReset={() => {
                    onReset("clientId", 0);
                    // reset the search term
                    setClientTerm("");
                  }}
                  onUpdate={onUpdate}
                  // START: For search
                  loading={clients?.loading}
                  searchTerm={clientTerm}
                  onSearch={(event) => setClientTerm(event.currentTarget.value)}
                // END: For search
                />
              </div>
              <div>
                <CustomFilter
                  type="radio"
                  label="Assigned To"
                  name="assignedToId"
                  withSearch={true}
                  options={assignedTo?.data?.map((item) => {
                    return {
                      label: `${item.firstName} ${item.lastName}`,
                      value: `${item.id}`
                    }
                  })}
                  onChange={onSelected}
                  value={Number(selectedFilters?.assignedToId) > 0 ? String(selectedFilters?.assignedToId) : ""}
                  onReset={() => {
                    onReset("assignedToId", 0);
                    // reset the search term
                    setAssignedToTerm("");
                  }}
                  onUpdate={onUpdate}
                  // START: For search
                  loading={assignedTo?.loading}
                  searchTerm={assignedToTerm}
                  onSearch={(event) => setAssignedToTerm(event.currentTarget.value)}
                // END: For search
                />
              </div>
              <div>
                <CustomFilter
                  type="datepicker"
                  label="Date"
                  name="dateRange"
                  onChange={(value) => setSelectedFilters((prev) => ({ ...prev, dateRange: value }))}
                  onReset={() => onReset("dateRange", [])}
                  onUpdate={onUpdate}
                />
              </div>
              <div>
                <CustomFilter
                  type="radio"
                  label="Project Type"
                  name="projectTypeId"
                  withSearch={true}
                  options={projectTypes?.data?.map((item) => {
                    return { label: item.title, value: `${item.id}` }
                  })}
                  onChange={onSelected}
                  value={Number(selectedFilters?.projectTypeId) > 0 ? String(selectedFilters?.projectTypeId) : ""}
                  onReset={() => {
                    onReset("projectTypeId", 0);
                    // reset the search term
                    setProjectTypeTerm("");
                  }}
                  onUpdate={onUpdate}
                  // START: For search
                  loading={projectTypes?.loading}
                  searchTerm={projectTypeTerm}
                  onSearch={(event) => setProjectTypeTerm(event.currentTarget.value)}
                // END: For search
                />
              </div>
              <div>
                <CustomFilter
                  type="radio"
                  label="Project"
                  name="projectId"
                  withSearch={true}
                  options={projects?.data?.map((item) => {
                    return {
                      label: `${item.referenceNumber} | ${item.title}`,
                      value: `${item.id}`
                    }
                  })}
                  onChange={onSelected}
                  value={Number(selectedFilters?.projectId) > 0 ? String(selectedFilters?.projectId) : ""}
                  onReset={() => {
                    onReset("projectId", 0);
                    // reset the search term
                    setProjectTerm("");
                  }}
                  onUpdate={onUpdate}
                  // START: For search
                  loading={projects?.loading}
                  searchTerm={projectTerm}
                  onSearch={(event) => setProjectTerm(event.currentTarget.value)}
                // END: For search
                />
              </div>
            </div>
          ) : null
        }
        excelExport={(readQuotation === true && data!?.length > 0) && (
          <ExcelExport
            fileName="Quotations"
            headers={headers}
            data={excelData}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                className='mr-1'
              >
                <path
                  fill="#42526E"
                  d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81v8.37C2 19.83 4.17 22 7.81 22h8.37c3.64 0 5.81-2.17 5.81-5.81V7.81C22 4.17 19.83 2 16.19 2zm1.06 10.33c0 .41-.34.75-.75.75s-.75-.34-.75-.75V9.31l-7.72 7.72c-.15.15-.34.22-.53.22s-.38-.07-.53-.22a.754.754 0 010-1.06l7.72-7.72h-3.02c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h4.83c.41 0 .75.34.75.75v4.83z"
                ></path>
              </svg>
            }
          />
        )}
      />
      {!data && loading && (
        <div style={{ display: "flex", flexWrap: "wrap", width: "100%", gap: 10 }}>
          {Array(6).fill(0).map((_, index) => <CardShimmer key={`shimmerItem-${index}`} />)}
        </div>
      )}
      {readQuotation === true && (
        <>
          <QuotationsCard
            permissions={permissions}
            data={{
              allQuotation: data!,
              onRefresh: () => onUpdate({ perPage: meta?.perPage || 10, page: meta?.page || 1 })
            }}
            quotationDrawer={drawer}
            setQuotationDrawer={setDrawer}
            setNewProject={setNewProject}
            newProject={newProject}
          />
          <Pagination
            total={meta?.total!}
            current={meta?.page!}
            defaultPageSize={meta?.pageCount || 10}
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={onPaginationChange}
          />
        </>
      )}

      {readQuotation === false && (
        <ErrorCode403
          mainMessage="You don't have permission to view this data"
        />
      )}

      {drawer?.open && (
        <QuotationDrawer
          drawer={drawer}
          setDrawer={setDrawer}
          permissions={permissions}
          onRefresh={onRefresh}
          setNewProject={setNewProject}
        />
      )}
    </Layout>
  );
};

export default Quotations;
