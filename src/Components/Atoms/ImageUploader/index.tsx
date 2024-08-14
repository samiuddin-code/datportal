import { FC, useState, useEffect, ReactNode } from "react";
import { Form, Upload, UploadFile, UploadProps } from "antd";

interface ImageUploaderProps extends UploadProps {
  name: string;
  title?: string
  required?: boolean
  label?: string
  customLabel?: ReactNode
}

const ImageUploader: FC<ImageUploaderProps> = (props) => {
  const {
    name, defaultFileList, title, required, disabled, accept,
    multiple = false, listType = "picture", label, customLabel,
    ...rest
  } = props;

  const uploadProps: UploadProps = {
    name: "file",
    listType: listType,
    multiple: multiple,
    beforeUpload: () => false,
    maxCount: multiple ? 100 : 1,
    accept: accept || "*",
    ...rest,
  };

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [showUploadList, setShowUploadList] = useState<any>({
    showPreviewIcon: true,
    showRemoveIcon: false,
  });

  useEffect(() => {
    defaultFileList && setFileList(defaultFileList);
  }, [defaultFileList]);

  const handleChange: UploadProps["onChange"] = (info) => {
    let newFileList = [...info.fileList];

    // 1. Limit the number of uploaded files
    // Only to show two recent uploaded files, and old ones will be replaced by the new
    if (!multiple) {
      newFileList = newFileList.slice(-2);
    }

    // 2. Read from response and show file link
    newFileList = newFileList.map((file) => {
      if (file.response) {
        // Component will show file.url as link
        file.url = file.response.url;
      }
      return file;
    });
    setFileList(newFileList);
    setShowUploadList({ ...showUploadList, showRemoveIcon: true });
  };

  const onRemove = () => {
    setTimeout(() => {
      defaultFileList && setFileList(defaultFileList);
      setShowUploadList({ ...showUploadList, showRemoveIcon: true });
    }, 100);
    return true;
  };

  return (
    <div>
      <p className="mb-0">
        {title} {required && <span className="color-red-yp">*</span>}
      </p>
      <Form.Item
        name={name}
        rules={[{ required: required, message: `Please add ${title}` }]}
      >
        <Upload.Dragger
          showUploadList={showUploadList} fileList={fileList}
          onChange={handleChange} onRemove={onRemove}
          disabled={disabled}
          {...uploadProps}
        >
          {customLabel || (
            <>
              <p className="ant-upload-drag-icon">
                <img src="/images/picture.svg" alt="" />
              </p>
              <p className="ant-upload-hint">
                {label || "Drag here or click to upload"}
              </p>
            </>
          )}
        </Upload.Dragger>
      </Form.Item>
    </div>
  );
};
export default ImageUploader;
