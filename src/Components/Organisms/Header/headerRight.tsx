import { FC, useState } from "react";
import { Button, Tooltip } from "antd";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import NotificationModal from "../NotificationModal";
import LogoutModal from "../LogoutModal";
import SettingsModal from "../SettingsModal";
import HelpDrawer from "../HelpDrawer";
import styles from "./style.module.scss";
import { RootState } from "Redux/store";
import { FeedbackModal } from "./Feedback/modal";
import XeroConnect from "./XeroConnect";
import { XeroPermissionsEnum } from "@modules/Xero/permissions";

const HeaderRight: FC = () => {
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const [openFeedback, setOpenFeedback] = useState(false);
  const permissions = userPermissions as { [key in XeroPermissionsEnum]: boolean };

  return (
    <div className={styles.headerSub + " " + styles.right}>
      {/* {userPermissions?.readProperty === true && (
        <SearchModal />
      )} */}
      <XeroConnect permissions={permissions} />
      <Tooltip title="Chat">
        <Link to="/chats">
          <span className={styles.headerIcons}>
            <img src="/images/chat.svg" alt="chat" />
          </span>
        </Link>
      </Tooltip>
      <span className={styles.headerIcons}>
        <NotificationModal />
      </span>
      <span className={styles.headerIcons}>
        <HelpDrawer />
      </span>
      <span className={styles.headerIcons}>
        <SettingsModal />
      </span>
      <span className={styles.headerIcons} style={{ border: '1px solid var(--color-border)' }}>
        <LogoutModal />
      </span>
      <Button
        onClick={() => setOpenFeedback(true)} className={styles.feedback}
        type="primary"
      >
        Feedback
      </Button>
      <FeedbackModal
        openModal={openFeedback}
        onCancel={() => setOpenFeedback(false)}
      />
    </div>
  );
}

export default HeaderRight;
