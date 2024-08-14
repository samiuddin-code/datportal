// types
export type PropTypes = {
    openModal: boolean;
    onCancel: (e?: React.MouseEvent<HTMLElement>) => void;
    reloadTableData: () => void;
    type: "credit" | "package";
};