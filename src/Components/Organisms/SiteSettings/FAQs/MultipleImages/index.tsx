import { FC, useState, useCallback, useEffect, useMemo } from 'react';
import { Button, Form, Upload, message, Typography as AntdTypography, Popconfirm } from 'antd';
import { CustomButton, CustomModal, CustomPhotoView } from '@atoms/';
import componentStyles from "./styles.module.scss";
import { RESOURCE_BASE_URL } from '@helpers/constants';
import { FAQModule } from '@modules/FAQs';

const { Paragraph } = AntdTypography;

interface MultipleImagesProps {
  openModal: boolean;
  onCancel: (e?: React.MouseEvent<HTMLElement>) => void;
  recordId: number;
}

type ImageTypes = {
  path: string;
  id: number;
  file: string;
}

const MultipleImages: FC<MultipleImagesProps> = ({ openModal, onCancel, recordId }) => {
  const [form] = Form.useForm();
  const [images, setImages] = useState<ImageTypes[]>([]);

  const module = useMemo(() => new FAQModule(), []);

  const onFinish = () => onCancel();

  const onImageDlt = async (id: number, idx: number) => {
    try {
      module.removeImages(id).then(() => {
        setImages((prv: any) => [
          ...prv.filter((_item: any, index: number) => index !== idx),
        ]);

        message.success('Image Deleted Successfully');
      }).catch((err) => {
        message.error(err?.response?.data?.message || 'Error Deleting Images');
      })
    } catch (err) {
      console.error('Error Deleting Images', err)
    }
  };

  const uploadImage = async (options: any) => {
    const { onSuccess, onError, file } = options;
    const fmData = new FormData();
    fmData.append("files[]", file);
    fmData.append("faqId", String(recordId));
    try {
      module.uploadImages(fmData).then((res) => {
        setImages((prv: any) => [...prv, res.data.data[0]]);
        onSuccess("ok");
      }).catch((err) => {
        onError({ err });
      })
    } catch (err) {
      onError({ err });
    }
  };

  const getImagesOnServer = useCallback(async () => {
    try {
      module.getAllImages(recordId).then((res) => {
        setImages(res.data.data);
      }).catch((err) => {
        message.error(err?.response?.data?.message || 'Error Fetching Images');
      })
    } catch (err) {
      console.error('Error Fetching Images', err)
    }
  }, [recordId, module]);

  useEffect(() => {
    if (openModal) {
      getImagesOnServer();
    }
  }, [openModal]);

  return (
    <CustomModal
      visible={openModal}
      closable={true}
      onCancel={onCancel}
      titleText={"Upload Images"}
      showFooter={false}
    >
      <Form onFinish={onFinish} form={form} className={componentStyles.form}>
        <div className={componentStyles.formItems}>
          <Form.Item name="images">
            <Upload.Dragger
              accept=".png,.jpg,.jpeg"
              className={componentStyles.dragger}
              multiple name="file" maxCount={20}
              customRequest={uploadImage}
              showUploadList={false}
            >
              <p className="ant-upload-hint">
                Drag image here or click to upload
              </p>
              <div className={componentStyles.numberOfUploads}>
                {`${images.length}/20`}
              </div>
            </Upload.Dragger>
          </Form.Item>
          <div className={componentStyles.uploadedImages}>
            <CustomPhotoView
              images={images.map((item) => `${RESOURCE_BASE_URL}${item.path}`)}
              style={{ borderRadius: 5, objectFit: 'cover', border: '1px solid #ddd' }}
              width={115} height={70} overlayVisible
              overlay={(photoIndex) => {
                const item = images[photoIndex];
                return (
                  <p className='mb-0 font-weight-bold'>{item?.file || "Untitled"}</p>
                )
              }}
              extra={(value) => {
                // get the file from the data array using the index from the key
                const item = images?.find((_item, index) => index === Number(value?.key?.split('-')[1]));
                const fileIndex = images.findIndex((_item, index) => index === Number(value?.key?.split('-')[1]));

                return (
                  <div className='d-flex flex-column justify-content-between align-items-center'>
                    <Paragraph
                      className='mb-0 px-1' style={{ width: 110 }}
                      ellipsis={{ rows: 1, expandable: true, symbol: 'more..' }}
                    >
                      {item?.file || "Untitled"}
                    </Paragraph>

                    <Popconfirm
                      title="Are you sure?" okText="Yes" cancelText="No"
                      onConfirm={() => onImageDlt(item?.id!, fileIndex)}
                    >
                      <Button
                        danger type='primary' size='small'
                        style={{ fontSize: 10, margin: '0 auto' }}
                      >
                        Remove
                      </Button>
                    </Popconfirm>
                  </div>
                )
              }}
            />
          </div>
        </div>
        <div className={componentStyles.footer}>
          <CustomButton size="normal" fontSize="sm" type="plain" onClick={onCancel}>
            Cancel
          </CustomButton>
          <CustomButton type="primary" size="normal" htmlType="submit">
            Done
          </CustomButton>
        </div>
      </Form>
    </CustomModal >
  );
}
export default MultipleImages;