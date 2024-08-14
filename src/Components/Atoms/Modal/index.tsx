import { Modal, ModalProps as AntdModalProps } from "antd";
import CustomButton from "../Button";
import Typography from "../Headings";
import { ModalProps } from "./modal";
import styles from "./styles.module.scss";

type CustomModalProps = AntdModalProps & {
} & ModalProps;

const CustomModal = (props: CustomModalProps) => {
	const {
		onCancel, onOk, visible, size, closable,
		okText, cancelText, titleText, descriptionText,
		children, showFooter, className, ...rest
	} = props;

	const footer = (
		<div className={styles.footer}>
			<CustomButton size="normal" fontSize="sm" onClick={onCancel} type="plain">
				{cancelText}
			</CustomButton>
			<CustomButton type="primary" size="normal" fontSize="sm" onClick={onOk}>
				{okText}
			</CustomButton>
		</div>
	);

	const title = (
		<div className={styles.title}>
			<Typography color="primary-sub" size="lg">
				{titleText}
			</Typography>
			<Typography color="dark-sub" size="sm" className="mt-2">
				{descriptionText}
			</Typography>
		</div>
	);

	return (
		<Modal
			{...rest}
			open={visible} width={size}
			onCancel={onCancel} closable={closable}
			className={`${styles.modal} ${className}`}
			footer={showFooter ? footer : null}
			title={title} destroyOnClose={true}
		>
			<div className={styles.modalBody}>{children}</div>
		</Modal>
	);
};
CustomModal.defaultProps = {
	visible: false,
	size: "600px",
	closable: false,
	onCancel: () => { },
	onOk: () => { },
	okText: "Submit",
	cancelText: "Cancel",
	titleText: "",
	showFooter: true,
	forceRender: true,
};
export default CustomModal;
