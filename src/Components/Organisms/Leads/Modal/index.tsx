import {
  useEffect, useState, useMemo, useCallback, FC, ReactNode,
  SetStateAction,
  
} from "react";
import { Segmented, message } from "antd";
import { useSelector } from "react-redux";
import Layout from "@templates/Layout";
import { RootState } from "Redux/store";
import { useFetchData } from "hooks";
import {
  CustomFilter, ExcelExport, PageHeader, Pagination
} from "@atoms/";
import { ErrorCode403 } from "@atoms/ErrorCodes";
import { LeadsTypes, LeadsParamTypes, LeadsStatusCounts } from "@modules/Leads/types";
import { LeadsModule } from "@modules/Leads";
import { LeadsPermissionsEnum } from "@modules/Leads/permissions";
import { QuotationPermissionsEnum } from "@modules/Quotation/permissions";
import { ProjectPermissionsEnum } from "@modules/Project/permissions";
import { QueryType } from "@modules/Common/common.interface";
import { convertDate } from "@helpers/dateHandler";
import { getPermissionSlugs, handleError, isNumber } from "@helpers/common";
import { LeadsModal } from "./Modal";
import styles from '../Common/styles.module.scss'
import LeadsCards from "./Card";
import { useDebounce } from "@helpers/useDebounce";
import MoreCustomFilters from "@atoms/CustomFilter/more";
import { ClientType } from "@modules/Client/types";
import { EnquiryType } from "@modules/Enquiry/types";
import { ProjectTypeType } from "@modules/ProjectType/types";
import { ClientModule } from "@modules/Client";
import { EnquiryModule } from "@modules/Enquiry";
import { ProjectTypeModule } from "@modules/ProjectType";
import { LeadsStatus } from "@helpers/commonEnums";
import FilesDrawer from "./FileManagement";
import { ClientPermissionsEnum } from "@modules/Client/permissions";
import { CardShimmer } from "@atoms/CardShimmer";
import { UserModule } from "@modules/User";
import { UserTypes } from "@modules/User/types";

const breadCrumbsData = [
  { text: "Home", isLink: true, path: "/" },
  { isLink: false, text: "Leads" },
];

type ModalOpenType = {
  type: "new" | "edit" | "notes";
  recordId: number;
  open: boolean;
}

type SelectedFiltersTypes = {
  dateRange?: string[];
} & QueryType<LeadsParamTypes>

type SelectedMoreFiltersTypes = Partial<keyof LeadsParamTypes>[]

type MoreFiltersTypes = Partial<{ [key in keyof LeadsParamTypes]: ReactNode }>

type LeadsExportType = { [key: string]: string | number | boolean }

type PermissionType = { [key in LeadsPermissionsEnum]: boolean }
  & { [key in QuotationPermissionsEnum]: boolean }
  & { [key in ProjectPermissionsEnum]: boolean }
  & { [ClientPermissionsEnum.CREATE]: boolean }

type SearchedResultTypes<T = any> = {
  data: T[]
  loading: boolean
}

