import { PropertiesType } from "@modules/Properties/types";
import axios from "axios";
import { type SetURLSearchParams } from "react-router-dom";
import { PROTECTED_RESOURCE_BASE_URL, RESOURCE_BASE_URL } from "./constants";
import { APIResponseObject } from "@modules/Common/common.interface";
import { EnumObject } from "./options";

export const slugifyString = (value: string, upper: boolean = false) => {
  let tempSlug = value.replace(/\s/g, "-");
  if (upper) {
    tempSlug = tempSlug.toUpperCase();
  } else {
    tempSlug = tempSlug.toLowerCase();
  }
  tempSlug = tempSlug.replace(/[%'?&*()+=!~@$^{}/;"']/g, "");
  return tempSlug;
}
export const removeUndefined = (data: { [x: string]: string; }, keysToExclude?: string[]) => {
  let excludedKeys = keysToExclude ? keysToExclude : []
  let convertedData: { [x: string]: string } = {};
  Object.keys(data)
    .filter((item) => data[item] && !excludedKeys.includes(item))
    .forEach((item) => {
      convertedData[item] = data[item];
    });
  return convertedData
}

export function getEnumKeyByValue<T>(__enum: T | any, value: string): string {
  const indexOfS = Object.values(__enum).indexOf(value);
  const key = Object.keys(__enum)[indexOfS];
  return key;
}

export const capitalize = (str: string) => {
  if (typeof str === 'string') {
    return str.replace(/^\w/, c => c.toUpperCase())
  } else {
    return str
  }
}

/** This function will revert comma separated string of numbers that starts with __ to array of numbers
 * @param {string} data - comma seperated string of numbers that starts with __
 */
export const reverseArrayString = (data: string) => {
  let temp = data?.replace(/__/g, '')?.split(',');
  let finalData: number[] = []

  temp?.map((ele) => parseInt(ele) && finalData?.push(parseInt(ele)))

  return finalData
}

/**
 * This function will return true if the page the user is on is the same as the page passed in the argument
 * @param link - the page to check against
 * @returns ```boolean```
 */
export const isNavLinkActive = (link: string) => {
  const currentPath = window.location.pathname;

  // split the current path and get the last element
  const currentPathArray = currentPath?.split("/");
  // split the link and get the last element
  const linkArray = link?.split("/");

  const currentPathLastElement = currentPathArray[currentPathArray.length - 1];
  const linkLastElement = linkArray[linkArray.length - 1];

  if (currentPathLastElement === linkLastElement) {
    return true;
  } else if (currentPath === link) {
    return true;
  } else if (link !== "/" && currentPath?.includes(link)) {
    return true;
  }
  return false;
}

/**
 * This function will return true if the page the user is on is the same as the page passed in the argument
 * @param link - the page to check against
 * @param params - the params to check against
 * @returns ```boolean```
 */
export const isNavLinkActiveWithParams = (link: string, params: string) => {
  const currentPath = window.location.pathname;
  const currentSearch = window.location.search;
  const fullLink = link + params;
  const fullCurrentPath = currentPath + currentSearch;

  if (fullCurrentPath === fullLink) {
    return true;
  } else if (!params && isNavLinkActive(link)) {
    return true;
  }
  return false;
}

/** if the link doesn't start with http:// or https://, add it 
 * @param {string} link - the link to check
 * @returns ```string``` - the link with https://
 */
export const validLink = (link: string) => {
  if (!link.startsWith("http://") && !link.startsWith("https://")) {
    link = "https://" + link;
    return link;
  }
}

/**
 * This function will validate the email address passed in the argument and return true if it is valid
 * @param email - the email address to validate
 * @returns ```boolean```
 */
export const validateEmail = (email: string) => {
  const _regex = /\S+@\S+\.\S+/;
  return _regex.test(email);
}

/** 
 * this function will return the price of the property based on the property data passed in the argument
 * @param {PropertiesType} data - the property data
 * @returns ```string``` - the price in the format of currency price / period
 */
