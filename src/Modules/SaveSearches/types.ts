import { filtersType } from "../../Components/Organisms/common___/filters";
import { APIResponseObject } from "../Common/common.interface";

export type SaveSearchTypes = {
	title: string;
	icon: string;
	visibility: string;
	savedSearchesFilters: Partial<filtersType>
}

export type SavedSearchesListingTypes = {
	id: number;
	title: string;
	userId: number;
	filters: filtersType;
	icon: string;
	forAdminpanel: boolean;
	visibility: string;
	organizationId: number;
	isPrivate: boolean;
	addedDate: Date;
	modifiedDate: Date;
	isPublished: boolean;
	isDeleted: boolean;
}

export type SaveSearchTypesResponseObject = APIResponseObject & { data: SaveSearchTypes };
export type SaveSearchTypesResponseArray = APIResponseObject & { data: Array<SaveSearchTypes> };

export type SavedSearchesListingTypesResponseObject = APIResponseObject & { data: SavedSearchesListingTypes };
export type SavedSearchesListingTypesResponseArray = APIResponseObject & { data: Array<SavedSearchesListingTypes> };
