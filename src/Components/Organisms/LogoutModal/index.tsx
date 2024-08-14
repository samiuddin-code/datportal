import { Avatar, Card, Divider, Dropdown } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import TokenService from "../../../services/tokenService";
import styles from "./styles.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../Redux/store";
import { RESOURCE_BASE_URL } from "../../../helpers/constants";

const LogoutModal = () => {
  const { loggedInUserData } = useSelector((state: RootState) => state.usersReducer);
  const { data } = loggedInUserData;

  const name = `${data?.firstName}`

  const onLogout = () => TokenService.removeTokens();

  const overlay = (
    <Card className={styles.overlay}>
      <div>
        Hi, <span style={{ fontWeight: "bold" }}>{name}</span>
      </div>

      <Link to={'/employees/' + data?.id} className="color-dark-900">
        <div className="my-1">
          Profile
        </div>
      </Link>

      {/* <Link to='/profile?tab=security' className="color-dark-900">
        <div className={styles.withIcon}>
          <span>Account settings</span>
          <img src="/images/arrow-up.svg" alt="" />
        </div>
      </Link> */}
      <Divider className="my-2" />
      <div
        className={`${styles.withIcon} ${styles.logOut} ${styles.hover}`}
        onClick={onLogout}
      >
        <span>Log Out</span>
        <LogoutOutlined />
      </div>
    </Card>
  );

  return (
    <Dropdown dropdownRender={() => overlay} trigger={["click"]}>
      <Avatar
        size={40}
        src={`${RESOURCE_BASE_URL}${loggedInUserData?.data?.profile}`}
        alt={loggedInUserData?.data?.firstName ? name : "User"}
        icon={<UserOutlined />}
        style={{
          objectFit: 'cover', cursor: 'pointer', backgroundColor: "#137749"
        }}
      />
    </Dropdown>
  );
}

export default LogoutModal;
