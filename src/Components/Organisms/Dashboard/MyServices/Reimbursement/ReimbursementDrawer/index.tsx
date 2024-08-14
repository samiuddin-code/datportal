import { Document, Page, pdfjs } from 'react-pdf';
import { Drawer, Typography, Image, Form, Radio, message } from "antd";
import { CustomButton, CustomInput } from "@atoms/";
import styles from "./styles.module.scss";
import { ActionFinance, ReimbursementStatus, ActionHR, ReimbursementEnum } from "@helpers/commonEnums";
import { useEffect, useState } from 'react';
import { ReimbursementModule } from '@modules/Reimbursement';
import { useFetchData } from 'hooks';
import {
  ReimbursementDetailType, ReimbursementReceipt, financeActionReimbursement, hrActionReimbursement
} from '@modules/Reimbursement/types';
import { BASE_URL } from '@services/axiosInstance';
import TokenService from '@services/tokenService';
import { convertDate } from '@helpers/dateHandler';
import { ReimbursementPermissionsEnum } from '@modules/Reimbursement/permissions';
import { APPLICATION_RESOURCE_BASE_URL } from '@helpers/constants';
const { Text } = Typography;

interface PropTypes {
  permissions: { [key in ReimbursementPermissionsEnum]: boolean };
  openDrawer: boolean;
  onClose: () => void;
  record: number;
  reloadTableData: (query?: any) => void
}

