import { UserQueryTypes } from "@modules/User/types";
import { ReactNode } from "react";

export type SelectedFiltersTypes = {
    dateRange?: string[];
} & Partial<UserQueryTypes>


export type SelectedMoreFiltersTypes = Partial<keyof UserQueryTypes>[]

export type MoreFiltersTypes = Partial<{ [key in keyof UserQueryTypes]: ReactNode }>

export type MoreFiltersOptionsTypes = { label: string; value: keyof UserQueryTypes; }
