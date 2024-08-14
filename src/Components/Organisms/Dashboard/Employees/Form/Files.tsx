
import { Form, message, Image, Upload, Button, TabsProps, Popconfirm } from "antd";
import {
    CustomInput,
    CustomErrorAlert,
    CustomButton,
    ImageUploader,
    CustomSelect,
    EditableInput,
} from "../../../../Atoms";
import styles from "../../../Common/styles.module.scss";
import { useEffect, useCallback, useMemo, useState, Dispatch, SetStateAction } from "react";
import { HandleServerErrors } from "../../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../../helpers";
import { UserModule } from "../../../../../Modules/User";
import { UserDocumentTypes, UserResponseObject } from "../../../../../Modules/User/types";
import { PropTypes } from "../../../Common/common-types";
import Skeletons from "@organisms/Skeletons";
import { UserDocumentsTypes } from "@helpers/commonEnums";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { Document, Page, pdfjs } from 'react-pdf';
import { BASE_URL } from "@services/axiosInstance";
import TokenService from "@services/tokenService";
import styles2 from "./styles.module.scss";

export const Files = ({
    type,
    record,
    openModal,
    onCancel,
    updateUser,
    reloadTableData }: {
        record: number,
        updateUser: boolean,
    } & PropTypes) => {
    const [form] = Form.useForm();
    const module = useMemo(() => new UserModule(), []);
    const [recordData, setRecordData] = useState<Partial<UserResponseObject>>();
    const [isUpdate, setIsUpdate] = useState<{ title: string, documentType: string, show: boolean, documentId: number }[]>([])
    pdfjs.GlobalWorkerOptions.workerSrc =
        `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
    const access_token = TokenService.getLocalAccessToken();

    const handleErrors = (err: any) => {
        const error = errorHandler(err);
        if (typeof error.message == "string") {
            setRecordData({ ...recordData, error: error.message });
        } else {
            let errData = HandleServerErrors(error.message, []);
            form.setFields(errData);
            setRecordData({ ...recordData, error: "" });
        }
    };

    const handleAlertClose = () => {
        setRecordData({ ...recordData, error: "" });
    };

    // Get data for the selected record from the api and set it in the form
    const getDataBySlug = useCallback(() => {
        module.getRecordById(record).then((res) => {
            if (res.data && res.data.data) {
                setRecordData({ ...res.data, loading: false });
                const _temp: { title: string, documentType: string, show: boolean, documentId: number }[] = [];
                res.data.data.UserDocuments.forEach((item: UserDocumentTypes) => {
                    _temp.push({
                        title: item.title,
                        documentId: item.id,
                        documentType: item.documentType,
                        show: false
                    })
                })
                setIsUpdate(_temp)
            }

        }).catch((err) => {
            handleErrors(err);
        });

    }, [form, record, module]);


    useEffect(() => {
        if (type === "edit") {
            setRecordData({ loading: true });
            getDataBySlug();
        } else {
            // fetch the countries
            form.resetFields();
        }
    }, [openModal, type, form, getDataBySlug]);

    const onFinish = (formValues: any) => {
        setRecordData({ ...recordData, buttonLoading: true });
        const formData = new FormData();
        const excludeFields = ["file"];
        Object.entries(formValues).forEach((ele: any) => {
            if (!excludeFields.includes(ele[0])) {
                formData.append(ele[0], ele[1]);
            }
        });

        if (
            formValues["file"] &&
            typeof formValues["file"] !== "string" &&
            formValues["file"]["fileList"].length > 0
        ) {
            formData.append("file", formValues["file"]["fileList"][0]["originFileObj"]);
        }
        formData.append('userId', record.toString())
        if (updateUser === true) {
            module.uploadUserDocuments(formData).then((res) => {
                // reloadTableData();
                getDataBySlug();
                form.resetFields();
                setRecordData((prev) => ({ ...prev, buttonLoading: false }));
            }).catch((err) => {
                handleErrors(err);
                setRecordData((prev) => ({ ...prev, buttonLoading: false }));
            });
        } else {
            setRecordData((prev) => ({ ...prev, buttonLoading: false }));
            message.error("You don't have permission to update this user");
        }
    };

    return (
        <>
            {recordData?.loading ? (
                <Skeletons items={10} />) : (
                <Form className={styles.form} onFinish={onFinish} form={form}>
                    {recordData?.error && (
                        <CustomErrorAlert
                            description={recordData?.error}
                            isClosable
                            onClose={handleAlertClose}
                        />
                    )}

                    <div>
                        <Form.Item
                            name="title"
                            rules={[{ required: true, message: "Please add title.", }]}
                        >
                            <CustomInput size="w100" label={"Title"} asterisk type="text" />
                        </Form.Item>
                        <Form.Item name="documentType" rules={[{ required: true, message: "Please add document type.", }]}>
                            <CustomSelect
                                label={"Document Type"}
                                options={UserDocumentsTypes}
                                placeholder="Select Document Type"
                                asterisk
                            />
                        </Form.Item>

                    </div>
                    <div>
                        <Form.Item name="file" rules={[{ required: true, message: "Please add file.", }]}>
                            <Upload multiple={false} beforeUpload={() => false}>
                                <Button icon={<UploadOutlined />}>Click to Upload</Button>
                            </Upload>
                        </Form.Item>
                    </div>


                    <div className={styles.footer} style={{ marginBottom: '1rem' }}>
                        <CustomButton size="normal" fontSize="sm" onClick={onCancel} type="plain">
                            Cancel
                        </CustomButton>
                        <CustomButton
                            type="primary"
                            size="normal"
                            fontSize="sm"
                            htmlType="submit"
                            loading={recordData?.buttonLoading}
                        >
                            Submit
                        </CustomButton>
                    </div>
                </Form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recordData?.data?.UserDocuments.map((file: UserDocumentTypes, index: number) => (
                    <div className={styles.resourceWrap}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className={styles2.resourceWrap}>
                                {file.documentType.includes("pdf") ?
                                    <a
                                        href={`${BASE_URL}resources/task-resources/${file?.file}?authKey=${access_token}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Document
                                            file={`${BASE_URL}resources/task-resources/${file.file}?authKey=${access_token}`}
                                        // onLoadSuccess={onDocumentLoadSuccess}
                                        >
                                            <Page renderTextLayer={false} pageNumber={1} />
                                        </Document>
                                    </a> :
                                    <Image
                                        className={styles2.image}
                                        width={120}
                                        height={100}
                                        src={`${BASE_URL}resources/task-resources/${file?.file}?authKey=${access_token}`} />}
                                <Popconfirm
                                    title="Are you sure you want to delete this document?"
                                    onConfirm={() => {
                                        module.deleteUserDocument(file.id)
                                            .then(() => {
                                                getDataBySlug();
                                            })
                                            .catch((err) => {
                                                message.error("Something bad happened")
                                            })
                                    }}
                                    okText="Yes"
                                    cancelText="No"
                                    overlayInnerStyle={{
                                        borderRadius: '0.25rem'
                                    }}
                                >
                                    <div className={styles2.deleteWrap}>
                                        <DeleteOutlined style={{ fontSize: 14, color: 'var(--color-light)' }} />
                                    </div>
                                </Popconfirm>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {isUpdate.find((item) => item.documentId === file.id)?.show ?
                                    <EditableInput
                                        onBlur={() => {
                                            const _temp = [...isUpdate];
                                            _temp[index] = { ...isUpdate[index], title: recordData?.data?.UserDocuments[index]?.title, show: false }
                                            setIsUpdate(_temp)
                                        }}
                                        onChange={(e: any) => {
                                            const _temp = [...isUpdate];
                                            _temp[index] = { ...isUpdate[index], title: e.target.value }
                                            setIsUpdate(_temp)
                                        }}
                                        style={{ fontSize: 'var(--font-size-normal)' }}
                                        onMouseDown={() => {
                                            module.updateUserDocument({
                                                title: isUpdate[index].title,
                                                documentId: isUpdate[index].documentId,
                                                documentType: isUpdate[index].documentType
                                            }).then((res) => {
                                                if (res) {
                                                    getDataBySlug();
                                                }
                                            })
                                        }}
                                        defaultValue={file?.title} />
                                    :
                                    <div
                                        onClick={() => {
                                            const _temp = [...isUpdate];
                                            _temp[index] = { ...isUpdate[index], show: true }
                                            setIsUpdate(_temp)
                                        }}
                                        className={styles2.Tasktitle}>
                                        <b>{file?.title}</b>
                                    </div>}
                                <div style={{ minWidth: '12rem' }}>
                                    <CustomSelect
                                        value={isUpdate[index].documentType}
                                        options={UserDocumentsTypes}
                                        placeholder="Select Document Type"
                                        onChange={(value) => module.updateUserDocument({
                                            title: isUpdate[index].title,
                                            documentId: isUpdate[index].documentId,
                                            documentType: value
                                        }).then((res) => {
                                            if (res) {
                                                getDataBySlug();
                                            }
                                        })}
                                    /></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </>)

}