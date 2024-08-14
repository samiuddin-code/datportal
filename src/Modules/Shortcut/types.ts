import { APIResponseObject } from "../Common/common.interface";


export type ShortcutTypes = {
	title: string;
	link: string;
	id: number,
	addedDate: string;
	userId: number
};

export type ShortcutTypesResponseObject = APIResponseObject & { data: ShortcutTypes };
export type ShortcutTypesResponseArray = APIResponseObject & { data: Array<ShortcutTypes> };
