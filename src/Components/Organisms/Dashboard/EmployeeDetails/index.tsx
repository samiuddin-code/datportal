import { UserModule } from "@modules/User";
import { UserPermissionsEnum } from "@modules/User/permissions";
import { UserDetailsType } from "@modules/User/types";
import Layout from "@templates/Layout";
import { RootState } from "Redux/store";
import { useFetchData } from "hooks";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Image, Tabs, TabsProps, Typography, message } from "antd";
import styles from "./style.module.scss";
import { RESOURCE_BASE_URL } from "@helpers/constants";
import { WhatsAppOutlined, PhoneOutlined, MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { capitalize, getPermissionSlugs, processCamelCaseStringToTitle } from "@helpers/common";
import { convertDate } from "@helpers/dateHandler";
import TokenService from "@services/tokenService";
import { Document, Page, pdfjs } from 'react-pdf';
import { BASE_URL } from "@services/axiosInstance";
import MyRequests from "./MyRequests";
import MyProjects from "./MyProjects";
import MyAllocatedResources from "./MyAllocatedResources";
import Security from "../AccountSettings/security";
import ManageNotifications from "../AccountSettings/manage-notifications";
import { EmployeeModal } from "../Employees/modal";
import { UserMetaKeys } from "@helpers/commonEnums";
import { ErrorCode404 } from "@atoms/ErrorCodes";
const { Text } = Typography;

const EmployeeDetails = () => {
  const employeeId = window?.location?.pathname?.split("/")[2];
  const user = TokenService.getUserData();
  const permissionSlug = getPermissionSlugs(UserPermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in UserPermissionsEnum]: boolean };
  const { updateUser } = permissions;
  pdfjs.GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  const access_token = TokenService.getLocalAccessToken();
  const tabs: TabsProps['items'] = [
    {
      key: '0',
      label: <a href="/employees">
        <ArrowLeftOutlined style={{ fontSize: 16 }} />
        Back
      </a>,
      disabled: true
    },
    {
      key: '1',
      label: <b>Requests</b>,
    },
    {
      key: '2',
      label: <b>Projects</b>,
    },
    {
      key: '3',
      label: <b>Allocated Resources</b>,
    },
    {
      key: '4',
      label: <b>Security</b>,
    },
    {
      key: '5',
      label: <b>Manage Notifications</b>,
    },

  ];
  const [activeTab, setActiveTab] = useState<string>('1');
  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'closed'>('all')
  const [currentEditType, setcurrentEditType] = useState<{
    recordId: number;
    openModal: boolean;
    form: string;
  }>({ recordId: 0, openModal: false, form: '1' });

  const onManageClick = (userId: number, currentForm?: string) => {
    if (updateUser === false) {
      message.error("You don't have permission to update this user");
      return;
    }
    setcurrentEditType({
      ...currentEditType,
      recordId: userId,
      openModal: true,
      form: currentForm ? currentForm : '1'
    });
  };
  const onCancelClick = () => {
    setcurrentEditType({
      ...currentEditType,
      openModal: !currentEditType.openModal,
      recordId: 0,
      form: '1'
    });
  };

  const module = useMemo(() => new UserModule(), []);
  const { data, onRefresh, loading } = useFetchData<UserDetailsType>({
    method: () => module.getRecordById(Number(employeeId)),
  });

  useEffect(() => {
    if (data) {
      onRefresh({ path: employeeId })
    }
  }, [employeeId])

  const componentsMap = {
    "1": <MyRequests activeFilter={activeFilter} userId={Number(employeeId)} />,
    "2": <MyProjects activeFilter={activeFilter} userId={Number(employeeId)} />,
    "3": <MyAllocatedResources onManageClick={() => onManageClick(data?.id || 0, '4')} userId={Number(employeeId)} />,
    "4": <Security />,
    "5": <ManageNotifications />
  }

  return (
    <Layout permissionSlug={permissionSlug} showSidebar={false}>
      {(data === null && !loading) && (
        <ErrorCode404
          mainMessage="Employee not found"
          subMessage="Please check the URL or contact your administrator"
        />
      )}

      {data && (
        <>
          <div className={styles.container}>
            <section className={styles.left}>
              <div className={styles.profileWrap}>
                <Image
                  width={80}
                  height={80}
                  src={`${RESOURCE_BASE_URL}${data?.profile}`}
                  preview={false}
                  rootClassName="object-fit-cover"
                  style={{ borderRadius: "100%" }}
                />
                <div className={styles.basicInfo}>
                  <p>{data?.firstName} {data?.lastName}</p>
                  <p>{data?.email}</p>
                  {data?.phone && <p>{data?.phoneCode} {data?.phone}</p>}
                  <p>{data?.designation}</p>
                  <p>{data?.Organization?.name}</p>
                </div>
                <div className={styles.links}>
                  <a
                    href={`https://wa.me/${data?.phoneCode || "971"}${data?.whatsapp || data?.phone}`}
                    target="_blank" rel="noreferrer"
                  >
                    <WhatsAppOutlined className={styles.linkIcon} />
                  </a>
                  <a href={`tel:${data?.phoneCode || "971"}${data?.phone}`}>
                    <PhoneOutlined className={styles.linkIcon} />
                  </a>
                  <a href={`mailto:${data?.email}`}>
                    <MailOutlined className={styles.linkIcon} />
                  </a>
                </div>
              </div>
              <div className={styles.aboutWrap + " infinite-scroll-wrap"}>
                <div>
                  <p>About</p>
                  <span onClick={() => onManageClick(data?.id || 0, '2')}>Manage</span>
                </div>
                <div className={styles.metaWrap}>
                  {Object.keys(UserMetaKeys).map((meta, index) => (
                    <div key={index} className={styles.meta}>
                      <p>{processCamelCaseStringToTitle(meta)}</p>
                      <p>{["dateOfBirth", "passportExpiryDate"].includes(data?.UserMeta?.find(item => item.key === meta)?.key || "")
                        ? convertDate(data?.UserMeta?.find(item => item.key === meta)?.value || "", "dd M,yy") : data?.UserMeta?.find(item => item.key === meta)?.value
                      }</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className={styles.center + " infinite-scroll-wrap"}>
              <div className={styles.backWrap}>
                <Tabs
                  defaultActiveKey={activeTab}
                  items={(Number(employeeId) === (user.id)) ? tabs : tabs.slice(0, 4)}
                  onChange={(key) => {
                    setActiveFilter('all');
                    setActiveTab(key);
                  }}
                />
              </div>
              {!["3", "4", "5"].includes(activeTab) && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div
                    onClick={() => setActiveFilter("all")}
                    style={{
                      backgroundColor: activeFilter === "all" ? "var(--color-dark-main)" : undefined,
                      color: activeFilter === "all" ? "var(--color-inactive)" : undefined
                    }}
                    className={styles.onlyMyTask}>
                    All
                  </div>
                  <div
                    onClick={() => setActiveFilter("open")}
                    style={{
                      backgroundColor: activeFilter === "open" ? "var(--color-dark-main)" : undefined,
                      color: activeFilter === "open" ? "var(--color-inactive)" : undefined
                    }}
                    className={styles.onlyMyTask}>
                    Open
                  </div>
                  <div
                    onClick={() => setActiveFilter("closed")}
                    style={{
                      backgroundColor: activeFilter === "closed" ? "var(--color-dark-main)" : undefined,
                      color: activeFilter === "closed" ? "var(--color-inactive)" : undefined
                    }}
                    className={styles.onlyMyTask}>
                    Closed
                  </div>
                </div>
              )}
              {componentsMap[activeTab as keyof typeof componentsMap]}
            </section>

            <section className={styles.right + " infinite-scroll-wrap"}>
              <div>
                <p>Documents</p>
                <span onClick={() => onManageClick(data?.id || 0, '3')}>Manage</span>
              </div>
              <div className={styles.resourcesWrap}>
                {data?.UserDocuments.map(resource => (
                  <div key={resource.id} className={styles.resourceWrap}>
                    {resource.mimeType.includes("image") ?
                      <Image
                        style={{ objectFit: 'cover', borderRadius: '0.25rem 0.25rem 0 0' }}
                        width={150}
                        height={100}
                        src={`${BASE_URL}resources/all/${resource.file}?authKey=${access_token}`} />

                      : <a
                        href={`${BASE_URL}resources/all/${resource?.file}?authKey=${access_token}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Document
                          file={`${BASE_URL}resources/all/${resource.file}?authKey=${access_token}`}
                        // onLoadSuccess={onDocumentLoadSuccess}
                        >
                          <Page renderTextLayer={false} pageNumber={1} />
                        </Document>
                      </a>}
                    <div style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', display: 'flex', flexDirection: 'column' }}>
                      <Text style={{ width: 125, fontSize: 'var(--font-size-sm)' }} strong ellipsis={true}>{capitalize(resource.documentType.replace("_", " "))}</Text>
                      <Text style={{ width: 125, fontSize: 'var(--font-size-xxs)', color: 'var(--color-light-500)' }} ellipsis={true}>{resource.title} - {convertDate(resource.addedDate, "dd M,yy")}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          {currentEditType.openModal && (
            <EmployeeModal
              record={currentEditType.recordId}
              type={"edit"}
              reloadTableData={() => {
                onRefresh()
                onCancelClick()
              }}
              onCancel={onCancelClick}
              openModal={currentEditType.openModal}
              permissions={permissions}
              currentForm={currentEditType.form}
            />
          )}
        </>
      )}
    </Layout>
  )
}
export default EmployeeDetails;