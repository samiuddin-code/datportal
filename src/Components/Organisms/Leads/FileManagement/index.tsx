import { useMemo, type FC, useState } from 'react';
import {
  Drawer, Image, Popconfirm, Skeleton, Tooltip, UploadProps, message
} from 'antd';
import { AxiosProgressEvent } from 'axios';
import api from "@services/axiosInstance";
import { CloudDownloadOutlined } from '@ant-design/icons';
import CustomEmpty from '@atoms/CustomEmpty';
import { LeadsModule } from '@modules/Leads';
import { LeadsTypes } from '@modules/Leads/types';
import { useConditionFetchData } from 'hooks';
import { APPLICATION_RESOURCE_BASE_URL, PROTECTED_RESOURCE_BASE_URL } from '@helpers/constants';
import { DeleteIcon } from '@icons/delete';
import ImageUploader from '@atoms/ImageUploader';
import TokenService from '@services/tokenService';
import { LeadsPermissionsEnum } from '@modules/Leads/permissions';
import styles from './styles.module.scss';
import { handleError } from '@helpers/common';

interface FilesDrawerProps {
  open: boolean;
  onClose: () => void;
  record: LeadsTypes;
  onRefresh: <QueryType = any>(query?: QueryType) => void;
  permissions: { [key in LeadsPermissionsEnum]: boolean }
}

