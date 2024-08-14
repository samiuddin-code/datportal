
import { Form, message, Popconfirm, Select, Empty, Table, DatePicker, Tag, Button } from "antd";
import {
    CustomInput,
    CustomErrorAlert,
    CustomButton,
} from "../../../../Atoms";
import styles from "../../../Common/styles.module.scss";
import { useEffect, useCallback, useMemo, useState } from "react";
import { HandleServerErrors } from "../../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../../helpers";
import { UserModule } from "../../../../../Modules/User";
import { SalaryType, UserResponseObject } from "../../../../../Modules/User/types";
import { PropTypes } from "../../../Common/common-types";
import Skeletons from "@organisms/Skeletons";
import { convertDate } from "@helpers/dateHandler";
import moment from "moment";
import { LeaveRequestModule } from "@modules/LeaveRequest";
import { Cell, Label, Legend, Pie, PieChart } from "recharts";
import { LeaveCreditModule } from "@modules/LeaveCredit";
const { MonthPicker } = DatePicker;

export const LeavesReport = ({
    type,
    record,
    openModal,
    onCancel,
    manageAllUser,
    reloadTableData }: {
        record: number,
        manageAllUser: boolean,
    } & PropTypes) => {
    const COLORS = ['var(--color-primary-main)', 'var(--color-primary-main-200)'];

    const [form] = Form.useForm();
    const module = useMemo(() => new LeaveRequestModule(), []);
    const leaveCreditModule = useMemo(() => new LeaveCreditModule(), []);
    const [recordData, setRecordData] = useState<Partial<Omit<UserResponseObject, "data"> & {
        data: {
            name: string,
            value?: number | null
        }[]
    }>>();
    const [showTable, setShowTable] = useState(false);

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
        module.getLeavesRecordById(record).then((res) => {
            if (res.data && res.data.data) {
                const _temp = [
                    {
                        name: "paidLeaves",
                        value: Number(res.data.data.paidLeaves)
                    },
                    {
                        name: "remainingLeaves",
                        value: Number(res.data.data.remainingLeaves)
                    },
                    {
                        name: "totalLeaveCredits",
                        value: Number(res.data.data.totalLeaveCredits)
                    },
                    {
                        name: "unpaidLeaves",
                        value: Number(res.data.data.unpaidLeaves)
                    },
                ];
                setRecordData({ ...res.data, loading: false, data: _temp });
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
        if (manageAllUser === true) {
            leaveCreditModule.createRecord({ userId: record, daysCount: formValues.daysCount, note: formValues.note })
                .then((res) => {
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

    // console.log(recordData?.data, 'asd')
    return (
        <>
            {recordData?.loading ? (
                <Skeletons items={10} />) : (
                (manageAllUser && <Form className={styles.form} onFinish={onFinish} form={form}>
                    {recordData?.error && (
                        <CustomErrorAlert
                            description={recordData?.error}
                            isClosable
                            onClose={handleAlertClose}
                        />
                    )}

                    <div>
                        <Form.Item
                            name="daysCount"
                            rules={[{ required: true, message: "Please add days count." }]}
                        >
                            <CustomInput size="w100" label={"Days Count"} asterisk type="number" />
                        </Form.Item>
                        <Form.Item
                            name="note"
                            rules={[{ required: true, message: "Please add note.", }]}
                        >
                            <CustomInput size="w100" label={"Note"} asterisk type="text" />
                        </Form.Item>


                        <div style={{ alignSelf: 'center' }}>

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
                    </div>
                </Form>)
            )}

            <div>

                <PieChart width={200} height={250}>
                    <Pie
                        data={recordData?.data?.slice(0, 2)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        // label={renderCustomizedLabel}
                        outerRadius={90}
                        innerRadius={70}
                        fill="#8884d8"
                        dataKey="value" >
                        {recordData?.data?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        <Label value={(recordData?.data ? recordData?.data[0].value : 0) + " of " + (recordData?.data ? recordData?.data[2].value : 0) + " used"} fontSize={16} position="center" />
                    </Pie>

                    {/* <Legend formatter={(val) => val +'123'} /> */}
                </PieChart>
                {recordData?.data?.slice(1).map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-dark-main)' }}>
                        <p>{item.name.replace(/([A-Z])/g, " $1").charAt(0).toUpperCase() + item.name.replace(/([A-Z])/g, " $1").slice(1)}:</p>
                        <p>{item.value} days</p>
                    </div>
                ))}
            </div>

        </>)

}