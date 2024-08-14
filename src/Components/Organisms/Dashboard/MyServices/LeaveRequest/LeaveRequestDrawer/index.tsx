import { Drawer, Form, Radio, message, Typography, Image } from "antd";
import { CustomButton, CustomInput } from "../../../../../Atoms";
import styles from "./styles.module.scss";
import { LeaveRequestStatus, ActionLeaveRequest, LeaveRequestEnum } from "@helpers/commonEnums";
import { useEffect, useState } from 'react';
import { useFetchData } from 'hooks';
import { convertDate, getDifferenceInDays } from '@helpers/dateHandler';
import { LeaveRequestDetailType } from '@modules/LeaveRequest/types';
import { LeaveRequestModule } from '@modules/LeaveRequest';
import { LeaveRequestPermissionsEnum } from '@modules/LeaveRequest/permissions';
import { BASE_URL } from "@services/axiosInstance";
import { Document, Page, pdfjs } from 'react-pdf';
import TokenService from '@services/tokenService';
import { UserModule } from "@modules/User";
import { UserTypes } from "@modules/User/types";
import { capitalize } from "@helpers/common";
import { APPLICATION_RESOURCE_BASE_URL } from "@helpers/constants";
import moment from "moment";
const { Text } = Typography;

interface PropTypes {
  permissions: { [key in LeaveRequestPermissionsEnum]: boolean };
  openDrawer: boolean;
  onClose: () => void;
  record: number;
  reloadTableData: (query?: any) => void
}

