import { FC, useState, useCallback, useEffect, useMemo } from 'react';
import { Button, Form, Upload, message, Typography as AntdTypography } from 'antd';
import { CustomButton, CustomModal } from '../../../../Atoms';
import componentStyles from "./styles.module.scss";
import { RESOURCE_BASE_URL } from '../../../../../helpers/constants';
import { BlogsModule } from '../../../../../Modules/Blogs';

const { Paragraph } = AntdTypography;

interface MultipleImagesProps {
    openModal: boolean;
    onCancel: (e?: React.MouseEvent<HTMLElement>) => void;
    recordId: number;
}

const MultipleImages: FC<MultipleImagesProps> = ({ openModal, onCancel, recordId }) => {
    const [form] = Form.useForm();
    const [images, setImages] = useState<any>([]);

    const module = useMemo(() => new BlogsModule(), []);

    const onFinish = () => onCancel();

    const onImageDlt = async (id: number, idx: number) => {
        try {
            module.removeImages(id).then((res) => {
                setImages((prv: any) => [
                    ...prv.filter((item: any, index: number) => index !== idx),
                ]);

                message.success('Image Deleted Successfully');
            }).catch((err) => {
                message.error(err?.response?.data?.message || 'Error Deleting Images');
            })
        } catch (err) {
            console.error('Error Deleting Images', err)
        }
    };

    const getImageCard = (item: { path: string; id: number, file: string }, index: number) => {
        return (
            <div className={componentStyles.imageWrap} key={`edit-images-card-${item.id}`}>
                <img
                    src={`${RESOURCE_BASE_URL}${item.path}`}
                    alt={item.path}
                />
                <Paragraph
                    copyable={{ text: `${RESOURCE_BASE_URL}${item.path}` }}
                    ellipsis={{ rows: 1, expandable: true, symbol: 'more' }}
                >
                    {item.file}
                </Paragraph>
                <span>
                    <Button onClick={() => onImageDlt(item.id, index)}>Remove</Button>
                </span>
            </div>
        );
    };

    const uploadImage = async (options: any) => {
        const { onSuccess, onError, file } = options;
        const fmData = new FormData();
        fmData.append("file", file);
        fmData.append("blogId", String(recordId));
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

    // useEffect(() => {
    //     form.setFields([{
    //         name: "images",
    //         errors: images.length < 1 ? ["Please Upload at least 1 Image!"] : [],
    //     }]);
    // }, [form, images]);

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
                            multiple
                            name="file"
                            maxCount={20}
                            customRequest={uploadImage}
                            showUploadList={false}
                        >
                            <p className="ant-upload-hint">
                                Drag image here or click to upload
                            </p>
                            <div
                                className={componentStyles.numberOfUploads}
                            >
                                {`${images.length}/20`}
                            </div>
                        </Upload.Dragger>
                    </Form.Item>
                    <div className={componentStyles.uploadedImages}>
                        {images?.map((
                            item: { path: string; id: number, file: string },
                            index: number
                        ) => (
                            getImageCard(item, index)
                        ))}
                    </div>
                </div>
                <div className={componentStyles.footer}>
                    <CustomButton
                        size="normal"
                        fontSize="sm"
                        onClick={onCancel}
                        type="plain"
                    >
                        Cancel
                    </CustomButton>
                    <CustomButton
                        type="primary"
                        size="normal"
                        htmlType="submit"
                    >
                        Done
                    </CustomButton>
                </div>
            </Form>
        </CustomModal>
    );
}
export default MultipleImages;