import { FC, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Layout as AntLayout, } from "antd";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { dispatchType } from "Redux/Reducers/commonTypes";
import { getLoggedInUser, getUserPermissions } from "Redux/Reducers/UsersReducer/action";
import { ProjectQueryTypes } from "@modules/Project/types";
import Header from "@organisms/Header";
import SideBar from "@organisms/Sidebar";
import { LayoutProps } from "./layout";
import styles from "./style.module.scss";
import { useNavSidebar } from "context";

type CustomLayoutProps = {
  onGetProjects?: (query?: Partial<ProjectQueryTypes>) => void,
  showSidebar?: boolean
} & LayoutProps;

const { Header: AntHeader, Sider, Content } = AntLayout;

const Layout: FC<CustomLayoutProps> = (props) => {
  const {
    showSidebar = true, title, adminNav, profileNav, className,
    permissionSlug, onGetProjects, children
  } = props;
  const { collapsed } = useNavSidebar()

  const location = useLocation();
  const dispatch = useDispatch<dispatchType>();

  const getLoggedInUserDetails = useCallback(() => {
    dispatch(getLoggedInUser({ reload: false }));
  }, []);

  const GetUserPermissions = useCallback(() => {
    if (permissionSlug) {
      dispatch(getUserPermissions(permissionSlug));
    } else {
      dispatch(getUserPermissions([]));
    }
  }, [permissionSlug]);

  // Get Logged In User Details
  useEffect(() => {
    getLoggedInUserDetails();
  }, [])

  // if the location or page url changes, then get the user permissions
  useEffect(() => {
    GetUserPermissions()
  }, [location?.pathname])

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>

      <AntLayout>
        <AntHeader className={styles.header}>
          <Header showSidebar={showSidebar} />
        </AntHeader>

        <AntLayout className={styles.layout}>
          {showSidebar && (
            <Sider
              width={260} theme='light' trigger={null}
              className={styles.layout_sidebar}
              breakpoint='lg' collapsedWidth={0}
              collapsible collapsed={collapsed}
            >
              <SideBar
                adminNav={adminNav || false} profileNav={profileNav}
                onGetProjects={onGetProjects}
              />
            </Sider>
          )}

          <AntLayout
            style={{
              padding: !showSidebar ? 0 : window.innerWidth < 992 ? 12 : 24
            }}
            className={`${styles.layout_body} ${className}`}
          >
            <Content>{children}</Content>
          </AntLayout>
        </AntLayout>
      </AntLayout>
    </>
  );
}

Layout.defaultProps = {
  withHeader: true,
  title: "DAT Engineering Consultants - Powered by Engineers",
  showAddProject: true,
  adminNav: false,
  profileNav: false
};

export default Layout;
