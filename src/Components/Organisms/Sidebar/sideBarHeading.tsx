import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RESOURCE_BASE_URL } from "../../../helpers/constants";
import { RootState } from "../../../Redux/store";
import Typography from "../../Atoms/Headings";
import styles from "./styles.module.scss";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

function SideBarHeading() {
	const { loggedInUserData } = useSelector((state: RootState) => state.usersReducer);
	const user = loggedInUserData?.data
	const navigate = useNavigate();

	return (
		<div
			className={`${styles.sideBarHeading} cursor-pointer`}
			onClick={() => navigate("/profile?tab=organization")}
		>
			<Avatar
				size={40}
				src={`${RESOURCE_BASE_URL}${user?.Organization?.logo}`}
				alt={user?.Organization ? `${user?.Organization.name} Logo` : "DAT Logo"}
				icon={<UserOutlined />}
				style={{
					objectFit: 'cover', cursor: 'pointer',
					backgroundColor: "#137749"
				}}
			/>
			<div>
				<Typography color="dark-main" size="xs">
					{user?.Organization ? `${user?.Organization.name}` : "DAT & Partners"}
				</Typography>
				<span>
					<Typography color="dark-sub" size="xxs">
						Last login:
					</Typography>
					<Typography color="dark-sub" size="xxs">
						12 hours ago
					</Typography>
				</span>
			</div>
		</div>
	);
}

export default SideBarHeading;
