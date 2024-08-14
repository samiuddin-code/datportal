import { FC, FormEvent, Key, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Segmented, message } from "antd";
import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import { useSelector } from "react-redux";
import Layout from "@templates/Layout";
import {
  CustomEmpty, CustomFilter, CustomInput,
  PageHeader, Pagination //  ExcelExport,
} from "@atoms/";
import { ErrorCode403 } from "@atoms/ErrorCodes";
import MoreCustomFilters from "@atoms/CustomFilter/more";
import { useFetchData } from "hooks";
import { ProjectQueryTypes, ProjectTypes } from "@modules/Project/types";
import { ProjectModule } from "@modules/Project";
import { ProjectPermissionsEnum } from "@modules/Project/permissions";
import { UserTypes } from "@modules/User/types";
import { UserModule } from "@modules/User";
import { OrganizationType } from "@modules/Organization/types";
import { OrganizationModule } from "@modules/Organization";
import { RootState } from "Redux/store";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import { ProjectStateType } from "@modules/ProjectState/types";
import { ProjectStateModule } from "@modules/ProjectState";
import { getPermissionSlugs, isNumber } from "@helpers/common";
import { convertDate } from "@helpers/dateHandler";
import { ProjectRoleEnumString } from "@helpers/commonEnums";
import { useDebounce } from "@helpers/useDebounce";
import ProjectsCard from "./Card";
import ProjectTable from "./table";
import styles from "../Common/styles.module.scss";
import ComponentStyles from "./styles.module.scss";
import { QueryType } from "@modules/Common/common.interface";
import { CardShimmer } from "@atoms/CardShimmer";

const breadCrumbsData = [
  {
    text: "Home",
    isLink: true,
    path: "/",
  },
  {
    isLink: false,
    text: "Projects",
  },
];

type SelectedFiltersTypes = {
  title?: string;
  slug?: string;
  quoteNumber?: string;
  projectStateSlugs?: string;
  clientId?: number;
  isClosed?: boolean;
  dateRange?: string[];
  userIds?: number[];
  projectRole?: number;
  // sortOrder?: string;
  // sortByField?: string;
};

type SearchResultsTypes<T> = {
  data: T[];
  loading: boolean;
};

type ProjectViewAsType = "grid" | "table";

