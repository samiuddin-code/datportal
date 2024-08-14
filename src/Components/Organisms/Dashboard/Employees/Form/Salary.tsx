
import { Form, message, Table, DatePicker, Tag, Button } from "antd";
import {
  CustomInput,
  CustomErrorAlert,
  CustomButton,
  CustomEmpty,
} from "../../../../Atoms";
import styles from "../../../Common/styles.module.scss";
import { useEffect, useCallback, useMemo, useState, FC } from "react";
import { HandleServerErrors } from "../../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../../helpers";
import { UserModule } from "../../../../../Modules/User";
import { SalaryType, UserResponseObject } from "../../../../../Modules/User/types";
import { PropTypes } from "../../../Common/common-types";
import Skeletons from "@organisms/Skeletons";
import { convertDate } from "@helpers/dateHandler";
import moment from "moment";
const { MonthPicker } = DatePicker;

type SalaryProps = {
  record: number,
  manageAllUser: boolean,
} & PropTypes;

export const Salary: FC<SalaryProps> = ({
  type,
  record,
  openModal,
  manageAllUser,
}) => {
  const [form] = Form.useForm();
  const module = useMemo(() => new UserModule(), []);
  const [recordData, setRecordData] = useState<Partial<UserResponseObject>>();
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
    module.getRecordById(record).then((res) => {
      if (res.data && res.data.data) {
        setRecordData({ ...res.data, loading: false });
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
      module.updateSalary({ amount: formValues.amount, startDate: (moment(formValues.startDate._d.toISOString()).set('D', 1)).toISOString() }, record)
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

  const columns = [
    {
      title: "S.No",
      dataIndex: "index",
      key: "index",
      render: (text: string, record: any, index: number) => index + 1,
      width: "5%",
    },
    {
      title: <div><b>Start Date</b> {manageAllUser ? <Button onClick={() => setShowTable(!showTable)} size="small">Promote</Button> : null}</div>,
      dataIndex: 'startDate',
      key: 'startDate',
      render: (text: any, record: SalaryType) => <div>{convertDate(record.startDate, "MM dd,yy")}</div>
    },
    {
      title: "End Date",
      dataIndex: 'endDate',
      key: 'endDate',
      render: (text: any, record: SalaryType) => <div>{convertDate(record.endDate, "MM dd,yy")}</div>
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text: string, record: SalaryType) => <div>{text} AED&nbsp;&nbsp;&nbsp;{record.isActive ? <Tag color="green">Current</Tag> : null}</div>
    },
  ];

  return (
    <>
      {manageAllUser && (
        <Form className={styles.form} onFinish={onFinish} form={form}>
          {recordData?.error && (
            <CustomErrorAlert
              description={recordData?.error}
              isClosable
              onClose={handleAlertClose}
            />
          )}

          {((recordData?.data?.Salary?.length === 0) || showTable) ? (
            <div>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-dark-main)' }}>
                  Start Date <span className='color-red-yp'>*</span>
                </label>
                <Form.Item
                  name="startDate"
                  rules={[{ required: true, message: "Please add start date.", }]}
                >
                  <MonthPicker
                    style={{ borderRadius: '0.25rem', borderWidth: 2, width: '100%', borderColor: 'var(--color-border)' }} />
                </Form.Item>
              </div>

              <Form.Item
                name="amount"
                rules={[{ required: true, message: "Please add amount." }]}
              >
                <CustomInput size="w100" label={"Amount"} asterisk type="number" />
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
          ) : null}
        </Form>
      )}

      {recordData?.loading ? (
        <Skeletons items={2} />
      ) : (
        <>
          {recordData?.data?.Salary.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Table columns={columns} dataSource={recordData?.data?.Salary} pagination={false} />
            </div>
          ) : <CustomEmpty description="No Salary Data found" />}
        </>
      )}
    </>
  )
}