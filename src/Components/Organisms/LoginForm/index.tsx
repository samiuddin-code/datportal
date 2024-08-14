import { MailOutlined } from "@ant-design/icons";
import { Checkbox, Form, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AuthModule } from "../../../Modules/Auth";
import { dispatchType } from "../../../Redux/Reducers/commonTypes";
import { loginApi } from "../../../Redux/Reducers/LoginReducer/action";
import { loginType } from "../../../Redux/Reducers/LoginReducer/types";
import { RootState } from "../../../Redux/store";
import CustomButton from "../../Atoms/Button";
import Typography from "../../Atoms/Headings";
import CustomInput from "../../Atoms/Input";
import { BackIcon, Logo } from "../../Icons";
import styles from "./style.module.scss";
import TextLoop from "../../Atoms/LogoTextLoop";

const LoginForm = () => {
  const dispatch = useDispatch<dispatchType>();
  const { loginDetails } = useSelector((state: RootState) => state.loginReducer);

  const authModule = useMemo(() => new AuthModule(), []);

  const [resetPassword, setResetPassword] = useState<{
    sent: boolean; clicked: boolean;
  }>({ sent: false, clicked: false });


  const onFinish = (values: loginType) => {
    if (resetPassword?.clicked) {
      authModule.sendPasswordResetLink(values.email).then((res) => {
        if (res.data?.statusCode === 200) {
          message.success(res.data.message);
          setResetPassword({ sent: true, clicked: true });
        }
      }).catch((err) => {
        const message = err.response.data.message;
        message.error(message);
        setResetPassword({ sent: false, clicked: true });
      })
      return;
    } else {
      const callBack = () => {
        let redirectUrl = "/";

        const urlParams = new URLSearchParams(window.location.search);
        const __redirectUrl = urlParams.get('redirectUrl');

        if (__redirectUrl) {
          redirectUrl = __redirectUrl;
        }

        window.location.href = redirectUrl;
      };
      dispatch(loginApi(values, callBack));
    }
  }

  const onLoginError = useCallback(() => {
    if (loginDetails.errorData.response?.data?.message) {
      message.error(loginDetails.errorData.response?.data?.message);
    }
  }, [loginDetails.errorData]);

  useEffect(() => {
    onLoginError();
  }, [onLoginError])

  return (
    <div className={styles.form}>
      <div className={styles.logoWrap}>
        <div className={styles.headingWrap}>
          {resetPassword?.clicked ? (
            <>
              <Typography color="dark-main" size="lg" weight="bold">
                Reset Password!
              </Typography>
              <Typography color="dark-sub" size="xs">
                Enter your email address and we&apos;ll send you a link to reset your
                password.
              </Typography>
            </>
          ) : (
            <>
              <Typography color="dark-main" size="lg" weight="bold">
                Welcome back!
              </Typography>
              <Typography color="dark-sub" size="xs">
                Lets get you signed in
              </Typography>
            </>
          )}
        </div>
        {/** Logo */}
        <div className={styles.logo}>
          <Logo color="#137749" />
          <TextLoop />
        </div>
      </div>

      {resetPassword?.clicked && (
        <div
          className="d-flex cursor-pointer mb-5"
          onClick={() => setResetPassword({ sent: false, clicked: false })}
        >
          <BackIcon className="mr-2" />
          <Typography color="dark-sub" size="normal">
            Back to Login
          </Typography>
        </div>
      )}

      {resetPassword?.sent && resetPassword?.clicked && (
        <>
          <img
            src="/images/forgot-password.svg"
            className={styles.forgotPasswordImg}
            alt="forgot-password"
          />
          <Typography
            color="dark-sub"
            size="md"
            weight="semi"
            className="text-center my-4"
          >
            We have sent you an email with a link to reset your password.
          </Typography>
        </>
      )}

      <Form
        name="login"
        validateTrigger="onChange"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please enter your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <CustomInput
            size="w100"
            icon={<MailOutlined />}
            label="Email"
            placeHolder="Email address"
            className="pa-2"
          />
        </Form.Item>

        {!resetPassword?.clicked && (
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
        )}

        {!resetPassword?.clicked && (
          <Form.Item>
            <Checkbox className="font-size-xs">Remember me</Checkbox>

            <Typography
              color="dark-sub"
              size="xs"
              weight="semi"
              className="float-right cursor-pointer mt-1"
              onClick={() => setResetPassword({ sent: false, clicked: true })}
            >
              Forgot Password?
            </Typography>
          </Form.Item>
        )}

        <Form.Item>
          <CustomButton
            size="w100"
            type="primary"
            htmlType="submit"
            loading={loginDetails.loading}
          >
            {resetPassword?.clicked ? "Reset Password" : "Sign In"}
          </CustomButton>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginForm;