export const LeaveRequestDrawer = ({ openDrawer, onClose, record, permissions, reloadTableData }: PropTypes

) => {
  pdfjs.GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  const access_token = TokenService.getLocalAccessToken();
  const [actionBy, setActionBy] = useState<"manager" | "hr" | "employee" | "done" | "rejectedByHr">();
  const { readLeaveRequest, leaveRequestHRApproval, leaveRequestProjectManagerApproval } = permissions;
  const [user, setUser] = useState<UserTypes>();
  const [form] = Form.useForm();
  const [isLoading, setisLoading] = useState<boolean>(false);
  const module = new LeaveRequestModule();
  const userModule = new UserModule();

  const { data, onRefresh } = useFetchData<LeaveRequestDetailType>({
    method: () => module.getRecordById(record)
  });
  useEffect(() => {
    if (data?.AdminActions.length === 0 && data.status === 1) {
      setActionBy("employee")
    }
    else if (data?.AdminActions.length === 0) {
      setActionBy("manager")
    }
    else if (Number(data?.AdminActions.length) === 1) {
      setActionBy("hr")
    }
    else if (data?.AdminActions.length === 2 && data.status === 6) {
      setActionBy("rejectedByHr")
    }
    else if (Number(data?.AdminActions.length) >= 1) {
      setActionBy("done")
    }

    if (data?.requestById) {
      userModule.getRecordById(data?.requestById).then(res => {
        setUser(res.data.data);
      })
    }
  }, [data])

  const onFinish = (formValues: { comment: string, status: LeaveRequestDetailType["status"] }) => {
    setisLoading(true);
    if (leaveRequestHRApproval || leaveRequestProjectManagerApproval || readLeaveRequest) {
      //means employee action
      if (actionBy === "employee") {
        module.employeeActionLeaveRequest(record).then((res) => {
          reloadTableData();
          setisLoading(false);
          onRefresh();
          form.resetFields();
        }).catch((err) => {
          message.error(err?.message)
          setisLoading(false);
        });
      }
      //means manager action
      else if (actionBy === "manager") {
        module.projectManagerActionLeaveRequest({
          comment: formValues.comment,
          status: formValues.status,
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
      else if (actionBy === "hr") {
        module.hrActionLeaveRequest({
          comment: formValues.comment,
          status: formValues.status
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
          <div>LVE-{data?.id} - ({data?.status ? capitalize(LeaveRequestStatus[data?.status]?.status) : ""})</div>

          {(data?.status !== LeaveRequestEnum.rejected && data?.status !== LeaveRequestEnum.withdrawn && moment(new Date()).isBefore(data?.leaveFrom)) ?
            <CustomButton
              type="primary"
              size="normal"
              fontSize="sm"
              onClick={() => {
                module.withdrawLeaveRequest(record)
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
            </CustomButton> : null}
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
              <div><b>Name:</b>&nbsp;{`${data?.RequestBy?.firstName || ""} ${data?.RequestBy?.lastName || ""}`}</div>
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
            {/* Employee */}
            {(data?.status === LeaveRequestEnum.not_yet_submitted) ? <div className={styles.hrWrap}>
              <div className={styles.title}>Employee Actions</div>
              <div className={styles.hrInputs}>
                <b style={{ fontSize: "var(--font-size-sm)" }}>Leave dates</b>
                <div className={styles.dateWrap}>
                  <div className={styles.fromDate}>{convertDate(data?.leaveFrom || "", "dd MM,yy")}</div>
                  <div className={styles.fromDate}>to {convertDate(data?.leaveTo || "", "dd MM,yy")}</div>
                  <div className={styles.bold}>({getDifferenceInDays(data?.leaveFrom || "", data?.leaveTo || "") + 1} days)</div>
                </div>
              </div>
              <div className={styles.footerWrap} style={{ justifyContent: 'flex-end' }}>
                {(actionBy === "employee") ? <div className={styles.buttonWrap}>
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
                    Submit Request
                  </CustomButton>
                </div> : null}
              </div>
            </div> : null}

            {/* Project Manager */}
            {((data?.status !== LeaveRequestEnum.not_yet_submitted && data?.status !== LeaveRequestEnum.withdrawn) && actionBy === "manager") ? (
              <div className={styles.hrWrap}>
                <div className={styles.title}>Project Manager Actions</div>
                <div className={styles.hrInputs}>
                  <b style={{ fontSize: "var(--font-size-sm)" }}>Leave dates</b>
                  <div className={styles.dateWrap}>
                    <div className={styles.fromDate}>{convertDate(data?.leaveFrom || "", "dd MM,yy")}</div>
                    <div className={styles.fromDate}>to {convertDate(data?.leaveTo || "", "dd MM,yy")}</div>
                    <div className={styles.bold}>({getDifferenceInDays(data?.leaveFrom || "", data?.leaveTo || "") + 1} days)</div>
                  </div>

                  <div className={styles.actionsWrap}>
                    <br />
                    {leaveRequestProjectManagerApproval ? (
                      <Form.Item name={'status'} rules={[{ required: true, message: "Please select a status" }]}>
                        <Radio.Group options={ActionLeaveRequest} optionType='button' buttonStyle='solid' />
                      </Form.Item>
                    ) : (
                      "No action from Project Manager yet"
                    )}
                  </div>
                </div>
                <div className={styles.footerWrap}>
                  {leaveRequestProjectManagerApproval && (
                    <Form.Item name={'comment'} className={styles.commentWrap}>
                      <CustomInput
                        size="w100"
                        label={<b>Comment</b>}
                        type="textArea"
                        placeHolder="Enter comment"
                      />
                    </Form.Item>
                  )}
                  {!leaveRequestProjectManagerApproval && (
                    <div className={styles.priceText}>
                      <b style={{ fontSize: "var(--font-size-sm)" }}>Comment</b>
                      <div>{data?.AdminActions[0]?.comment}</div>
                    </div>
                  )}
                  {leaveRequestProjectManagerApproval && (
                    <div className={styles.buttonWrap}>
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
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* HR */}
            {((actionBy === "rejectedByHr") || ((data?.status !== LeaveRequestEnum.not_yet_submitted && data?.status !== LeaveRequestEnum.rejected && data?.status !== LeaveRequestEnum.withdrawn) && (actionBy !== "manager"))) ? (
              <div className={styles.hrWrap}>
                <div className={styles.title}>HR Department Actions</div>
                <div className={styles.hrInputs}>
                  <b style={{ fontSize: "var(--font-size-sm)" }}>Leave dates</b>
                  <div className={styles.dateWrap}>
                    <div className={styles.fromDate}>{convertDate(data?.leaveFrom || "", "dd MM,yy")}</div>
                    <div className={styles.fromDate}>to {convertDate(data?.leaveTo || "", "dd MM,yy")}</div>
                    <div className={styles.bold}>({getDifferenceInDays(data?.leaveFrom || "", data?.leaveTo || "") + 1} days)</div>
                  </div>

                  <div className={styles.actionsWrap}>
                    <br />
                    {(actionBy === "hr") ? (
                      leaveRequestHRApproval ? (
                        <Form.Item name={'status'} rules={[{ required: true, message: "Please select a status" }]}>
                          <Radio.Group options={ActionLeaveRequest} optionType='button' buttonStyle='solid' />
                        </Form.Item>
                      ) : "No action from HR yet"
                    ) : ((actionBy === "rejectedByHr" || actionBy === "done") && (
                      <div
                        style={{
                          textTransform: 'capitalize', lineHeight: '1rem',
                          // @ts-ignore
                          color: LeaveRequestStatus[data?.AdminActions[1]?.status]?.color
                        }}
                      >
                        {/* @ts-ignore */}
                        {LeaveRequestStatus[data?.AdminActions[1]?.status]?.status}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.footerWrap}>
                  {actionBy === "hr" && leaveRequestHRApproval && (
                    <div className={styles.buttonWrap}>
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
                    </div>
                  )}

                  {(actionBy === "hr") ? (
                    leaveRequestHRApproval && (
                      <Form.Item name={'comment'} className={styles.commentWrap}>
                        <CustomInput
                          size="w100"
                          label={<b>Comment</b>}
                          type="textArea"
                          placeHolder="Enter comment"
                        />
                      </Form.Item>
                    )
                  ) : ((actionBy === "done") && (
                    <div className={styles.priceText}>
                      <b style={{ fontSize: "var(--font-size-sm)" }}>Comment</b>
                      <div>{data?.AdminActions[1]?.comment}</div>
                    </div>
                  ))}
                  {actionBy === "hr" && leaveRequestHRApproval && (
                    <div className={styles.buttonWrap}>
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
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </Form>
      </Drawer>
    </section >
  )
}