import { FC } from "react";
import { Alert } from "antd";

interface AlertProps {
	description: string;
	isClosable: boolean;
	onClose?: () => void;
}

const CustomErrorAlert: FC<AlertProps> = ({ description, isClosable, onClose }) => {
	return (
		<Alert
			message={"Error"}
			description={description}
			type={"error"}
			closable={isClosable}
			className={"mb-5"}
			onClose={onClose}
		/>
	);
};

export default CustomErrorAlert;
