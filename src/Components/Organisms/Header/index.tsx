import { FC } from "react";
import HeaderLeft from "./headerLeft";
import HeaderRight from "./headerRight";
import styles from "./style.module.scss"

interface HeaderLeftProps {
  showSidebar: boolean
}

const Header: FC<HeaderLeftProps> = ({ showSidebar }) => {
  return (
    <div className={styles.header}>
      <HeaderLeft showSidebar={showSidebar} />
      <HeaderRight />
    </div>
  );
}

export default Header;
