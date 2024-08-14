import { Form, message } from "antd";
import { useMemo, useState } from "react";
import { AuthModule } from "../../../Modules/Auth";
import { loginType } from "../../../Redux/Reducers/LoginReducer/types";
import CustomButton from "../../Atoms/Button";
import Typography from "../../Atoms/Headings";
import CustomInput from "../../Atoms/Input";
import styles from "./style.module.scss";

const ResetPasswordForm = () => {
  // get the url
  const url = window.location.pathname;
  // remove /reset-password/ from the url
  const token = url.replace("/reset-password/", "");

  const authModule = useMemo(() => new AuthModule(), []);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  const onFinish = (values: loginType & { confirmPassword: string }) => {

    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }

    const data = {
      password: values.password,
      resetToken: token
    }

    authModule.resetPassword(data).then((res) => {
      if (res.data?.statusCode === 200) {
        message.success(res.data.message);

        setResetSuccess(true)
      }
    }).catch((err) => {
      const msg = err.response.data.message;
      message.error(msg);
    })
  }

  return (
    <div className={styles.form}>
      <div className={styles.logoWrap}>
        <div className={styles.headingWrap}>
          <Typography color="dark-main" size="lg" weight="bold">
            Reset Password!
          </Typography>
          <Typography color="dark-sub" size="xs">
            {resetSuccess ? "You can now login with your new password." : "Enter your new password below to reset your password."}
          </Typography>
        </div>
        <img src="/images/logo256.png" alt="logo" />
      </div>

      <Form
        name="login"
        validateTrigger="onChange"
        onFinish={onFinish}
        autoComplete="off"
      >
        {resetSuccess ? (
          <>
            <img
              src="/images/forgot-password.svg"
              className={styles.forgotPasswordImg}
              alt="Email sent"
            />
            <Typography
              color="dark-sub"
              size="md"
              weight="semi"
              className="text-center my-4"
            >
              Password reset successful! You can now login with your new password.
            </Typography>
          </>
        ) : (
          <>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please enter your password!" }]}
            >
              <CustomInput
                size="w100"
                type="password"
                label="Password"
                placeHolder="Password"
                className="pa-2"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[{ required: true, message: "Please confirm your password!" }]}
            >
              <CustomInput
                size="w100"
                type="password"
                label="Confirm Password"
                placeHolder="Confirm Password"
                className="pa-2"
              />
            </Form.Item>
          </>
        )}

        <Form.Item>
          <CustomButton
            size="w100"
            type="primary"
            htmlType={resetSuccess ? "button" : "submit"}
            onClick={() => {
              if (resetSuccess) {
                window.location.href = "/login";
              }
            }}
          >
            {resetSuccess ? "Login" : "Reset Password"}
          </CustomButton>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ResetPasswordForm;
