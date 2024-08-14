import { FC, ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { isNavLinkActive } from "@helpers/common";
import { ProjectQueryTypes } from "@modules/Project/types";
import Typography from "@atoms/Headings";
import SidebarPanels from "./sideBarPanels";
import InnerSideBarPanels from "./innerSideBar";
import AdminNavPanels from "./adminNav";
import styles from "./styles.module.scss";
import { useNavSidebar } from "context";

type SideBarProps = {
  onGetProjects?: (query?: Partial<ProjectQueryTypes>) => void;
  adminNav?: boolean;
  profileNav?: boolean;
};

type BarType = "outer" | "inner";

const SideBar: FC<SideBarProps> = (props) => {
  const { onGetProjects, adminNav = false, profileNav = false } = props;
  const [currentBar, setCurrentBar] = useState<BarType>("outer");
  const { closeOnMobileLink } = useNavSidebar()

  const changeSideBar = () => setCurrentBar((prev) => (prev === "outer" ? "inner" : "outer"));

  const RenderSideBar: { [key in BarType]: ReactNode } = {
    inner: <InnerSideBarPanels changeSideBar={changeSideBar} />,
    outer: (
      <>
        <Link
          to="/"
          className={`mt-2 ${isNavLinkActive("/") ? styles.activeLink : styles.linkHover}`}
          onClick={closeOnMobileLink}
        >
          <Typography type="span" size="sm" color="dark-main">
            Dashboard
          </Typography>
        </Link>
        <SidebarPanels onGetProjects={onGetProjects} />
      </>
    ),
  };

  return (
    <nav className={styles.navBar}>
      {adminNav ? (
        <AdminNavPanels profileNav={profileNav} />
      ) : (
        <aside className={styles.navBarBody}>{RenderSideBar[currentBar]}</aside>
      )}
    </nav>
  );
};

export default SideBar;