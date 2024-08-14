import { Form, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ShortcutModule } from "../../../Modules/Shortcut";
import { ShortcutTypes, ShortcutTypesResponseObject } from "../../../Modules/Shortcut/types";
import { CustomModal, CustomInput, CustomButton, HandleServerErrors, CustomErrorAlert } from "../../Atoms";
import { errorHandler } from '../../../helpers'
import Skeletons from "../Skeletons";
import { validLink } from "../../../helpers/common";

interface ShortcutModalProps {
    openModal: boolean;
    onCancel: () => void;
    type: "new" | "edit";
    reloadData: () => void;
    recordId: number;
}

const ShortcutModal = ({ openModal, onCancel, reloadData, type, recordId }: ShortcutModalProps) => {
    const [form] = Form.useForm();
    const shortcutModule = useMemo(() => new ShortcutModule(), []);
    const [recordData, setRecordData] = useState<Partial<ShortcutTypesResponseObject>>()

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

    const onFinish = (values: ShortcutTypes) => {
        const link = validLink(values.link);

        if (type === "edit") {
            shortcutModule
                .updateRecord({ ...values, link: link }, recordData?.data.id)
                .then((res) => {
                    message.success(res.data?.message)
                    reloadData();
                    onCancel();
                    setRecordData((prev) => ({ ...prev, buttonLoading: false }));
                })
                .catch((err) => {
                    handleErrors(err);
                    setRecordData((prev) => ({ ...prev, buttonLoading: false }));
                });
        } else {
            shortcutModule
                .createRecord({ ...values, link: link! })
                .then((res) => {
                    message.success(res.data?.message)
                    reloadData();
                    onCancel();
                    setRecordData((prev) => ({ ...prev, buttonLoading: false }));
                })
                .catch((err) => {
                    handleErrors(err);
                    setRecordData((prev) => ({ ...prev, buttonLoading: false }));
                });
        }
    }

    const removeShortCut = () => {
        shortcutModule
            .deleteRecord(recordId)
            .then((res) => {
                message.success(res.data?.message)
                reloadData();
                onCancel();
                setRecordData((prev) => ({ ...prev, buttonLoading: false }));
            })
            .catch((err) => {
                handleErrors(err);
                setRecordData((prev) => ({ ...prev, buttonLoading: false }));
            });
    }

    const getDataBySlug = useCallback(() => {
        shortcutModule
            .getRecordById(recordId)
            .then((res) => {
                if (res.data && res.data.data) {
                    form.setFieldsValue({
                        translations: res.data.data.localization,
                        ...res.data.data,
                        isPublished: res.data.data.isPublished,
                    });
                    setRecordData({ ...res.data, loading: false });
                }
            })
            .catch((err) => {
                handleErrors(err);
            });
    }, [form, recordId, shortcutModule]);

    useEffect(() => {
        if (type === "edit") {
            setRecordData({ loading: true });
            getDataBySlug();
        } else {
            form.resetFields();
        }
    }, [openModal, type, form, getDataBySlug]);

    return (
        <CustomModal
            visible={openModal}
            closable={true}
            onCancel={onCancel}
            titleText={type === "edit" ? "Edit Shortcut" : "Add New Shortcut"}
            showFooter={false}
            descriptionText='Add a link to a frequently used resource, like a web page.'
        >
            <img src='/images/shortcut-img.svg' alt='Shortcut Image' width={146} height={116} className='d-flex mx-auto' />
            {recordData?.loading ? (
                <Skeletons items={2} fullWidth />
            ) : (
                <Form onFinish={onFinish} form={form}>
                    {recordData?.error && (
                        <CustomErrorAlert
                            description={recordData?.error}
                            isClosable
                            onClose={handleAlertClose}
                        />
                    )}
                    <div>
                        <Form.Item name="title" rules={[{ required: true, message: "Please add a title" }]}>
                            <CustomInput size="w100" label={"Title"} asterisk type="text" placeHolder="e.g. Yallah Property Website" />
                        </Form.Item>
                    </div>
                    <div>
                        <Form.Item name="link" rules={[{ required: true, message: "Please enter a valid URL" }]}>
                            <CustomInput size="w100" label={"Link"} asterisk type="url" placeHolder="e.g. https://yallahproperty.com" />
                        </Form.Item>
                    </div>

                    <div className="d-flex justify-end">
                        {type === 'edit' && (
                            <CustomButton size="normal" fontSize="sm" onClick={removeShortCut} type="danger">
                                Remove shortcut
                            </CustomButton>
                        )}
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

        </CustomModal>
    );
}

export default ShortcutModal;
