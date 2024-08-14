import {
  useMemo, type FC, useState, Dispatch, SetStateAction, useCallback,
  useEffect, FormEvent
} from 'react';
import {
  Image, message, Popconfirm, Tooltip, Skeleton, Drawer, Checkbox
} from 'antd';
import {
  CloudDownloadOutlined, CloseOutlined, ShareAltOutlined
} from '@ant-design/icons';
import {
  CustomEmpty, CustomFilter, CustomInput, CustomSelect, EditableInput, Pagination
} from '@atoms/';
import { DeleteIcon } from '@icons/';
import { ProjectModule } from '@modules/Project';
import { ProjectResourceTypes, ProjectResourceQueryTypes } from '@modules/Project/types';
import { PROTECTED_RESOURCE_BASE_URL } from '@helpers/constants';
import { ProjectDocumentsTypes, ProjectFileTypes } from '@helpers/commonEnums';
import TokenService from '@services/tokenService';
import { QueryType } from '@modules/Common/common.interface';
import { convertDate } from '@helpers/dateHandler';
import { useDebounce } from '@helpers/useDebounce';
import styles from './styles.module.scss';
import { handleError } from '@helpers/common';

interface ManageMediaProps {
  media: {
    onRefresh: <QueryType = any>(query?: QueryType) => void,
    data: ProjectResourceTypes[],
    loading: boolean,
    meta: QueryType
  }
  projectId: number
  isManageMediaOpen: boolean
  setIsManageMediaOpen: Dispatch<SetStateAction<boolean>>
  shareFiles?: boolean
}

type EditTitleTypes = {
  [key: string]: {
    show: boolean
    title: string
  }
}

type SelectedFiltersTypes = {
  dateRange?: string[];
} & Partial<ProjectResourceQueryTypes>

type SelectedFilesTypes = {
  fileIds: number[]
  shareInEmail: boolean
}

