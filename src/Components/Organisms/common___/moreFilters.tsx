import { Button, Checkbox, message, Radio } from "antd";
import { useCallback, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { moreFilterProps, multiSelectFilterProps } from "./filters";
import DropDown from "../../Atoms/DropDown";
import CustomInput from "../../Atoms/Input";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import { validateEmail } from "../../../helpers/common";

export default function MoreFilters(props: moreFilterProps) {
	const { values, setValues, setVisible, visible, moreItems } = props;
	const [, setSearchVal] = useState("");
	const [filteredMoreItems, setFilteredMoreItems] = useState(moreItems);
	const handleVisibleChange = (flag: boolean) => {
		setVisible(flag);
	};

	const onSearchChange = useCallback((e: { target: { value: string } }) => {
		setSearchVal(e.target.value);
		setFilteredMoreItems(
			moreItems.filter((item) => item.label.toLowerCase().includes(e.target.value))
		);
	}, [moreItems]);

	return (
		<div className={`${styles.freeText}`}>
			<DropDown
				onVisibleChange={handleVisibleChange}
				visible={visible}
				items={[
					{
						key: 1,
						label: (
							<div>
								<CustomInput
									size="w100"
									onChange={onSearchChange}
									placeHolder="Search"
									icon={<img src="/images/searchIcon.svg" alt="" />}
								/>
								{filteredMoreItems?.length > 0 ? (
									<Checkbox.Group
										value={values}
										onChange={setValues}
										className={styles.checkboxGroup}
										options={filteredMoreItems?.map((item) => ({
											label: item.label,
											value: item.value,
										}))}
									/>
								) : (
									<div className={styles.noOption}>No Options</div>
								)}
							</div>
						),
					},
				]}
			>
				More+
			</DropDown>
		</div>
	);
}
export const MultiSelectFilter = (props: multiSelectFilterProps) => {
	const [visible, setVisible] = useState(false);
	const handleVisibleChange = (flag: boolean) => {
		setVisible(flag);
	};
	const {
		value,
		onChange,
		data,
		filters,
		type,
		label,
		onFilter,
		show,
		filterType = "multi",
		getChild,
		showFooter = true,
		searchProps,
		...rest
	} = props;
	const [selectedItems, setSelectedItems] = useState<{ value: number; name: string }[]>([]);
	useEffect(() => {
		setVisible(show);
	}, [show]);
	const onDeleteItem = (id: number) => {
		let newData = value.filter((item: number) => item !== id);
		setSelectedItems((prv) => prv.filter((item: { value: number }) => item.value !== id));
		onChange(newData, type);
	};
	const onCheckChange = (e: CheckboxValueType[]) => {
		if (searchProps) {
			let [difference]: any = new Set([
				...e.filter((x) => value.indexOf(x) === -1),
				...value.filter((x: string | number | boolean) => e.indexOf(x) === -1),
			]);
			let newData = data.filter((item: { value: number }) => item.value === difference);
			setSelectedItems((prv: { value: number }[]) => {
				let currentData = !prv.filter((item) => item.value === difference).length
					? [newData[0], ...prv]
					: prv.filter((item) => item.value !== difference);
				let newIds = currentData.map((item) => item.value);
				onChange(newIds, type);
				return currentData;
			});
		} else {
			onChange(e, type);
		}
	};
	const children = (
		<div>
			{filterType === "multi" ? (
				<>
					{searchProps ? (
						<>
							<CustomInput
								icon={<img src="/images/searchIcon.svg" alt="" />}
								size="w100"
								placeHolder="Enter value"
								{...rest}
								allowClear
								onChange={(e: { target: { value: string } }) =>
									searchProps.onSearch(e.target.value)
								}
							/>
							<div className={styles.searchItems}>
								{selectedItems.map((item: { name: string; value: number }) => (
									<span>
										{item?.name}
										<h5 onClick={() => onDeleteItem(item.value)}>X</h5>
									</span>
								))}
							</div>
						</>
					) : null}
					<Checkbox.Group
						value={value}
						onChange={onCheckChange}
						className={styles.checkboxGroup}
						options={data}
					/>
				</>
			) : filterType === "single" ? (
				<Radio.Group
					value={value}
					onChange={(e) => onChange(e.target.value, type)}
					className={styles.checkboxGroup}
					options={data}
				/>
			) : (
				<div className={styles.webIdFilter}>
					<CustomInput
						value={value}
						placeHolder="Enter value"
						type={type}
						onChange={(e: { target: { value: string } }) => {
							if (type === "number") {
								return onChange(e, type);
							}
							return onChange(e.target.value, type)
						}}
						allowClear
						{...rest}
					/>
					<Button
						type="primary"
						onClick={() => {
							if (type === "email" && !validateEmail(value)) {
								return message.error("Please enter valid email");
							}
							onFilter(setVisible);
						}}
					>
						Update
					</Button>
				</div>
			)}
			{showFooter ? (
				<div className={styles.footerButtonWrap}>
					<Button
						onClick={() => {
							setSelectedItems([]);
							onChange([], type);
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
	);
	if (getChild === true) {
		return children;
	}
	return (
		<div className={`${styles.freeText} ${filters[type]?.length ? styles.active : ""}`}>
			<DropDown
				visible={visible}
				onVisibleChange={handleVisibleChange}
				items={[
					{
						key: 1,
						label: children ? children : "",
					},
				]}
			>
				{filters[type]?.length > 0
					? `${label}: ${filterType === "single"
						? data.filter((item: { value: string | number }) => item.value === filters[type])[0]
							.label
						: filterType === "input"
							? filters[type]
							: searchProps
								? data.filter(
									(item: { value: string | number }) => item.value === filters[type][0]
								)[0]?.name
								: data.filter(
									(item: { value: string | number }) => item.value === filters[type][0]
								)[0].label
					}`
					: label}
				{filters[type]?.length > 1 && filterType === "multi" ? (
					<h5>{`+${filters[type].length - 1}`}</h5>
				) : null}
			</DropDown>
		</div>
	);
};
