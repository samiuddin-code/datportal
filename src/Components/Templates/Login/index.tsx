import { FC } from "react";
import { Col, Row } from "antd";
import Typography from "../../Atoms/Headings";
import LoginForm from "../../Organisms/LoginForm";
import styles from "./login.module.scss";
import { DIcon } from "../../Icons";

const LoginTemplate: FC = () => {
  //if access token is present redirect to dashboard
  const access_token = localStorage.getItem("access_token");
  // device width
  const width = window.innerWidth;

  if (access_token) {
    window.location.href = "/";
    return <></>
  }

  return (
    <>
      {!access_token && (
        <Row className={styles.row}>
          <Col className={styles.colLeft} xs={24} sm={24} md={12}>
            <DIcon
              width={width > 768 ? 400 : 300}
              height={width > 768 ? 450 : 300}
              className={styles.frameImage}
            />
            <Typography
              size="xxxl" weight="bold" type="h1"
              lineHeight={width > 768 ? 4 : 2}
              className={styles.contentWrap}
            >
              Welcome to DAT Portal
            </Typography>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <div className={styles.formWrap}>
              <LoginForm />
            </div>
          </Col>
        </Row>
      )}
    </>
  );
}

export default LoginTemplate;
