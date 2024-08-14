import { FC, SVGProps } from "react";
import { Button } from "antd";
import { useNavigate, } from "react-router-dom";
import { RootState } from "Redux/store";
import { useSelector } from "react-redux";
import { Logo, SideBarLeft, SideBarRight } from "@icons/";
import CreateTask from "./create";
import styles from "./style.module.scss";
import { useNavSidebar } from "context";

interface HeaderLeftProps {
  showSidebar: boolean
}

const HeaderLeft: FC<HeaderLeftProps> = ({ showSidebar }) => {
  const navigate = useNavigate();

  const { userPermissions } = useSelector((state: RootState) => {
    return {
      userPermissions: state.usersReducer.userPermissions
    }
  });

  const { createTask } = userPermissions || {};

  const { collapsed, setCollapsed } = useNavSidebar()

  const onHomeClick = () => navigate("/");

  const commonProps: SVGProps<SVGSVGElement> = {
    onClick: () => setCollapsed(!collapsed),
    style: { fontSize: 20, cursor: 'pointer' },
  }

  return (
    <div className={styles.headerSub}>
      {showSidebar && (
        collapsed ? <SideBarRight {...commonProps} /> : <SideBarLeft {...commonProps} />
      )}

      <Logo
        onClick={onHomeClick} width={60} height={25}
        style={{ cursor: "pointer" }}
      />

      {userPermissions?.manageAllUser && (
        <Button
          className={styles.headerSubContent} type='text' href="/employees"
          style={{ fontSize: "var(--font-size-sm)", padding: "0px" }}
        >
          Employees
        </Button>
      )}

      {/** Create property permission */}
      {(createTask === true) && (
        <div className={styles.headerSubContent}>
          <CreateTask />
        </div>
      )}
    </div>
  );
}

export default HeaderLeft;
