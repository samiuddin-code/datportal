import { Form, Rate, message } from "antd";
import {
    CustomInput,
    CustomModal,
    CustomErrorAlert,
    CustomButton,
    ImageUploader,
} from "../../../Atoms";
import styles from "../../Common/styles.module.scss";
import { useEffect, useState } from "react";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { FeedbackModule } from "@modules/Feedback";
import { FeedbackResponseObject } from "@modules/Feedback/types";
import { StarFilled, MehOutlined, SmileOutlined } from '@ant-design/icons';

interface FeedbackModalProps {
    openModal: boolean;
    onCancel: () => void
}

export const FeedbackModal = (props: FeedbackModalProps) => {
    const { openModal, onCancel } = props;
    const [form] = Form.useForm();
    const module = new FeedbackModule();
    const [recordData, setRecordData] = useState<Partial<FeedbackResponseObject>>();
    const customIcons: Record<number, React.ReactNode> = {
        1: <StarFilled style={{ fontSize: 56 }} />,
        2: <StarFilled style={{ fontSize: 56 }} />,
        3: <StarFilled style={{ fontSize: 56 }} />,
        4: <StarFilled style={{ fontSize: 56 }} />,
        5: <StarFilled style={{ fontSize: 56 }} />,
    };


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
    useEffect(() => {
        form.resetFields();
    }, [openModal])


    const onFinish = (formValues: any) => {
        setRecordData({ ...recordData, buttonLoading: true });
        const formData = new FormData();
        const excludeFields = ["files"];

        Object.entries(formValues).forEach((ele: any) => {
            if (!excludeFields.includes(ele[0])) {
                formData.append(ele[0], ele[1]);
            }
        });

        if (
            formValues["files"] &&
            typeof formValues["files"] !== "string" &&
            formValues["files"]["fileList"].length > 0
        ) {
            formData.append("files", formValues["files"]["fileList"][0]["originFileObj"]);
        }
        module.createRecord(formData).then((res) => {
            onCancel();
            setRecordData((prev) => ({ ...prev, buttonLoading: false }));
            message.success("Feedback shared successfully")
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
            titleText={"We'd Love To Hear Your Portal Experience"}
            showFooter={false}
        >
            <Form className={styles.form} onFinish={onFinish} form={form}>
                {recordData?.error && (
                    <CustomErrorAlert
                        description={recordData?.error}
                        isClosable
                        onClose={handleAlertClose}
                    />
                )}
                <div >
                    <Form.Item name="rating" rules={[{ required: true, message: "Please select a rating" }]} >
                        <Rate
                            tooltips={[
                                "Difficult",
                                "Challenging",
                                "Okay",
                                "Smooth",
                                "Effortless",
                            ]}
                            style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }} character={({ index }: any) => customIcons[index + 1]} />
                    </Form.Item>
                </div>
                <div>
                    <Form.Item name="comment" >
                        <CustomInput autoSize={{ minRows: 4 }} size="w100" label={"How has your experience been"} type="textArea" placeHolder="Enter details, you can also share any URLs" />
                    </Form.Item>
                </div>

                <div>
                    <ImageUploader name="files" required={false} />
                </div>
                <div className="d-flex justify-end mt-4">
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
                        Submit Feedback
                    </CustomButton>
                </div>
            </Form>
        </CustomModal>
    );
};
