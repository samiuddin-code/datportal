import { Drawer, Typography, Form, Radio, message, Image, Slider, Divider, Tag } from "antd";
import { CustomButton, CustomInput } from "@atoms/";
import styles from "./styles.module.scss";
import { CashAdvanceStatus, ActionFinance, ActionHR, CashAdvanceEnum, marks } from "@helpers/commonEnums";
import { useEffect, useState } from 'react';
import { useFetchData } from 'hooks';
import { convertDate } from '@helpers/dateHandler';
import { CashAdvanceDetailType } from '@modules/CashAdvance/types';
import { CashAdvanceModule } from '@modules/CashAdvance';
import { CashAdvancePermissionsEnum } from '@modules/CashAdvance/permissions';
import { Document, Page, pdfjs } from 'react-pdf';
import { BASE_URL } from "@services/axiosInstance";
import TokenService from '@services/tokenService';
import { APPLICATION_RESOURCE_BASE_URL } from "@helpers/constants";
const { Text } = Typography;

interface PropTypes {
  permissions: { [key in CashAdvancePermissionsEnum]: boolean };
  openDrawer: boolean;
  onClose: () => void;
  record: number;
  reloadTableData: (query?: any) => void
}

export const CashAdvanceDrawer = ({ openDrawer, onClose, record, permissions, reloadTableData }: PropTypes) => {
  pdfjs.GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  const access_token = TokenService.getLocalAccessToken();
  const { updateCashAdvance, cashAdvanceHRApproval, cashAdvanceFinanceApproval } = permissions;
  // const user = TokenService.getUserData();
  const [form] = Form.useForm();
  const [isLoading, setisLoading] = useState<boolean>(false);
  const module = new CashAdvanceModule()
  const { data, onRefresh } = useFetchData<CashAdvanceDetailType>({
    method: () => module.getRecordById(record)
  });

  useEffect(() => {
    form.setFieldValue("approvedAmount", data?.requestAmount)
  }, [data])

  const onFinish = (formValues: { comment: string, status: CashAdvanceDetailType["status"], approvedAmount?: number, numberOfInstallments: number }) => {
    setisLoading(true);

    if (updateCashAdvance || cashAdvanceHRApproval || cashAdvanceFinanceApproval) {
      //means hr action
      if (formValues.approvedAmount) {
        module.hrActionCashAdvance({
          comment: formValues.comment,
          status: formValues.status,
          approvedAmount: Number(formValues.approvedAmount)
        }, record).then((res) => {
          reloadTableData();
          setisLoading(false);
          onRefresh();
          form.resetFields();
        }).catch((err) => {
          message.error(err?.message)
          setisLoading(false);
        });
      }
      else {
        module.financeActionCashAdvance({
          comment: formValues.comment,
          status: formValues.status,
          numberOfInstallments: formValues?.numberOfInstallments ? formValues?.numberOfInstallments : 3
        }, record).then((res) => {
          reloadTableData();
          setisLoading(false);
          onRefresh();
          form.resetFields();
        }).catch((err) => {
          message.error(err?.message)
          setisLoading(false);
        });
      }

    } else {
      message.error("You don't have permission to create this record");
      setisLoading(false);
    }
  };

  return (
    <section className={styles.container}>
      <Drawer
        title={<div className="d-flex align-center justify-space-between">
          <div>CSH-{data?.id} - ({data?.status ? CashAdvanceStatus[data?.status]?.status : ""})</div>
          {(data?.status !== CashAdvanceEnum.rejected && data?.status !== CashAdvanceEnum.withdrawn && data?.status !== CashAdvanceEnum.paid_and_closed) ? <div>
            <CustomButton
              type="primary"
              size="normal"
              fontSize="sm"
              onClick={() => {
                module.withdrawCashAdvance(record)
                  .then(() => {
                    reloadTableData();
                    onRefresh();
                    form.resetFields();
                    onClose()
                  }).catch((err) => {
                    message.error(err?.message)
                  });
              }}>
              Withdraw Request
            </CustomButton>
          </div> : null}
        </div>}
        placement="right"
        size={"large"}
        width={window.innerWidth > 768 ? "60%" : "100%"}
        onClose={onClose}
        open={openDrawer}
      >
        <Form className={styles.form} onFinish={onFinish} form={form}>
          <div className={styles.drawerContainer}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <b>Name:</b>&nbsp;{`${data?.RequestBy?.firstName || ""} ${data?.RequestBy?.lastName || ""}`}
              </div>
              <div><b>Date:</b>&nbsp;{convertDate(data?.addedDate || "", "MM dd,yy")}</div>
            </div>
            <div >
              <b>Purpose:</b>
              <div style={{ fontSize: 'var(--font-size-normal)' }}>{data?.purpose}</div>
            </div>
            {(data?.Attachments?.length) ? <div className={styles.attachmentsWrap}>
              {data?.Attachments.map((attachment, index) => (
                <div key={index} className={styles.attachment}>
                  <div className={styles.resourceWrap}>
                    {attachment?.mimeType?.includes("pdf") ?
                      <a href={`${APPLICATION_RESOURCE_BASE_URL}${attachment?.file}`}
                        target="_blank"
                        rel="noreferrer">
                        <Document
                          file={`${BASE_URL}resources/all/${attachment.file}?authKey=${access_token}`}
                        // onLoadSuccess={onDocumentLoadSuccess}
                        >
                          <Page renderTextLayer={false} pageNumber={1} />
                        </Document>
                      </a> :
                      <Image
                        style={{ objectFit: 'cover', borderRadius: '0.25rem 0.25rem 0 0' }}
                        width={150}
                        height={100}
                        src={`${BASE_URL}resources/all/${attachment.file}?authKey=${access_token}`} />}
                    <div style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', display: 'flex', flexDirection: 'column' }}>
                      <Text style={{ width: 125, fontSize: 'var(--font-size-xs)' }} strong ellipsis={true}>{attachment?.title}</Text>
                    </div>
                  </div></div>))}
            </div> : null}

            {/* HR */}

            {data?.status !== CashAdvanceEnum.withdrawn && <div className={styles.hrWrap}>
              <div className={styles.title}>HR Department Actions</div>
              <div className={styles.hrInputs}>
                {!data?.AdminActions.find(action => action.Department.slug === "hr") ?
                  (cashAdvanceHRApproval ? <div>
                    <b style={{ fontSize: "var(--font-size-sm)" }}>Amount</b>
                    <Form.Item name={'approvedAmount'} rules={[{ required: true, message: "Please enter approved amount." }]}>
                      <CustomInput
                        prefix={"AED"}
                        size="w100"
                        asterisk
                        placeHolder="Enter approved amount" />
                    </Form.Item>
                  </div> : "No action from HR yet") : <div>
                    <div className={styles.actionsWrap}>
                      <b style={{ fontSize: "var(--font-size-sm)" }}>Amount</b>
                      <div style={{
                        textDecoration: data?.approvedAmount !== data?.requestAmount ? 'line-through' : 'unset'
                      }}>AED {data?.requestAmount}</div>
                      {(data?.approvedAmount !== data.requestAmount) ?
                        <div className={styles.approvedAmount}>AED {data?.approvedAmount}</div> : null}
                    </div>
                  </div>}

                <div className={styles.actionsWrap}>
                  <br />
                  {!data?.AdminActions.find(action => action.Department.slug === "hr") ?
                    (cashAdvanceHRApproval && <Form.Item name={'status'} rules={[{ required: true, message: "Please select a status" }]}>
                      <Radio.Group options={ActionHR} optionType='button' buttonStyle='solid' />
                    </Form.Item>)
                    : <div style={{ textTransform: 'capitalize', lineHeight: '1rem' }} >
                      {/* @ts-ignore */}
                      {CashAdvanceStatus[data?.AdminActions?.find(action => action.Department.slug === "hr")?.status]?.status}
                    </div>}
                </div>
              </div>
              <div className={styles.footerWrap}>
                {!data?.AdminActions.find(action => action.Department.slug === "hr") ?
                  (cashAdvanceHRApproval && <Form.Item name={'comment'} style={{ minWidth: '60%', margin: 0 }}>
                    <CustomInput
                      size="w100"
                      label={<b>Comment</b>}
                      type="textArea"
                      placeHolder="Enter comment" />
                  </Form.Item>) : <div className={styles.priceText}>
                    <b style={{ fontSize: "var(--font-size-sm)" }}>Comment</b>
                    <div>{data?.AdminActions.find(action => action.Department.slug === "hr")?.comment}</div>
                  </div>}
                {!data?.AdminActions.find(action => action.Department.slug === "hr") ?
                  (cashAdvanceHRApproval && <div className={styles.buttonWrap}>
                    <CustomButton size="normal" fontSize="sm" onClick={onClose} type="plain">
                      Cancel
                    </CustomButton>
                    <CustomButton
                      type="primary"
                      size="normal"
                      fontSize="sm"
                      htmlType="submit"
                      loading={isLoading}
                    >
                      Save
                    </CustomButton>
                  </div>) : null}
              </div>
            </div>}

            {/* FINACE */}

            {(data?.status !== CashAdvanceEnum.withdrawn && data?.AdminActions.find(action => action.Department.slug === "hr") && data.status !== CashAdvanceEnum.rejected) ?
              <div className={styles.financeWrap}>
                <div className={styles.title}>Finance Department Actions</div>
                <div className={styles.actionsWrap}>
                  {/* <b style={{ fontSize: "var(--font-size-sm)" }}>Action</b> */}
                  {!data?.AdminActions.find(action => action.Department.slug === "finance") ?
                    (cashAdvanceFinanceApproval ? <Form.Item name={'status'} rules={[{ required: true, message: "Please select a status" }]}>
                      <Radio.Group options={ActionFinance} optionType='button' buttonStyle='solid' />
                    </Form.Item> : "No action from Finance yet")
                    : <div style={{ textTransform: 'capitalize', lineHeight: '1rem' }} >
                      {/* @ts-ignore */}
                      {CashAdvanceStatus[data?.AdminActions?.find(action => action.Department.slug === "finance")?.status]?.status}
                    </div>}
                  {!data?.AdminActions.find(action => action.Department.slug === "finance") ?
                    (cashAdvanceFinanceApproval && <div>
                      <b style={{ fontSize: "var(--font-size-sm)" }}>Number of installments</b>
                      <Form.Item name="numberOfInstallments">
                        <Slider marks={marks} defaultValue={3} min={1} max={24} />
                      </Form.Item>
                    </div>) : <div>
                      <Divider />
                      <b>Installments:</b>
                      {data?.Installments?.map(item => (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <p style={{ marginBottom: '0.25rem' }}>{convertDate(item.monthYear, "dd MM,yy")?.slice(2)} - {data.installmentAmount} AED</p>
                          <p>{item.isPaid ? <Tag color="green">Paid on {convertDate(item.paidDate, "dd MM,yy")}</Tag> : <Tag>To be paid</Tag>}</p>
                        </div>
                      ))}
                    </div>}
                </div>
                <div className={styles.footerWrap}>
                  {!data?.AdminActions.find(action => action.Department.slug === "finance") ?
                    (cashAdvanceFinanceApproval && <Form.Item name={'comment'} style={{ minWidth: '60%', margin: 0 }} >
                      <CustomInput
                        size="w100"
                        label={<b>Comment</b>}
                        type="textArea"
                        placeHolder="Enter comment" />
                    </Form.Item>) : <div className={styles.priceText}>
                      <b style={{ fontSize: "var(--font-size-sm)" }}>Comment</b>
                      <div>{data?.AdminActions.find(action => action.Department.slug === "finance")?.comment}</div>
                    </div>}
                  {!data?.AdminActions.find(action => action.Department.slug === "finance") ?
                    (cashAdvanceFinanceApproval && <div className={styles.buttonWrap}>
                      <CustomButton size="normal" fontSize="sm" onClick={onClose} type="plain">
                        Cancel
                      </CustomButton>
                      <CustomButton
                        type="primary"
                        size="normal"
                        fontSize="sm"
                        htmlType="submit"
                        loading={isLoading}
                      >
                        Save
                      </CustomButton>
                    </div>) : null}
                </div>
              </div> : null}

          </div>
        </Form>
      </Drawer>
    </section >
  )
}