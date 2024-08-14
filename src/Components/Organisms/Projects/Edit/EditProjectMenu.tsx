import { CheckOutlined } from "@ant-design/icons";
import { FC, useState } from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../../Redux/store";
// import { HandleServerErrors } from "../../../Atoms";
import Typography from "../../../Atoms/Headings";
import { XMarkIcon } from "../../../Icons";
import styles from "./styles.module.scss";
import { EditProjectMenuTypes, ProjectFormSteps } from "./types";

type GetTextWithIconProps = {
  src: string;
  text: string;
  tab: keyof typeof ProjectFormSteps;
};

const EditPropertyMenu: FC<EditProjectMenuTypes> = ({
  currentTab,
  onTabClick,
  completedTabs,
}) => {
  const [errors, setErrors] = useState<{ [key in keyof typeof ProjectFormSteps]: any[] }>();

  const navItems = [
    {
      src: "/images/basic-info.svg",
      text: "Basic Information",
      tab: ProjectFormSteps.basic_info
    },
    {
      src: "/images/deadline.svg",
      text: "Deadlines and Priority",
      tab: ProjectFormSteps.deadline_info
    },
  ];

  //TODO: add error handling 

  // const { addPropertiesData } = useSelector((state: RootState) => state.propertiesReducer);

  // const prepareError = useCallback(() => {
  //   if (addPropertiesData.errorData.message) {
  //     let error = addPropertiesData.errorData;
  //     if (typeof error.message !== "string") {
  //       let errData = HandleServerErrors(error.message, []);

  //       // group the errors and categories them by tab index
  //       let groupedErrors = errData?.reduce((acc: any, item: any) => {
  //         const name = item?.name
  //         if (item?.errors?.length > 0) {
  //           switch (name) {
  //             case "location":
  //               acc["0"] = item?.errors
  //               break;
  //             case "translations":
  //               acc["1"] = item?.errors
  //               break;
  //             case "propertyTypeId" || "propertyType":
  //               acc["2"] = item?.errors
  //               break;
  //             case "priceTypes":
  //               acc["3"] = item?.errors
  //               break;
  //             case "reference":
  //               acc["6"] = item?.errors
  //               break;
  //             default:
  //               acc[name] = item?.errors
  //               break;
  //           }
  //         }
  //         return acc
  //       }, {})

  //       setErrors(groupedErrors)
  //     }
  //   }
  // }, [addPropertiesData?.errorData])

  // useEffect(() => {
  //   prepareError()
  // }, [prepareError])

  const getTextWithIcon = (item: GetTextWithIconProps) => (
    <span
      className={
        styles.textWithIcon + " " +
        (item.tab === currentTab ? styles.active : "") + " " +
        (completedTabs.includes(item.tab) ? styles.done : "")
      }
      key={item.tab}
      onClick={() => onTabClick(item.tab)}
    >
      <div>
        <div />
        {item.src && (
          <img
            src={item.src}
            alt={`${item.text} icon`}
            width={30}
            height={30}
          />
        )}
        <span>{item.text}</span>
      </div>
      {/** if the tab is completed and there are errors for the tab, show the error icon */}
      {completedTabs?.includes(item.tab) && errors && errors[item.tab] && <XMarkIcon color="#ff0000" />}

      {/** if the tab is completed and there are no errors from the server, show the check icon */}
      {completedTabs?.includes(item.tab) && !errors && <CheckOutlined />}

      {/** if the tab is completed and there are no errors for that tab, show the check icon */}
      {completedTabs?.includes(item.tab) && errors && !errors[item.tab] && <CheckOutlined />}
    </span>
  );

  return (
    <div className={styles.nav}>
      <Typography type="h1" color="dark-main" size="lg">
        Edit Project
      </Typography>
      <div className={styles.divider}></div>
      {navItems.map((item) => getTextWithIcon(item))}
    </div>
  );
}

export default EditPropertyMenu;
