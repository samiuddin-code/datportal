import { Drawer, Form, Radio, message, Image, Typography, Select, Empty } from "antd";
import { CustomButton, CustomInput } from "@atoms/";
import styles from "./styles.module.scss";
import { CarReservationRequestStatus, ActionHRCarReservation, CarReservationEnum } from "@helpers/commonEnums";
import { useState } from 'react';
import { useFetchData } from 'hooks';
import { convertDate } from '@helpers/dateHandler';
import { CarReservationDetailType } from '@modules/CarReservation/types';
import { CarReservationModule } from '@modules/CarReservation';
import { CarReservationPermissionsEnum } from '@modules/CarReservation/permissions';
import { Document, Page, pdfjs } from 'react-pdf';
import { BASE_URL } from "@services/axiosInstance";
import TokenService from '@services/tokenService';
import { APPLICATION_RESOURCE_BASE_URL } from "@helpers/constants";
import moment from "moment";
import { CompanyAssetType } from "@modules/CompanyAsset/types";
import { CompanyAssetModule } from "@modules/CompanyAsset";
const { Text } = Typography;

interface PropTypes {
  permissions: { [key in CarReservationPermissionsEnum]: boolean };
  openDrawer: boolean;
  onClose: () => void;
  record: number;
  reloadTableData: (query?: any) => void
}

export const CarReservationDrawer = ({ openDrawer, onClose, record, permissions, reloadTableData }: PropTypes

) => {
  pdfjs.GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  // const user = TokenService.getUserData();
  const [form] = Form.useForm();
  const [isLoading, setisLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const module = new CarReservationModule()
  const { data, onRefresh } = useFetchData<CarReservationDetailType>({
    method: () => module.getRecordById(record)
  });
  const access_token = TokenService.getLocalAccessToken();
  const { updatecarReservationRequest, carReservationRequestHRApproval } = permissions;

  const onFinish = (formValues: { comment: string, status: CarReservationDetailType["status"], companyCarId: number }) => {
    setisLoading(true);
    if (updatecarReservationRequest === true) {
      module.hrActionCarReservation({
        companyCarId: formValues.companyCarId,
        comment: formValues.comment,
        status: formValues.status
      }, record).then(() => {
        reloadTableData();
        setisLoading(false);
        onRefresh();
        form.resetFields();
      }).catch((err) => {
        message.error(err?.response?.data?.message)
        setisLoading(false);
      });
    }
    else {
      message.error("You don't have permission to update this record");
      setisLoading(false);
    }
  };

  //company cars
  const assetModule = new CompanyAssetModule();
  const { data: companyCars } = useFetchData<CompanyAssetType[]>({
    method: assetModule.getCars
  });

  const checkAvailabilityOfCar = (companyCarId: number) => {
    setErrorMessage("");
    module.checkAvailability({
      companyCarId: companyCarId,
      fromDate: data?.fromDate.toString() || "",
      toDate: data?.toDate.toString() || ""
    }).then(res => {
      if (res.data.data.isAvailable) {
        return
      }
      else {
        setErrorMessage("The car is already booked for these dates")
      }
    }).catch(() => {
      message.error("Something went wrong")
    })
  }

  return (
    <section className={styles.container}>
      <Drawer
        title={`CRR-${data?.id} - (${data?.status ? CarReservationRequestStatus[data?.status]?.status : ""})`}
        placement="right" size={"large"}
        width={window.innerWidth > 768 ? "60%" : "100%"}
        onClose={onClose} open={openDrawer}
      >
        <Form className={styles.form} onFinish={onFinish} form={form}>
          <div className={styles.drawerContainer}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <b>Name:</b>&nbsp;{`${data?.RequestBy?.firstName || ""} ${data?.RequestBy?.lastName || ""}`}
              </div>
              <div>
                <b>Date:</b>&nbsp;{convertDate(data?.addedDate || "", "MM dd,yy")}
              </div>
            </div>
            <div >
              <b >Purpose:</b>
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
            {(data?.status !== CarReservationEnum.withdrawn) && <div className={styles.hrWrap}>
              <div className={styles.title}>HR Department Actions</div>
              <div className={styles.hrInputs}>
                <b style={{ fontSize: "var(--font-size-sm)" }}>Reservation date</b>
                <div className={styles.dateWrap}>
                  <div className={styles.fromDate}>{moment(data?.fromDate).format("dddd") + ", " + convertDate(data?.fromDate || "", "dd MM,yy")}</div>
                  <div className={styles.fromDate}>(From {moment(data?.fromDate).format("LT")}</div>
                  <div className={styles.fromDate}>to {moment(data?.toDate).format("LT")})</div>
                  {/* <div className={styles.bold}>({getDifferenceInDays(data?.fromDate || "", data?.toDate || "") + 1} days)</div> */}
                </div>

                <div className={styles.actionsWrap}>
                  <br />
                  {!data?.AdminActions.find(action => action.Department.slug === "hr") ?
                    (carReservationRequestHRApproval ?
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                        <Form.Item
                          name="companyCarId"
                          rules={[
                            { required: true, message: "Please select a car" },
                          ]}
                        >
                          <b className={"font-size-sm color-dark-main"}>
                            Company car
                          </b>

                          <Select
                            allowClear
                            style={{ width: "100%" }}
                            // defaultValue={recordData?.data?.companyCarId}
                            placeholder="Search for the car"
                            className="selectAntdCustom"
                            onChange={(value) => {
                              form.setFieldsValue({ companyCarId: value })
                              checkAvailabilityOfCar(value)
                            }}
                            showSearch
                            onSearch={() => { }}
                            optionFilterProp="label"
                            options={companyCars?.map((item) => {
                              return {
                                label: item.assetName,
                                value: item.id,
                              }
                            })}
                            notFoundContent={
                              <Empty
                                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                                imageStyle={{
                                  height: 100,
                                }}
                                description={
                                  <span>
                                    No data found, Please search for the car
                                  </span>
                                }
                              />
                            }
                          />
                        </Form.Item>
                        <Form.Item name={'status'} rules={[{ required: true, message: "Please select a status" }]}>
                          <Radio.Group options={ActionHRCarReservation} optionType='button' buttonStyle='solid' />
                        </Form.Item>
                      </div>
                      : "No action from HR yet")
                    : <div style={{ textTransform: 'capitalize', lineHeight: '1rem' }} >
                      {/* @ts-ignore */}
                      {CarReservationRequestStatus[data?.AdminActions[0]?.status]?.status}
                    </div>}
                  <div style={{ color: 'var(--color-red-yp)', fontSize: 'var(--font-size-xs)' }}>{errorMessage}</div>
                </div>
              </div>
              <div className={styles.footerWrap}>
                {!data?.AdminActions.find(action => action.Department.slug === "hr") ?
                  (carReservationRequestHRApproval && <Form.Item name={'comment'} style={{ minWidth: '60%', margin: 0 }}>
                    <CustomInput
                      size="w100"
                      label={<b>Comment</b>}
                      type="textArea"
                      autoSize={{ minRows: 2 }}
                      placeHolder="Enter comment" />
                  </Form.Item>) : <div className={styles.priceText}>
                    <b style={{ fontSize: "var(--font-size-sm)" }}>Comment</b>
                    <div>{data?.AdminActions[0]?.comment}</div>
                  </div>}
                {!data?.AdminActions.find(action => action.Department.slug === "hr") ?
                  (carReservationRequestHRApproval && <div className={styles.buttonWrap}>
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


          </div>
        </Form>
      </Drawer>
    </section >
  )
}