const AllProjects: FC = () => {
  const [searchParams] = useSearchParams();
  // available permissions for the projects page
  const permissionSlug = getPermissionSlugs(ProjectPermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in ProjectPermissionsEnum]: boolean };
  const { readProject } = permissions;

  const module = useMemo(() => new ProjectModule(), []);
  const projectStateModule = useMemo(() => new ProjectStateModule(), []);
  const userModule = useMemo(() => new UserModule(), []);
  const orgModule = useMemo(() => new OrganizationModule(), []);

  const [projectViewAs, setProjectViewAs] = useState<ProjectViewAsType>(() => {
    const viewAs = localStorage.getItem("projectViewAs") as ProjectViewAsType;
    if (viewAs === "table") {
      return "table";
    }
    return "grid";
  })
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [moreFilters, setMoreFilters] = useState<CheckboxValueType[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
    title: "",
    slug: "",
    quoteNumber: "",
    projectStateSlugs: "",
    clientId: 0,
    isClosed: undefined,
    dateRange: [],
    userIds: [],
    projectRole: 0,
    // sortOrder: "",
    // sortByField: ""
  });

  const [reset, setReset] = useState<boolean>(false);
  // Title Search
  const [titleTerm, setTitleTerm] = useState<string | undefined>();
  // Users Search
  const [searchTerm, setSearchTerm] = useState("");
  // Client Search
  const [clientSearchTerm, setClientSearchTerm] = useState("");

  // Title Debounce
  const debouncedTitleTerm = useDebounce(titleTerm, 500);
  // Users Debounce
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  // Client Debounce
  const debouncedClientSearchTerm = useDebounce(clientSearchTerm, 500);

  const { data, meta, onRefresh, loading } = useFetchData<ProjectTypes[]>({
    method: module.getAllRecords,
    initialQuery: {
      isClosed: searchParams.get("isClosed") === "true" ? true : searchParams.get("isClosed") === "false" ? false : undefined,
      onHold: searchParams.get("onHold") === "true" ? true : searchParams.get("onHold") === "false" ? false : undefined,
    }
  });

  const { data: projectStates } = useFetchData<ProjectStateType[]>({
    method: projectStateModule.getPublishedRecords,
    initialQuery: { perPage: 100 }
  });

  // Users Search Results
  const [users, setUsers] = useState<SearchResultsTypes<UserTypes>>({
    data: [],
    loading: false,
  });

  // Client Search Results
  const [clients, setClients] = useState<SearchResultsTypes<OrganizationType>>({
    data: [],
    loading: false,
  });

  // const sortByField = [
  //   { label: "Name", value: "name" },
  //   { label: "Email", value: "email" },
  //   { label: "Date Added", value: "addedDate" },
  // ];

  const onSelected = (event: any) => {
    const { name, value } = event.target;

    const numberValues = [
      { key: "clientId", name: "Client", },
      { key: "projectRole", name: "Project Role" }
    ]

    if (numberValues.some((item) => item.key === name)) {
      const isValidNumber = isNumber(value);
      if (!isValidNumber) {
        message.error(`${numberValues.find((item) => item.key === name)?.name} should be a number`);
        return;
      }
    }

    // set the selected value in the state
    setSelectedFilters({
      ...selectedFilters,
      [name]: value,
    });
  };

  const onReset = useCallback((name: string, value: number | string | string[]) => {
    if (name) {
      setReset(true);
      setSelectedFilters({ ...selectedFilters, [name]: value });
    }
  }, [selectedFilters]);

  const onUpdate = useCallback((query?: QueryType<ProjectQueryTypes>) => {
    const fromDateString: string = selectedFilters.dateRange?.[0] || "";
    const toDateString = selectedFilters.dateRange?.[1] || "";
    const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
    const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

    const params: QueryType<ProjectQueryTypes> = {
      slug: selectedFilters.slug || undefined,
      quoteNumber: selectedFilters.quoteNumber || undefined,
      projectStateSlugs: selectedFilters.projectStateSlugs ? [selectedFilters.projectStateSlugs] : undefined,
      clientId: Number(selectedFilters.clientId) > 0 ? Number(selectedFilters.clientId) : undefined,
      isClosed: selectedFilters.isClosed || undefined,
      fromDate: fromDate,
      toDate: toDate,
      userIds: selectedFilters.userIds?.length ? selectedFilters.userIds : undefined,
      projectRole: Number(selectedFilters.projectRole) > 0 ? Number(selectedFilters.projectRole) : undefined,
      title: debouncedTitleTerm || undefined,
      ...query
    }

    onRefresh<QueryType<ProjectQueryTypes>>(params);
  }, [selectedFilters, onRefresh]);

  const onTitleSearch = useCallback(() => {
    if (debouncedTitleTerm !== undefined) {
      onUpdate({ title: debouncedTitleTerm });
    } else {
      onUpdate({ title: undefined });
    }
  }, [debouncedTitleTerm]);

  const onUserSearch = useCallback(() => {
    if (debouncedSearchTerm) {
      setUsers((prev) => ({ ...prev, loading: true }))
      userModule.getAllRecords({ name: debouncedSearchTerm }).then((res) => {
        const { data } = res?.data
        setUsers((prev) => {
          // if the data is already present in the state, then don't add it again
          const filteredData = data?.filter((item) => {
            return !prev?.data.find((prevItem) => prevItem.id === item.id);
          });
          // add the new data to the existing data
          return {
            data: [...prev.data, ...filteredData],
            loading: false,
          }
        })
      }).catch((err) => {
        message.error(err?.response?.data?.message || "Something went wrong")
        setUsers((prev) => ({ ...prev, loading: false }))
      })
    }
  }, [debouncedSearchTerm])

  const onOrgSearch = useCallback(() => {
    if (debouncedClientSearchTerm) {
      setClients((prev) => ({ ...prev, loading: true }))
      orgModule.findPublished({ name: debouncedClientSearchTerm }).then((res) => {
        const { data } = res?.data
        setClients((prev) => {
          // if the data is already present in the state, then don't add it again
          const filteredData = data?.filter((item: OrganizationType) => {
            return !prev?.data.find((prevItem) => prevItem.id === item.id);
          });
          // add the new data to the existing data
          return {
            data: [...prev.data, ...filteredData],
            loading: false,
          }
        })
      }).catch((err) => {
        message.error(err?.response?.data?.message || "Something went wrong")
        setClients((prev) => ({ ...prev, loading: false }))
      })
    }
  }, [debouncedClientSearchTerm])

  const onTitleChange = (event: FormEvent<HTMLInputElement>) => {
    const { currentTarget } = event
    setTitleTerm(currentTarget.value)
    onSelected(event)
  }

  // Function to handle pagination change
  const onPaginationChange = (page: number, pageSize: number) => onUpdate({ page, perPage: pageSize });

  // Function to handle view as change
  const onViewAsChange = (value: ProjectViewAsType) => {
    localStorage.setItem("projectViewAs", value);
  }

  // Use Effect to fetch Title Search data
  useEffect(() => {
    onTitleSearch();
  }, [onTitleSearch]);

  // Use Effect to fetch Users Search data
  useEffect(() => {
    onUserSearch();
  }, [onUserSearch]);

  // Use Effect to fetch organization Search data
  useEffect(() => {
    onOrgSearch();
  }, [onOrgSearch]);

  useEffect(() => {
    if (reset) {
      onUpdate();
    }
    // after 2 seconds set reset clicked state to false
    const timer = setTimeout(() => {
      setReset(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [reset]);

  useEffect(() => {
    if (readProject === false) {
      window.location.replace('/')
    }
  }, [readProject])

  const moreFiltersOptions = [
    { label: "Users", value: "userIds" },
    { label: "Slug", value: "slug" },
    { label: "Closed Projects", value: "isClosed" }
  ];

  const moreComponents = {
    userIds: (
      <CustomFilter
        type="multiSelect"
        label="Users"
        name="userIds"
        withSearch={true}
        options={users?.data?.map((item) => ({
          label: `${item.firstName} ${item.lastName}`,
          value: `${item.id}`,
        }))}
        onChange={(value) => {
          setSelectedFilters({ ...selectedFilters, userIds: value })
        }}
        onReset={() => {
          setReset(true)
          onReset("userIds", []);
          // Reset search term
          setSearchTerm("")
        }}
        defaultVisible={moreFilters.includes("userIds")}
        onUpdate={onUpdate}
        // START: For search
        loading={users.loading}
        searchTerm={searchTerm}
        onSearch={(event) => setSearchTerm(event.currentTarget.value)}
      // END: For search
      />
    ),
    slug: (
      <CustomFilter
        type="input"
        label="Slug"
        name="slug"
        value={String(selectedFilters?.slug)}
        onChange={onSelected}
        onReset={() => onReset("slug", "")}
        onUpdate={onUpdate}
        defaultVisible={moreFilters.includes("slug")}
      />
    ),
    isClosed: (
      <CustomFilter
        type="radio"
        label="Closed Projects"
        name="isClosed"
        options={[
          {
            label: "Yes",
            value: "true",
          },
          {
            label: "No",
            value: "false",
          }
        ]}
        value={String(selectedFilters?.isClosed)}
        onChange={onSelected}
        onReset={() => onReset("isClosed", "")}
        onUpdate={onUpdate}
        defaultVisible={moreFilters.includes("isClosed")}
      />
    ),
  };

  // const slugsWhichHasMultiple = ["typeIds", "categoryId", "__bathrooms", "__bedrooms", "location", "state", "agentIds"]
  // const [searchParams] = useSearchParams()
  // const [excelData, setExcelData] = useState<any>([]);

  // headers for the excel export
  // const headers = [
  //     {
  //         label: "Property ID",
  //         key: "id"
  //     },
  //     {
  //         label: "Title",
  //         key: "title"
  //     },
  //     {
  //         label: "Location",
  //         key: "location"
  //     },
  //     {
  //         label: "Bedrooms",
  //         key: "bedrooms"
  //     },
  //     {
  //         label: "Bathrooms",
  //         key: "bathrooms"
  //     },
  //     {
  //         label: "Daily Price (AED)",
  //         key: "dailyPrice"
  //     },
  //     {
  //         label: "Weekly Price (AED)",
  //         key: "weeklyPrice"
  //     },
  //     {
  //         label: "Monthly Price (AED)",
  //         key: "monthlyPrice"
  //     },
  //     {
  //         label: "Yearly Price (AED)",
  //         key: "yearlyPrice"
  //     },
  //     {
  //         label: "Fixed Price (AED)",
  //         key: "fixedPrice"
  //     },
  //     {
  //         label: "Property Type",
  //         key: "type"
  //     },
  //     {
  //         label: "Category",
  //         key: "category"
  //     },
  //     {
  //         label: "Slug",
  //         key: "slug"
  //     },
  //     {
  //         label: "Agent",
  //         key: "agent"
  //     },
  //     {
  //         label: "Date Added",
  //         key: "addedDate"
  //     },
  //     {
  //         label: "Status",
  //         key: "status"
  //     },
  //     {
  //         label: "Quality Score",
  //         key: "qualityScore"
  //     },
  // ]

  // let params: Partial<filtersType> = {
  //     title: "",
  //     status: "",
  //     id: "",
  //     categoryId: [],
  //     __bathrooms: [],
  //     __bedrooms: [],
  //     furnishingStatus: "",
  //     featured: "",
  //     typeIds: [],
  //     minArea: "",
  //     maxArea: "",
  //     maxPrice: "",
  //     minPrice: "",
  //     rentalPeriod: "",
  //     slug: "",
  //     location: [],
  //     state: [],
  //     agentIds: [],
  //     agencyId: "",
  // };

  // searchParams.forEach((key, value) => {
  //     if (slugsWhichHasMultiple.includes(value) && value !== "__bathrooms" && value !== "__bedrooms") {
  //         let val = key.split(',').map((ele) => Number(ele));
  //         params = { ...params, [value]: val }
  //     } else if (value === "__bathrooms" || value === "__bedrooms") {
  //         let val = key.split(',').map((ele) => ele);
  //         params = { ...params, [value]: val }
  //     }
  //     else {
  //         if (key) {
  //             params = { ...params, [value]: key }
  //         }
  //     }
  // });

  useEffect(() => {
    const isClosed = searchParams.get("isClosed");

    if ((isClosed !== null)) {
      setSelectedFilters((prev) => ({
        ...prev,
        isClosed: isClosed === "true",
      }));
    }
  }, []);

  // Get selected data using the ids
  // const getSelectedDataUsingID = useCallback(() => {
  //     if (params.location) {
  //         dispatch(getLocationData({ id: params.location }));
  //     }

  //     if (params.agentIds) {
  //         dispatch(getUsersData({ ids: params.agentIds }))
  //     }

  //     if (params.agencyId) {
  //         dispatch(getOrganizationFilteredData({ ids: [params.agencyId] }))
  //     }
  // }, [params.location, params.agentIds, params.agencyId, dispatch])

  // useEffect(() => {
  //     getSelectedDataUsingID()
  // }, [])

  // const getExcelData = useCallback(() => {
  //   if (data) {
  //     const _data = data?.map((property) => {
  //       return {
  //         id: property?.id || "N/A",
  //         title: property?.localization[0]?.title || "N/A",
  //         location: property?.propertyLocation[0]?.location?.localization[0]?.pathName || "N/A",
  //         bedrooms: property?.bedrooms || "N/A",
  //         bathrooms: property?.bathrooms || "N/A",
  //         dailyPrice: property?.dailyPrice || "N/A",
  //         weeklyPrice: property?.weeklyPrice || "N/A",
  //         monthlyPrice: property?.monthlyPrice || "N/A",
  //         yearlyPrice: property?.yearlyPrice || "N/A",
  //         fixedPrice: property?.fixedPrice || "N/A",
  //         type: property?.type?.localization[0]?.title || "N/A",
  //         category: property?.category?.slug || "N/A",
  //         slug: property?.slug || "N/A",
  //         agent: property?.addedByRelation?.firstName + " " + property?.addedByRelation?.lastName || "N/A",
  //         addedDate: moment(property?.addedDate).format("LL") || "N/A",
  //         status: PropertyStatus[property?.status] || "Unknown",
  //         qualityScore: property?.qualityScore || "N/A",
  //       }
  //     })
  //     setExcelData(_data)
  //   }
  // }, [data])

  // useEffect(() => {
  //   getExcelData()
  // }, [getExcelData])

  return (
    <Layout permissionSlug={permissionSlug} onGetProjects={onUpdate}>
      <PageHeader
        heading="Projects"
        breadCrumbData={breadCrumbsData}
        filters={
          readProject ? (
            <div className={styles.filterWrapper}>
              {selectedRowKeys.length > 0 ? (
                <>
                  <div>
                    Bulk Action Components will be here
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <CustomInput
                      placeHolder="Search by title or reference number"
                      onChange={onTitleChange}
                      value={titleTerm}
                    />
                  </div>
                  <div>
                    <CustomFilter
                      type="radio"
                      label="Project Status"
                      name="projectStateSlugs"
                      options={projectStates?.map((state) => ({
                        label: state.title,
                        value: `${state.slug}`,
                      })) || []}
                      value={`${selectedFilters?.projectStateSlugs}`}
                      onChange={onSelected}
                      onReset={() => onReset("projectStateSlugs", "")}
                      onUpdate={onUpdate}
                    />
                  </div>
                  <div>
                    <CustomFilter
                      type="input"
                      label="Quote Number"
                      name="quoteNumber"
                      value={`${selectedFilters?.quoteNumber}`}
                      onChange={onSelected}
                      onReset={() => onReset("quoteNumber", "")}
                      onUpdate={onUpdate}
                    />
                  </div>
                  <CustomFilter
                    type="radio"
                    label="Client"
                    name="clientId"
                    withSearch={true}
                    options={clients?.data?.map((item) => ({
                      label: item.name,
                      value: `${item.id}`,
                    }))}
                    onChange={onSelected}
                    value={Number(selectedFilters?.clientId) > 0 ? `${selectedFilters?.clientId}` : ""}
                    onReset={() => {
                      onReset("clientId", 0);
                      // Reset search term
                      setClientSearchTerm("")
                    }}
                    onUpdate={onUpdate}
                    // START: For search
                    loading={clients.loading}
                    searchTerm={clientSearchTerm}
                    onSearch={(event) => setClientSearchTerm(event.currentTarget.value)}
                  // END: For search
                  />
                  <div>
                    <CustomFilter
                      type="datepicker"
                      label="Date"
                      name="dateRange"
                      onChange={(value) => setSelectedFilters({ ...selectedFilters, dateRange: value })}
                      onReset={() => onReset("dateRange", "")}
                      onUpdate={onUpdate}
                    />
                  </div>
                  <div>
                    <CustomFilter
                      type="radio"
                      label="Project Role"
                      name="projectRole"
                      options={Object.entries(ProjectRoleEnumString).map(([key, value]) => ({
                        label: key,
                        value: value,
                      }))}
                      value={String(selectedFilters?.projectRole)}
                      onChange={onSelected}
                      onReset={() => onReset("projectRole", "")}
                      onUpdate={onUpdate}
                    />
                  </div>
                  {/**  Find the selected filter and render the component based on the name of the filter */
                    Object.keys(moreComponents).map((key) => {
                      return moreFilters?.includes(key) && moreComponents[key as keyof typeof moreComponents];
                    })
                  }
                  <div>
                    <MoreCustomFilters
                      options={moreFiltersOptions?.map((option) => ({
                        label: option.label,
                        value: option.value,
                      }))}
                      onChange={(value) => setMoreFilters(value)}
                      value={moreFilters}
                    />
                  </div>
                </>
              )}

              {/** View as grid or table */}
              <div style={{ overflow: "auto" }} className={ComponentStyles.view_as}>
                <Segmented
                  options={[
                    {
                      label: 'Table',
                      value: 'table',
                      icon: <BarsOutlined />,
                    },
                    {
                      label: 'Grid',
                      value: 'grid',
                      icon: <AppstoreOutlined />,
                    },
                  ]}
                  onChange={(value) => {
                    setProjectViewAs(value as ProjectViewAsType)
                    onViewAsChange(value as ProjectViewAsType)
                  }}
                  value={projectViewAs}
                />
              </div>
            </div>
          ) : null
        }
      // excelExport={propertiesData.data?.length > 0 &&
      //     <ExcelExport
      //         fileName="Properties"
      //         headers={headers}
      //         data={excelData}
      //     />
      // }
      />

      {!data && loading && (
        <div style={{ display: "flex", flexWrap: "wrap", width: "100%", gap: 10 }}>
          {Array(6).fill(0).map((_item, index) => <CardShimmer key={`shimmerItem-${index}`} />)}
        </div>
      )}

      {readProject === true && (
        <>
          <div className={styles.antdTableWrapper}>
            {data?.length === 0 ? (
              <div style={{ marginTop: "50px" }}>
                <CustomEmpty description="No Projects found" />
              </div>
            ) : (
              <>
                {projectViewAs === "table" ? (
                  <ProjectTable
                    data={{
                      allProjects: data!,
                      onRefresh: onUpdate as any,
                      projectStates: projectStates!,
                    }}
                    permissions={permissions}
                    rowSelection={{
                      selectedRowKeys,
                      onChange: setSelectedRowKeys,
                    }}
                  />
                ) : (
                  <ProjectsCard
                    data={{
                      allProjects: data!,
                      onRefresh: onUpdate as any,
                      projectStates: projectStates!,
                    }}
                    permissions={permissions}
                  />
                )}
              </>
            )}
          </div>
          <Pagination
            total={meta?.total!}
            current={meta?.page!}
            defaultPageSize={25}
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={onPaginationChange}
          />
        </>
      )}
      {readProject === false && (
        <ErrorCode403
          mainMessage="You don't have permission to view this data"
        />
      )}
    </Layout >
  );
}
export default AllProjects;
