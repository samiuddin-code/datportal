import { APIResponseObject } from "@modules/Common/common.interface";
import React from "react";

export type PropTypes = {
	openModal: boolean;
	onCancel: (e?: React.MouseEvent<HTMLElement>) => void;
	reloadTableData: (query?: { [key: string]: any; }) => void;
	type: "edit" | "new" | "seo" | "notes"
};
export type TableProps<T = any> = {
	tableLoading: boolean;
	reloadTableData: (query?: { [key: string]: any; }) => void;
	onEditIconClick: (data: any) => void;
	/** Custom Empty Table Design. This Accepts React Node */
	emptyText?: React.ReactNode
	tableData: T[];
	meta?: APIResponseObject['meta']
};

export type ActionComponentProps = {
	onEditIconClick: (data: any, currentForm?: string) => void;
	reloadTableData: (query?: { [key: string]: any; }) => void;
};

/**
 * @description Common Modal Props
 * @param ModalType Type of the modal
 * @param visible Whether the modal is visible or not
 * @param onCancel Function to be called when the modal is closed
 * @param onFinish Function to be called when the modal is submitted
 */
export type CommonModalProps<ModalType = any> = {
	/**Whether the modal is visible or not
	 * @default false
	 */
	visible: boolean;
	/**Function to be called when the modal is closed */
	onCancel: (e?: React.MouseEvent<HTMLElement>) => void;
	/**Function to refresh the table or any other
	 * data after the modal is submitted
	 * @param query Query to be passed to fetch the data
	 */
	onRefresh: <QueryType = any>(query?: QueryType) => void;
	/**Type of the modal
	 * @default undefined
	 */
	type?: ModalType
}
