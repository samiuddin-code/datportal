import { message, Switch as AntdSwitch } from "antd";
import { useEffect, useState } from "react";
import { errorHandler } from "../../../helpers";

interface SwitchProps {
	checked: boolean | undefined;
	onChange: (checked: boolean, id: number, ...rest: any) => Promise<any>
	allowChange?: boolean;
	recordId: number;
	[x: string]: any;
}

export const Switch = ({ onChange, checked, recordId, allowChange = true, ...rest }: SwitchProps) => {
	const [buttonState, setButtonState] = useState<{ loading: boolean; checked: boolean }>({
		loading: false,
		checked: false,
	});

	const onSwitchChange = (checked: boolean) => {
		if (allowChange === true) {
			setButtonState({ ...buttonState, loading: true });
			onChange(checked, recordId, rest).then((res) => {
				setButtonState({
					...buttonState,
					checked: checked,
					loading: false
				});
				message.success(res.data.message);
			}).catch((err) => {
				setButtonState({ ...buttonState, loading: false });
				let serverErrors = errorHandler(err);
				if (typeof serverErrors.message === "string") {
					message.error(serverErrors.message);
				} else {
					message.error("Something went wrong");
				}
			});
		} else {
			message.error("You don't have permission to change this record, please contact your admin.");
		}
	};

	useEffect(() => {
		setButtonState({ ...buttonState, checked: checked! });
	}, [checked]);

	return (
		<AntdSwitch
			checked={buttonState.checked}
			onChange={onSwitchChange}
			loading={buttonState.loading}
		/>
	);
};
