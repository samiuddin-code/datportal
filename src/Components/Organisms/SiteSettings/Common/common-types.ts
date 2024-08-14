export type PropTypes = {
	openModal: boolean;
	onCancel: (e?: React.MouseEvent<HTMLElement>) => void;
	reloadTableData: () => void;
	type: "edit" | "new";
};
export type TableProps = {
	tableLoading: boolean;
	reloadTableData: () => void;
	onEditIconClick: (data: any) => void;
};

export type ActionComponentProps = {
	onEditIconClick: (data: any) => void;
	reloadTableData: () => void;
};
