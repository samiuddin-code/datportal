import {
  useMemo, type FC, useState, useCallback, useEffect,
  type FormEvent, type ReactNode
} from 'react';
import { Segmented, message } from 'antd';
import { useSelector } from 'react-redux';
import Layout from "@templates/Layout";
import { useFetchData } from 'hooks';
import { RootState } from 'Redux/store';
import { EnquiryModule } from '@modules/Enquiry';
import { EnquiryParamTypes, EnquiryStatusCounts, EnquiryType } from '@modules/Enquiry/types';
import { EnquiryPermissionsEnum } from '@modules/Enquiry/permissions';
import { ProjectTypeModule } from '@modules/ProjectType';
import { ProjectTypeType } from '@modules/ProjectType/types';
import { QueryType } from '@modules/Common/common.interface';
import { ErrorCode403 } from '@atoms/ErrorCodes';
import { Pagination, PageHeader, CustomInput, CustomFilter } from '@atoms/';
import MoreCustomFilters from '@atoms/CustomFilter/more';
import { useDebounce } from '@helpers/useDebounce';
import { EnquirySource, EnquiryStatus } from '@helpers/commonEnums';
import { getPermissionSlugs, handleError, isNumber } from '@helpers/common';
import { convertDate } from '@helpers/dateHandler';
import EnquiriesModal from './drawer';
import EnquiriesTable from './table';
import styles from '../Common/styles.module.scss';
import EnquiryNotes from './Notes';
import { UserModule } from '@modules/User';
import { UserTypes } from '@modules/User/types';

const breadCrumbsData = [
  { text: "Home", isLink: true, path: "/" },
  { isLink: false, text: "Enquiries" },
];

type ModalOpenType = {
  type: "new" | "edit" | "notes" | "attachments";
  recordId: number;
  open: boolean;
}

type SelectedFiltersTypes = {
  dateRange?: string[];
} & QueryType<EnquiryParamTypes>

type SelectedMoreFiltersTypes = Partial<keyof EnquiryParamTypes>[]

type MoreFiltersTypes = Partial<{ [key in keyof EnquiryParamTypes]: ReactNode }>

type EnquiriesExportType = { [key: string]: string | number | boolean }

type SearchedResultTypes<T = any> = {
  data: T[]
  loading: boolean
}

