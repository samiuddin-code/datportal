import { Form, message } from "antd";
import { useMemo, useState } from "react";
import { SaveSearchesModule } from "../../../Modules/SaveSearches";
import { SaveSearchTypes, SaveSearchTypesResponseObject } from "../../../Modules/SaveSearches/types";
import { CustomModal, CustomInput, CustomButton, HandleServerErrors, CustomErrorAlert } from "../../Atoms";
import { errorHandler } from '../../../helpers'

interface SaveSearchModalProps {
    openModal: boolean;
    onCancel: () => void;
    data: any
}

const SaveSearchModal = ({ openModal, onCancel, data }: SaveSearchModalProps) => {
    const [form] = Form.useForm();
    const saveSearchModule = useMemo(() => new SaveSearchesModule(), []);
    const [recordData, setRecordData] = useState<Partial<SaveSearchTypesResponseObject>>()

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

    const onFinish = (values: SaveSearchTypes) => {
        // remove filters or searches with empty values from data
        if (data) {
            Object.keys(data).forEach((key) => {
                if (data[key] === "" || data[key]?.length === 0) {
                    delete data[key];
                }
            });
        }

        values.savedSearchesFilters = data

        saveSearchModule.createRecord(values).then((res) => {
            message.success(res.data?.message)
            onCancel();
            setRecordData((prev) => ({ ...prev, buttonLoading: false }));
        }).catch((err) => {
            handleErrors(err);
            setRecordData((prev) => ({ ...prev, buttonLoading: false }));
        });
    }

    return (
        <CustomModal
            visible={openModal}
            closable={true}
            onCancel={onCancel}
            titleText={"Save Your Search"}
            showFooter={false}
        >
            <img
                src='/images/house-img-save-search.svg'
                alt='Save Search Image'
                width={146}
                height={116}
                className='d-flex mx-auto'
            />

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
                        <CustomInput
                            size="w100"
                            label={"Title"}
                            asterisk type="text"
                            placeHolder="e.g. Offices for rent in Rigga Dubai"
                        />
                    </Form.Item>
                </div>

                <div className="d-flex justify-end">
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
        </CustomModal>
    );
}

export default SaveSearchModal;
