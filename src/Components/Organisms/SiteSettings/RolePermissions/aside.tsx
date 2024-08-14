import { message, Skeleton } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import CustomInput from "../../../Atoms/Input";
import styles from "./styles.module.scss";
import Typography from "../../../Atoms/Headings";
import { useDebounce } from "../../../../helpers/useDebounce";
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { itemType } from "../../Sidebar/sidebar";
import { SystemModulesModule } from "../../../../Modules/SystemModules";

export type RolePermissionsAsideProps = {
	setModuleId: (module: number) => void;
	moduleId: number;
};

export const RolePermissionsAside = ({ moduleId, setModuleId }: RolePermissionsAsideProps) => {
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	const module = new SystemModulesModule();

	const [navItems, setnavItems] = useState({
		loading: false,
		data: [],
	});
	const [moduleData, setModuleData] = useState<{ data: any }>({
		data: [],
	});

	const getTextWithIcon = (item: itemType) => (
		<span
			className={`${styles.textWithIcon} ${item?.id === moduleId ? styles.active : ""}`}
			key={item.name}
			onClick={() => setModuleId(item.id ? item.id : 0)}
		>
			<div />
			{item.icon ? <img src={`${RESOURCE_BASE_URL}${item.icon}`} alt="" width={15} /> : null}
			<Typography type="span" size="sm" color="dark-main">
				{item.name}
			</Typography>
		</span>
	);

	const onSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	}, []);

	useEffect(() => {
		setnavItems({ ...navItems, loading: true });
		module.getAllRecords().then((res) => {
			if (res.data && res.data.data) {
				setnavItems({ ...navItems, data: res.data.data, loading: false });
				setModuleData({ data: res.data.data });
			}
		}).catch((err) => {
			setnavItems({ ...navItems, loading: false });
			message.error("Something went wrong");
		});
	}, []);

	// Search functionality
	useEffect(() => {
		if (debouncedSearchTerm) {
			const filteredData = moduleData.data.filter((item: any) => {
				return item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
			});
			setnavItems({ ...navItems, data: filteredData });
		} else {
			setnavItems({ ...navItems, data: moduleData.data });
		}
	}, [debouncedSearchTerm]);

	return (
		<div className={styles.rolePermissionAsideContainer}>
			<CustomInput
				size="w100"
				label=""
				placeHolder={"Search"}
				icon={<img src="/images/searchIcon.svg" alt="Search Icon" />}
				onChange={onSearch}
			/>
			{
				<div className={styles.adminNavPanelsWrap + " " + styles.negAnimateTranslation}>
					{navItems.loading ? (
						<Skeleton paragraph={{ rows: 18 }} />
					) : (
						navItems.data?.map((item: itemType) => getTextWithIcon(item))
					)}
				</div>
			}
			<div className={styles.divider} />
		</div>
	);
};