const Enquiries: FC = () => {
  // available permissions for the properties page
  const permissionSlug = getPermissionSlugs(EnquiryPermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in EnquiryPermissionsEnum]: boolean };
  const { readEnquiry, createEnquiry, updateEnquiry } = permissions;

  const module = useMemo(() => new EnquiryModule(), []);
  const userModule = useMemo(() => new UserModule(), []);
  const projectTypeModule = useMemo(() => new ProjectTypeModule(), []);

  const { data: projectTypeData } = useFetchData<ProjectTypeType[]>({
    method: projectTypeModule.getPublishRecords,
    initialQuery: { perPage: 100 }
  })

  const { data, onRefresh, meta, loading } = useFetchData<EnquiryType[]>({
    method: module.getAllRecords,
    initialQuery: { status: EnquiryStatus.Active }
  })

  // Status Counts
  const {
    data: statusCounts, onRefresh: onRefreshStatusCount
  } = useFetchData<EnquiryStatusCounts>({ method: module.getCounts })

  const [modalOpen, setModalOpen] = useState<ModalOpenType>({ type: "new", recordId: 0, open: false });
  const [openNotesModal, setOpenNotesModal] = useState<ModalOpenType>({ type: "notes", recordId: 0, open: false });

  const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
    status: EnquiryStatus.Active,
    dateRange: [""],
  });
  const [moreFilters, setMoreFilters] = useState<SelectedMoreFiltersTypes>([]);

  const [reset, setReset] = useState<boolean>(false);
  const [excelData, setExcelData] = useState<EnquiriesExportType[]>([]);

  // Name search
  const [searchTerm, setSearchTerm] = useState<string | undefined>();
  // Search Debounce
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // assigned to search term
  const [assignedToTerm, setAssignedToTerm] = useState("");
  // Search Debounce
  const debouncedAssignedToTerm = useDebounce(assignedToTerm, 500)

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

    // set the selected value in the state
    setSelectedFilters((prev) => ({ ...prev, [name]: value }))
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
    if (createEnquiry === false) {
      message.error("You don't have permission to create new record");
      return;
    }
    onModalOpen({ type: "new", open: true, recordId: 0 })
  }

  const onEditIconClick = (record: EnquiryType) => {
    if (updateEnquiry === false) {
      message.error("You don't have permission to update record");
      return;
    }
    onModalOpen({ type: "edit", open: true, recordId: record?.id })
  };

  const onAddNoteClick = (record: EnquiryType) => {
    if (updateEnquiry === false) {
      message.error("You don't have permission to add notes");
      return;
    }
    setOpenNotesModal({ type: "notes", open: true, recordId: record?.id })
  };

  const onUpdate = useCallback((query?: QueryType<EnquiryParamTypes>) => {
    const fromDateString: string = selectedFilters.dateRange?.[0] || "";
    const toDateString = selectedFilters.dateRange?.[1] || "";
    const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
    const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

    const data: QueryType<EnquiryParamTypes> = {
      status: selectedFilters.status || undefined,
      email: selectedFilters.email || undefined,
      phone: selectedFilters.phone || undefined,
      fromDate: fromDate,
      toDate: toDate,
      name: selectedFilters.name || undefined,
      source: selectedFilters.source || undefined,
      userAgent: selectedFilters.userAgent || undefined,
      userIP: selectedFilters.userIP || undefined,
      hasConcerns: selectedFilters.hasConcerns || undefined,
      assignedToId: selectedFilters.assignedToId || undefined,
      ...query
    }

    // get the data from the api
    onRefresh(data);
    // get the status counts
    onRefreshStatusCount();
  }, [selectedFilters])

  const onPaginationChange = (page: number, pageSize: number) => onUpdate({ page, perPage: pageSize });

  const moreFiltersOptions: { label: string; value: keyof EnquiryParamTypes; }[] = [
    { label: "Email", value: "email" },
    { label: "Phone", value: "phone" },
    { label: "User IP", value: "userIP" },
    { label: "User Agent", value: "userAgent" },
  ];

  const moreComponents: MoreFiltersTypes = {
    email: (
      <CustomFilter
        type="email"
        label="Email"
        name="email"
        value={selectedFilters?.email}
        onChange={onSelected}
        onReset={() => onReset("email", "")}
        onUpdate={onUpdate}
        defaultVisible={moreFilters.includes("email")}
      />
    ),
    phone: (
      <CustomFilter
        type="input"
        label="Phone"
        name="phone"
        value={selectedFilters?.phone}
        onChange={onSelected}
        onReset={() => onReset("phone", "")}
        onUpdate={onUpdate}
        defaultVisible={moreFilters.includes("phone")}
      />
    ),
    userIP: (
      <CustomFilter
        type="input"
        label="User IP"
        name="userIP"
        value={selectedFilters?.userIP}
        onChange={onSelected}
        onReset={() => onReset("userIP", "")}
        onUpdate={onUpdate}
        defaultVisible={moreFilters.includes("userIP")}
      />
    ),
    userAgent: (
      <CustomFilter
        type="input"
        label="User Agent"
        name="userAgent"
        value={selectedFilters?.userAgent}
        onChange={onSelected}
        onReset={() => onReset("userAgent", "")}
        onUpdate={onUpdate}
        defaultVisible={moreFilters.includes("userAgent")}
      />
    ),
  };

  const onSearchChange = (event: FormEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearchTerm(value)
    onSelected(event)
  }

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

  const otherOptions = [] as { label: string, value: string }[]
  Object.entries(EnquiryStatus).forEach(([key, value]) => {
    if (!isNumber(key)) {
      otherOptions.push({
        label: `${key} (${statusCounts?.[key?.toLowerCase() as keyof EnquiryStatusCounts] || 0})`,
        value: value as string
      })
    }
  })

  const segmentedOptions = [
    { label: `All (${statusCounts?.all || 0})`, value: "all" },
    ...otherOptions,
    { label: `Has Concerns (${statusCounts?.hasConcerns || 0})`, value: "hasConcerns" }
  ]

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
    if (debouncedSearchTerm !== undefined) {
      onUpdate({ name: debouncedSearchTerm })
    } else if (debouncedSearchTerm === "") {
      onUpdate({ name: undefined });
    }
  }, [debouncedSearchTerm])

  useEffect(() => {
    GetSearchAssignedTo();
  }, [GetSearchAssignedTo])

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

  return (
    <Layout permissionSlug={permissionSlug}>
      <PageHeader
        heading="Enquiries"
        breadCrumbData={breadCrumbsData}
        showAdd={!!createEnquiry}
        buttonText='Add Enquiry'
        onButtonClick={onAddNewClick}
        filters={
          readEnquiry ? (
            <div>
              <div>
                <CustomInput
                  name='name' placeHolder="Search by name"
                  onChange={onSearchChange}
                  value={searchTerm}
                  style={{ maxWidth: 200 }}
                />
              </div>
              <div style={{ overflow: "auto" }}>
                <Segmented
                  size="middle" options={segmentedOptions.map((item) => {
                    return {
                      ...item,
                      title: item.label,
                      value: item.value
                    }
                  })}
                  style={{ fontSize: "var(--font-size-sm)" }}
                  value={selectedFilters?.status || "all"}
                  onChange={(value) => {
                    setSelectedFilters({ ...selectedFilters, status: value as EnquiryStatus })
                    if (value === "all") {
                      onReset("status", "")
                    } else if (value === "hasConcerns") {
                      onUpdate({ hasConcerns: true, status: undefined })
                    } else {
                      onUpdate({ status: value as EnquiryStatus })
                    }
                  }}
                />
              </div>
              <div>
                <CustomFilter
                  type="radio"
                  label="Source"
                  name="source"
                  options={Object.entries(EnquirySource).map(([key, value]) => {
                    return {
                      label: value as string,
                      value: key
                    }
                  })}
                  value={String(selectedFilters?.source)}
                  onChange={onSelected}
                  onReset={() => onReset("source", "")}
                  onUpdate={onUpdate}
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
            </div>
          ) : null
        }
      />
      {readEnquiry === true && (
        <>
          <div className={styles.antdTableWrapper}>
            <EnquiriesTable
              tableData={data!}
              tableLoading={loading}
              permissions={permissions}
              projectTypeData={projectTypeData!}
              reloadTableData={() => {
                onRefresh();
                onRefreshStatusCount();
              }}
              onEditIconClick={onEditIconClick}
              onAddNoteClick={onAddNoteClick}
              onAttachmentClick={(record) => onModalOpen({ type: "attachments", open: true, recordId: record?.id })}
              meta={meta}
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

      {readEnquiry === false && (
        <ErrorCode403
          mainMessage="You don't have permission to view this data"
        />
      )}

      {modalOpen.open && (
        <EnquiriesModal
          projectTypeData={projectTypeData!}
          visible={modalOpen.open} type={modalOpen.type}
          recordId={modalOpen.recordId} permissions={permissions}
          onCancel={() => onModalOpen({ type: "new", recordId: 0, open: false })}
          onRefresh={() => {
            if (modalOpen.type === "new") {
              setSelectedFilters({ status: EnquiryStatus.Active })
              onUpdate({ status: EnquiryStatus.Active })
            } else {
              onUpdate();
            }
            onRefreshStatusCount();
          }}
        />
      )}


      {/*TODO: Add Note logs in modal */}
      {openNotesModal.open && (
        <EnquiryNotes
          open={openNotesModal.open}
          permissions={permissions}
          enquiryId={openNotesModal.recordId}
          // refresh enquiry data
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
}
export default Enquiries;