export const getPropertyPrice = (data: PropertiesType) => {
  if (data?.category?.slug === "commercial-for-sale" || data?.category?.slug === "residential-for-sale") {
    return `${data?.currency} ${data?.fixedPrice?.toLocaleString("en-US")}`;
  } else {
    if (data?.yearlyPrice) {
      return `${data?.currency} ${data?.yearlyPrice?.toLocaleString("en-US")} /Year`
    } else if (data?.monthlyPrice) {
      return `${data?.currency} ${data?.monthlyPrice?.toLocaleString("en-US")} /Month`
    } else if (data?.weeklyPrice) {
      return `${data?.currency} ${data?.weeklyPrice?.toLocaleString("en-US")} /Week`
    } else if (data?.dailyPrice) {
      return `${data?.currency} ${data?.dailyPrice?.toLocaleString("en-US")} /Day`
    } else {
      return ""
    }
  }
};

/**
 * This function prevents users from entering letters and special characters in the input field
 * @param {string} value - the value of the input field
 */
export const preventNonNumericInput = (value: string) => value?.replace(/[^\d]/g, "");

/**
 * handleNumberChange function interface
 * @param {any} event - the event object
 * @param {any} form - the form object
 * @param {string} formName - the name of the input field
 * @param {boolean} isArray - if the input field is an array
 * @param {object} arrayFields - the array fields
 * */
interface HandleNumberChange {
  event: any;
  form: any;
  formName: string;
  isArray?: boolean;
  arrayFields?: {
    name: string;
    index: number;
  }
}

/**
 * This function will handle the change event of the input field and set the value of the input field to the form
 * @params ```HandleNumberChange``` - the handleNumberChange function interface
 * @example
 *  <InputNumber
 *    name="price"
 *    value={form.getFieldValue("price")}
 *    onChange={(event: any) => {
        const params = {
          event: event,
          form: form,
          formName: "price",
        }
        handleNumberChange(params)
      }}
 *  />
 * */
export const handleNumberChange = ({ event, form, formName, isArray = false, arrayFields }: HandleNumberChange) => {
  let value = preventNonNumericInput(event?.target?.value);

  if (isArray) {
    let fieldName: any = [formName, arrayFields?.index, arrayFields?.name];
    form?.setFields([{ name: fieldName, value: value }]);
  } else {
    formName && form.setFieldsValue({ [formName]: value });
  }
}

/**
 * This function will generate alphanumeric random string for password
 * 
 * @returns ```string``` - the generated password
 * */
export const generatePassword = () => {
  let password = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 8; i++) {
    password += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return password;
}

/**
 * This function will check if the value entered is a valid number
 * @param {string} value - the value to check
 * @returns ```boolean```
 */
export const isNumber = (value: string | number) => {
  return !isNaN(Number(value));
}

/** Maximize image height (in pixels) */
export const imageMaxHeight = 1920
/** Minimize image height (in pixels) */
export const imageMinHeight = 500
/** Maximize image width (in pixels) */
export const imageMaxWidth = 1920
/** Minimize image width (in pixels) */
export const imageMinWidth = 800

/**
 * This function will check for the validity of the image file using the file dimension
 * @param {number} height - the height of the image
 * @param {number} width - the width of the image
 * @return ```string``` | ```null``` - the error message or null
 * */
export const validateImageDimension = (height: number, width: number) => {
  if (height > imageMaxHeight || width > imageMaxWidth) {
    return `File dimension is too large.`
  } else if (height < imageMinHeight || width < imageMinWidth) {
    return `File dimension is too small.`
  }
  return null
}

/**
 * This function is used to check if one date is greater than another
 * @param {string} targetDate - the target date
 * @param {string} compareDate - the date to compare with
 * @returns ```boolean```
 * 
 * @example
 * const targetDate = "2021-08-01"
 * const compareDate = "2021-07-01"
 * const result = isDateGreaterThan(targetDate, compareDate)
 * console.log(result) // true
 * */
export const isDateGreaterThan = (targetDate: string | Date, compareDate: string | Date) => {
  const target = new Date(targetDate).setHours(0, 0, 0, 0)
  const compare = new Date(compareDate).setHours(0, 0, 0, 0)

  return target < compare
}

/** This function is used to check if the date expiring soon or not */
export const isDateExpiringSoon = (date: string, days: number) => {
  const target = new Date(date)
  const compare = new Date()
  compare.setDate(compare.getDate() + days)

  return target < compare
}

