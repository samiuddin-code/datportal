import { Button, DatePicker } from "antd";
import { useEffect, useState } from "react";
import DropDown from "../../Atoms/DropDown";
import CustomInput from "../../Atoms/Input";
import styles from "./styles.module.scss";
import { multiInputFilterProps } from "./filters";
import Typography from "../../Atoms/Headings";
import { convertDate } from "../../../helpers/dateHandler";

export const MultiInputFilter = (props: multiInputFilterProps) => {
	const [visible, setVisible] = useState(false);
	const handleVisibleChange = (flag: boolean) => {
		setVisible(flag);
	};
	const {
		values,
		onChange,
		filters,
		labels,
		label,
		onFilter,
		show,
		subTypes,
		type,
		showFooter,
		children,
		types = ["input", "input"],
	} = props;
	useEffect(() => {
		setVisible(show);
	}, [show]);
	return (
		<div className={`${styles.freeText} ${filters[subTypes[0]] ? styles.active : ""}`}>
			<DropDown
				visible={visible}
				onVisibleChange={handleVisibleChange}
				items={[
					{
						key: 1,
						label: (
							<div>
								<div className={types[0] === "input" ? styles.inputsWrap : styles.dateWrap}>
									{subTypes[0] ? (
										<div>
											{types[0] === "input" ? (
												<CustomInput
													size="w100"
													value={values[0]}
													label={labels[0]}
													placeHolder=""
													onChange={(e: { target: { value: string } }) =>
														onChange(e.target.value, subTypes[0])
													}
												/>
											) : (
												<>
													<Typography color="dark-main" size="sm">
														{labels[0]}
													</Typography>
													<DatePicker
														value={values[0]}
														onChange={(e) => onChange(e, subTypes[0])}
													/>
												</>
											)}
										</div>
									) : null}
									{subTypes[1] ? (
										<div>
											{types[1] === "input" ? (
												<CustomInput
													size="w100"
													value={values[1]}
													label={labels[1]}
													placeHolder=""
													onChange={(e: { target: { value: string } }) =>
														onChange(e.target.value, subTypes[1])
													}
												/>
											) : (
												<>
													<Typography color="dark-main" size="sm">
														{labels[1]}
													</Typography>
													<DatePicker
														value={values[1]}
														onChange={(e) => onChange(e, subTypes[1])}
													/>
												</>
											)}
										</div>
									) : null}
								</div>
								{children ? children : null}
								{showFooter ? (
									<div className={styles.footerButtonWrap}>
										<Button
											onClick={() => {
												onChange(null, type);
											}}
										>
											Reset
										</Button>
										<Button type="primary" onClick={() => onFilter(setVisible)}>
											Update
										</Button>
									</div>
								) : null}
							</div>
						),
					},
				]}
			>
				{subTypes?.length
					? `${filters[subTypes[0]]?.length
						? `${label}:${filters[subTypes[0]]}`
						: (filters[subTypes[0]] && Object.keys(filters[subTypes[0]]))?.length
							? `${label}:${convertDate(filters[subTypes[0]], "dd/mm/yy")}`
							: label
					}`
					: label}
				{subTypes?.length > 1
					? `${filters[subTypes[1]]?.length
						? ` - ${filters[subTypes[1]]}`
						: (filters[subTypes[1]] && Object.keys(filters[subTypes[1]]))?.length
							? ` - ${convertDate(filters[subTypes[1]], "dd/mm/yy")}`
							: ""
					}`
					: null}
				{subTypes?.length > 2
					? `${filters[subTypes[2]] ? ` ( ${filters[subTypes[2]]} )` : ""}`
					: null}
			</DropDown>
		</div>
	);
};
