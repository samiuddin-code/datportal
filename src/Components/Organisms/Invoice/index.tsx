import { useEffect, useState, useMemo, useCallback, FC } from "react";
import { useSearchParams } from "react-router-dom";
import { Segmented, message } from "antd";
import { useSelector } from "react-redux";
import Layout from "@templates/Layout";
import { RootState } from "Redux/store";
import { useFetchData, useInvoiceDrawer } from "hooks";
import { CustomFilter, ExcelExport, PageHeader, Pagination } from "@atoms/";
import { ErrorCode403 } from "@atoms/ErrorCodes";
import { convertDate } from "@helpers/dateHandler";
import { getPermissionSlugs, handleError, isNumber, onRemoveUrlParams } from "@helpers/common";
import { InvoiceStatus } from "@helpers/commonEnums";
import { useDebounce } from "@helpers/useDebounce";
import { InvoiceModule } from "@modules/Invoice";
import { InvoiceParams, InvoiceStatusCounts, InvoiceTypes } from "@modules/Invoice/types";
import { InvoicePermissionsEnum } from "@modules/Invoice/permissions";
import { QueryType } from "@modules/Common/common.interface";
import { ProjectModule } from "@modules/Project";
import { ProjectTypes } from "@modules/Project/types";
import InvoicesTable from "./table-columns";
import InvoiceDrawer from "./Drawer";
import styles from '../Common/styles.module.scss'
import { InvoiceDrawerTypes } from "./Drawer/types";
import { ClientType } from "@modules/Client/types";
import { ProjectTypeModule } from "@modules/ProjectType";
import { ClientModule } from "@modules/Client";
import InvoiceNotes from "./Notes/index";

const breadCrumbsData = [
  { text: "Home", isLink: true, path: "/" },
  { isLink: false, text: "Invoices" },
];

type SelectedFiltersTypes = {
  dateRange?: string[];
} & QueryType<InvoiceParams>

type InvoicesExportType = { [key: string]: string | number | boolean }

type PermissionType = { [key in InvoicePermissionsEnum]: boolean }

type SearchedResultTypes<T = any> = {
  data: T[]
  loading: boolean
}
type ModalOpenType = {
  type: "new" | "edit" | "notes" | "attachments";
  recordId: number;
  open: boolean;
}

type SegmentedStatusTypes = "all" | "active" | "paid" | "draft" | "canceled" | "hasConcerns"

