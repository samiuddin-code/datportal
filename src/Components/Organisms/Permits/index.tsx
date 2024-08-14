import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CustomFilter, PageHeader, Pagination } from "@atoms/";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { Segmented, message } from "antd";
import { ErrorCode403 } from "@atoms/ErrorCodes";
import { PermitsPermissionsEnum } from "@modules/Permits/permissions";
import { PermitsType, PermitsQueryType } from "@modules/Permits/types";
import { PermitsModule } from "@modules/Permits";
import { QueryType } from "@modules/Common/common.interface";
import Layout from "@templates/Layout";
import PermitsTable from "./table-columns";
import { useFetchData } from "hooks";
import { PermitsModal } from "./modal";
import { getPermissionSlugs, handleError, isNumber, onRemoveUrlParams } from "@helpers/common";
import { convertDate } from "@helpers/dateHandler";
import { useDebounce } from "@helpers/useDebounce";
import { ClientStatusOptions, FinanceStatusOptions } from "@helpers/options";
import { ProjectTypes } from "@modules/Project/types";
import { ClientType } from "@modules/Client/types";
import { ProjectModule } from "@modules/Project";
import { ClientModule } from "@modules/Client";
import { AuthoritiesModule } from "@modules/Authorities";
import { AuthoritiesType } from "@modules/Authorities/types";

const breadCrumbsData = [
  { text: "Home", isLink: true, path: "/" },
  { isLink: false, text: "Permits" },
];

type ModalOpenType = {
  type: "new" | "edit"
  recordId: number;
  open: boolean;
  projectId?: number;
}

type SelectedFiltersTypes = {
  dateRange?: string[];
} & QueryType<PermitsQueryType>

type SearchedResultTypes<T = any> = {
  data: T[]
  loading: boolean
}

type SegmentedStatusTypes = "all" | "onlyActive" | "onlyExpired"

const segmentedOptions: { label: string; value: SegmentedStatusTypes }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "onlyActive" },
  { label: "Expired", value: "onlyExpired" },
]

