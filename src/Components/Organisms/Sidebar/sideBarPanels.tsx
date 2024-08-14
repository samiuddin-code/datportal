import { FC, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { Collapse } from "antd";
import { Accordian } from "@atoms/Collapse";
import Typography from "@atoms/Headings";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { isNavLinkActive, isNavLinkActiveWithParams } from "@helpers/common";
import { ProjectQueryTypes } from "@modules/Project/types";
import { HelpIcon } from "@icons/";
import styles from "./styles.module.scss";
import TokenService from "@services/tokenService";
import { useNavSidebar } from "context";
import { organizationDrop, projectsDrop, requestsDrop } from "./data";

type AccordianTextTypes = {
  src: string;
  text: string;
  params: string;
  to: string
}

type SideBarPanelsProps = {
  onGetProjects?: (query?: Partial<ProjectQueryTypes>) => void
}

const SideBarPanels: FC<SideBarPanelsProps> = (props) => {
  const { onGetProjects } = props;
  const user = TokenService.getUserData();
  const location = useLocation();
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const { closeOnMobileLink } = useNavSidebar()

  const organizationPermission = useMemo(() => {
    const {
      readAccount, readTaxRate, createProduct, createBrandingTheme, readPublicHoliday
    } = userPermissions

    return (readAccount || readTaxRate || createProduct || createBrandingTheme || readPublicHoliday)
  }, [userPermissions])

  const getLink = (item: AccordianTextTypes): string => {
    if (item.params) {
      return `${item.to}?${item.params}`
    }
    return item.to
  }

  const getAccordianText = (item: AccordianTextTypes, name?: string) => (
    <Link
      className={`${styles.textWithIcon} ${isNavLinkActiveWithParams(item.to, item.params ? `?${item.params}` : "") ? styles.active : ""}`}
      key={item.text}
      to={getLink(item)}
      onClick={() => {
        const { params } = item;

        switch (name) {
          case "projects": {
            // Get Projects Data 
            const query: Partial<ProjectQueryTypes> = {
              isClosed: params === "isClosed=true" ? true : params === "isClosed=false" ? false : undefined,
            }
            onGetProjects && onGetProjects(query)
            break;
          }
        }

        closeOnMobileLink()
      }}
    >
      <div />
      {item.src ? <img src={item.src} alt="" /> : null}
      <span>{item.text}</span>
    </Link>
  );

  const renderLinkWithCondition = (to: string, text: string, condition: boolean) => {
    if (condition) {
      return (
        <Link
          to={to}
          className={isNavLinkActive(to) ? styles.activeLink : styles.linkHover}
          onClick={closeOnMobileLink}
        >
          <Typography type="span" size="sm" color="dark-main">
            {text}
          </Typography>
        </Link>
      )
    }
  }

  const renderLink = (to: string, text: string) => (
    <Link
      to={to}
      className={isNavLinkActive(to) ? styles.activeLink : styles.linkHover}
      onClick={closeOnMobileLink}
    >
      <Typography type="span" size="sm" color="dark-main">
        {text}
      </Typography>
    </Link>
  )

  return (
    <>
      {renderLinkWithCondition("/notifications", "Announcements", userPermissions?.readNotification === true)}

      {userPermissions?.readProject === true && (
        <Accordian
          header={"Projects"}
          className={styles.collapse + " " + (location.pathname === "/projects" ? styles.active : "")}
        >
          {projectsDrop.map((item) => getAccordianText(item, "projects"))}
        </Accordian>
      )}

      <Link to="/employee-requests?all" onClick={closeOnMobileLink}>
        <Accordian
          className={`${styles.collapse__normal} ${styles.collapse + " " + (isNavLinkActive("/employee-requests") ? styles.active : "")}`}
          defaultActiveKey={isNavLinkActive("/employee-requests") ? 1 : 0}
          withPanel={false}
        >
          <Collapse.Panel key={1} header={"Employee Requests"}>
            {requestsDrop.map((item) => getAccordianText(item))}
          </Collapse.Panel>
        </Accordian>
      </Link>

      {renderLinkWithCondition("/leave-requests", "Leave Requests", user?._count?.Employees > 0)}

      {renderLinkWithCondition("/tasks?type=myTask", "Task", userPermissions?.readTask === true)}

      {renderLinkWithCondition("/tech-support", "Tech Support", userPermissions?.manageTechSupportTask === true)}

      {renderLink("/myservices", "My Services")}

      {renderLinkWithCondition("/employees", "Employees", userPermissions?.manageAllUser === true)}

      {renderLinkWithCondition("/enquiries", "Enquiries", userPermissions?.readEnquiry === true)}

      {renderLinkWithCondition("/leads", "Leads", userPermissions?.readLeads === true)}

      {renderLinkWithCondition("/quotations", "Quotations", userPermissions?.readQuotation === true)}

      {renderLinkWithCondition("/invoice", "Invoices", userPermissions?.readInvoice === true)}

      {renderLinkWithCondition("/clients", "Clients", userPermissions?.readClient === true)}

      {renderLinkWithCondition("/company-assets", "Company Assets", userPermissions?.readCompanyAsset === true)}

      {renderLinkWithCondition("/biometrics", "Biometrics", userPermissions?.readBiometrics === true)}

      {renderLinkWithCondition("/attendance", "Attendance", userPermissions?.readAttendance === true)}

      {renderLinkWithCondition("/permits", "Permits", userPermissions?.readPermit === true)}

      {renderLinkWithCondition("/transactions", "Government Fees", userPermissions?.readTransaction === true)}

      {renderLinkWithCondition("/payroll-cycle", "Payroll Cycle", userPermissions?.readPayrollCycle === true)}

      {renderLinkWithCondition("/payrolls", "Payroll", userPermissions?.readPayroll === true)}

      {organizationPermission === true && (
        <Accordian
          header={"Organization Settings"}
          className={styles.collapse}
        >
          {organizationDrop.map((item) => getAccordianText(item))}
        </Accordian>
      )}

      <div className={styles.divider} />

      <Link
        to="/help-center"
        className={isNavLinkActive('/help-center') ? styles.activeLink : styles.linkHover}
        onClick={closeOnMobileLink}
      >
        <span className="d-flex my-1">
          <HelpIcon width={18} height={18} className="mr-2" />

          <Typography type="span" size="sm" color="dark-main" className="my-auto">
            Help
          </Typography>
        </span>
      </Link>
    </>
  );
}

export default SideBarPanels;