const ManageMedia: FC<ManageMediaProps> = (props) => {
  const {
    projectId, isManageMediaOpen, setIsManageMediaOpen,
    shareFiles = false, media: { onRefresh, data, loading, meta }
  } = props;

  const access_token = TokenService.getLocalAccessToken();
  const module = useMemo(() => new ProjectModule(), []);

  const [editTitle, setEditTitle] = useState<EditTitleTypes>()
  const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
    dateRange: [""],
  });
  const [selectedFiles, setSelectedFiles] = useState<SelectedFilesTypes>({
    fileIds: [], shareInEmail: true
  });
  const [reset, setReset] = useState<boolean>(false);

  // File Name search
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
  // Search Debounce
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  /** Share files with client */
  const onShareFiles = useCallback(() => {
    if (selectedFiles.fileIds.length > 0) {
      const data = {
        fileIds: selectedFiles.fileIds,
        shareInEmail: selectedFiles.shareInEmail,
        projectId: projectId
      }
      module.shareFiles(data).then((res) => {
        onRefresh<Partial<ProjectResourceQueryTypes>>({ projectId: projectId });
        message.success(res?.data?.message || 'File shared successfully');
        setSelectedFiles({ fileIds: [], shareInEmail: true });
      }).catch((err) => {
        const errorMessage = handleError(err);
        message.error(errorMessage);
      });
    }
  }, [selectedFiles]);

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

  const onRemoveProjectFile = (id: number) => {
    module.removeProjectFiles(id).then((res) => {
      onRefresh<Partial<ProjectResourceQueryTypes>>({ projectId: projectId });
      message.success(res?.data?.message || 'File removed successfully');
    });
  };

  const onDocumentTypeChange = (value: string, id: number) => {
    module.updateFiles(id, { documentType: value }).then((res) => {
      onRefresh<Partial<ProjectResourceQueryTypes>>({ projectId: projectId });
      message.success(res?.data?.message || 'File updated successfully');
    });
  };

  const onUpdateTitle = (value: string, id: number) => {
    module.updateFiles(id, { title: value }).then((res) => {
      onRefresh<Partial<ProjectResourceQueryTypes>>({ projectId: projectId });
      message.success(res?.data?.message || 'File updated successfully');
    });
  };

  const onSearchChange = (event: FormEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearchTerm(value)
    onSelected(event)
  }

  const onUpdate = useCallback((query?: QueryType<ProjectResourceQueryTypes>) => {
    const fromDateString: string = selectedFilters.dateRange?.[0] || "";
    const toDateString = selectedFilters.dateRange?.[1] || "";
    const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
    const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

    const data: QueryType<ProjectResourceQueryTypes> = {
      fromDate: fromDate,
      toDate: toDate,
      projectId: projectId,
      fileType: selectedFilters.fileType || undefined,
      projectDocumentsTypes: selectedFilters.projectDocumentsTypes || undefined,
      fileName: selectedFilters.fileName || undefined,
      sharedToClient: selectedFilters.sharedToClient || undefined,
      perPage: 12,
      ...query
    }

    // get the data from the api
    onRefresh(data);
  }, [selectedFilters])

  const onPaginationChange = (page: number, pageSize: number) => onUpdate({ page, perPage: pageSize });

  const onClose = useCallback(() => {
    setIsManageMediaOpen(false);

    // if no filters are selected then return
    if (Object.values(selectedFilters).every((item) => JSON.stringify(item) === JSON.stringify([""]))) return;

    setSearchTerm("");
    setSelectedFilters({
      dateRange: [""], fileType: undefined,
      projectDocumentsTypes: undefined,
      fileName: "", sharedToClient: undefined
    });

    Object.entries(selectedFilters).forEach(([key]) => {
      if (key === "dateRange") {
        setSelectedFilters((prev) => ({ ...prev, dateRange: [""], }));
      } else {
        setSelectedFilters((prev) => ({ ...prev, [key]: undefined }));
      }

      if (key === "fileName") {
        setSearchTerm("");
      }
    });

    // fetch the data again with the pagination
    onRefresh<Partial<ProjectResourceQueryTypes>>({
      projectId: projectId,
      page: meta?.page || 1,
      perPage: meta?.perPage || 12,
    });
  }, [projectId, meta, selectedFilters]);

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
      onUpdate({ fileName: debouncedSearchTerm })
    } else if (debouncedSearchTerm === '') {
      onUpdate({ fileName: undefined })
    }
  }, [debouncedSearchTerm])

  return (
    <Drawer
      open={isManageMediaOpen} onClose={onClose}
      width={window.innerWidth > 820 ? 820 : "100%"}
      destroyOnClose={true} bodyStyle={{ padding: "0px 25px" }} closable={false}
      headerStyle={{ display: "flex", justifyContent: "space-between", paddingBottom: 0 }}
      title={
        <div className={styles.manage_media_header}>
          <div className={styles.manage_media_header_title}>
            <div>
              <CloseOutlined
                className='mr-3' onClick={onClose}
                style={{ cursor: "pointer", color: "var(--color-dark-sub)" }}
              />
              Manage Media
            </div>

            {selectedFiles.fileIds.length > 0 && (
              <div className={styles.manage_media_selected_files}>
                <p className={styles.manage_media_selected_files_label}>
                  {selectedFiles.fileIds.length} file{selectedFiles.fileIds.length > 1 ? 's' : ''} selected
                </p>
                <div className={styles.manage_media_selected_files_actions}>
                  <Popconfirm
                    title={
                      <>
                        Are you sure to share this files with client?
                        <br />
                        <Checkbox
                          checked={selectedFiles.shareInEmail}
                          onChange={(e) => setSelectedFiles((prev) => ({ ...prev, shareInEmail: e.target.checked }))}
                        >
                          Share files in email
                        </Checkbox>
                      </>
                    }
                    onConfirm={onShareFiles} okText="Yes" cancelText="No"
                    placement='bottomLeft'
                  >
                    <ShareAltOutlined />
                  </Popconfirm>
                </div>
              </div>
            )}
          </div>
          <div className={styles.manage_media_filters}>
            <CustomInput
              name='fileName' placeHolder="Search by file name"
              onChange={onSearchChange} value={searchTerm}
              style={{ width: '40%' }}
            />
            <CustomFilter
              type="datepicker" label="Date" name="dateRange"
              onChange={(value) => setSelectedFilters((prev) => ({ ...prev, dateRange: value }))}
              onReset={() => onReset("dateRange", [])}
              onUpdate={onUpdate}
            />
            <CustomFilter
              type="radio" label="Document Type" name="projectDocumentsTypes"
              options={Object.entries(ProjectDocumentsTypes).map(([key, value]) => {
                return { label: value as string, value: key }
              })}
              value={String(selectedFilters?.projectDocumentsTypes)}
              onChange={onSelected}
              onReset={() => onReset("projectDocumentsTypes", "")}
              onUpdate={onUpdate}
            />
            <CustomFilter
              type="radio" label="File Type" name="fileType"
              options={Object.entries(ProjectFileTypes).map(([key, value]) => {
                return { label: value as string, value: key }
              })}
              value={String(selectedFilters?.fileType)}
              onChange={onSelected}
              onReset={() => onReset("fileType", "")}
              onUpdate={onUpdate}
            />
            {shareFiles && (
              <div
                className={styles.manage_media_filters_with_clients}
                style={{
                  backgroundColor: selectedFilters.sharedToClient ? "var(--color-dark-main)" : undefined,
                  color: selectedFilters.sharedToClient ? "var(--color-inactive)" : undefined,
                }}
                onClick={() => {
                  setSelectedFilters((prev) => {
                    const sharedToClient = !prev.sharedToClient
                    return { ...prev, sharedToClient }
                  })
                  if (selectedFilters.sharedToClient) {
                    onUpdate({ sharedToClient: undefined })
                  } else {
                    onUpdate({ sharedToClient: true })
                  }
                }}
              >
                Shared With Clients
              </div>
            )}
          </div>
        </div>
      }
      footer={!loading && data?.length! > 0 && (
        <Pagination
          total={meta?.total!}
          current={meta?.page!}
          defaultPageSize={meta?.perPage! || 12}
          pageSizeOptions={[10, 20, 50, 100]}
          onChange={onPaginationChange}
        />
      )}
    >
      {loading && <Skeleton active />}

      {!loading && data?.length === 0 && <CustomEmpty description='No data found' />}

      {!loading && data?.map((item, idx) => {
        return (
          <div key={`${item.name}-${idx}`} className={styles.manage_media_photo}>
            <div className={styles.manage_media_photo_image}>
              {shareFiles && (
                <Tooltip title={"Select file to share with client"}>
                  <Checkbox
                    checked={selectedFiles.fileIds.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles((prev) => ({
                          ...prev, fileIds: [...prev.fileIds, item.id]
                        }))
                      } else {
                        setSelectedFiles((prev) => ({
                          ...prev, fileIds: prev.fileIds.filter((id) => id !== item.id)
                        }))
                      }
                    }}
                  />
                </Tooltip>
              )}
              {item.fileType?.includes('image') ? (
                <Image
                  src={`${PROTECTED_RESOURCE_BASE_URL}${item.path}?authKey=${access_token}`}
                  alt={item.title}
                  width={100} height={70}
                  style={{ borderRadius: 5, objectFit: 'cover' }}
                  preview={false}
                />
              ) : (
                <Image
                  src='/images/doc.png' alt={`Document-${idx}`}
                  width={100} height={70} preview={false}
                  style={{ objectFit: 'contain' }}
                />
              )}

              <div className={styles.manage_media_photo_content}>
                <div className={styles.manage_media_photo_name_container}>
                  <div
                    className={styles.manage_media_photo_name}
                    onClick={() => setEditTitle((prev) => ({ ...prev, [idx]: { show: true, title: item.title } }))}
                  >
                    {editTitle?.[idx]?.show ? (
                      <EditableInput
                        defaultValue={item.title}
                        size='small' className={styles.manage_media_photo_name_input}
                        onChange={(e) => setEditTitle((prev) => ({ ...prev, [idx]: { ...prev?.[idx], title: e.target.value } }))}
                        onBlur={() => setEditTitle((prev) => ({ ...prev, [idx]: { show: false, } }))}
                        onMouseDown={() => onUpdateTitle(editTitle?.[idx]?.title, item.id)}
                      />
                    ) : (
                      <span
                        style={{ cursor: 'pointer' }}
                        className={styles.manage_media_photo_name_label}
                      >
                        {item.title || 'Untitled, Click to edit'}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.manage_media_photo_document_type}>
                  <CustomSelect
                    bordered={false} style={{ width: 'fit-content' }}
                    defaultValue={item.documentType} clearIcon={false}
                    options={Object.entries(ProjectDocumentsTypes).map(([key, value]) => ({
                      label: value,
                      value: key
                    }))}
                    onSelect={(value) => onDocumentTypeChange(value, item.id)}
                  />
                </div>
              </div>
              <div className={styles.media_photo_actions}>
                <Tooltip title="Download">
                  <a
                    href={`${PROTECTED_RESOURCE_BASE_URL}${item.path}?authKey=${access_token}&download=true`}
                    target='_blank' style={{ color: "var(--color-dark-sub)" }}
                    download={item.title} rel="noreferrer"
                  >
                    <CloudDownloadOutlined style={{ fontSize: 22, cursor: "pointer", marginTop: 5 }} />
                  </a>
                </Tooltip>
                <Popconfirm
                  title="Are you sure to delete this file?"
                  onConfirm={() => onRemoveProjectFile(item.id)}
                  okText="Yes" cancelText="No" placement='left'
                >
                  <DeleteIcon cursor={'pointer'} width={20} />
                </Popconfirm>
              </div>
            </div>
          </div>
        )
      })}
    </Drawer>
  );
}
export default ManageMedia;