const Permits: FC = () => {
  // available permissions for this module
  const permissionSlug = getPermissionSlugs(PermitsPermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in PermitsPermissionsEnum]: boolean };
  const { readPermit, createPermit, updatePermit } = permissions;

  const [searchParams, setSearchParams] = useSearchParams();
  const recordId = searchParams.get("id")
  const projectId = searchParams.get("projectId")
  const actionType = searchParams.get("actionType") as "create" | "edit" | "view"

  const module = useMemo(() => new PermitsModule(), []);
  const projectModule = useMemo(() => new ProjectModule(), []);
  const clientModule = useMemo(() => new ClientModule(), []);
  const authorityModule = useMemo(() => new AuthoritiesModule(), []);

  const { data, onRefresh, meta, loading } = useFetchData<PermitsType[]>({
    method: module.getAllRecords,
    initialQuery: {
      onlyActive: !actionType ? true : undefined,
      projectId: projectId ? Number(projectId) : undefined
    }
  })

  const [segmentedStatus, setSegmentedStatus] = useState<SegmentedStatusTypes>("onlyActive");

  const [modalOpen, setModalOpen] = useState<ModalOpenType>({ type: "new", recordId: 0, open: false });

  // selected filters
  const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
    dateRange: [""],
  });

  const [reset, setReset] = useState<boolean>(false);

  // search term for the project search
  const [projectSearchTerm, setProjectSearchTerm] = useState<string | undefined>(undefined);
  const debouncedSearchTerm = useDebounce(projectSearchTerm, 500);

  // client search term
  const [clientTerm, setClientTerm] = useState<string | undefined>(undefined);
  // Search Debounce
  const debouncedClientTerm = useDebounce(clientTerm, 500)

  // authority search term
  const [authorityTerm, setAuthorityTerm] = useState<string | undefined>(undefined);
  // Search Debounce
  const debouncedAuthorityTerm = useDebounce(authorityTerm, 500)

  // project data
  const [projectData, setProjectData] = useState<SearchedResultTypes<ProjectTypes>>({
    data: [], loading: false
  });

  // client data
  const [clients, setClients] = useState<SearchedResultTypes<ClientType>>({
    data: [], loading: false
  });

  // authority data
  const [authorities, setAuthorities] = useState<SearchedResultTypes<AuthoritiesType>>({
    data: [], loading: false
  });

  const onCancelClick = () => {
    if (createPermit === false) {
      message.error("You don't have permission to update this record");
      return;
    }
    setModalOpen({ ...modalOpen, open: !modalOpen.open, type: "new" });
  };

  const onEditIconClick = (record: PermitsType) => {
    if (updatePermit === false) {
      message.error("You don't have permission to update this record");
      return;
    }
    setModalOpen({
      ...modalOpen, open: !modalOpen.open, type: "edit",
      recordId: record.id
    });
  };

  const onSelected = (event: any) => {
    const { name, value } = event?.target as { name: keyof SelectedFiltersTypes, value: string | string[] }

    if (name === "clientId" || name === "authorityId" || name === "projectId") {
      const isValidNumber = isNumber(value as string);
      if (!isValidNumber) {
        let label: string = "";
        switch (name) {
          case "clientId": {
            label = "Client ID"
            break;
          }
          case "authorityId": {
            label = "Authority ID"
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

  const onUpdate = useCallback((query?: QueryType<PermitsQueryType>) => {
    const fromDateString: string = selectedFilters.dateRange?.[0] || "";
    const toDateString = selectedFilters.dateRange?.[1] || "";
    const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
    const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

    const data: QueryType<PermitsQueryType> = {
      fromDate: fromDate,
      toDate: toDate,
      clientId: selectedFilters.clientId || undefined,
      projectId: selectedFilters.projectId || undefined,
      authorityId: selectedFilters.authorityId || undefined,
      financeStatus: selectedFilters.financeStatus || undefined,
      clientStatus: selectedFilters.clientStatus || undefined,
      onlyActive: selectedFilters.onlyActive ? true : undefined,
      onlyExpired: selectedFilters.onlyExpired ? true : undefined,
      ...query
    }

    // get the data from the api
    onRefresh(data);
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

  /** Get the search result for the authority */
  const GetSearchAuthorities = useCallback(() => {
    if (debouncedAuthorityTerm) {
      setAuthorities((prev) => ({ ...prev, loading: true }));
      authorityModule.getAllRecords({ name: debouncedAuthorityTerm }).then((res) => {
        const data = res?.data?.data;
        setAuthorities((prev) => {
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
        setAuthorities((prev) => ({ ...prev, loading: false }));
      })
    }
  }, [debouncedAuthorityTerm])

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
    if (debouncedSearchTerm) {
      onSearchProject({ title: debouncedSearchTerm })
    }
  }, [debouncedSearchTerm])

  useEffect(() => {
    GetSearchClients();
  }, [GetSearchClients])

  useEffect(() => {
    GetSearchAuthorities();
  }, [GetSearchAuthorities])

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
          setModalOpen({
            ...modalOpen,
            open: true, type: "new",
            projectId: Number(projectId)
          });
          onRemoveUrlParams(["actionType", "projectId"], setSearchParams);
        }
        break;
      }
      case "edit": {
        if (recordId && projectId) {
          updateProject();
          setModalOpen({
            ...modalOpen,
            open: true, type: "edit",
            recordId: Number(recordId),
            projectId: Number(projectId),
          });
          onRemoveUrlParams(["actionType", "id", "projectId"], setSearchParams);
        }
        break;
      }
      case "view": {
        if (recordId && projectId) {
          updateProject();
          onRemoveUrlParams(["actionType", "id", "projectId"], setSearchParams);
        }
        break;
      }
      default:
        break;
    }
  }, [actionType, projectId, recordId])

  return (
    <Layout permissionSlug={permissionSlug}>
      <PageHeader
        heading="Permits" buttonText="Add Permit"
        onButtonClick={onCancelClick}
        breadCrumbData={breadCrumbsData}
        showAdd={!!createPermit}
        filters={
          readPermit ? (
            <div>
              <div style={{ overflow: "auto" }}>
                <Segmented
                  size="middle" value={segmentedStatus}
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
                      onUpdate({ onlyActive: undefined, onlyExpired: undefined })
                      setSelectedFilters((prev) => ({ ...prev, onlyActive: undefined, onlyExpired: undefined }))
                    } else {
                      onReset(value as keyof SelectedFiltersTypes, "")
                      setSelectedFilters((prev) => ({
                        ...prev,
                        onlyActive: value === "onlyActive" ? true : undefined,
                        onlyExpired: value === "onlyExpired" ? true : undefined
                      }))
                    }
                    setSegmentedStatus(value as SegmentedStatusTypes)
                  }}
                />
              </div>

              <div>
                <CustomFilter
                  type="datepicker"
                  label="Expiry Date"
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
                  searchTerm={projectSearchTerm || ""}
                  onSearch={(event) => setProjectSearchTerm(event.currentTarget.value)}
                  // END: For search
                  defaultValue={Number(selectedFilters?.projectId) > 0 ? String(selectedFilters?.projectId) : ""}
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
                  searchTerm={clientTerm || ""}
                  onSearch={(event) => setClientTerm(event.currentTarget.value)}
                // END: For search
                />
              </div>

              <div>
                <CustomFilter
                  type="radio"
                  label="Authority"
                  name="authorityId"
                  withSearch={true}
                  options={authorities?.data?.map((item) => {
                    return { label: item.title, value: `${item.id}` }
                  })}
                  onChange={onSelected}
                  value={Number(selectedFilters?.authorityId) > 0 ? String(selectedFilters?.authorityId) : ""}
                  onReset={() => {
                    onReset("authorityId", 0);
                    // reset the search term
                    setAuthorityTerm("");
                  }}
                  onUpdate={onUpdate}
                  // START: For search
                  loading={authorities?.loading}
                  searchTerm={authorityTerm || ""}
                  onSearch={(event) => setAuthorityTerm(event.currentTarget.value)}
                // END: For search
                />
              </div>

              <div>
                <CustomFilter
                  type="radio"
                  label="Finance Status"
                  name="financeStatus"
                  options={FinanceStatusOptions?.map((option) => ({
                    label: option.label,
                    value: option.value,
                  }))}
                  value={`${selectedFilters?.financeStatus}`}
                  onChange={onSelected}
                  onReset={() => onReset("financeStatus", "")}
                  onUpdate={onUpdate}
                />
              </div>

              <div>
                <CustomFilter
                  type="radio"
                  label="Client Status"
                  name="clientStatus"
                  options={ClientStatusOptions?.map((option) => ({
                    label: option.label,
                    value: option.value,
                  }))}
                  value={`${selectedFilters?.clientStatus}`}
                  onChange={onSelected}
                  onReset={() => onReset("clientStatus", "")}
                  onUpdate={onUpdate}
                />
              </div>
            </div>
          ) : null
        }
      />
      {readPermit === true && (
        <>
          <PermitsTable
            tableData={data!}
            tableLoading={loading}
            onEditIconClick={onEditIconClick}
            reloadTableData={onRefresh}
            permissions={permissions}
          />
          <Pagination
            total={meta?.total!}
            current={meta?.page!}
            defaultPageSize={meta?.perPage ? meta?.perPage : 10}
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={onPaginationChange}
          />
        </>
      )}

      {readPermit === false && (
        <ErrorCode403
          mainMessage="You don't have permission to view this data"
        />
      )}

      {modalOpen.open && (
        <PermitsModal
          type={modalOpen.type}
          openModal={modalOpen.open}
          record={modalOpen.recordId}
          projectId={modalOpen.projectId}
          onCancel={onCancelClick}
          reloadTableData={onRefresh}
          permissions={permissions}
        />
      )}
    </Layout>
  );
}
export default Permits;