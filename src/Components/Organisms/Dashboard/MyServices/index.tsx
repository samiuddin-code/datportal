import { PageHeader } from "@atoms/";
import Layout from "@templates/Layout";
import styles from "./styles.module.scss";
import { DiaryPermissionsEnum } from "@modules/Diary/permissions";
import { Card } from "antd";
import { MyServices as services } from "@helpers/commonEnums";
import { getPermissionSlugs } from "@helpers/common";

const breadCrumbsData = [
  {
    text: "Home",
    isLink: true,
    path: "/",
  },
  {
    isLink: false,
    text: "My Services",
  },
];

const MyServices = () => {
  // available permissions for the properties page
  const permissionSlug = getPermissionSlugs(DiaryPermissionsEnum)

  return (
    <Layout permissionSlug={permissionSlug}>
      <PageHeader
        heading="My Services"
        breadCrumbData={breadCrumbsData} />
      <section className={styles.container}>
        {services.map((service, index) => (
          <Card key={index} hoverable className={styles.card}>
            <a href={service.link} className={styles.cardBody}>
              <img className={styles.icon} src={service.icon} alt="icon" />
              <p className={styles.cardTitle}>{service.title}</p>
            </a>
          </Card>
        ))}
      </section>
    </Layout>
  );
};
export default MyServices;