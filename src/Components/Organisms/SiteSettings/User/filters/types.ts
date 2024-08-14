import { ReactNode, SetStateAction } from "react";

export type FiltersType = {
	name?: string;
	isPublished?: string;
	email?: string;
	phone?: string;
	status?: string;
	fromDate?: any;
	toDate?: any;
	organizationId?: string;
	roleIds?: number[];
	sortOrder?: string;
	sortByField?: string;
};

export type MoreFilterProps = {
	values: string[];
	setValues: SetStateAction<string[]> | ((prevState: string[]) => string[]);
	setVisible: SetStateAction<boolean> | ((prevState: boolean) => boolean);
	visible: boolean;
	moreItems: { label: string; value: string }[];
};

export type MultiSelectFilterProps = {
	value: any;
	onChange: any;
	data: any;
	filters: any;
	type: any;
	label: any;
	onFilter: any;
	show: any;
	filterType?: "multi" | "single" | "input" | "search";
	getChild?: boolean;
	showFooter?: boolean;
	searchProps?: {
		onSearch: any;
	};
};

export type MultiInputFilterProps = {
	values: any;
	onChange: any;
	filters: any;
	labels: any;
	label: any;
	onFilter: any;
	show: any;
	subTypes: any;
	type: any;
	showFooter: boolean;
	children?: ReactNode;
};