const FilesDrawer: FC<FilesDrawerProps> = (props) => {
  const {
    open, onClose, record, permissions, onRefresh
  } = props;

  const access_token = TokenService.getLocalAccessToken();
  const [messageApi, contextHolder] = message.useMessage();
  const module = useMemo(() => new LeadsModule(), []);
  const [preview, setPreview] = useState({ image: false, document: false, src: "" });

  // Fetch Data by id
  const {
    data, loading, onRefresh: onRefreshDataById
  } = useConditionFetchData<LeadsTypes>({
    method: () => module.getRecordById(record?.id),
    condition: !!open && !!record?.id,
  })

  const [fileList, setFileList] = useState<UploadProps["fileList"]>([]);
  const [upload, setUpload] = useState<{
    status: "active" | "success" | "exception" | "normal";
    progress: { [key: string]: number };
  }>({ status: "normal", progress: {} });

  const onRemoveFile = (id: number) => {
    module.removeFile(id).then((res) => {
      onRefreshDataById();
      onRefresh();
      message.success(res?.data?.message || 'File removed successfully');
    });
  };

  /** Upload file to server */
  const fileUpload: UploadProps['customRequest'] = async (options) => {
    const { onSuccess, onError, file, filename } = options;
    const fmData = new FormData();
    const config = {
      headers: { "content-type": "multipart/form-data" },
    };

    fmData.append("files[]", file);
    fmData.append("leadId", record?.id.toString()!);

    setUpload({ status: "active", progress: { [filename!]: 0 } });

    const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
      const { loaded, total } = progressEvent;
      let percent = 0;
      if (total !== null && total !== undefined) {
        percent = Math.floor((loaded * 100) / total);
      }
      setUpload({ status: "active", progress: { [filename!]: percent } });
    };

    try {
      // if (permissions.updateLeads === true) {
      await api.post("leads/uploadLeadsDocuments", fmData, {
        onUploadProgress,
        ...config,
      });

      onSuccess && onSuccess({ status: 200 });
      setUpload({ status: "success", progress: { [filename!]: 100 } });
      // only refresh when the last file is uploaded

      setFileList([]);
      onRefreshDataById()

      //after 3 seconds, reset the upload status
      setTimeout(() => {
        setUpload({ status: "normal", progress: {} });
      }, 3000);
      // } else {
      //   throw new Error("You do not have permission to upload files")
      // }
    } catch (err: any) {
      let errorMessage = handleError(err)

      if (errorMessage === "You do not have permission to upload files") {
        messageApi.open({
          key: "permission", type: "error",
          duration: 5, content: errorMessage,
        });
      } else {
        messageApi.open({
          key: "error", type: "error",
          content: errorMessage,
        });
      }

      setUpload({ status: "exception", progress: { [filename!]: 0 } })
      onError && onError(new Error('Upload failed'))
    }
  }

  return (
    <>
      {contextHolder}
      <Drawer
        title="Attachments"
        placement="right" onClose={onClose} open={open}
        width={window.innerWidth > 768 ? 700 : "100%"}
        bodyStyle={{ padding: "0px 25px" }}
        destroyOnClose={true}
        style={{ zIndex: 99999 }}
      >
        {(!loading && data?.Attachments?.length === 0) && (
          <CustomEmpty
            description="No attachments found"
            className='d-flex flex-column'
          />
        )}

        {loading && <Skeleton active />}

        {data?.Attachments?.map((item, idx) => {
          return (
            <div key={`${item.title}-${idx}`} className={styles.manage_media_photo}>
              <div className={styles.manage_media_photo_image}>
                {item.mimeType?.includes('image') ? (
                  <Image
                    src={`${PROTECTED_RESOURCE_BASE_URL}${item.file}?authKey=${access_token}`}
                    alt={item.title}
                    width={100}
                    height={70}
                    style={{ borderRadius: 5, objectFit: 'cover' }}
                    preview={{
                      visible: preview.image,
                      src: preview.src,
                      onVisibleChange: (visible) => setPreview({ ...preview, image: visible, src: `${PROTECTED_RESOURCE_BASE_URL}${item.file}?authKey=${access_token}` }),
                    }}
                  />
                ) : (
                  <Image
                    src='/images/doc.png'
                    alt={`Document-${idx}`}
                    width={100}
                    height={70}
                    preview={false}
                    style={{ objectFit: 'contain', cursor: 'pointer' }}
                    onClick={() => window.open(`${APPLICATION_RESOURCE_BASE_URL}${item.file}`, '_blank')}
                  />
                )}

                <div className={styles.manage_media_photo_content}>
                  <span
                    style={{ cursor: 'pointer' }}
                    className={styles.manage_media_photo_name_label}
                    onClick={() => {
                      if (item.mimeType?.includes('image')) {
                        setPreview({ ...preview, image: true, src: `${PROTECTED_RESOURCE_BASE_URL}${item.file}?authKey=${access_token}` });
                      } else {
                        window.open(`${APPLICATION_RESOURCE_BASE_URL}${item.file}`, '_blank');
                      }
                    }}
                  >
                    {item.title}
                  </span>
                </div>
                <div className={styles.media_photo_actions}>
                  <Tooltip title="Download">
                    <a
                      href={`${PROTECTED_RESOURCE_BASE_URL}${item.file}?authKey=${access_token}&download=true`}
                      target='_blank' style={{ color: "var(--color-dark-sub)" }}
                      download={item.title} rel="noreferrer"
                    >
                      <CloudDownloadOutlined style={{ fontSize: 22, cursor: "pointer", marginTop: 5 }} />
                    </a>
                  </Tooltip>
                  <Popconfirm
                    title="Are you sure to delete this file?"
                    onConfirm={() => onRemoveFile(item.id)}
                    okText="Yes" cancelText="No" placement='left'
                    zIndex={99999}
                  >
                    <DeleteIcon cursor={'pointer'} width={20} />
                  </Popconfirm>
                </div>
              </div>
            </div>
          )
        })}

        <div className={"mt-5"}>
          <ImageUploader
            title='Attachments' name="attachments" multiple
            fileList={fileList} customRequest={fileUpload}
            beforeUpload={(_file, fileList) => {
              if (fileList.length > 0) {
                setFileList(fileList);
                return true
              }
              return false
            }}
            onRemove={(file) => {
              const index = fileList?.indexOf(file);
              const newFileList = fileList?.slice();
              newFileList?.splice(index!, 1);
              setFileList(newFileList);
            }}
          />
        </div>
      </Drawer>
    </>
  )
}
export default FilesDrawer;