import { Link, useLocation } from "react-router-dom";
import { isNavLinkActiveWithParams } from "../../../helpers/common";
import { Accordian } from "../../Atoms/Collapse";
import Typography from "../../Atoms/Headings";
import { propsType } from "./sidebar";
import styles from "./styles.module.scss";
import { TasksIcon } from "../../Icons/tasks";

function InnerSideBarPanels(props: propsType) {
  const location = useLocation();

  const getTextWithIcon = (item: { src: JSX.Element; text: string, href: string, params: string; }) => (
    <Link
      to={`${item.href}${item.params ? `?days=${item.params}` : ""}`}
      className={`${styles.textWithIcon} ${isNavLinkActiveWithParams(item.href, `?days=${item.params}`) ? styles.active : ""}`}
      key={item.text}
    >
      <div />
      {item.src ? item.src : null}
      <span>{item.text}</span>
    </Link>
  );

  const tasksDrop = [
    {
      src: <TasksIcon />,
      text: "All Tasks",
      href: "/tasks",
      params: "all",
    },
  ];

  return (
    <>
      <span onClick={props.changeSideBar} className={styles.textWithIcon__rev}>
        <div />
        <img src="/images/arrow_right.svg" alt="" />
        <Typography type="span" size="sm" color="dark-main">
          Back to Menu
        </Typography>
      </span>
      <div className={styles.divider} />
      <Accordian
        header={"Task"}
        className={`${styles.collapse__normal} ${styles.collapse + " " + (location.pathname === "/tasks" ? styles.active : "")}`}
      >
        {tasksDrop.map((item) => getTextWithIcon(item))}
      </Accordian>
    </>
  );
}

export default InnerSideBarPanels;
