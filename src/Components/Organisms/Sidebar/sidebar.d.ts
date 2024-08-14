export type itemType = {
	icon: string;
	name: string;
	url: string;
	id?: number;
};
export type sideBarProps = {
	adminNav: boolean;
	profileNav?: boolean;
};
export type propsType = {
	changeSideBar: () => void;
};