/**This function is used to handle the error message returned from the server
 * @param {any} err - the error object
 * @returns ```string``` - the error message 
 */
export const handleError = (err: any) => {
  let errorMessage: string
  const errorResponse = err?.response?.data?.message;

  if (typeof errorResponse === 'string') {
    errorMessage = errorResponse;
  } else if (typeof errorResponse === 'object') {
    const constraints = errorResponse?.map((error: any) => error.constraints);
    errorMessage = constraints?.map((constraint: any) => {
      return Object.values(constraint).join(', ');
    })
  } else {
    errorMessage = err?.message;
  }

  return errorMessage;
}

export const processCamelCaseStringToTitle = (string: string) => {
  let processedString = ''
  for (let index = 0; index < string.length; index++) {
    if (index === 0) {
      processedString += string[index].toUpperCase();
    }
    else if (string[index] === string[index].toUpperCase()) {
      processedString += (" " + string[index]);
    }
    else {
      processedString += string[index];
    }

  }
  return processedString;

}

/** Get the type of the enum values */
export type TypeFromEnumValues<T extends object> = T[keyof T];

/** This function will remove the query params from the url
 * @param {string[]} params - the params to remove
 * @param {SetURLSearchParams} setSearchParams - the setSearchParams function from the useSearchParams hook
 * */
export const onRemoveUrlParams = (params: string[], setSearchParams: SetURLSearchParams) => {
  setSearchParams((prev) => {
    const _params = new URLSearchParams(prev);
    params.forEach((param) => {
      _params.delete(param);
    })
    return _params;
  }, { replace: true })
}

/** This function is used to download a file from the server
 * @param {string} path - the path of the file
 * @param {string} fileName - the name of the file
 */
export const downloadFile = async (path: string, fileName: string) => {
  const url = `${PROTECTED_RESOURCE_BASE_URL}${path}`;
  const response = await axios.get(url, { responseType: 'blob' });

  const urlObject = window.URL || window.webkitURL || window;
  const blobUrl = urlObject.createObjectURL(response.data);

  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function isWeekend(date: Date) {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0; // Sunday
}

export function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isDateInRange(givenDate: Date, fromDate: Date, toDate: Date) {
  givenDate = new Date(givenDate);
  givenDate.setHours(0, 0, 0, 0);

  fromDate = new Date(fromDate);
  fromDate.setHours(0, 0, 0, 0);

  toDate = new Date(toDate);
  toDate.setHours(0, 0, 0, 0);

  return givenDate >= fromDate && givenDate <= toDate;
}

export const formatCurrency = (value: number) => {
  return value?.toLocaleString("en-US", { minimumFractionDigits: 2, currency: "AED", style: "currency" })
}

export const cleanup = () => {
  localStorage.removeItem("attendanceUser");
}
/** This function is used to number table rows, based on the current page and the number of rows per page */
export const getTableRowNumber = (index: number, meta?: APIResponseObject['meta']) => {
  if (meta) {
    return (meta?.perPage! * (meta?.page! - 1)) + (index + 1)
  }
  return index + 1
}

/** This function is used to play notification sound */
export const PlayNotificationSound = () => {
  try {
    const audio = new Audio(`${RESOURCE_BASE_URL}public/notification/sound/alert.wav`)
    audio.play();
  } catch (err: any) {
    console.warn("Some error while playing notification", err?.message);
  }
}

const domainName = window.location.hostname;
const hostedDevDomain = "sandbox.projects.datconsultancy.com";

const NODE_ENV = process.env.NODE_ENV;
const isDev = NODE_ENV === "development";
const isProd = NODE_ENV === "production";

/** This variable is used to check if the app is in development mode.
 * @description
 * If the app is in production mode and the domain is equal to the hosted dev domain,
 * also if the app is in development mode, then it is in dev mode
 */
export const IN_DEV_MODE = (isProd && domainName === hostedDevDomain) || isDev;

/** This function is used to get the slugs of the permissions
 * @param {object} enumObject - the enum object
 * @returns ```string[]``` - the slugs of the permissions
 */
export const getPermissionSlugs = <T extends EnumObject<unknown>>(enumObject: T): string[] => {
  return Object.values(enumObject).map((value: unknown) => value as string);
}