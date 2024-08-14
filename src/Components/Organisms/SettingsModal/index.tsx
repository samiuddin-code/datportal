import { useNavigate } from "react-router-dom";
import { Card, Dropdown } from "antd";
import { SettingFilled } from "@ant-design/icons";
import Typography from "../../Atoms/Headings";
import styles from "./styles.module.scss";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../Redux/store";
import TokenService from "../../../services/tokenService";
import { useMemo } from "react";
import { SUPER_ADMIN, YALLAH_USERS } from "../../../helpers/commonEnums";

function SettingsModal() {
  let navigate = useNavigate();

  // const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const user = TokenService.getUserData();

  const isSuperUser = useMemo(() => {
    const slugs: any[] = user?.roles?.slugs

    if (slugs?.includes(SUPER_ADMIN) || slugs?.includes(YALLAH_USERS)) {
      return true
    } else {
      return false
    }
  }, [user])

  const overlay = (
    <Card className={styles.overlay}>
      <div>
        <Typography color="primary-sub" size="lg" type="h1" className="pl-6 pb-4">
          Settings
        </Typography>
        <Typography color="dark-main" className="pl-6">
          Personal Settings
        </Typography>

        <div className="my-3">
          <span
            className={styles.overlay_item}
            onClick={() => { navigate("/employees/" + user?.id) }}
          >
            <span className={styles.anticon}>
              <img src="/images/fileUser.svg" alt="" />
            </span>
            <span className={styles.textWrap}>
              <Typography color="dark-main">
                Account settings
              </Typography>
              <Typography color="dark-main" type="h5" size="xs" className="pt-1">
                Manage your language, time zone, and other profile information.
              </Typography>
            </span>
          </span>
          <span
            className={styles.overlay_item}
            onClick={() => { navigate("/profile?tab=manage_notifications") }}
          >
            <span className={styles.anticon}>
              <img src="/images/user.svg" alt="" />
            </span>
            <span className={styles.textWrap}>
              <Typography color="dark-main">
                Personal settings
              </Typography>
              <Typography color="dark-main" type="h5" size="xs" className="pt-1">
                Manage your email notification and other settings
              </Typography>
            </span>
          </span>
          {/** Read Site Settings permission */}
          {isSuperUser === true && (
            <span
              className={styles.overlay_item}
              onClick={() => { navigate("/siteSettings") }}
            >
              <span className={styles.anticon}>
                <img src="/images/settings.svg" alt="" />
              </span>
              <span className={styles.textWrap}>
                <Typography color="dark-main">
                  Site Settings
                </Typography>
                <Typography color="dark-main" type="h5" size="xs" className="pt-1">
                  Manage your email notifications and other settings.
                </Typography>
              </span>
            </span>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <Dropdown dropdownRender={() => overlay} trigger={["click"]}>
      <SettingFilled />
    </Dropdown>
  );
}

export default SettingsModal;
