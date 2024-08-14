import { useState, type FC } from 'react';
import { CustomSelect, ImageUploader } from '@atoms/';
import { Form, Progress, UploadProps, message } from 'antd';
import { AxiosProgressEvent } from 'axios';
import api from "@services/axiosInstance";
import { ProjectDocumentsTypes } from '@helpers/commonEnums';
import { ProjectTypes } from '@modules/Project/types';
import { ProjectPermissionsEnum } from '@modules/Project/permissions';
import styles from './styles.module.scss';

interface FilesUploaderProps {
  data: {
    project: {
      data: ProjectTypes
      onRefresh: <QueryType = any>(query?: QueryType) => void
    }
    projectFiles: {
      onRefresh: <QueryType = any>(query?: QueryType) => void
    }
  }
  permissions: { [key in ProjectPermissionsEnum]: boolean }
}

const FilesUploader: FC<FilesUploaderProps> = ({ data, permissions }) => {
  const { project, projectFiles } = data;

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [fileList, setFileList] = useState<UploadProps["fileList"]>([]);
  const [upload, setUpload] = useState<{
    status: "active" | "success" | "exception" | "normal";
    progress: { [key: string]: number };
  }>({ status: "normal", progress: {} });
  const [documentType, setDocumentType] = useState<keyof typeof ProjectDocumentsTypes>("other")

  /** Upload file to server */
  const fileUpload: UploadProps['customRequest'] = async (options) => {
    const { onSuccess, onError, file, filename } = options;
    const fmData = new FormData();
    const config = {
      headers: { "content-type": "multipart/form-data" },
    };

    fmData.append("files[]", file);
    // fmData.append("title", filename!);
    fmData.append("documentType", documentType);
    fmData.append("projectId", project.data.id.toString());

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
      if (permissions.updateProject === true) {
        await api.post("project/uploadProjectFiles", fmData, {
          onUploadProgress,
          ...config,
        });

        onSuccess && onSuccess({ status: 200 });
        setUpload({ status: "success", progress: { [filename!]: 100 } });
        setFileList([]);
        projectFiles.onRefresh({ projectId: project.data.id })

        //after 3 seconds, reset the upload status
        setTimeout(() => {
          setUpload({ status: "normal", progress: {} });
        }, 3000);
      } else {
        throw new Error("You do not have permission to upload files")
      }
    } catch (err: any) {
      let errorMessage = err.response?.data?.message || err.message || "Something went wrong"

      if (typeof errorMessage !== 'string') errorMessage = "Something went wrong"

      if (errorMessage === "You do not have permission to upload files") {
        messageApi.open({
          key: "permission",
          type: "error",
          duration: 5,
          content: errorMessage,
        });
      } else {
        messageApi.open({
          key: "error",
          type: "error",
          content: errorMessage,
        });
      }

      setUpload({ status: "exception", progress: { [filename!]: 0 } })
      onError && onError(new Error('Upload failed'))
    }
  };

  return (
    <>
      {contextHolder}

      {upload.progress && Object.entries(upload.progress).map(([key, value]) => (
        <Progress
          key={key}
          percent={value}
          status={upload.status}
          showInfo={false}
        />
      ))}

      <div className={styles.uploadSection}>
        <CustomSelect
          className={styles.uploadSection_content_select}
          placeholder="Select Document Type"
          defaultValue={documentType}
          onChange={(value) => setDocumentType(value as keyof typeof ProjectDocumentsTypes)}
          options={Object.entries(ProjectDocumentsTypes).map(([key, value]) => ({
            label: value,
            value: key
          }))}
          bordered={false} clearIcon={false}
          style={{ width: 120 }}
        />
        <Form form={form} layout="vertical">
          <ImageUploader
            name="file" multiple listType='picture-card' style={{ marginTop: 10 }}
            className={styles.uploadSection_content_uploader}
            fileList={fileList} customRequest={fileUpload}
            beforeUpload={(_file, fileList) => {
              if (fileList.length > 0) {
                setFileList(fileList);
                return true
              }
              return false
            }}
            customLabel={(
              <div style={{ marginTop: -20 }}>
                <p className="ant-upload-drag-icon mb-0">
                  <img src="/images/picture.svg" alt="" />
                </p>
                <p className="ant-upload-hint">
                  Drag here or click to upload
                </p>
              </div>
            )}
          />
        </Form>
      </div>
    </>
  );
}
export default FilesUploader;