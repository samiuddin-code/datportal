
import { FC } from "react";
import Typography from "../../../Atoms/Headings";
import styles from "./styles.module.scss";
import { EditProjectBodyWrapProps } from "./types";

const EditProjectBodyWrap: FC<EditProjectBodyWrapProps> = (props) => {
  const {
    headings, children, onBackClick, showBackButton = true
  } = props;

  return (
    <div className={styles.bodyWrap}>
      <div className={styles.heading}>
        {showBackButton && (
          <img src="/images/west.svg" alt="" onClick={onBackClick} />
        )}
        <Typography
          type="h1" color="dark-main" size="lg" weight="semi"
          className={showBackButton ? "" : "text-center w-100"}
        >
          {headings?.heading}
        </Typography>
        {showBackButton && <span></span>}
      </div>
      <div className={styles.subHeading}>
        <Typography type="h3" color="dark-main" weight="semi">
          {headings?.subHeading}
        </Typography>
        <Typography type="p" color="dark-sub" size="sm">
          {headings?.description}
        </Typography>
      </div>
      {children}
    </div>
  );
}
EditProjectBodyWrap.defaultProps = {
  headings: {
    heading: "Heading",
    subHeading: "Sub Heading",
    description: "Description",
    buttonText: "Continue",
  },
  children: undefined,
  onBackClick: () => { },
};

export default EditProjectBodyWrap;
