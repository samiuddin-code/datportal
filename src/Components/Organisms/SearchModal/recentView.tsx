import { FC } from "react";
import { FRONT_END_URL, RESOURCE_BASE_URL } from "../../../helpers/constants";
import { PropertiesType } from "../../../Modules/Properties/types";
import Typography from "../../Atoms/Headings";
import styles from "./styles.module.scss";

interface PropsType {
  data: PropertiesType[]
}

export const RecentViewedProperties: FC<PropsType> = ({ data }) => {

  return (
    <div className={styles.recentWrap}>
      {data.map((item: PropertiesType) => (
        <div key={`properties-search-result-navbar-${item.id}`}>
          <a
            href={`${FRONT_END_URL}/en/property/${item.slug}`}
            title={item.localization[0].title}
            className={styles.recentWrap_item}
          >

            <img src={`${RESOURCE_BASE_URL}${item.resources[0].path}`} alt={item.resources[0].file} />
            <span>
              <Typography color="dark-main" size="sm">
                {item.localization[0].title}
              </Typography>

              <Typography color="dark-sub" size="sm">
                {`YALLAH-${String(item.id).padStart(6, "0")}`}
              </Typography>
            </span>
          </a>
        </div>
      ))}
    </div>
  );
}