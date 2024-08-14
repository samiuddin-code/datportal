import { FormEvent, ReactNode } from "react";

/** Custom filter props */
export type CustomFilterProps = FilterTypeTypes & {
    /** The label of the Input or the filter */
    label: ReactNode;
    /** The name of the Input or filter */
    name: string;
    /** Value of the input or filter */
    value?: string;
    /** On Change event handler */
    onChange: (e: any) => void;
    /** Function to reset the filter when reset button is clicked */
    onReset: () => void;
    /** Function to update the filter when update button is clicked */
    onUpdate: (query?: { [key: string]: any }) => void;
    /** Whether the filter or input can be resetted */
    canReset?: boolean,
    /** Whether the filter is visible or not */
    defaultVisible?: boolean;
    withSort?: boolean
    /**Whether the filter should have a background color or not when
     * a filter is active
     */
    showBg?: boolean
} & WithSearchProps;

/** Date Picker Select types for custom filter */
export type DateSelectType = "today" | "yesterday" | "last7days" | "last30days" | "custom";

/** ===START OF WITH SEARCH PROPS===*/
type RequiredWithSearchProps = {
    /** Whether the filter has a search input or not */
    withSearch?: true;
    /** On Search event handler */
    onSearch: (value: FormEvent<HTMLInputElement>) => void;
    /** Search term */
    searchTerm: string;
}

type NotRequiredWithSearchProps = {
    /** Whether the filter has a search input or not */
    withSearch?: false
    /** On Search event handler */
    onSearch?: undefined;
    /** Search term */
    searchTerm?: undefined;
}

type WithSearchProps = RequiredWithSearchProps | NotRequiredWithSearchProps;
/** ===END OF WITH SEARCH PROPS===*/

/** Date picker types for custom filter */
type DatePickerTypes = {
    /** Filter type */
    type: "datepicker";
    /** Filter options */
    options?: undefined;
    /** Default value for the input or filter */
    defaultValue?: undefined;
    /** Whether the filter data is loading or not */
    loading?: false;
    /** Default value for the date picker input */
    defaultDate?: any;
    /** Default value for the multi select filter */
    defaultMultiValue?: undefined;
    /** Selected data for the multi select filter */
    selectedData?: undefined;
    /** Remove selected data event handler */
    removeSelectedData?: undefined;
}

/** Radio types for custom filter */
type RadioTypes = {
    /** Filter type */
    type: "radio";
    /** Filter options */
    options: { label: string, value: string }[],
    /** Default value for the input or filter */
    defaultValue?: string;
    /** Default value for the date picker input */
    defaultDate?: undefined;
    /** Whether the filter data is loading or not */
    loading?: boolean;
    /** Default value for the multi select filter */
    defaultMultiValue?: undefined;
    /** Selected data for the multi select filter */
    selectedData?: undefined;
    /** Remove selected data event handler */
    removeSelectedData?: undefined;
}

/** Multi select types for custom filter */
type MultiSelectTypes = {
    /** Filter type */
    type: "multiSelect"
    /** Filter options */
    options: { label: string, value: string }[],
    /** Default value for the input or filter */
    defaultValue?: string;
    /** Default value for the date picker input */
    defaultDate?: undefined;
    /** Whether the filter data is loading or not */
    loading?: boolean;
    /** Default value for the multi select filter */
    defaultMultiValue?: string[] | number[];
    /** Selected data for the multi select filter */
    selectedData?: any[];
    /** Remove selected data event handler */
    removeSelectedData?: (value: any) => void;
}

/** Input types for custom filter */
type InputTypes = {
    /** Filter type */
    type: "input" | "email";
    /** Filter options */
    options?: undefined;
    /** Default value for the input or filter */
    defaultValue?: string;
    /** Default value for the date picker input */
    defaultDate?: undefined;
    /** Whether the filter data is loading or not */
    loading?: boolean;
    /** Default value for the multi select filter */
    defaultMultiValue?: undefined;
    /** Selected data for the multi select filter */
    selectedData?: undefined;
    /** Remove selected data event handler */
    removeSelectedData?: undefined;
}

/** Available Inputs for custom filter
 * @default "radio"
 * @type   ```input``` | ```email``` | ```multiSelect``` | ```radio``` |  ```datepicker```  
 */
type FilterTypeTypes = InputTypes | MultiSelectTypes | RadioTypes | DatePickerTypes