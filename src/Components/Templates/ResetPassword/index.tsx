import styles from "./login.module.scss";
import ResetPasswordForm from "../../Organisms/ResetPasswordForm";

function ResetPassword() {
  //if access token is present redirect to dashboard
  const access_token = localStorage.getItem("access_token");

  if (access_token) {
    window.location.href = "/";
    return <></>
  }

  return (
    <>
      {!access_token && (
        <div className={styles.formWrap}>
          <ResetPasswordForm />
        </div>
      )}
    </>
  );
}

export default ResetPassword;