const Leads: FC = () => {
  // available permissions for this page
  const permissionSlug = getPermissionSlugs(LeadsPermissionsEnum)
  // Quotation permissions slugs
  const quotationPermissionSlug = getPermissionSlugs(QuotationPermissionsEnum)

  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as PermissionType
  const { readLeads, createLeads, updateLeads, deleteLeads } = permissions;

  const module = useMemo(() => new LeadsModule(), []);
  const clientModule = useMemo(() => new ClientModule(), []);
  const userModule = useMemo(() => new UserModule(), []);
  const enquiryModule = useMemo(() => new EnquiryModule(), []);
  const projectTypeModule = useMemo(() => new ProjectTypeModule(), []);

  // Status Filters
  const statusValues = {
    active: [LeadsStatus.New, LeadsStatus["In Progress"]],
    confirmed: [LeadsStatus.Confirmed],
    unqualified: [
      LeadsStatus["Invalid Request"], LeadsStatus.Spam,
      LeadsStatus.Canceled, LeadsStatus.Unqualified
    ]
  }

  const { data, onRefresh, meta, loading } = useFetchData<LeadsTypes[]>({
    method: module.getAllRecords,
    initialQuery: { __status: statusValues.active }
  })

  // Status Counts
  const {
    data: statusCounts, onRefresh: onRefreshStatusCount
  } = useFetchData<LeadsStatusCounts>({ method: module.getCounts })

  const [modalOpen, setModalOpen] = useState<ModalOpenType>({ type: "new", recordId: 0, open: false });
  const [filesDrawer, setFilesDrawer] = useState<{ open: boolean; record: LeadsTypes | null }>({
    open: false, record: null
  });

  const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
    dateRange: [""],
    __status: statusValues.active,
    sortOrder: "",
    sortByField: ""
  });
  const [moreFilters, setMoreFilters] = useState<SelectedMoreFiltersTypes>([]);

  const [reset, setReset] = useState<boolean>(false);
  const [excelData] = useState<LeadsExportType[]>([]);

  // client search term
  const [clientTerm, setClientTerm] = useState("");
  // Search Debounce
  const debouncedClientTerm = useDebounce(clientTerm, 500)

  // enquiry search term
  const [enquiryTerm, setEnquiryTerm] = useState("");
  // Search Debounce
  const debouncedEnquiryTerm = useDebounce(enquiryTerm, 500)

  // representative search term
  const [representativeTerm, setRepresentativeTerm] = useState("");
  // Search Debounce
  const debouncedRepresentativeTerm = useDebounce(representativeTerm, 500)

  // assigned to search term
  const [assignedToTerm, setAssignedToTerm] = useState("");
  // Search Debounce
  const debouncedAssignedToTerm = useDebounce(assignedToTerm, 500)

  // project type search term
  const [projectTypeTerm, setProjectTypeTerm] = useState("");
  // Search Debounce
  const debouncedProjectTypeTerm = useDebounce(projectTypeTerm, 500)

  const [clients, setClients] = useState<SearchedResultTypes<ClientType>>({
    data: [], loading: false
  });

  const [enquiries, setEnquiries] = useState<SearchedResultTypes<EnquiryType>>({
    data: [], loading: false
  });

  const [representatives, setRepresentatives] = useState<SearchedResultTypes<ClientType>>({
    data: [], loading: false
  });

  const [assignedTo, setAssignedTo] = useState<SearchedResultTypes<UserTypes>>({
    data: [], loading: false
  });

  const [projectTypes, setProjectTypes] = useState<SearchedResultTypes<ProjectTypeType>>({
    data: [], loading: false
  });

  // headers for the excel export
  const headers = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" }
  ]

  const onSelected = (event: any) => {
    const { name, value } = event?.target as { name: keyof SelectedFiltersTypes, value: string | string[] }
    const fieldsNames = ["clientId", "enquiryId", "projectTypeId", "representativeId"];

    if (fieldsNames.includes(name)) {
      const isValidNumber = isNumber(value as string);
      if (!isValidNumber) {
        let label: string = "";
        switch (name) {
          case "clientId":
            label = "Client ID";
            break;
          case "enquiryId":
            label = "Enquiry ID";
            break;
          case "projectTypeId":
            label = "Project Type ID";
            break;
          case "representativeId":
            label = "Representative ID";
            break;
          case "assignedToId":
            label = "Assigned To ID";
            break;
        }
        return message.error(`${label} should be a number`);
      }
    }

    setSelectedFilters((prev) => ({ ...prev, [name]: value }));
  }

  const onReset = useCallback((name: keyof SelectedFiltersTypes, value: number | string | string[]) => {
    if (name) {
      setReset(true);
      setSelectedFilters({ ...selectedFilters, [name]: value });
    }
  }, [selectedFilters]);

  const onModalOpen = ({ type, recordId, open }: ModalOpenType) => {
    return setModalOpen({ type, recordId, open });
  }

  const onAddNewClick = () => {
    if (createLeads === false) {
      message.error("You don't have permission to create new record");
      return;
    }
    onModalOpen({ type: "new", open: true, recordId: 0 })
  }

  const onEditIconClick = (recordId: number) => {
    if (updateLeads === false) {
      message.error("You don't have permission to update record");
      return;
    }
    onModalOpen({ type: "edit", open: true, recordId: recordId })
  };

  /**Function to delete a lead
   * @param {number} id id of the lead to be deleted
   */
  const onDelete = (id: number) => {
    if (deleteLeads === true) {
      module.deleteRecord(id).then(() => {
        onRefresh();
        onRefreshStatusCount();
      }).catch((err) => {
        const errorMessages = err.response.data.message || "Something went wrong!"
        message.error(errorMessages)
      })
    } else {
      message.error("You don't have permission to delete this lead, Please contact your admin")
    }
  };

  const onUpdate = useCallback((query?: QueryType<LeadsParamTypes>) => {
    const fromDateString: string = selectedFilters.dateRange?.[0] || "";
    const toDateString = selectedFilters.dateRange?.[1] || "";
    const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
    const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

    const data: QueryType<LeadsParamTypes> = {
      fromDate: fromDate,
      toDate: toDate,
      __status: selectedFilters.__status || undefined,
      clientId: selectedFilters.clientId || undefined,
      enquiryId: selectedFilters.enquiryId || undefined,
      projectTypeId: selectedFilters.projectTypeId || undefined,
      representativeId: selectedFilters.representativeId || undefined,
      fetchCompleted: selectedFilters.fetchCompleted || undefined,
      sortOrder: selectedFilters.sortOrder || undefined,
      sortByField: selectedFilters.sortByField || undefined,
      hasConcerns: selectedFilters.hasConcerns || undefined,
      assignedToId: selectedFilters.assignedToId || undefined,
      ...query,
    }

    // get the data from the api
    onRefresh(data);
    // get the status counts
    onRefreshStatusCount();
  }, [selectedFilters])

  const onPaginationChange = (page: number, pageSize: number) => onUpdate({ page, perPage: pageSize });

  const moreFiltersOptions: { label: string; value: keyof LeadsParamTypes; }[] = [
    { label: "Enquiry", value: "enquiryId" },
    { label: "Representative", value: "representativeId" },
    { label: "Project Type", value: "projectTypeId" },
  ];

  const sortByField = [
    { label: "Name", value: "name" },
    { label: "Email", value: "email" },
    { label: "Date Added", value: "addedDate" },
  ];

  const moreComponents: MoreFiltersTypes = {
    enquiryId: (
      <CustomFilter
        type="radio"
        label="Enquiry"
        name="enquiryId"
        withSearch={true}
        options={enquiries?.data?.map((item) => {
          return { label: item.name, value: `${item.id}` }
        })}
        onChange={onSelected}
        value={Number(selectedFilters?.enquiryId) > 0 ? String(selectedFilters?.enquiryId) : ""}
        onReset={() => {
          onReset("enquiryId", 0);
          // reset the search term
          setEnquiryTerm("");
        }}
        onUpdate={onUpdate}
        // START: For search
        loading={enquiries?.loading}
        searchTerm={enquiryTerm}
        onSearch={(event: { currentTarget: { value: SetStateAction<string>; }; }) => setEnquiryTerm(event.currentTarget.value)}
        // END: For search
        defaultVisible={moreFilters.includes("enquiryId")}
      />
    ),
    representativeId: (
      <CustomFilter
        type="radio"
        label="Representative"
        name="representativeId"
        withSearch={true}
        options={representatives?.data?.map((item) => {
          return { label: item.name, value: `${item.id}` }
        })}
        onChange={onSelected}
        value={Number(selectedFilters?.representativeId) > 0 ? String(selectedFilters?.representativeId) : ""}
        onReset={() => {
          onReset("representativeId", 0);
          // reset the search term
          setRepresentativeTerm("");
        }}
        onUpdate={onUpdate}
        // START: For search
        loading={representatives?.loading}
        searchTerm={representativeTerm}
        onSearch={(event: { currentTarget: { value: SetStateAction<string>; }; }) => setRepresentativeTerm(event.currentTarget.value)}
        // END: For search
        defaultVisible={moreFilters.includes("representativeId")}
      />
    ),
    projectTypeId: (
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
        onSearch={(event: { currentTarget: { value: SetStateAction<string>; }; }) => setProjectTypeTerm(event.currentTarget.value)}
        // END: For search
        defaultVisible={moreFilters.includes("projectTypeId")}
      />
    ),
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

  /** Get the search result for the enquiry */
  const GetSearchEnquiries = useCallback(() => {
    if (debouncedEnquiryTerm) {
      setEnquiries((prev) => ({ ...prev, loading: true }));
      enquiryModule.getAllRecords({ name: debouncedEnquiryTerm }).then((res) => {
        const data = res?.data?.data;
        setEnquiries((prev) => {
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
        setEnquiries((prev) => ({ ...prev, loading: false }));
      })
    }
  }, [debouncedEnquiryTerm])

  /** Get the search result for the representative */
  const GetSearchRepresentatives = useCallback(() => {
    if (debouncedRepresentativeTerm) {
      setRepresentatives((prev) => ({ ...prev, loading: true }));
      clientModule.findPublished({ name: debouncedRepresentativeTerm }).then((res) => {
        const data = res?.data?.data;
        setRepresentatives((prev) => {
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
        setRepresentatives((prev) => ({ ...prev, loading: false }));
      })
    }
  }, [debouncedRepresentativeTerm])

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

  useEffect(() => {
    GetSearchClients();
  }, [GetSearchClients])

  useEffect(() => {
    GetSearchEnquiries();
  }, [GetSearchEnquiries])

  useEffect(() => {
    GetSearchRepresentatives();
  }, [GetSearchRepresentatives])

  useEffect(() => {
    GetSearchAssignedTo();
  }, [GetSearchAssignedTo])

  useEffect(() => {
    GetSearchProjectTypes();
  }, [GetSearchProjectTypes])

  const segmentedOptions = [
    { label: `All (${statusCounts?.all || 0})`, value: "all" },
    { label: `Active (${statusCounts?.active || 0})`, value: "active" },
    { label: `Has Concerns (${statusCounts?.hasConcerns || 0})`, value: "hasConcerns" },
    { label: `Confirmed (${statusCounts?.confirmed || 0})`, value: "confirmed" },
    { label: `Completed (${statusCounts?.completed || 0})`, value: "completed" },
    { label: `Unqualified (${statusCounts?.unqualified || 0})`, value: "unqualified" },
  ]

  return (
    <Layout
      permissionSlug={[
        ...permissionSlug, ...quotationPermissionSlug,
        ClientPermissionsEnum.CREATE
      ]}
    >
      <PageHeader
        heading="Leads" breadCrumbData={breadCrumbsData}
        showAdd={permissions.createLeads === true ? true : false}
        buttonText="Add Lead" onButtonClick={onAddNewClick}
        positionChildren="new-line"
        filters={
          readLeads ? (
            <div>
              <div style={{ overflow: "auto" }}>
                <Segmented
                  size="middle"
                  defaultValue={"active"}
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
                      setSelectedFilters((prev) => ({ ...prev, fetchCompleted: undefined }))
                      onReset("__status", "")
                    } else if (value === "hasConcerns") {
                      onUpdate({ hasConcerns: true, __status: undefined })
                    } else if (value === "completed") {
                      const finalValues = { fetchCompleted: true, __status: undefined }
                      onUpdate(finalValues)
                      setSelectedFilters((prev) => ({ ...prev, ...finalValues }))
                    } else {
                      const finalValues = {
                        fetchCompleted: undefined,
                        __status: statusValues[value as keyof typeof statusValues]
                      }
                      onUpdate(finalValues)
                      setSelectedFilters((prev) => ({ ...prev, ...finalValues }))
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
                  onSearch={(event: { currentTarget: { value: SetStateAction<string>; }; }) => setClientTerm(event.currentTarget.value)}
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
                  onSearch={(event: { currentTarget: { value: SetStateAction<string>; }; }) => setAssignedToTerm(event.currentTarget.value)}
                  // END: For search
                  defaultVisible={moreFilters.includes("assignedToId")}
                />
              </div>
              <div>
                <CustomFilter
                  type="datepicker"
                  label="Date"
                  name="dateRange"
                  onChange={(value: any) => setSelectedFilters((prev) => ({ ...prev, dateRange: value }))}
                  onReset={() => onReset("dateRange", [])}
                  onUpdate={onUpdate}
                />
              </div>
              {/**  Find the selected filter and render the component based on the name of the filter */
                Object.keys(moreComponents).map((key) => {
                  const _key = key as keyof MoreFiltersTypes;
                  return moreFilters?.includes(_key) ? moreComponents[_key] : null
                })
              }
              <div>
                <MoreCustomFilters
                  options={moreFiltersOptions?.map((option) => ({
                    label: option.label,
                    value: option.value,
                  }))}
                  onChange={(value) => setMoreFilters(value as SelectedMoreFiltersTypes)}
                  value={moreFilters}
                />
              </div>

              <div style={{ marginLeft: "auto", marginRight: "0px" }}>
                <CustomFilter
                  type="radio"
                  label="Sort By"
                  name="sortByField"
                  options={sortByField}
                  value={selectedFilters?.sortByField}
                  onChange={onSelected}
                  onReset={() => onReset("sortByField", "")}
                  onUpdate={onUpdate}
                  withSort
                />
              </div>
            </div>
          ) : null
        }
        excelExport={(readLeads === true && data!?.length > 0) && (
          <ExcelExport
            fileName="Leads"
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
          {Array(6).fill(0).map((_item, index) => <CardShimmer key={`shimmerItem-${index}`} />)}
        </div>
      )}

      {readLeads === true && (
        <>
          <div className={styles.antdTableWrapper}>
            <LeadsCards
              permissions={permissions}
              onDelete={onDelete}
              onEdit={onEditIconClick}
              onOpenNoteModal={onModalOpen}
              data={{
                allLeads: data!,
                onRefresh: () => {
                  onUpdate({ perPage: meta?.perPage || 10, page: meta?.page || 1 })
                  // refresh the status counts
                  onRefreshStatusCount();
                }
              }}
              onAttachmentClick={(record) => setFilesDrawer({ open: true, record: record })}
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

      {readLeads === false && (
        <ErrorCode403
          mainMessage="You don't have permission to view this data"
        />
      )}

      {modalOpen.open && (
        <LeadsModal
          record={modalOpen.recordId} type={modalOpen.type}
          openModal={modalOpen.open} permissions={permissions}
          onCancel={() => onModalOpen({ type: "new", recordId: 0, open: false })}
          reloadTableData={() => {
            onUpdate({ perPage: meta?.perPage || 10, page: meta?.page || 1 })
          }}
        />
      )}

      {/** Files Drawer */}
      {filesDrawer.open && (
        <FilesDrawer
          open={filesDrawer.open} record={filesDrawer.record!} permissions={permissions}
          onClose={() => setFilesDrawer({ open: false, record: null })}
          onRefresh={() => {
            onUpdate({ perPage: meta?.perPage || 10, page: meta?.page || 1 })
            // refresh the status counts
            onRefreshStatusCount();
          }}
        />
      )}
    </Layout>
  );
};

export default Leads;