export const ReimbursementDrawer = (props: PropTypes) => {
  const { openDrawer, onClose, record, permissions, reloadTableData } = props;
  const { reimbursementHRApproval, reimbursementFinanceApproval } = permissions;
  const user = TokenService.getUserData();
  const [form] = Form.useForm();
  pdfjs.GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  const access_token = TokenService.getLocalAccessToken();
  const [isLoading, setisLoading] = useState<boolean>(false);
  const module = new ReimbursementModule()
  const { data, onRefresh } = useFetchData<ReimbursementDetailType>({
    method: () => module.getRecordById(record)
  });

  useEffect(() => {
    const _temp: any = { comment: "", reimbursementReceipts: [] }
    data?.ReimbursementReceipt.forEach((receipt) => {
      _temp.reimbursementReceipts.push({
        ...receipt,
        approvedAmount: receipt.claimedAmount
      })
    })
    form.setFieldsValue(_temp)
  }, [data])

  const onFinish = (formValues: { comment: string, reimbursementReceipts: ReimbursementReceipt[], status?: financeActionReimbursement["status"] }) => {

    setisLoading(true);
    const _temp: Partial<hrActionReimbursement> = { comment: formValues.comment, reimbursementReceipts: [] };
    if (!formValues.status) {
      formValues?.reimbursementReceipts?.forEach(receipt => {
        _temp["reimbursementReceipts"]?.push({
          receiptId: receipt.id,
          approvedAmount: receipt.approvedAmount,
          status: receipt.status,
          comment: receipt.comment
        })
      })
    }

    if (reimbursementHRApproval || reimbursementFinanceApproval) {
      //means finance action
      if (formValues.status) {
        module.financeActionReimbursement({ comment: formValues.comment, status: formValues?.status }, record).then(() => {
          reloadTableData();
          setisLoading(false);
          onRefresh()
        }).catch(() => {
          message.error("Something went wrong")
          setisLoading(false);
        });
      }
      else {
        module.hrActionReimbursement(_temp, record).then(() => {
          reloadTableData();
          setisLoading(false);
          onRefresh()
        }).catch(() => {
          message.error("Something went wrong")
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
        title={`RMB-${data?.id} - (${data?.status ? ReimbursementStatus[data?.status]?.status : ""})`}
        placement="right" size={"large"}
        width={window.innerWidth > 768 ? "60%" : "100%"}
        onClose={onClose} open={openDrawer}
      >
        <Form className={styles.form} onFinish={onFinish} form={form}>
          <div className={styles.drawerContainer}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><b>Name:</b>&nbsp;{`${data?.RequestBy?.firstName || ""} ${data?.RequestBy?.lastName || ""}`}</div>
              <div><b>Date:</b>&nbsp;{convertDate(data?.addedDate || "", "MM dd,yy")}</div>
            </div>
            <div >
              <b>Purpose:</b>
              <div style={{ fontSize: 'var(--font-size-normal)' }}>{data?.purpose}</div>
            </div>

            {/* HR */}

            {data?.status !== ReimbursementEnum.withdrawn && <div className={styles.hrWrap}>
              {(data?.ReimbursementReceipt) ?
                <Form.List name="reimbursementReceipts" initialValue={data?.ReimbursementReceipt} >
                  {(fields, _, { errors }) => (
                    <>
                      <div className={styles.title}>HR Department Actions</div>
                      <div className={styles.attachmentsWrap}>
                        {fields.map((_receipt, index) => (
                          <div key={data?.ReimbursementReceipt[index].id} className={styles.attachment}>
                            <div className={styles.resourceWrap}>
                              {data?.ReimbursementReceipt[index].file.includes("pdf") ?
                                <a
                                  href={`${APPLICATION_RESOURCE_BASE_URL}${data?.ReimbursementReceipt[index]?.file}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Document
                                    file={`${BASE_URL}resources/all/${data?.ReimbursementReceipt[index].file}?authKey=${access_token}`}
                                  // onLoadSuccess={onDocumentLoadSuccess}
                                  >
                                    <Page renderTextLayer={false} pageNumber={1} />
                                  </Document>
                                </a> :
                                <Image
                                  style={{ objectFit: 'cover', borderRadius: '0.25rem 0.25rem 0 0' }}
                                  width={150}
                                  height={100}
                                  src={`${BASE_URL}resources/all/${data?.ReimbursementReceipt[index].file}?authKey=${access_token}`} />}
                              <div style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', display: 'flex', flexDirection: 'column' }}>
                                <Text style={{ width: 125, fontSize: 'var(--font-size-xs)' }} strong ellipsis={true}>{data?.ReimbursementReceipt[index]?.title}</Text>
                              </div>
                            </div>
                            <div>{!data?.AdminActions.find(action => action.Department.slug === "hr") ?
                              <div>
                                {reimbursementHRApproval ? <Form.Item
                                  style={{ minWidth: '80%' }}
                                  name={[fields[index]?.name, 'approvedAmount']}
                                  rules={[{ required: true, message: "Please add a amount", type: "number" }]}>
                                  <CustomInput
                                    prefix={"AED"}
                                    defaultValue={data?.ReimbursementReceipt[index]?.claimedAmount}
                                    size="w100"
                                    label={<b>Amount</b>}
                                    asterisk
                                    type="number"
                                    placeHolder="Enter amount" />
                                </Form.Item> : "No action from HR yet"}
                              </div>
                              :
                              <div className={styles.priceText}>
                                <b style={{ fontSize: "var(--font-size-sm)" }}>Amount</b>
                                <div
                                  style={{
                                    textDecoration: data?.ReimbursementReceipt[index].approvedAmount !== data?.ReimbursementReceipt[index].claimedAmount ? 'line-through' : 'unset'
                                  }}>AED {data?.ReimbursementReceipt[index].claimedAmount}</div>
                                {(data?.ReimbursementReceipt[index].approvedAmount !== data.ReimbursementReceipt[index].claimedAmount) ?
                                  <div className={styles.approvedAmount}>AED {data?.ReimbursementReceipt[index].approvedAmount}</div> : null}
                              </div>}
                            </div>
                            <div className={styles.buttonWrap}>
                              <br />
                              {!data?.AdminActions.find(action => action.Department.slug === "hr") ?
                                (reimbursementHRApproval && <Form.Item name={[fields[index]?.name, 'status']} rules={[{ required: true, message: "Please select a status" }]}>
                                  <Radio.Group options={ActionHR} optionType='button' buttonStyle='solid' />
                                </Form.Item>)
                                : <div style={{ textTransform: 'capitalize' }} >{ReimbursementStatus[data?.ReimbursementReceipt[index].status].status}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                      <Form.ErrorList errors={errors} />
                    </>)}
                </Form.List> : null}
              <div className={styles.footerWrap} style={(reimbursementHRApproval ? { borderTop: '1px solid var(--color-border)' } : undefined)}>
                {!data?.AdminActions.find(action => action.Department.slug === "hr") ?
                  (reimbursementHRApproval && <Form.Item name={'comment'} style={{ minWidth: '60%', margin: 0 }} >
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
                  (reimbursementHRApproval && <div className={styles.buttonWrap}>
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

            {(data?.status !== ReimbursementEnum.withdrawn && data?.AdminActions.find(action => action.Department.slug === "hr")) ?
              <div className={styles.financeWrap}>
                <div className={styles.title}>Finance Department Actions</div>
                <div className={styles.actionsWrap}>
                  {/* <b style={{ fontSize: "var(--font-size-sm)" }}>Action</b> */}
                  {!data?.AdminActions.find(action => action.Department.slug === "finance") ?
                    (reimbursementFinanceApproval ? <Form.Item name={'status'} rules={[{ required: true, message: "Please select a status" }]}>
                      <Radio.Group options={ActionFinance} optionType='button' buttonStyle='solid' />
                    </Form.Item> : "No action from Finance yet")
                    : <div style={{ textTransform: 'capitalize', lineHeight: '1rem' }} >
                      {/* @ts-ignore */}
                      {ReimbursementStatus[data?.AdminActions?.find(action => action.Department.slug === "finance").status].status}
                    </div>}
                </div>
                <div className={styles.footerWrap}>
                  {!data?.AdminActions.find(action => action.Department.slug === "finance") ?
                    (reimbursementFinanceApproval &&
                      <Form.Item name={'comment'} style={{ minWidth: '60%', margin: 0 }}>
                        <CustomInput
                          size="w100"
                          label={<b>Comment</b>}
                          type="textArea"
                          placeHolder="Enter comment" />
                      </Form.Item>)
                    : <div className={styles.priceText}>
                      <b style={{ fontSize: "var(--font-size-sm)" }}>Comment</b>
                      <div>{data?.AdminActions.find(action => action.Department.slug === "finance")?.comment}</div>
                    </div>}
                  {!data?.AdminActions.find(action => action.Department.slug === "finance") ?
                    (reimbursementFinanceApproval && <div className={styles.buttonWrap}>
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