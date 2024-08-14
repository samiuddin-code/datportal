import { Empty, Skeleton } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAdminNavData } from "../../../Redux/Reducers/AdminNavReducer/action";
import { RootState } from "../../../Redux/store";
import { useLocation } from "react-router-dom";
import CustomInput from "../../Atoms/Input";
import styles from "./styles.module.scss";
import Typography from "../../Atoms/Headings";
import { useDebounce } from "../../../helpers/useDebounce";
import { itemType } from "./sidebar";
import { RESOURCE_BASE_URL } from "../../../helpers/constants";
import { dispatchType } from "../../../Redux/Reducers/commonTypes";
import { Link } from "react-router-dom";

interface AdminNavPanelsProps {
	profileNav?: boolean
}

function AdminNavPanels({ profileNav }: AdminNavPanelsProps) {
	const dispatch = useDispatch<dispatchType>();
	const location = useLocation();
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 500);
	const { adminNavData } = useSelector((state: RootState) => {
		return {
			adminNavData: state.adminNavReducer.adminNavData,
			userPermissions: state.usersReducer.userPermissions,
		}
	})
	const [navItems, setNavItems] = useState(adminNavData?.data);

	/** Account Settings Navigation Items */
	const accountNavItems = [
		{
			icon: 'profile.svg',
			name: "Profile",
			url: "/profile?tab=profile",
			id: 1,
		},
		{
			icon: 'shield.svg',
			name: "Security",
			url: "/profile?tab=security",
			id: 2,
		},
		{
			icon: 'bell-ringing.svg',
			name: "Manage Notifications",
			url: "/profile?tab=manage_notifications",
			id: 1,
		},
		/** To be Added in Future */
		// {
		// 	icon: '',
		// 	name: "Recent Devices",
		// 	url: "/profile?tab=recent_devices",
		// 	id: 3,
		// }
	]

	// if (userPermissions?.readOrganization === true) {
	// 	accountNavItems.push({
	// 		icon: 'building.svg',
	// 		name: "Organization",
	// 		url: "/profile?tab=organization",
	// 		id: 3,
	// 	})
	// }

	const getTextWithIcon = (item: itemType) => (
		<Link
			to={item.url ? item.url : "#"}
			className={`
				${styles.textWithIcon} 
				${(profileNav && (location.pathname + location.search)) === item.url ? styles.active : ''}
				${location.pathname === item.url ? styles.active : ""}
			`}
			key={`admin-nav-${item.id}`}
		>
			<div />
			{item.icon && !profileNav ? (
				<>
					{item?.icon && (
						<img
							src={`${RESOURCE_BASE_URL}${item.icon}`}
							alt={`${item.name} Icon`}
							width={15}
						/>
					)}
				</>
			) : (
				<>
					{item?.icon && (
						<img
							src={`/images/${item.icon}`}
							alt={`${item.name} Icon`}
							width={15}
						/>
					)}
				</>
			)}
			<Typography type="span" size="sm" color="dark-main">
				{item.name}
			</Typography>
		</Link>
	);

	useEffect(() => {
		if (!profileNav) {
			dispatch(getAdminNavData());
		}
	}, [dispatch, profileNav]);

	useEffect(() => {
		if (!profileNav) {
			setNavItems(adminNavData.data);
		}
	}, [adminNavData?.data, profileNav]);

	useEffect(() => {
		if (!profileNav) {
			const searchValue: string = debouncedSearchTerm?.toLowerCase();
			const data = adminNavData?.data || [];
			const filteredItems = data?.filter((item: { name: string }) => {
				const { name } = item;
				return name?.toLowerCase().includes(searchValue);
			});

			setNavItems(filteredItems);
		}
	}, [profileNav, debouncedSearchTerm, adminNavData?.data]);

	const onSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	}, []);

	return (
		<>
			{!profileNav && (
				<CustomInput
					size="w100"
					label=""
					placeHolder={"Search"}
					icon={<img src="/images/searchIcon.svg" alt="Search Icon" />}
					onChange={onSearch}
				/>
			)}

			<div className={styles.adminNavPanelsWrap + " " + styles.negAnimateTranslation}>
				{!profileNav ? (
					<>
						{adminNavData.loading ? (
							<Skeleton paragraph={{ rows: 18 }} />
						) : (
							<>
								{navItems.length > 0 ? (
									navItems?.map((item: itemType) => getTextWithIcon(item))
								) : (
									<Empty
										description="Modify your search, No results found!"
										imageStyle={{ height: 60 }}
									/>
								)}
							</>
						)}
					</>
				) : accountNavItems?.map((item: itemType) => getTextWithIcon(item))}
			</div>

			{!profileNav && <div className={styles.divider} />}
		</>
	);
}

export default AdminNavPanels;