const Invoices: FC = () => {
  // available permissions for the properties page
  const permissionSlug = getPermissionSlugs(InvoicePermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as PermissionType
  const { readInvoice, createInvoice, updateInvoice } = permissions;

  const [searchParams, setSearchParams] = useSearchParams()
  const recordId = searchParams.get("id")
  const actionType = searchParams.get("actionType") as "create" | "edit" | "preview"
  const projectId = searchParams.get("projectId")

  const module = useMemo(() => new InvoiceModule(), []);
  const projectTypeModule = useMemo(() => new ProjectTypeModule(), []);
  const projectModule = useMemo(() => new ProjectModule(), []);
  const clientModule = useMemo(() => new ClientModule(), []);

  // Status Filters
  const statusValues = {
    active: [InvoiceStatus.Generated, InvoiceStatus.Sent],
    paid: [InvoiceStatus.Paid],
    canceled: [InvoiceStatus.Canceled],
    draft: [InvoiceStatus.Generated]
  }

  const { data, onRefresh, meta, loading } = useFetchData<InvoiceTypes[]>({
    method: module.getAllRecords,
    initialQuery: {
      __status: !actionType ? statusValues.active : undefined,
      projectId: projectId ? Number(projectId) : undefined
    }
  })

  // Status Counts
  const {
    data: statusCounts, onRefresh: onRefreshStatusCount
  } = useFetchData<InvoiceStatusCounts>({ method: module.getCounts })

  const [segmentedStatus, setSegmentedStatus] = useState<SegmentedStatusTypes>("active");

  // search term for the project search
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(projectSearchTerm, 500);

  // client search term
  const [clientTerm, setClientTerm] = useState("");
  // Search Debounce
  const debouncedClientTerm = useDebounce(clientTerm, 500)

  // project type search term
  const [projectTypeTerm, setProjectTypeTerm] = useState("");
  // Search Debounce
  const debouncedProjectTypeTerm = useDebounce(projectTypeTerm, 500)

  // project data
  const [projectData, setProjectData] = useState<SearchedResultTypes<ProjectTypes>>({
    data: [], loading: false
  });

  // client data
  const [clients, setClients] = useState<SearchedResultTypes<ClientType>>({
    data: [], loading: false
  });

  // project type data
  const [projectTypes, setProjectTypes] = useState<SearchedResultTypes>({
    data: [], loading: false
  });

  // drawer state
  const { drawer, setDrawer } = useInvoiceDrawer()
  const [openNotesModal, setOpenNotesModal] = useState<ModalOpenType>({ type: "notes", recordId: 0, open: false });
  // selected filters
  const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
    dateRange: [""],
    __status: statusValues.active
  });

  const [reset, setReset] = useState<boolean>(false);
  const [excelData, setExcelData] = useState<InvoicesExportType[]>([]);

  // headers for the excel export
  const headers = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" }
  ]

  const onSelected = (event: any) => {
    const { name, value } = event?.target as { name: keyof SelectedFiltersTypes, value: string | string[] }

    if (name === "clientId" || name === "projectTypeId" || name === "projectId") {
      const isValidNumber = isNumber(value as string);
      if (!isValidNumber) {
        let label: string = "";
        switch (name) {
          case "clientId": {
            label = "Client ID"
            break;
          }
          case "projectTypeId": {
            label = "Project Type ID"
            break;
          }
          case "projectId": {
            label = "Project ID"
            break;
          }
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

  const onAddNewClick = (extra?: { projectId?: number }) => {
    if (createInvoice === false) {
      message.error("You don't have permission to create new record");
      return;
    }

    setDrawer({
      type: "create", open: true,
      id: undefined, quotation: undefined,
      projectId: extra?.projectId
    })
  }

  const onEditIconClick = (recordId: number) => {
    if (updateInvoice === false) {
      message.error("You don't have permission to update record");
      return;
    }
    setDrawer({ open: true, id: recordId, type: "edit", projectId: Number(projectId) })
  };

  const onUpdate = useCallback((query?: QueryType<InvoiceParams>) => {
    const fromDateString: string = selectedFilters.dateRange?.[0] || "";
    const toDateString = selectedFilters.dateRange?.[1] || "";
    const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
    const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

    const data: QueryType<InvoiceParams> = {
      fromDate: fromDate,
      toDate: toDate,
      __status: selectedFilters.__status || undefined,
      clientId: selectedFilters.clientId || undefined,
      projectTypeId: selectedFilters.projectTypeId || undefined,
      projectId: selectedFilters.projectId || undefined,
      ...query
    }

    // get the data from the api
    onRefresh(data);
    // get the status counts
    onRefreshStatusCount();
  }, [selectedFilters])

  const onPaginationChange = (page: number, pageSize: number) => onUpdate({ page, perPage: pageSize });

  /** Get the search result for the projects */
  const onSearchProject = ({ title, ids }: { title?: string; ids?: number[] }) => {
    setProjectData((prev) => ({ ...prev, loading: true }));
    projectModule.getAllRecords({ title: title, ids }).then((res) => {
      const { data } = res?.data
      setProjectData((prev) => ({ ...prev, data: data, loading: false }))
    }).finally(() => {
      setProjectData((prev) => ({ ...prev, loading: false }))
    })
  }

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
    getExcelData();
  }, [getExcelData])

  useEffect(() => {
    GetSearchClients();
  }, [GetSearchClients])

  useEffect(() => {
    GetSearchProjectTypes();
  }, [GetSearchProjectTypes])

  // Open the modal based on the action type
  useEffect(() => {
    const updateProject = () => {
      setSegmentedStatus("all");
      setSelectedFilters((prev) => ({ ...prev, projectId: Number(projectId) }));
      onSearchProject({ ids: [Number(projectId)] });
    };

    switch (actionType) {
      case "create": {
        if (projectId) {
          updateProject();
          onAddNewClick({ projectId: Number(projectId) });
          onRemoveUrlParams(["projectId", "actionType"], setSearchParams);
        }
        break;
      }
      case "edit": {
        if (recordId && projectId) {
          updateProject();
          onEditIconClick(Number(recordId));
          onRemoveUrlParams(["id", "actionType", "projectId"], setSearchParams);
        }
        break;
      }
      case "preview": {
        if (recordId && projectId) {
          updateProject();
          setDrawer({ open: true, id: Number(recordId), type: "preview" });
          onRemoveUrlParams(["id", "actionType", "projectId"], setSearchParams);
        }
        break;
      }
      default:
        break;
    }
  }, [actionType, projectId, recordId]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      onSearchProject({ title: debouncedSearchTerm })
    }
  }, [debouncedSearchTerm])

  const onAddNoteClick = (record: InvoiceTypes) => {
    if (updateInvoice === false) {
      message.error("You don't have permission to add notes");
      return;
    }
    setOpenNotesModal({ type: "notes", open: true, recordId: record?.id })
  };

  const segmentedOptions: { label: string; value: SegmentedStatusTypes }[] = [
    { label: `All (${statusCounts?.all || 0})`, value: "all" },
    { label: `Active (${statusCounts?.active || 0})`, value: "active" },
    { label: `Has Concerns (${statusCounts?.hasConcerns || 0})`, value: "hasConcerns" },
    { label: `Paid (${statusCounts?.paid || 0})`, value: "paid" },
    { label: `Draft (${statusCounts?.draft || 0})`, value: "draft" },
    { label: `Canceled (${statusCounts?.canceled || 0})`, value: "canceled" },
  ]

  return (
    <Layout permissionSlug={permissionSlug}>
      <PageHeader
        heading="Invoices" breadCrumbData={breadCrumbsData}
        showAdd={permissions.createInvoice === true ? true : false}
        buttonText="Add Invoice"
        onButtonClick={onAddNewClick}
        positionChildren="new-line"
        filters={
          readInvoice ? (
            <div className={styles.filterWrapper}>
              <div style={{ overflow: "auto" }}>
                <Segmented
                  size="middle" style={{ fontSize: "var(--font-size-sm)" }}
                  options={segmentedOptions.map((item) => {
                    return {
                      ...item,
                      title: item.label,
                      value: item.value
                    }
                  })}
                  value={segmentedStatus}
                  onChange={(value) => {
                    if (value === "all") {
                      onReset("__status", "")
                      setSelectedFilters((prev) => ({ ...prev, __status: [] }))
                    } else if (value === "hasConcerns") {
                      onUpdate({ hasConcerns: true, __status: undefined })
                    } else {
                      const _value = value as keyof typeof statusValues
                      onUpdate({ __status: statusValues[_value] })
                      setSelectedFilters((prev) => ({ ...prev, __status: statusValues[_value] }))
                    }
                    setSegmentedStatus(value as SegmentedStatusTypes)
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
                  label="Project"
                  name="projectId"
                  withSearch={true}
                  options={projectData?.data?.map((item) => ({
                    label: `${item.referenceNumber} | ${item.title}`,
                    value: `${item.id}`,
                  }))}
                  onChange={onSelected}
                  value={Number(selectedFilters?.projectId) > 0 ? String(selectedFilters?.projectId) : ""}
                  onReset={() => {
                    onReset("projectId", 0);
                    // reset the search term
                    setProjectSearchTerm("");
                  }}
                  onUpdate={onUpdate}
                  // START: For search
                  loading={projectData?.loading}
                  searchTerm={projectSearchTerm}
                  onSearch={(event) => setProjectSearchTerm(event.currentTarget.value)}
                  // END: For search
                  defaultValue={Number(selectedFilters?.projectId) > 0 ? String(selectedFilters?.projectId) : ""}
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
            </div>
          ) : null
        }
        excelExport={(readInvoice === true && data!?.length > 0) && (
          <ExcelExport
            fileName="Invoice"
            headers={headers}
            data={excelData}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18" height="18" fill="none"
                viewBox="0 0 24 24" className='mr-1'
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

      {readInvoice === true && (
        <>
          <div className={styles.antdTableWrapper}>
            <InvoicesTable
              tableData={data!}
              tableLoading={loading}
              permissions={permissions}
              setDrawer={setDrawer}
              onEditIconClick={onEditIconClick}
              onAddNoteClick={onAddNoteClick}
              reloadTableData={() => {
                onUpdate({
                  perPage: meta?.perPage || 10,
                  page: meta?.page || 1
                })
              }}
            />
          </div>
          <Pagination
            total={meta?.total!}
            current={meta?.page!}
            defaultPageSize={meta?.perPage ? meta?.perPage : 10}
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={onPaginationChange}
          />
        </>
      )}

      {readInvoice === false && (
        <ErrorCode403 mainMessage="You don't have permission to view this data" />
      )}

      {drawer.open && (
        <InvoiceDrawer
          drawer={drawer}
          setDrawer={setDrawer}
          onRefresh={onRefresh}
          permissions={permissions}
        />
      )}
      {/*TODO: Add Note logs in modal */}
      {openNotesModal.open && (
        <InvoiceNotes
          open={openNotesModal.open}
          permissions={permissions}
          invoiceId={openNotesModal.recordId}
          onRefresh={() => {
            onRefresh();
            onRefreshStatusCount();
          }}
          onCancel={() => {
            setOpenNotesModal({ type: "new", recordId: 0, open: false })
          }}
        />
      )}
    </Layout>
  );
};

export default Invoices;
